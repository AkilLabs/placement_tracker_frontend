import React from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { useAuth } from '../../contexts/AuthContext';

const AdminAuthPage: React.FC = () => {
  const { authState, isAdmin } = useAuth();
  
  // If user is authenticated and is an admin, show the admin dashboard
  if (authState.user && isAdmin()) {
    return <AdminDashboard />;
  }
  
  // Otherwise show login form
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] bg-gray-100">
      <div className="w-full max-w-md mb-8">
        <h1 className="text-center text-3xl font-bold text-gray-800 mb-2">Admin Portal</h1>
        <p className="text-center text-gray-600">Secure access for administrators only</p>
      </div>
      <div className="w-full max-w-md">
        <AdminLogin />
      </div>
    </div>
  );
};

export default AdminAuthPage;