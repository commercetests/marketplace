import React, { useState, useEffect, useRef } from 'react';
import { Shield, Lock, Unlock, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { securityService } from '@/services/securityService';

interface SecurityLock {
  id: string;
  type: 'authentication' | 'authorization' | 'encryption';
  status: 'locked' | 'unlocked';
  angle: number;
  requiredAngle: number;
  lastAttempt: Date;
  attempts: number;
}

interface TripleRadialLockProps {
  userId: string;
  onUnlocked: () => void;
  onFailed: (message: string) => void;
}

export function TripleRadialLock({ userId, onUnlocked, onFailed }: TripleRadialLockProps) {
  const [locks, setLocks] = useState<SecurityLock[]>([]);
  const [selectedLock, setSelectedLock] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dragAngle, setDragAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const centerX = 200;
  const centerY = 200;
  const baseRadius = 150;

  useEffect(() => {
    loadSecurityLocks();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (locks.length > 0) {
      drawLocks();
    }
  }, [locks, selectedLock, dragAngle, isDragging]);

  const loadSecurityLocks = async () => {
    try {
      setIsLoading(true);
      
      // Initialize locks if they don't exist
      let userLocks = await securityService.getSecurityLocks();
      
      if (!userLocks || userLocks.length === 0) {
        userLocks = await securityService.tripleRadialLock.initializeLocks(userId);
      }
      
      setLocks(userLocks);
      setMessage('Align all three security locks to continue');
    } catch (error) {
      console.error('Failed to load security locks:', error);
      onFailed('Failed to load security locks');
    } finally {
      setIsLoading(false);
    }
  };

  const drawLocks = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set high DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    // Draw background gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius + 50);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 400);

    // Draw locks from outer to inner
    locks.forEach((lock, index) => {
      const lockRadius = baseRadius - (index * 45);
      const isSelected = index === selectedLock;
      const isUnlocked = lock.status === 'unlocked';

      // Lock ring colors
      const ringColor = isSelected ? '#3B82F6' : '#E5E7EB';
      const statusColor = isUnlocked ? '#10B981' : '#EF4444';
      const targetColor = isUnlocked ? '#10B981' : '#F59E0B';

      // Draw outer ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, lockRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = isSelected ? 6 : 3;
      ctx.stroke();

      // Draw status ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, lockRadius - 15, 0, 2 * Math.PI);
      ctx.strokeStyle = statusColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw target position (yellow/green dot)
      const targetAngle = (lock.requiredAngle * Math.PI) / 180 - Math.PI / 2;
      const targetX = centerX + (lockRadius - 25) * Math.cos(targetAngle);
      const targetY = centerY + (lockRadius - 25) * Math.sin(targetAngle);
      
      ctx.beginPath();
      ctx.arc(targetX, targetY, 10, 0, 2 * Math.PI);
      ctx.fillStyle = targetColor;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw current position handle (blue dot)
      const currentAngle = isSelected && isDragging 
        ? (dragAngle * Math.PI) / 180 - Math.PI / 2
        : (lock.angle * Math.PI) / 180 - Math.PI / 2;
      const handleX = centerX + (lockRadius - 25) * Math.cos(currentAngle);
      const handleY = centerY + (lockRadius - 25) * Math.sin(currentAngle);
      
      ctx.beginPath();
      ctx.arc(handleX, handleY, 15, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? '#3B82F6' : '#6B7280';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw lock type label
      const labelAngle = Math.PI / 2 + (index * 2 * Math.PI / 3);
      const labelX = centerX + (lockRadius + 35) * Math.cos(labelAngle);
      const labelY = centerY + (lockRadius + 35) * Math.sin(labelAngle);
      
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(lock.type.toUpperCase(), labelX, labelY);

      // Draw status text
      ctx.font = '10px Arial';
      ctx.fillStyle = statusColor;
      ctx.fillText(isUnlocked ? 'UNLOCKED' : 'LOCKED', labelX, labelY + 15);

      // Draw alignment indicator
      const angleDiff = Math.abs(lock.angle - lock.requiredAngle);
      const isAligned = angleDiff <= 5 || angleDiff >= 355;
      
      if (isAligned && !isUnlocked) {
        // Draw alignment glow
        ctx.beginPath();
        ctx.arc(handleX, handleY, 20, 0, 2 * Math.PI);
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI);
    const allUnlocked = locks.every(l => l.status === 'unlocked');
    ctx.fillStyle = allUnlocked ? '#10B981' : '#6B7280';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw center icon
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(allUnlocked ? '✓' : '🔒', centerX, centerY + 8);

    // Draw progress arc
    const unlockedCount = locks.filter(l => l.status === 'unlocked').length;
    const progressAngle = (unlockedCount / locks.length) * 2 * Math.PI;
    
    if (progressAngle > 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 20, -Math.PI / 2, -Math.PI / 2 + progressAngle);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  };

  const getMousePosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const calculateAngle = (x: number, y: number) => {
    const angle = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI + 90;
    return angle < 0 ? angle + 360 : angle;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePosition(e);
    
    // Check which lock was clicked
    locks.forEach((lock, index) => {
      const lockRadius = baseRadius - (index * 45);
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      if (distance >= lockRadius - 40 && distance <= lockRadius + 20) {
        setSelectedLock(index);
        setIsDragging(true);
        setDragAngle(calculateAngle(x, y));
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const { x, y } = getMousePosition(e);
    setDragAngle(calculateAngle(x, y));
  };

  const handleMouseUp = async () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    try {
      const lock = locks[selectedLock];
      const result = await securityService.alignSecurityLock(lock.type, dragAngle);

      // Update locks state
      const updatedLocks = [...locks];
      updatedLocks[selectedLock] = result.lock;
      setLocks(updatedLocks);

      setMessage(result.message);
      setAttempts(prev => prev + 1);

      if (result.allLocksAligned) {
        setMessage('All locks aligned! Access granted.');
        setTimeout(() => onUnlocked(), 1000);
      } else if (!result.success) {
        // Vibrate on failure (if supported)
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
      }

    } catch (error) {
      onFailed(error instanceof Error ? error.message : 'Lock alignment failed');
    }
  };

  const resetLocks = async () => {
    try {
      setIsLoading(true);
      const newLocks = await securityService.resetSecurityLocks();
      setLocks(newLocks);
      setAttempts(0);
      setMessage('Security locks have been reset');
    } catch (error) {
      onFailed('Failed to reset locks');
    } finally {
      setIsLoading(false);
    }
  };

  const getLockTypeIcon = (type: string) => {
    switch (type) {
      case 'authentication': return <Shield className="w-5 h-5" />;
      case 'authorization': return <Lock className="w-5 h-5" />;
      case 'encryption': return <Unlock className="w-5 h-5" />;
      default: return <Lock className="w-5 h-5" />;
    }
  };

  const getLockTypeColor = (type: string, status: string) => {
    const baseColors = {
      authentication: status === 'unlocked' ? 'text-blue-600' : 'text-blue-400',
      authorization: status === 'unlocked' ? 'text-purple-600' : 'text-purple-400',
      encryption: status === 'unlocked' ? 'text-green-600' : 'text-green-400'
    };
    return baseColors[type as keyof typeof baseColors] || 'text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const allUnlocked = locks.every(l => l.status === 'unlocked');
  const unlockedCount = locks.filter(l => l.status === 'unlocked').length;

  return (
    <div className="bg-white rounded-[24px] border p-8 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Triple Radial Security Lock</h2>
        <p className="text-gray-600">
          Align all three security locks by rotating them to match the target positions
        </p>
      </div>

      {/* Security Status */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {locks.map((lock, index) => (
          <div 
            key={lock.id}
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              selectedLock === index 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedLock(index)}
          >
            <div className="flex items-center justify-center mb-2">
              <div className={getLockTypeColor(lock.type, lock.status)}>
                {getLockTypeIcon(lock.type)}
              </div>
            </div>
            <h3 className="text-sm font-medium text-center capitalize mb-1">
              {lock.type}
            </h3>
            <div className="flex items-center justify-center gap-1">
              {lock.status === 'unlocked' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-xs ${
                lock.status === 'unlocked' ? 'text-green-600' : 'text-red-600'
              }`}>
                {lock.status === 'unlocked' ? 'Unlocked' : 'Locked'}
              </span>
            </div>
            <div className="text-xs text-gray-500 text-center mt-1">
              {lock.attempts}/10 attempts
            </div>
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progress: {unlockedCount}/3 locks aligned
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((unlockedCount / 3) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(unlockedCount / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Interactive Lock Canvas */}
      <div className="flex justify-center mb-6">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="border rounded-lg cursor-pointer bg-gray-50"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ width: '400px', height: '400px' }}
        />
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Click on a lock ring to select it (highlighted in blue)</li>
          <li>2. Drag the handle (blue dot) to rotate the lock</li>
          <li>3. Align the handle with the target (yellow/green dot)</li>
          <li>4. Repeat for all three locks to unlock the system</li>
        </ol>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          allUnlocked 
            ? 'bg-green-50 border border-green-200' 
            : message.includes('failed') || message.includes('error')
            ? 'bg-red-50 border border-red-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <p className={`text-sm ${
            allUnlocked 
              ? 'text-green-700' 
              : message.includes('failed') || message.includes('error')
              ? 'text-red-700'
              : 'text-blue-700'
          }`}>
            {message}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={resetLocks}
          disabled={isLoading}
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Locks
        </Button>
        
        {allUnlocked && (
          <Button
            onClick={onUnlocked}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Continue
          </Button>
        )}
      </div>

      {/* Security Info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          This triple radial lock system provides enhanced security through multi-layer authentication.
          Each lock must be precisely aligned to grant access.
        </p>
      </div>
    </div>
  );
}