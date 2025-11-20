import React, { useState } from 'react';
import AuthForm from './AuthForm';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-950/20 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <AuthForm mode={mode} onSuccess={onAuthSuccess} onModeChange={setMode} />
      </div>
    </div>
  );
};

export default AuthPage;
