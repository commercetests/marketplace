import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bot,
  GitGraph,
  Plug,
  Settings,
  Code2,
  Database,
  History,
  BarChart,
  Layout,
  LogOut,
  Key
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Layout, label: 'Dashboard', color: 'text-violet-500', path: '/' },
  { icon: Bot, label: 'Agents', color: 'text-blue-500', path: '/agents' },
  { icon: GitGraph, label: 'Flows', color: 'text-emerald-500', path: '/flows' },
  { icon: Database, label: 'Knowledge Base', color: 'text-amber-500', path: '/knowledge-base' },
  { icon: Code2, label: 'Code Library', color: 'text-rose-500', path: '/code-library' },
  { icon: Plug, label: 'Integrations', color: 'text-purple-500', path: '/integrations' },
  { icon: History, label: 'History', color: 'text-indigo-500', path: '/history' },
  { icon: BarChart, label: 'Analytics', color: 'text-cyan-500', path: '/analytics' },
  { icon: Key, label: 'API', color: 'text-orange-500', path: '/api' },
  { icon: Settings, label: 'Settings', color: 'text-slate-500', path: '/settings' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col">
      <div className="p-6">
        <button 
          onClick={() => navigate('/')}
          className="hover:opacity-80 transition-opacity"
        >
          <h1 className="text-[32px] font-medium" style={{ fontFamily: 'Urbanist' }}>Marketplace</h1>
        </button>
      </div>
      
      <nav className="flex-1 px-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button 
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-[20px]',
                  'hover:bg-gray-50 transition-colors',
                  'text-gray-700 hover:text-gray-900',
                  location.pathname === item.path && 'bg-gray-50 text-gray-900'
                )}
              >
                <item.icon className={cn('w-5 h-5', item.color)} />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-[20px] hover:bg-red-50 text-red-600 transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}