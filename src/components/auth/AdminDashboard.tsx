import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FormData } from '../../types';
import Button from '../Button';
import Card from '../Card';
import DataDisplay from '../DataDisplay';
import { ListFilter, FileSpreadsheet, BarChart2, Users, LogOut, Grid, Settings } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { authState, logout } = useAuth();
  const [reports, setReports] = useState<FormData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'reports' | 'analytics' | 'users' | 'settings'>('reports');
  const [totalPlacements, setTotalPlacements] = useState(0);
  const [totalInternships, setTotalInternships] = useState(0);
  const [unplacedStudents, setUnplacedStudents] = useState(0);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://backend-pqg1.onrender.com/get_data/');
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setReports(data);
      
      // Calculate summary stats
      let placementsTotal = 0;
      let internshipsTotal = 0;
      let unplacedTotal = 0;
      
      data.forEach((report: FormData) => {
        if (report.FinalYearPlacementUpdates?.OffersReceived) {
          placementsTotal += parseInt(report.FinalYearPlacementUpdates.OffersReceived) || 0;
        }
        
        if (report.PreFinalYearInternships?.OffersToday) {
          internshipsTotal += parseInt(report.PreFinalYearInternships.OffersToday) || 0;
        }
        
        const unplacedSNSCE = report.FinalYearPlacementUpdates?.UnplacedStudentsCount?.SNSCE || 0;
        const unplacedSNSCT = report.FinalYearPlacementUpdates?.UnplacedStudentsCount?.SNSCT || 0;
        unplacedTotal = unplacedSNSCE + unplacedSNSCT;
      });
      
      setTotalPlacements(placementsTotal);
      setTotalInternships(internshipsTotal);
      setUnplacedStudents(unplacedTotal);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatCard = (title: string, value: number | string, icon: React.ReactNode, color: string) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-')} bg-opacity-10`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderStatCard(
            "Total Placements", 
            totalPlacements,
            <Users className="w-8 h-8 text-green-500" />,
            "border-green-500"
          )}
          
          {renderStatCard(
            "Total Internships", 
            totalInternships,
            <FileSpreadsheet className="w-8 h-8 text-blue-500" />,
            "border-blue-500"
          )}
          
          {renderStatCard(
            "Unplaced Students", 
            unplacedStudents,
            <Users className="w-8 h-8 text-red-500" />,
            "border-red-500"
          )}
        </div>
        
        <Card title="Recent Placement Reports">
          <DataDisplay />
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case 'reports':
        return renderDashboard();
      case 'analytics':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Analytics Dashboard</h2>
            <p className="text-gray-500">Advanced analytics will be available soon.</p>
          </div>
        );
      case 'users':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <p className="text-gray-500">User management will be available soon.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Admin Settings</h2>
            <p className="text-gray-500">Admin settings will be available soon.</p>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-blue-800 min-h-screen p-4 fixed">
          <div className="flex items-center justify-center mb-8 pt-4">
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          </div>
          
          <nav className="space-y-2">
            <button 
              className={`flex items-center w-full p-3 rounded-lg text-left transition-colors ${
                activeView === 'reports' ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700'
              }`}
              onClick={() => setActiveView('reports')}
            >
              <ListFilter className="w-5 h-5 mr-3" />
              Placement Reports
            </button>
            
            <button 
              className={`flex items-center w-full p-3 rounded-lg text-left transition-colors ${
                activeView === 'analytics' ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700'
              }`}
              onClick={() => setActiveView('analytics')}
            >
              <BarChart2 className="w-5 h-5 mr-3" />
              Analytics
            </button>
            
            <button 
              className={`flex items-center w-full p-3 rounded-lg text-left transition-colors ${
                activeView === 'users' ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700'
              }`}
              onClick={() => setActiveView('users')}
            >
              <Users className="w-5 h-5 mr-3" />
              Users
            </button>
            
            <button 
              className={`flex items-center w-full p-3 rounded-lg text-left transition-colors ${
                activeView === 'settings' ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700'
              }`}
              onClick={() => setActiveView('settings')}
            >
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </button>
            
            <div className="pt-8 mt-8 border-t border-blue-700">
              <button 
                className="flex items-center w-full p-3 rounded-lg text-left text-blue-100 hover:bg-blue-700 transition-colors"
                onClick={logout}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="ml-64 p-8 w-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome, {authState.user?.username}</h1>
              <p className="text-gray-600">Here's an overview of all placement activities</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleDateString()}
              </span>
              <Button 
                variant="primary"
                onClick={fetchReports}
                disabled={isLoading}
              >
                <Grid className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
          
          {/* Content area */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;