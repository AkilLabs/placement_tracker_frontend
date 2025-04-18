import React, { useState, useEffect, useRef } from 'react';
import { FormData, InternshipUpdate } from '../types';
import Button from './Button';
import { Plus, Download, Share2, Image } from 'lucide-react';
import html2canvas from 'html2canvas';
import DataDisplay, { DataReport } from './DataDisplay';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

const initialFormData: FormData = {
  Date: new Date().toISOString().split('T')[0],
  ReportedBy: '',
  FinalYearPlacementUpdates: {
    OffersReceived: '',
    TotalSinceApril: '',
    Remarks: '',
    UnplacedStudentsCount: {
      SNSCE: 0,
      SNSCT: 0,
    },
    AwaitedResults: '',
  },
  PreFinalYearInternships: {
    OffersToday: '',
    TotalSinceApril: 0,
    Remarks: '',
  },
  PreFinalYearHighSalaryOpportunities: {
    OffersToday: '',
    TotalSinceApril: '',
    Remarks: '',
  },
  InternshipUpdates: [
    {
      Company: '',
      Department: '',
      NumberOfStudents: 0,
      Status: '',
    },
  ],
};

const PlacementDataForm: React.FC = () => {
  const { authState } = useAuth(); // Get authentication state
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [savedReports, setSavedReports] = useState<FormData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSavedReports, setShowSavedReports] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Set the username from auth when component mounts or auth state changes
  useEffect(() => {
    if (authState.user) {
      setFormData(prev => ({
        ...prev,
        ReportedBy: authState.user?.username || ''
      }));
    }
  }, [authState.user]);

  useEffect(() => {
    const savedData = localStorage.getItem('placementFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Ensure the ReportedBy is always set from the auth state
        if (authState.user) {
          parsedData.ReportedBy = authState.user.username;
        }
        setFormData(parsedData);
      } catch (e) {
        console.error('Error loading saved form data', e);
      }
    }
  }, [authState.user]);

  useEffect(() => {
    // Make sure to preserve the authenticated username when saving to localStorage
    const dataToSave = { ...formData };
    if (authState.user) {
      dataToSave.ReportedBy = authState.user.username;
    }
    localStorage.setItem('placementFormData', JSON.stringify(dataToSave));
  }, [formData, authState.user]);

  const fetchSavedReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://backend-pqg1.onrender.com/get_data/');

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      setSavedReports(data);
      setShowSavedReports(true);
    } catch (error) {
      console.error('Error fetching saved reports:', error);
      alert('Failed to fetch saved reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReport = (report: FormData) => {
    setFormData(report);
    setShowSavedReports(false);
  };

  // Update the handleChange function to prevent changes to ReportedBy
  const handleChange = (section: string, field: string, value: string | number) => {
    // Prevent changes to ReportedBy field
    if (section === 'basic' && field === 'ReportedBy') {
      return; // Do nothing - username can't be changed
    }

    setFormData(prev => {
      const newData = { ...prev };

      if (section === 'basic') {
        newData[field as keyof FormData] = value;
      } else if (section === 'FinalYearPlacementUpdates') {
        if (field.includes('UnplacedStudentsCount')) {
          const college = field.split('.')[1];
          newData.FinalYearPlacementUpdates.UnplacedStudentsCount[college as 'SNSCE' | 'SNSCT'] = Number(value);
        } else {
          newData.FinalYearPlacementUpdates[field as keyof typeof newData.FinalYearPlacementUpdates] = value;
        }
      } else if (section === 'PreFinalYearInternships') {
        newData.PreFinalYearInternships[field as keyof typeof newData.PreFinalYearInternships] =
          field === 'TotalSinceApril' ? Number(value) : value;
      } else if (section === 'PreFinalYearHighSalaryOpportunities') {
        newData.PreFinalYearHighSalaryOpportunities[field as keyof typeof newData.PreFinalYearHighSalaryOpportunities] = value;
      }

      return newData;
    });
  };

  const handleInternshipChange = (index: number, field: keyof InternshipUpdate, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      InternshipUpdates: prev.InternshipUpdates.map((item, i) =>
        i === index
          ? { ...item, [field]: field === 'NumberOfStudents' ? Number(value) : value }
          : item
      )
    }));
  };

  const addInternshipUpdate = () => {
    setFormData(prev => ({
      ...prev,
      InternshipUpdates: [
        ...prev.InternshipUpdates,
        {
          Company: '',
          Department: '',
          NumberOfStudents: 0,
          Status: '',
        }
      ]
    }));
  };

  const removeInternshipUpdate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      InternshipUpdates: prev.InternshipUpdates.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://backend-pqg1.onrender.com/add_data/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Success:', data);
      setFormSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
      setFormData(initialFormData);
      setFormSubmitted(false);
      localStorage.removeItem('placementFormData');
    }
  };

  const generateImage = async () => {
    setGeneratingImage(true);
    try {
      if (!reportRef.current) return;

      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Better resolution
        logging: false,
        useCORS: true
      });

      const imageUrl = canvas.toDataURL('image/png');
      return imageUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
      return null;
    } finally {
      setGeneratingImage(false);
    }
  };

  const forwardToWhatsApp = async () => {
    setShowReportPreview(true);
    // The actual image generation and forwarding will happen when the user confirms
  };

  const confirmAndForward = async () => {
    // First generate the image
    const imageUrl = await generateImage();
    if (!imageUrl) {
      setShowReportPreview(false);
      return;
    }

    try {
      // Create a formatted message for WhatsApp
      const message = `
*SNS Placement & Internship Daily Report*
*Date:* ${formData.Date}
*Reported By:* ${formData.ReportedBy}

*Final Year Placement Updates:*
- Offers Received: ${formData.FinalYearPlacementUpdates.OffersReceived}
- Total Since April: ${formData.FinalYearPlacementUpdates.TotalSinceApril}
${formData.FinalYearPlacementUpdates.Remarks ? `- Remarks: ${formData.FinalYearPlacementUpdates.Remarks}` : ''}

*Pre-Final Year Internships:*
- Offers Today: ${formData.PreFinalYearInternships.OffersToday}
- Total Since April: ${formData.PreFinalYearInternships.TotalSinceApril}
${formData.PreFinalYearInternships.Remarks ? `- Remarks: ${formData.PreFinalYearInternships.Remarks}` : ''}
      `;

      // Get file name from the date
      const fileName = `placement-report-${formData.Date}.png`;

      // Convert the base64 data URL to a Blob
      const fetchRes = await fetch(imageUrl);
      const imgBlob = await fetchRes.blob();

      // Create a File object from the Blob
      const file = new File([imgBlob], fileName, { type: 'image/png' });

      // Check if the Web Share API is supported by the browser
      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'SNS Placement Report',
            text: message
          });
          console.log('Image shared successfully');
        } catch (error) {
          console.error('Error sharing the image:', error);
          // Fall back to download and WhatsApp URL method
          shareViaWhatsAppLink(imageUrl, message);
        }
      } else {
        // Fall back to download and WhatsApp URL method
        shareViaWhatsAppLink(imageUrl, message);
      }
    } catch (error) {
      console.error('Error preparing image for sharing:', error);
      alert('There was an issue sharing the report. Please try again.');
    } finally {
      setShowReportPreview(false);
    }
  };

  // Fallback method for sharing via WhatsApp
  const shareViaWhatsAppLink = (imageUrl: string, message: string) => {
    // Save the image for the user
    const tempLink = document.createElement('a');
    tempLink.href = imageUrl;
    tempLink.download = `placement-report-${formData.Date}.png`;
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);

    // Let the user know that they'll need to attach the image manually
    alert('Your report image has been downloaded. Please attach it manually when WhatsApp opens.');

    // Open WhatsApp with the pre-filled message
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  if (showReportPreview) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Preview Report Image</h2>
            <p className="text-sm text-gray-500">This is how your report will look as an image</p>
          </div>

          <div ref={reportRef} className="p-6">
            <DataReport data={formData} />
          </div>

          <div className="p-4 border-t flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowReportPreview(false)}
              disabled={generatingImage}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmAndForward}
              disabled={generatingImage}
            >
              <Share2 className="w-4 h-4 mr-2" />
              {generatingImage ? 'Generating...' : 'Share Report'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (formSubmitted) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold mb-4">Report Submitted Successfully!</h2>
        <div className="flex justify-center space-x-4">
          <Button variant="secondary" onClick={() => {
            setFormData(initialFormData);
            setFormSubmitted(false);
          }}>
            Submit New Report
          </Button>
        </div>
      </div>
    );
  }

  if (showSavedReports) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Saved Reports</h2>
          <Button variant="secondary" onClick={() => setShowSavedReports(false)}>
            Back to Form
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-6">Loading saved reports...</div>
        ) : savedReports.length > 0 ? (
          <div className="overflow-auto max-h-[70vh]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-800 text-white">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Reported By</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedReports.map((report, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">{report.Date}</td>
                    <td className="p-2">{report.ReportedBy}</td>
                    <td className="p-2">
                      <Button variant="primary" onClick={() => loadReport(report)}>
                        Load
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6">No saved reports found.</div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex justify-end p-4 bg-gray-50">

      </div>
      <div ref={reportRef}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-800 text-white">
              <th colSpan={4} className="p-4 text-left text-lg">
                SNS Final Year & Pre-Final Year Placement and Internship Daily Report
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-4">Date</td>
              <td className="p-4">
                <input
                  type="date"
                  value={formData.Date}
                  onChange={(e) => handleChange('basic', 'Date', e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </td>
              <td className="p-4">Reported by</td>
              <td className="p-4">
                <input
                  type="text"
                  value={formData.ReportedBy}
                  onChange={(e) => handleChange('basic', 'ReportedBy', e.target.value)}
                  className="border rounded px-2 py-1"
                  disabled // Disable editing of ReportedBy field
                />
              </td>
            </tr>

            {/* Final Year Section */}
            <tr className="bg-gray-100">
              <td colSpan={4} className="p-4 font-semibold">1. Final Year Placement Updates</td>
            </tr>
            <tr className="border-b">
              <td className="p-4">Category</td>
              <td className="p-4">Today</td>
              <td className="p-4">Total Since April</td>
              <td className="p-4">Remarks</td>
            </tr>
            <tr className="border-b">
              <td className="p-4">Offers Received</td>
              <td className="p-4">
                <input
                  type="text"
                  value={formData.FinalYearPlacementUpdates.OffersReceived}
                  onChange={(e) => handleChange('FinalYearPlacementUpdates', 'OffersReceived', e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </td>
              <td className="p-4">
                <input
                  type="text"
                  value={formData.FinalYearPlacementUpdates.TotalSinceApril}
                  onChange={(e) => handleChange('FinalYearPlacementUpdates', 'TotalSinceApril', e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </td>
              <td className="p-4">
                <input
                  type="text"
                  value={formData.FinalYearPlacementUpdates.Remarks}
                  onChange={(e) => handleChange('FinalYearPlacementUpdates', 'Remarks', e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                />
              </td>
            </tr>
            <tr className="border-b">
              <td className="p-4">Unplaced Students Count (SNSCE)</td>
              <td className="p-4">
                <input
                  type="number"
                  value={formData.FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCE}
                  onChange={(e) => handleChange('FinalYearPlacementUpdates', 'UnplacedStudentsCount.SNSCE', e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </td>
              <td colSpan={2}></td>
            </tr>
            <tr className="border-b">
              <td className="p-4">Unplaced Students Count (SNSCT)</td>
              <td className="p-4">
                <input
                  type="number"
                  value={formData.FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCT}
                  onChange={(e) => handleChange('FinalYearPlacementUpdates', 'UnplacedStudentsCount.SNSCT', e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </td>
              <td colSpan={2}></td>
            </tr>
            <tr className="border-b">
              <td className="p-4">Awaited Results</td>
              <td colSpan={3} className="p-4">
                <textarea
                  value={formData.FinalYearPlacementUpdates.AwaitedResults}
                  onChange={(e) => handleChange('FinalYearPlacementUpdates', 'AwaitedResults', e.target.value)}
                  className="border rounded px-2 py-1 w-full h-20 resize-none"
                  placeholder="Enter awaited results details..."
                />
              </td>
            </tr>

            {/* Pre-Final Year Section */}
            <tr className="bg-gray-100">
              <td colSpan={4} className="p-4 font-semibold">2. Pre-Final Year WA / Unicorn / SNS Internships</td>
            </tr>
            <tr className="border-b">
              <td className="p-4">Category</td>
              <td className="p-4">Today</td>
              <td className="p-4">Total Since April</td>
              <td className="p-4">Remarks</td>
            </tr>
            <tr className="border-b">
              <td className="p-4">Offers/Selections</td>
              <td className="p-4">
                <input
                  type="text"
                  value={formData.PreFinalYearInternships.OffersToday}
                  onChange={(e) => handleChange('PreFinalYearInternships', 'OffersToday', e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </td>
              <td className="p-4">
                <input
                  type="number"
                  value={formData.PreFinalYearInternships.TotalSinceApril}
                  onChange={(e) => handleChange('PreFinalYearInternships', 'TotalSinceApril', e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </td>
              <td className="p-4">
                <input
                  type="text"
                  value={formData.PreFinalYearInternships.Remarks}
                  onChange={(e) => handleChange('PreFinalYearInternships', 'Remarks', e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                />
              </td>
            </tr>

            {/* High Salary Section */}
            <tr className="bg-gray-100">
              <td colSpan={4} className="p-4 font-semibold">3. Pre-Final Year – High Salary (10 LPA+) Placement Opportunities</td>
            </tr>
            <tr className="border-b">
              <td className="p-4">Category</td>
              <td className="p-4">Today</td>
              <td className="p-4">Total Since April</td>
              <td className="p-4">Remarks</td>
            </tr>
            <tr className="border-b">
              <td className="p-4">Offers/Selections</td>
              <td className="p-4">
                <input
                  type="text"
                  value={formData.PreFinalYearHighSalaryOpportunities.OffersToday}
                  onChange={(e) => handleChange('PreFinalYearHighSalaryOpportunities', 'OffersToday', e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </td>
              <td className="p-4">
                <input
                  type="text"
                  value={formData.PreFinalYearHighSalaryOpportunities.TotalSinceApril}
                  onChange={(e) => handleChange('PreFinalYearHighSalaryOpportunities', 'TotalSinceApril', e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </td>
              <td className="p-4">
                <input
                  type="text"
                  value={formData.PreFinalYearHighSalaryOpportunities.Remarks}
                  onChange={(e) => handleChange('PreFinalYearHighSalaryOpportunities', 'Remarks', e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                />
              </td>
            </tr>

            {/* Internship Updates */}
            <tr className="bg-gray-100">
              <td colSpan={4} className="p-4 font-semibold flex justify-between items-center">
                <span>4. Internship Updates</span>
                <Button onClick={addInternshipUpdate} type="button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </td>
            </tr>
            <tr className="border-b">
              <td className="p-4">Company</td>
              <td className="p-4">Department</td>
              <td className="p-4">No. of Students</td>
              <td className="p-4">Status</td>
            </tr>
            {formData.InternshipUpdates.map((internship, index) => (
              <tr key={index} className="border-b">
                <td className="p-4">
                  <input
                    type="text"
                    value={internship.Company}
                    onChange={(e) => handleInternshipChange(index, 'Company', e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    value={internship.Department}
                    onChange={(e) => handleInternshipChange(index, 'Department', e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    value={internship.NumberOfStudents}
                    onChange={(e) => handleInternshipChange(index, 'NumberOfStudents', e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </td>
                <td className="p-4 flex justify-between items-center">
                  <input
                    type="text"
                    value={internship.Status}
                    onChange={(e) => handleInternshipChange(index, 'Status', e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                  {formData.InternshipUpdates.length > 1 && (
                    <Button
                      variant="danger"
                      onClick={() => removeInternshipUpdate(index)}
                      type="button"
                      className="ml-2"
                    >
                      Remove
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-gray-50 flex justify-end space-x-4">
        <Button variant="danger" onClick={handleReset} type="button">
          Reset
        </Button>
        <Button type="button" variant="primary" onClick={forwardToWhatsApp}>
          <Share2 className="w-4 h-4 mr-2" />
          Share Report
        </Button>
        <Button type="submit" variant="success" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </Button>
      </div>
    </form>
  );
};

export default PlacementDataForm;
