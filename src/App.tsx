import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import LandingPage from './features/landing/LandingPage';
import AuthModal from './features/auth/AuthModal';
import VerifyEmail from './features/auth/VerifyEmail';
import MeetingRoom from './features/meeting/MeetingRoom';
import Dashboard from './features/dashboard/Dashboard';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

function AppContent() {
  const { user, loading, initialized, init } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    init();
  }, []);

  if (!initialized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="relative">
           <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
           </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <LandingPage onGetStarted={() => navigate('/auth')} />
      } />
      <Route path="/auth" element={
        <div className="min-h-screen w-full flex items-center justify-center bg-background px-6">
           <AuthModal onSuccess={() => navigate('/dashboard')} />
        </div>
      } />
      <Route path="/auth/verify" element={<VerifyEmail />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/meeting/:id" element={<MeetingRoom />} />
    </Routes>
  );
}

export default function App() {
  return (
    <TooltipProvider>
      <Router>
        <AppContent />
        <Toaster position="top-center" expand={true} richColors closeButton />
      </Router>
    </TooltipProvider>
  );
}
