import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { authService } from './authService';
import { securityService } from './securityService';
import type { Agent, Flow } from '@/types/agent';

export interface DatabaseAgent extends Omit<Agent, 'id' | 'createdAt' | 'updatedAt'> {
  userId: string;
  isPublic: boolean;
  tags: string[];
  version: string;
  status: 'active' | 'inactive' | 'archived';
}

export interface DatabaseFlow extends Omit<Flow, 'id' | 'createdAt' | 'updatedAt'> {
  userId: string;
  isPublic: boolean;
  tags: string[];
  version: string;
  status: 'active' | 'inactive' | 'archived';
  nodes: any[];
  edges: any[];
  nodeConfigs: Record<string, any>;
}

export interface KnowledgeBaseEntry {
  id?: string;
  userId: string;
  name: string;
  description: string;
  type: 'rag' | 'kg';
  documents: {
    id: string;
    name: string;
    content: string;
    metadata: Record<string, any>;
    embeddings?: number[];
  }[];
  settings: {
    embeddingModel: string;
    vectorStore?: string;
    chunkSize?: number;
    overlap?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeSnippet {
  id?: string;
  userId: string;
  name: string;
  description: string;
  language: string;
  code: string;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Integration {
  id?: string;
  userId: string;
  provider: string;
  name: string;
  credentials: Record<string, string>; // Encrypted
  settings: Record<string, any>;
  isActive: boolean;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKey {
  id?: string;
  userId: string;
  name: string;
  keyHash: string; // Hashed version of the key
  permissions: string[];
  lastUsed?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface ExecutionLog {
  id?: string;
  userId: string;
  type: 'agent' | 'flow';
  targetId: string;
  targetName: string;
  input: any;
  output: any;
  success: boolean;
  error?: string;
  executionTime: number;
  tokensUsed?: number;
  cost?: number;
  timestamp: Date;
}

class DatabaseService {
  private listeners: Map<string, () => void> = new Map();

  // ==================== SECURITY VALIDATION ====================

  private async validateSecurityAccess(resource: string, action: string): Promise<void> {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Validate security compliance
    const compliance = await securityService.validateSecurityCompliance(user.uid);
    if (!compliance.compliant) {
      throw new Error(`Security compliance required: ${compliance.issues.join(', ')}`);
    }

    // Check zero trust access
    const hasAccess = await authService.validateSecurityAccess(resource, action);
    if (!hasAccess) {
      throw new Error('Access denied by security policy');
    }
  }

  // ==================== AGENTS ====================

  async createAgent(agent: Omit<DatabaseAgent, 'userId'>): Promise<string> {
    await this.validateSecurityAccess('agents', 'create');
    
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const agentData: DatabaseAgent = {
        ...agent,
        userId: user.uid,
        isPublic: false,
        tags: agent.tags || [],
        version: agent.version || '1.0.0',
        status: 'active'
      };

      const docRef = await addDoc(collection(db, 'agents'), {
        ...agentData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Update usage
      await authService.updateUsage('agentExecutions', 0); // Just track creation

      return docRef.id;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create agent');
    }
  }

  async updateAgent(agentId: string, updates: Partial<DatabaseAgent>): Promise<void> {
    await this.validateSecurityAccess('agents', 'update');
    
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // Verify ownership
      const agentDoc = await getDoc(doc(db, 'agents', agentId));
      if (!agentDoc.exists()) throw new Error('Agent not found');
      
      const agentData = agentDoc.data();
      if (agentData.userId !== user.uid && !authService.isAdmin()) {
        throw new Error('Access denied');
      }

      await updateDoc(doc(db, 'agents', agentId), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update agent');
    }
  }

  async deleteAgent(agentId: string): Promise<void> {
    await this.validateSecurityAccess('agents', 'delete');
    
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // Verify ownership
      const agentDoc = await getDoc(doc(db, 'agents', agentId));
      if (!agentDoc.exists()) throw new Error('Agent not found');
      
      const agentData = agentDoc.data();
      if (agentData.userId !== user.uid && !authService.isAdmin()) {
        throw new Error('Access denied');
      }

      await deleteDoc(doc(db, 'agents', agentId));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete agent');
    }
  }

  async getAgent(agentId: string): Promise<Agent | null> {
    await this.validateSecurityAccess('agents', 'read');
    
    try {
      const agentDoc = await getDoc(doc(db, 'agents', agentId));
      if (agentDoc.exists()) {
        const data = agentDoc.data();
        return {
          id: agentDoc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Agent;
      }
      return null;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get agent');
    }
  }

  async getUserAgents(): Promise<Agent[]> {
    await this.validateSecurityAccess('agents', 'read');
    
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const q = query(
        collection(db, 'agents'),
        where('userId', '==', user.uid),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Agent[];
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get user agents');
    }
  }

  async getPublicAgents(): Promise<Agent[]> {
    await this.validateSecurityAccess('agents', 'read');
    
    try {
      const q = query(
        collection(db, 'agents'),
        where('isPublic', '==', true),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Agent[];
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get public agents');
    }
  }

  // ==================== FLOWS ====================

  async createFlow(flow: Omit<DatabaseFlow, 'userId'>): Promise<string> {
    await this.validateSecurityAccess('flows', 'create');
    
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const flowData: DatabaseFlow = {
        ...flow,
        userId: user.uid,
        isPublic: false,
        tags: flow.tags || [],
        version: flow.version || '1.0.0',
        status: 'active',
        nodes: flow.nodes || [],
        edges: flow.edges || [],
        nodeConfigs: flow.nodeConfigs || {}
      };

      const docRef = await addDoc(collection(db, 'flows'), {
        ...flowData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return docRef.id;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create flow');
    }
  }

  async updateFlow(flowId: string, updates: Partial<DatabaseFlow>): Promise<void> {
    await this.validateSecurityAccess('flows', 'update');
    
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // Verify ownership
      const flowDoc = await getDoc(doc(db, 'flows', flowId));
      if (!flowDoc.exists()) throw new Error('Flow not found');
      
      const flowData = flowDoc.data();
      if (flowData.userId !== user.uid && !authService.isAdmin()) {
        throw new Error('Access denied');
      }

      await updateDoc(doc(db, 'flows', flowId), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update flow');
    }
  }

  async deleteFlow(flowId: string): Promise<void> {
    await this.validateSecurityAccess('flows', 'delete');
    
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // Verify ownership
      const flowDoc = await getDoc(doc(db, 'flows', flowId));
      if (!flowDoc.exists()) throw new Error('Flow not found');
      
      const flowData = flowDoc.data();
      if (flowData.userId !== user.uid && !authService.isAdmin()) {
        throw new Error('Access denied');
      }

      await deleteDoc(doc(db, 'flows', flowId));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete flow');
    }
  }

  async getFlow(flowId: string): Promise<Flow | null> {
    await this.validateSecurityAccess('flows', 'read');
    
    try {
      const flowDoc = await getDoc(doc(db, 'flows', flowId));
      if (flowDoc.exists()) {
        const data = flowDoc.data();
        return {
          id: flowDoc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Flow;
      }
      return null;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get flow');
    }
  }

  async getUserFlows(): Promise<Flow[]> {
    await this.validateSecurityAccess('flows', 'read');
    
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const q = query(
        collection(db, 'flows'),
        where('userId', '==', user.uid),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Flow[];
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get user flows');
    }
  }

  // ==================== KNOWLEDGE BASE ====================

  async createKnowledgeBase(kb: Omit<KnowledgeBaseEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await this.validateSecurityAccess('knowledgeBase', 'create');
    
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const kbData: Omit<KnowledgeBaseEntry, 'id'> = {
        ...kb,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'knowledgeBase'), {
        ...kbData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return docRef.id;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create knowledge base');
    }
  }

  async getUserKnowledgeBases(): Promise<KnowledgeBaseEntry[]> {
    await this.validateSecurityAccess('knowledgeBase', 'read');
    
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const q = query(
        collection(db, 'knowledgeBase'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as KnowledgeBaseEntry[];
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get knowledge bases');
    }
  }

  // ==================== CODE LIBRARY ====================

  async createCodeSnippet(snippet: Omit<CodeSnippet, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await this.validateSecurityAccess('codeLibrary', 'create');
    
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const snippetData: Omit<CodeSnippet, 'id'> = {
        ...snippet,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'codeLibrary'), {
        ...snippetData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return docRef.id;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create code snippet');
    }
  }

  async getUserCodeSnippets(): Promise<CodeSnippet[]> {
    await this.validateSecurityAccess('codeLibrary', 'read');
    
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const q = query(
        collection(db, 'codeLibrary'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as CodeSnippet[];
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get code snippets');
    }
  }

  // ==================== INTEGRATIONS ====================

  async createIntegration(integration: Omit<Integration, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await this.validateSecurityAccess('integrations', 'create');
    
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // Encrypt credentials
      const encryptedCredentials: Record<string, string> = {};
      Object.entries(integration.credentials).forEach(([key, value]) => {
        encryptedCredentials[key] = securityService.encryptionManager.encrypt(value);
      });

      const integrationData: Omit<Integration, 'id'> = {
        ...integration,
        userId: user.uid,
        credentials: encryptedCredentials,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'integrations'), {
        ...integrationData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return docRef.id;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create integration');
    }
  }

  async getUserIntegrations(): Promise<Integration[]> {
    await this.validateSecurityAccess('integrations', 'read');
    
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const q = query(
        collection(db, 'integrations'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Decrypt credentials
        const decryptedCredentials: Record<string, string> = {};
        Object.entries(data.credentials).forEach(([key, value]) => {
          try {
            decryptedCredentials[key] = securityService.encryptionManager.decrypt(value as string);
          } catch {
            decryptedCredentials[key] = '[ENCRYPTED]';
          }
        });

        return {
          id: doc.id,
          ...data,
          credentials: decryptedCredentials,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        };
      }) as Integration[];
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get integrations');
    }
  }

  // ==================== API KEYS ====================

  async createApiKey(apiKey: Omit<ApiKey, 'id' | 'userId' | 'keyHash' | 'createdAt'>, rawKey: string): Promise<string> {
    await this.validateSecurityAccess('api-keys', 'create');
    
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // Hash the API key
      const keyHash = securityService.encryptionManager.hash(rawKey);

      const apiKeyData: Omit<ApiKey, 'id'> = {
        ...apiKey,
        userId: user.uid,
        keyHash,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'apiKeys'), {
        ...apiKeyData,
        createdAt: Timestamp.now()
      });

      return docRef.id;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create API key');
    }
  }

  async getUserApiKeys(): Promise<Omit<ApiKey, 'keyHash'>[]> {
    await this.validateSecurityAccess('api-keys', 'read');
    
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const q = query(
        collection(db, 'apiKeys'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const { keyHash, ...apiKeyData } = data;
        
        return {
          id: doc.id,
          ...apiKeyData,
          createdAt: data.createdAt.toDate()
        };
      }) as Omit<ApiKey, 'keyHash'>[];
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get API keys');
    }
  }

  // ==================== EXECUTION LOGS ====================

  async logExecution(execution: Omit<ExecutionLog, 'id' | 'userId' | 'timestamp'>): Promise<void> {
    const user = authService.getCurrentUser();
    if (!user) return;

    try {
      const executionData: Omit<ExecutionLog, 'id'> = {
        ...execution,
        userId: user.uid,
        timestamp: new Date()
      };

      await addDoc(collection(db, 'executions'), {
        ...executionData,
        timestamp: Timestamp.now()
      });

      // Update usage
      await authService.updateUsage(execution.type === 'agent' ? 'agentExecutions' : 'flowExecutions');
    } catch (error) {
      console.error('Failed to log execution:', error);
    }
  }

  async getExecutionHistory(limit: number = 50): Promise<ExecutionLog[]> {
    await this.validateSecurityAccess('executions', 'read');
    
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const q = query(
        collection(db, 'executions'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as ExecutionLog[];
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get execution history');
    }
  }

  // ==================== REAL-TIME LISTENERS ====================

  subscribeToUserAgents(callback: (agents: Agent[]) => void): () => void {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(
      collection(db, 'agents'),
      where('userId', '==', user.uid),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const agents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Agent[];
      
      callback(agents);
    });

    return unsubscribe;
  }

  subscribeToUserFlows(callback: (flows: Flow[]) => void): () => void {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(
      collection(db, 'flows'),
      where('userId', '==', user.uid),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const flows = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Flow[];
      
      callback(flows);
    });

    return unsubscribe;
  }

  // ==================== BATCH OPERATIONS ====================

  async batchCreateAgents(agents: Omit<DatabaseAgent, 'userId'>[]): Promise<string[]> {
    await this.validateSecurityAccess('agents', 'create');
    
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const batch = writeBatch(db);
      const docIds: string[] = [];

      agents.forEach(agent => {
        const docRef = doc(collection(db, 'agents'));
        const agentData: DatabaseAgent = {
          ...agent,
          userId: user.uid,
          isPublic: false,
          tags: agent.tags || [],
          version: agent.version || '1.0.0',
          status: 'active'
        };

        batch.set(docRef, {
          ...agentData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        docIds.push(docRef.id);
      });

      await batch.commit();
      return docIds;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to batch create agents');
    }
  }

  // ==================== ANALYTICS ====================

  async getAnalytics(): Promise<{
    totalAgents: number;
    totalFlows: number;
    totalExecutions: number;
    recentActivity: any[];
  }> {
    await this.validateSecurityAccess('analytics', 'read');
    
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // Get counts
      const [agentsSnapshot, flowsSnapshot, executionsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'agents'), where('userId', '==', user.uid))),
        getDocs(query(collection(db, 'flows'), where('userId', '==', user.uid))),
        getDocs(query(collection(db, 'executions'), where('userId', '==', user.uid)))
      ]);

      // Get recent activity
      const recentActivitySnapshot = await getDocs(
        query(
          collection(db, 'executions'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(10)
        )
      );

      const recentActivity = recentActivitySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }));

      return {
        totalAgents: agentsSnapshot.size,
        totalFlows: flowsSnapshot.size,
        totalExecutions: executionsSnapshot.size,
        recentActivity
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get analytics');
    }
  }

  // ==================== CLEANUP ====================

  dispose(): void {
    // Clean up all listeners
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}

export const databaseService = new DatabaseService();