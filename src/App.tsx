import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Plus, Search, Bell } from 'lucide-react';
import { Button } from './components/ui/Button';
import { Sidebar } from './components/Sidebar';
import { UserMenu } from './components/UserMenu';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Agents } from './pages/Agents';
import { Flows } from './pages/Flows';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { CodeLibrary } from './pages/CodeLibrary';
import { CreateAgent } from './pages/CreateAgent.tsx';
import { CreateFlow } from './pages/CreateFlow.tsx';
import { History } from './pages/History';
import { Integrations } from './pages/Integrations';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { AgentSettings } from './pages/AgentSettings';
import { FlowSettings } from './pages/FlowSettings';
import { ApiManagement } from './pages/ApiManagement';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { useNavigate } from 'react-router-dom';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  const showCreateButton = ['/agents', '/'].includes(location.pathname);
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        
        <div className="flex-1">
          <header className="bg-white border-b sticky top-0 z-10">
            <div className="px-8 py-4 flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search agents, flows, or code..."
                  className="w-full pl-10 pr-4 py-2 rounded-[20px] border border-gray-200 focus:outline-none focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Button>
                {showCreateButton && (
                  <Button onClick={() => navigate('/agents/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Agent
                  </Button>
                )}
                <UserMenu />
              </div>
            </div>
          </header>
        
          <main className="p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/agents/new" element={<CreateAgent />} />
              <Route path="/agents/:id/settings" element={<AgentSettings />} />
              <Route path="/flows" element={<Flows />} />
              <Route path="/flows/new" element={<CreateFlow />} />
              <Route path="/flows/:id/settings" element={<FlowSettings />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/code-library" element={<CodeLibrary />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/history" element={<History />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/api" element={<ApiManagement />} />
            </Routes>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default App;