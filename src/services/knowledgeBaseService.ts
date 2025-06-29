import { databaseService } from './databaseService';

export interface Document {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  uploadedAt: Date;
  metadata: Record<string, any>;
  embeddings?: number[];
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  type: 'rag' | 'kg';
  documents: Document[];
  settings: {
    embeddingModel: string;
    vectorStore?: string;
    chunkSize?: number;
    overlap?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult {
  document: Document;
  relevanceScore: number;
  chunks: {
    content: string;
    score: number;
    metadata: Record<string, any>;
  }[];
}

class KnowledgeBaseService {
  private embeddingCache: Map<string, number[]> = new Map();

  async createKnowledgeBase(data: Omit<KnowledgeBase, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return await databaseService.createKnowledgeBase(data);
  }

  async getUserKnowledgeBases(): Promise<KnowledgeBase[]> {
    return await databaseService.getUserKnowledgeBases();
  }

  async uploadDocument(knowledgeBaseId: string, file: File): Promise<Document> {
    try {
      // Read file content
      const content = await this.readFileContent(file);
      
      // Create document
      const document: Document = {
        id: `doc_${Date.now()}`,
        name: file.name,
        content,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
        metadata: {
          originalName: file.name,
          mimeType: file.type,
          size: file.size
        }
      };

      // Process document for embeddings
      await this.processDocumentForEmbeddings(document);

      // Store document (in a real implementation, this would be stored in the database)
      // For now, we'll just return the document
      return document;
    } catch (error) {
      throw new Error(`Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      // Handle different file types
      if (file.type === 'application/pdf') {
        // For PDF files, we'd need a PDF parser library
        // For now, just read as text
        reader.readAsText(file);
      } else if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        reader.readAsText(file);
      } else if (file.type === 'application/json') {
        reader.readAsText(file);
      } else {
        reader.readAsText(file);
      }
    });
  }

  private async processDocumentForEmbeddings(document: Document): Promise<void> {
    try {
      // Chunk the document
      const chunks = this.chunkDocument(document.content, 1000, 200);
      
      // Generate embeddings for each chunk
      const embeddings: number[][] = [];
      
      for (const chunk of chunks) {
        const embedding = await this.generateEmbedding(chunk);
        embeddings.push(embedding);
      }

      // Store embeddings in document metadata
      document.metadata.chunks = chunks.map((chunk, index) => ({
        content: chunk,
        embedding: embeddings[index],
        index
      }));
      
    } catch (error) {
      console.error('Failed to process document for embeddings:', error);
      // Continue without embeddings
    }
  }

  private chunkDocument(content: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    let start = 0;
    
    while (start < content.length) {
      const end = Math.min(start + chunkSize, content.length);
      const chunk = content.slice(start, end);
      chunks.push(chunk);
      
      if (end === content.length) break;
      start = end - overlap;
    }
    
    return chunks;
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Check cache first
    const cacheKey = this.hashString(text);
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }

    try {
      // Use OpenAI embeddings API
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const embedding = data.data[0].embedding;
      
      // Cache the embedding
      this.embeddingCache.set(cacheKey, embedding);
      
      return embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      // Return a dummy embedding for demo purposes
      return Array(1536).fill(0).map(() => Math.random() - 0.5);
    }
  }

  async searchKnowledgeBase(knowledgeBaseId: string, query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      // Get knowledge base
      const knowledgeBases = await this.getUserKnowledgeBases();
      const kb = knowledgeBases.find(k => k.id === knowledgeBaseId);
      
      if (!kb) {
        throw new Error('Knowledge base not found');
      }

      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Search through documents
      const results: SearchResult[] = [];
      
      for (const document of kb.documents) {
        if (!document.metadata.chunks) continue;
        
        const chunks = document.metadata.chunks.map((chunk: any) => {
          const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding);
          return {
            content: chunk.content,
            score: similarity,
            metadata: { index: chunk.index }
          };
        }).sort((a, b) => b.score - a.score);

        if (chunks.length > 0 && chunks[0].score > 0.7) {
          results.push({
            document,
            relevanceScore: chunks[0].score,
            chunks: chunks.slice(0, 3) // Top 3 chunks
          });
        }
      }

      // Sort by relevance and return top results
      return results
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
        
    } catch (error) {
      console.error('Knowledge base search failed:', error);
      return [];
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  async deleteDocument(knowledgeBaseId: string, documentId: string): Promise<void> {
    // Implementation would remove document from knowledge base
    console.log(`Deleting document ${documentId} from knowledge base ${knowledgeBaseId}`);
  }

  async updateKnowledgeBase(knowledgeBaseId: string, updates: Partial<KnowledgeBase>): Promise<void> {
    // Implementation would update knowledge base in database
    console.log(`Updating knowledge base ${knowledgeBaseId}`, updates);
  }

  async deleteKnowledgeBase(knowledgeBaseId: string): Promise<void> {
    // Implementation would delete knowledge base from database
    console.log(`Deleting knowledge base ${knowledgeBaseId}`);
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();