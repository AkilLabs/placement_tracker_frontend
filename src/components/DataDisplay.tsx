import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FormData } from '../types';
import Button from './Button';
import Card from './Card';
import { ArrowLeft, RefreshCw, Download, Users, Briefcase, TrendingUp, Calendar, FileSpreadsheet, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const DataDisplay: React.FC = () => {
  const [reports, setReports] = useState<FormData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<FormData | null>(null);
  const [view, setView] = useState<'dashboard' | 'table'>('table');
  const [filterDate, setFilterDate] = useState<string>('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://backend-pqg1.onrender.com/get_data/');
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to fetch reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (report: FormData) => {
    setSelectedReport(report);
  };

  const handleBackToList = () => {
    setSelectedReport(null);
  };

  // Filter reports by date if filterDate is set
  const filteredReports = useMemo(() => {
    if (!filterDate) return reports;
    return reports.filter(report => report.Date === filterDate);
  }, [reports, filterDate]);

  const downloadExcel = () => {
    if (!reports.length) return;

    // Group reports by ReportedBy
    const reportsByPerson: Record<string, FormData[]> = {};
    
    reports.forEach(report => {
      const reporter = report.ReportedBy;
      if (!reportsByPerson[reporter]) {
        reportsByPerson[reporter] = [];
      }
      reportsByPerson[reporter].push(report);
    });
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Helper function to convert report data to worksheet format
    const convertToWorksheetData = (data: FormData[]) => {
      // Headers row
      const headers = [
        'Date', 
        'FY Offers Received',
        'FY Total Since April',
        'FY Remarks',
        'SNSCE Unplaced',
        'SNSCT Unplaced',
        'Awaited Results',
        'PFY Offers Today',
        'PFY Total Since April',
        'PFY Remarks',
        'High Salary Offers Today',
        'High Salary Total Since April',
        'High Salary Remarks'
      ];

      // Convert data to rows
      const rows = data.map(report => {
        return [
          report.Date,
          report.FinalYearPlacementUpdates.OffersReceived,
          report.FinalYearPlacementUpdates.TotalSinceApril,
          report.FinalYearPlacementUpdates.Remarks,
          report.FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCE,
          report.FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCT,
          report.FinalYearPlacementUpdates.AwaitedResults,
          report.PreFinalYearInternships.OffersToday,
          report.PreFinalYearInternships.TotalSinceApril,
          report.PreFinalYearInternships.Remarks,
          report.PreFinalYearHighSalaryOpportunities.OffersToday,
          report.PreFinalYearHighSalaryOpportunities.TotalSinceApril,
          report.PreFinalYearHighSalaryOpportunities.Remarks
        ];
      });

      // Return data with headers
      return [headers, ...rows];
    };

    // Add a sheet for each person
    Object.entries(reportsByPerson).forEach(([person, personReports]) => {
      const worksheet = XLSX.utils.aoa_to_sheet(convertToWorksheetData(personReports));
      XLSX.utils.book_append_sheet(workbook, worksheet, person);
    });

    // Add a summary sheet with all reports
    const allDataWorksheet = XLSX.utils.aoa_to_sheet(convertToWorksheetData(reports));
    XLSX.utils.book_append_sheet(workbook, allDataWorksheet, 'All Reports');

    // Generate Excel file
    const fileName = `placement_reports_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Calculate summary statistics for the dashboard
  const calculateStats = useCallback(() => {
    if (!reports.length) {
      return {
        totalFYOffers: 0,
        totalPFYOffers: 0,
        totalHighSalaryOffers: 0,
        totalUnplacedStudents: 0,
        latestDate: '',
        latestReport: null as FormData | null
      };
    }

    let totalFYOffers = 0;
    let totalPFYOffers = 0;
    let totalHighSalaryOffers = 0;
    let totalUnplacedStudents = 0;
    let latestDate = reports[0].Date;
    let latestReport = reports[0];

    reports.forEach((report) => {
      // Sum up all the values
      totalFYOffers += parseInt(report.FinalYearPlacementUpdates.OffersReceived) || 0;
      totalPFYOffers += parseInt(report.PreFinalYearInternships.OffersToday) || 0;
      totalHighSalaryOffers += parseInt(report.PreFinalYearHighSalaryOpportunities.OffersToday) || 0;
      
      // Calculate total unplaced
      const snsce = report.FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCE || 0;
      const snsct = report.FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCT || 0;
      totalUnplacedStudents = snsce + snsct; // We take the latest count since this isn't cumulative
      
      // Find the latest report date
      if (new Date(report.Date) > new Date(latestDate)) {
        latestDate = report.Date;
        latestReport = report;
      }
    });

    return {
      totalFYOffers,
      totalPFYOffers,
      totalHighSalaryOffers,
      totalUnplacedStudents,
      latestDate,
      latestReport
    };
  }, [reports]);

  const stats = useMemo(() => calculateStats(), [calculateStats, reports]);

  // Prepare chart data
  const prepareChartData = () => {
    // Sort reports by date
    const sortedReports = [...reports].sort((a, b) => 
      new Date(a.Date).getTime() - new Date(b.Date).getTime()
    );

    // Extract last 7 reports (or all if less than 7)
    const recentReports = sortedReports.slice(-7);
    
    const dates = recentReports.map(report => report.Date);
    const fyOffers = recentReports.map(report => parseInt(report.FinalYearPlacementUpdates.OffersReceived) || 0);
    const pfyOffers = recentReports.map(report => parseInt(report.PreFinalYearInternships.OffersToday) || 0);
    const highSalary = recentReports.map(report => parseInt(report.PreFinalYearHighSalaryOpportunities.OffersToday) || 0);
    
    // Get unplaced data for pie chart
    const latestReport = stats.latestReport;
    const unplacedData = latestReport ? [
      latestReport.FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCE,
      latestReport.FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCT
    ] : [0, 0];
    
    return { 
      dates,
      fyOffers,
      pfyOffers, 
      highSalary,
      unplacedData
    };
  };

  const chartData = useMemo(() => prepareChartData(), [reports, stats.latestReport]);

  // Bar chart options and data config
  const offersChartData = {
    labels: chartData.dates,
    datasets: [
      {
        label: 'Final Year Offers',
        data: chartData.fyOffers,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Pre-Final Year Internships',
        data: chartData.pfyOffers,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'High Salary Opportunities',
        data: chartData.highSalary,
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      }
    ]
  };

  const offersChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Recent Placement & Internship Offers'
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Pie chart for unplaced students
  const unplacedChartData = {
    labels: ['SNSCE', 'SNSCT'],
    datasets: [
      {
        data: chartData.unplacedData,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const unplacedChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Unplaced Students by College'
      },
    },
  };

  // Trend lines for final year total since April
  const trendLineData = {
    labels: chartData.dates,
    datasets: [
      {
        label: 'FY Total Placements',
        data: reports
          .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
          .slice(-7)
          .map(report => parseInt(report.FinalYearPlacementUpdates.TotalSinceApril) || 0),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const trendLineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Placement Trend (Total Since April)'
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Function to render the summary stats cards
  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500 flex items-center">
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          <Briefcase className="w-6 h-6 text-blue-700" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Final Year Offers</h3>
          <p className="text-2xl font-bold">{stats.totalFYOffers}</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500 flex items-center">
        <div className="bg-green-100 p-3 rounded-full mr-4">
          <FileSpreadsheet className="w-6 h-6 text-green-700" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">PFY Internships</h3>
          <p className="text-2xl font-bold">{stats.totalPFYOffers}</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500 flex items-center">
        <div className="bg-yellow-100 p-3 rounded-full mr-4">
          <TrendingUp className="w-6 h-6 text-yellow-700" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">High Salary Offers</h3>
          <p className="text-2xl font-bold">{stats.totalHighSalaryOffers}</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500 flex items-center">
        <div className="bg-red-100 p-3 rounded-full mr-4">
          <Users className="w-6 h-6 text-red-700" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Unplaced Students</h3>
          <p className="text-2xl font-bold">{stats.totalUnplacedStudents}</p>
          <p className="text-xs text-gray-500">Latest count</p>
        </div>
      </div>
    </div>
  );

  // Render report details view
  if (selectedReport) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto my-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-800">
            Report Details - {selectedReport.Date}
          </h1>
          <Button variant="secondary" onClick={handleBackToList}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Basic Info Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Report Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Date</p>
              <p className="font-medium">{selectedReport.Date}</p>
            </div>
            <div>
              <p className="text-gray-600">Reported By</p>
              <p className="font-medium">{selectedReport.ReportedBy}</p>
            </div>
          </div>
        </div>

        {/* Final Year Placement Updates */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Final Year Placement Updates</h2>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2">Category</th>
                <th className="text-left p-2">Today</th>
                <th className="text-left p-2">Total Since April</th>
                <th className="text-left p-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">Offers Received</td>
                <td className="p-2">{selectedReport.FinalYearPlacementUpdates.OffersReceived}</td>
                <td className="p-2">{selectedReport.FinalYearPlacementUpdates.TotalSinceApril}</td>
                <td className="p-2">{selectedReport.FinalYearPlacementUpdates.Remarks}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2" colSpan={4}>
                  <div className="mt-2">
                    <p className="font-semibold">Unplaced Students Count:</p>
                    <div className="flex mt-1">
                      <div className="mr-6">
                        <span className="text-gray-600 mr-2">SNSCE:</span>
                        <span>{selectedReport.FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCE}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 mr-2">SNSCT:</span>
                        <span>{selectedReport.FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCT}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2" colSpan={4}>
                  <div className="mt-2">
                    <p className="font-semibold">Awaited Results:</p>
                    <p className="mt-1">{selectedReport.FinalYearPlacementUpdates.AwaitedResults}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pre-Final Year Internships */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Pre-Final Year Internships</h2>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2">Today</th>
                <th className="text-left p-2">Total Since April</th>
                <th className="text-left p-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">{selectedReport.PreFinalYearInternships.OffersToday}</td>
                <td className="p-2">{selectedReport.PreFinalYearInternships.TotalSinceApril}</td>
                <td className="p-2">{selectedReport.PreFinalYearInternships.Remarks}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pre-Final Year High Salary Opportunities */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Pre-Final Year – High Salary (10 LPA+) Opportunities</h2>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2">Today</th>
                <th className="text-left p-2">Total Since April</th>
                <th className="text-left p-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">{selectedReport.PreFinalYearHighSalaryOpportunities.OffersToday}</td>
                <td className="p-2">{selectedReport.PreFinalYearHighSalaryOpportunities.TotalSinceApril}</td>
                <td className="p-2">{selectedReport.PreFinalYearHighSalaryOpportunities.Remarks}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Internship Updates */}
        <div>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Internship Updates</h2>
          {selectedReport.InternshipUpdates.length === 0 ? (
            <p className="text-gray-500 italic">No internship updates available</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2">Company</th>
                  <th className="text-left p-2">Department</th>
                  <th className="text-left p-2">No. of Students</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedReport.InternshipUpdates.map((internship, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{internship.Company}</td>
                    <td className="p-2">{internship.Department}</td>
                    <td className="p-2">{internship.NumberOfStudents}</td>
                    <td className="p-2">{internship.Status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // Render dashboard view
  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with title, view toggle and actions */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-800 mb-4 sm:mb-0">Placement Dashboard</h1>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex gap-2">
            <Button 
                variant={view === 'table' ? 'primary' : 'secondary'} 
                onClick={() => setView('table')}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" /> 
                Table View
              </Button>
              <Button 
                variant={view === 'dashboard' ? 'primary' : 'secondary'} 
                onClick={() => setView('dashboard')}
              >
                <TrendingUp className="w-4 h-4 mr-2" /> 
                Dashboard
              </Button>
              
            </div>
            
            <div className="flex gap-2">
              <Button variant="secondary" onClick={fetchReports} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Refresh'}
              </Button>
              <Button variant="primary" onClick={downloadExcel} disabled={reports.length === 0 || isLoading}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Filter by date - conditional rendering */}
        {view === 'table' && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex items-center">
            <Filter className="w-5 h-5 text-gray-500 mr-2" />
            <span className="mr-3 text-sm font-medium">Filter by Date:</span>
            <input 
              type="date" 
              value={filterDate} 
              onChange={(e) => setFilterDate(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            />
            {filterDate && (
              <Button 
                variant="secondary"
                onClick={() => setFilterDate('')}
                className="ml-2 text-xs py-1 px-2"
              >
                Clear
              </Button>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 border rounded bg-white shadow-sm">
            <p className="text-gray-500 text-lg">No reports available</p>
            <p className="text-gray-400 mt-2">Submit a report to see data here</p>
          </div>
        ) : (
          <>
            {view === 'dashboard' && (
              <div className="space-y-6">
                {/* Summary Statistics */}
                {renderStatsCards()}

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Offers Bar Chart */}
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <Bar options={offersChartOptions} data={offersChartData} />
                  </div>

                  {/* Unplaced Students Pie Chart */}
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="h-[300px] flex items-center justify-center">
                      <Pie options={unplacedChartOptions} data={unplacedChartData} />
                    </div>
                  </div>
                </div>

                {/* Trends Line Chart */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                  <Line options={trendLineOptions} data={trendLineData} />
                </div>

                {/* Recent Reports */}
                <Card title="Recent Reports">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-blue-800 text-white">
                          <th className="py-2 px-3 text-left">Date</th>
                          <th className="py-2 px-3 text-left">Reported By</th>
                          <th className="py-2 px-3 text-left">FY Offers</th>
                          <th className="py-2 px-3 text-left">PFY Offers</th>
                          <th className="py-2 px-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {reports
                          .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
                          .slice(0, 5)
                          .map((report, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="py-2 px-3">{report.Date}</td>
                              <td className="py-2 px-3">{report.ReportedBy}</td>
                              <td className="py-2 px-3">{report.FinalYearPlacementUpdates.OffersReceived || '0'}</td>
                              <td className="py-2 px-3">{report.PreFinalYearInternships.OffersToday || '0'}</td>
                              <td className="py-2 px-3">
                                <Button variant="primary" onClick={() => handleViewDetails(report)} className="text-xs px-2 py-1">
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {view === 'table' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-blue-800 text-white">
                      <tr>
                        <th className="py-3 px-4 text-left">Date</th>
                        <th className="py-3 px-4 text-left">Reported By</th>
                        <th className="py-3 px-4 text-left">FY Offers</th>
                        <th className="py-3 px-4 text-left">PFY Offers</th>
                        <th className="py-3 px-4 text-left">High Salary Offers</th>
                        <th className="py-3 px-4 text-left">Unplaced (Total)</th>
                        <th className="py-3 px-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredReports
                        .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
                        .map((report, index) => {
                        const totalUnplaced = 
                          report.FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCE + 
                          report.FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCT;
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-3 px-4">{report.Date}</td>
                            <td className="py-3 px-4">{report.ReportedBy}</td>
                            <td className="py-3 px-4">{report.FinalYearPlacementUpdates.OffersReceived || '0'}</td>
                            <td className="py-3 px-4">{report.PreFinalYearInternships.OffersToday || '0'}</td>
                            <td className="py-3 px-4">{report.PreFinalYearHighSalaryOpportunities.OffersToday || '0'}</td>
                            <td className="py-3 px-4">{totalUnplaced}</td>
                            <td className="py-3 px-4">
                              <Button variant="primary" onClick={() => handleViewDetails(report)}>
                                View Details
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DataDisplay;

interface DataReportProps {
  data: FormData;
  className?: string;
}

export const DataReport: React.FC<DataReportProps> = ({ data, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold text-blue-800">SNS Placement & Internship Daily Report</h1>
        <div className="flex justify-between mt-3">
          <p className="text-gray-600"><span className="font-semibold">Date:</span> {data.Date}</p>
          <p className="text-gray-600"><span className="font-semibold">Reported By:</span> {data.ReportedBy}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold bg-blue-100 p-2 border-l-4 border-blue-500">Final Year Placement Updates</h2>
        <div className="grid grid-cols-3 gap-4 mt-3">
          <div className="p-3 border rounded shadow-sm">
            <p className="text-sm text-gray-500">Offers Received Today</p>
            <p className="text-xl font-semibold">{data.FinalYearPlacementUpdates.OffersReceived || '0'}</p>
          </div>
          <div className="p-3 border rounded shadow-sm">
            <p className="text-sm text-gray-500">Total Since April</p>
            <p className="text-xl font-semibold">{data.FinalYearPlacementUpdates.TotalSinceApril || '0'}</p>
          </div>
          <div className="p-3 border rounded shadow-sm">
            <p className="text-sm text-gray-500">Remarks</p>
            <p className="text-sm">{data.FinalYearPlacementUpdates.Remarks || 'N/A'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="p-3 border rounded shadow-sm">
            <p className="text-sm text-gray-500">Unplaced Students (SNSCE)</p>
            <p className="text-xl font-semibold">{data.FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCE}</p>
          </div>
          <div className="p-3 border rounded shadow-sm">
            <p className="text-sm text-gray-500">Unplaced Students (SNSCT)</p>
            <p className="text-xl font-semibold">{data.FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCT}</p>
          </div>
        </div>
        {data.FinalYearPlacementUpdates.AwaitedResults && (
          <div className="p-3 border rounded shadow-sm mt-3">
            <p className="text-sm text-gray-500">Awaited Results</p>
            <p className="text-sm">{data.FinalYearPlacementUpdates.AwaitedResults}</p>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold bg-blue-100 p-2 border-l-4 border-blue-500">Pre-Final Year WA / Unicorn / SNS Internships</h2>
        <div className="grid grid-cols-3 gap-4 mt-3">
          <div className="p-3 border rounded shadow-sm">
            <p className="text-sm text-gray-500">Offers/Selections Today</p>
            <p className="text-xl font-semibold">{data.PreFinalYearInternships.OffersToday || '0'}</p>
          </div>
          <div className="p-3 border rounded shadow-sm">
            <p className="text-sm text-gray-500">Total Since April</p>
            <p className="text-xl font-semibold">{data.PreFinalYearInternships.TotalSinceApril}</p>
          </div>
          <div className="p-3 border rounded shadow-sm">
            <p className="text-sm text-gray-500">Remarks</p>
            <p className="text-sm">{data.PreFinalYearInternships.Remarks || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold bg-blue-100 p-2 border-l-4 border-blue-500">Pre-Final Year – High Salary (10 LPA+) Opportunities</h2>
        <div className="grid grid-cols-3 gap-4 mt-3">
          <div className="p-3 border rounded shadow-sm">
            <p className="text-sm text-gray-500">Offers/Selections Today</p>
            <p className="text-xl font-semibold">{data.PreFinalYearHighSalaryOpportunities.OffersToday || '0'}</p>
          </div>
          <div className="p-3 border rounded shadow-sm">
            <p className="text-sm text-gray-500">Total Since April</p>
            <p className="text-xl font-semibold">{data.PreFinalYearHighSalaryOpportunities.TotalSinceApril || '0'}</p>
          </div>
          <div className="p-3 border rounded shadow-sm">
            <p className="text-sm text-gray-500">Remarks</p>
            <p className="text-sm">{data.PreFinalYearHighSalaryOpportunities.Remarks || 'N/A'}</p>
          </div>
        </div>
      </div>

      {data.InternshipUpdates.length > 0 && (
        <div>
          <h2 className="text-lg font-bold bg-blue-100 p-2 border-l-4 border-blue-500">Internship Updates</h2>
          <div className="mt-3 overflow-hidden border rounded-lg">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Students</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.InternshipUpdates.map((internship, index) => (
                  <tr key={index}>
                    <td className="py-2 px-3 text-sm">{internship.Company || '-'}</td>
                    <td className="py-2 px-3 text-sm">{internship.Department || '-'}</td>
                    <td className="py-2 px-3 text-sm">{internship.NumberOfStudents}</td>
                    <td className="py-2 px-3 text-sm">{internship.Status || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-center text-xs text-gray-500">
        Report generated on {new Date().toLocaleString()}
      </div>
    </div>
  );
};