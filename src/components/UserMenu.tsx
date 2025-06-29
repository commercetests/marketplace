import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, Shield, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(authService.getUserProfile());
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((userProfile) => {
      setUser(userProfile);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-[20px] hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="w-4 h-4 text-blue-700" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-[20px] shadow-lg border py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b">
            <p className="font-medium text-gray-900">{user.displayName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            {user.company && (
              <p className="text-xs text-gray-400">{user.company}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.role === 'admin' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {user.role === 'admin' ? 'Admin' : 'User'}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                {user.subscription?.plan || 'Free'}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                navigate('/settings');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Settings</span>
            </button>

            {user.permissions?.canAccessAnalytics && (
              <button
                onClick={() => {
                  navigate('/analytics');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <BarChart className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Analytics</span>
              </button>
            )}

            {user.role === 'admin' && (
              <button
                onClick={() => {
                  navigate('/admin');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Admin Panel</span>
              </button>
            )}
          </div>

          {/* Usage Stats */}
          <div className="px-4 py-3 border-t">
            <p className="text-xs font-medium text-gray-700 mb-2">This Month</p>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Agent Executions:</span>
                <span>{user.usage?.agentExecutions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Flow Executions:</span>
                <span>{user.usage?.flowExecutions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>API Calls:</span>
                <span>{user.usage?.apiCalls || 0}</span>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <div className="border-t pt-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-red-50 text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}