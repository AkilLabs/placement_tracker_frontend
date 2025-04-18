import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

const AuthenticationPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'login' | 'signup'>('login');

  const switchToSignup = () => setCurrentView('signup');
  const switchToLogin = () => setCurrentView('login');

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-md">
        {currentView === 'login' ? (
          <Login onSwitchToSignup={switchToSignup} />
        ) : (
          <Signup onSwitchToLogin={switchToLogin} />
        )}
      </div>
    </div>
  );
};

export default AuthenticationPage;