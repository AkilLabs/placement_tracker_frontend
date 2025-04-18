import React from 'react';
import PlacementDataForm from './components/PlacementDataForm';
import DataDisplay from './components/DataDisplay';
import Button from './components/Button';
import { FileSpreadsheet, ListFilter, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthenticationPage from './components/auth/AuthenticationPage';
import logoImage from '/logo.png'; // Import the logo image

// Create an authenticated app component
const AuthenticatedApp: React.FC = () => {
  const { authState, logout, isAdmin } = useAuth();
  
  // If user is not authenticated, show login page
  if (!authState.user) {
    return <AuthenticationPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <img src={logoImage} alt="SNS Logo" className="h-10 mr-3" />
            <h1 className="text-3xl font-bold text-blue-800">SNS Placement Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {authState.user.username} {isAdmin() && ' (Admin)'}
            </span>
            <nav className="flex gap-2">
              {/* Only regular users can see the submit report button */}
              {/* {!isAdmin() && (
                <Button variant="primary">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Submit Report
                </Button>
              )} */}
              
              {/* Only admins can see the view reports button */}
              {/* {isAdmin() && (
                <Button variant="primary">
                  <ListFilter className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
              )} */}
              
              <Button 
                variant="secondary"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </nav>
          </div>
        </header>

        {/* Render component based on user role */}
        {isAdmin() ? <DataDisplay /> : <PlacementDataForm />}
      </div>
    </div>
  );
};

// Main App component wrapped with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;