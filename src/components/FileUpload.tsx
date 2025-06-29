import React, { useCallback, useState } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { fileUploadService, UploadResult } from '@/services/fileUploadService';

interface FileUploadProps {
  onUpload: (files: UploadResult[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  folder?: string;
}

interface FileWithStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  result?: UploadResult;
  error?: string;
  progress?: number;
}

export function FileUpload({ 
  onUpload, 
  accept = '.txt,.md,.pdf,.docx,.json,.csv',
  multiple = true,
  maxSize = 10,
  folder = 'uploads'
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  }, []);

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
        return false;
      }
      return true;
    });

    const filesWithStatus: FileWithStatus[] = validFiles.map(file => ({
      file,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...filesWithStatus]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    const results: UploadResult[] = [];

    for (let i = 0; i < pendingFiles.length; i++) {
      const fileIndex = files.findIndex(f => f.file === pendingFiles[i].file);
      
      // Update status to uploading
      setFiles(prev => prev.map((f, idx) => 
        idx === fileIndex ? { ...f, status: 'uploading', progress: 0 } : f
      ));

      try {
        const result = await fileUploadService.uploadFile(
          pendingFiles[i].file,
          folder,
          (progress) => {
            setFiles(prev => prev.map((f, idx) => 
              idx === fileIndex ? { ...f, progress: progress.percentage } : f
            ));
          }
        );

        // Update status to success
        setFiles(prev => prev.map((f, idx) => 
          idx === fileIndex ? { ...f, status: 'success', result } : f
        ));

        results.push(result);
      } catch (error) {
        // Update status to error
        setFiles(prev => prev.map((f, idx) => 
          idx === fileIndex ? { 
            ...f, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Upload failed'
          } : f
        ));
      }
    }

    if (results.length > 0) {
      onUpload(results);
    }
  };

  const getStatusIcon = (status: FileWithStatus['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: FileWithStatus['status']) => {
    switch (status) {
      case 'uploading':
        return 'border-blue-300 bg-blue-50';
      case 'success':
        return 'border-green-300 bg-green-50';
      case 'error':
        return 'border-red-300 bg-red-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-[20px] p-8 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          Drag and drop your files here, or{' '}
          <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
            browse
            <input
              type="file"
              className="hidden"
              accept={accept}
              multiple={multiple}
              onChange={handleFileSelect}
            />
          </label>
        </p>
        <p className="text-sm text-gray-400">
          Supports: {accept.replace(/\./g, '').toUpperCase()} • Max {maxSize}MB per file
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Files to upload:</h4>
          {files.map((fileWithStatus, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 border rounded-lg ${getStatusColor(fileWithStatus.status)}`}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(fileWithStatus.status)}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {fileWithStatus.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {fileUploadService.formatFileSize(fileWithStatus.file.size)}
                    {fileWithStatus.status === 'uploading' && fileWithStatus.progress && (
                      <span> • {Math.round(fileWithStatus.progress)}% uploaded</span>
                    )}
                    {fileWithStatus.status === 'error' && fileWithStatus.error && (
                      <span className="text-red-600"> • {fileWithStatus.error}</span>
                    )}
                  </p>
                </div>
              </div>
              
              {fileWithStatus.status === 'uploading' && fileWithStatus.progress && (
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${fileWithStatus.progress}%` }}
                  />
                </div>
              )}
              
              {fileWithStatus.status === 'pending' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.some(f => f.status === 'pending') && (
        <Button onClick={uploadFiles} className="w-full">
          <Upload className="w-4 h-4 mr-2" />
          Upload {files.filter(f => f.status === 'pending').length} file(s)
        </Button>
      )}
    </div>
  );
}