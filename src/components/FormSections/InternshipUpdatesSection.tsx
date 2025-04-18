import React from 'react';
import FormField from '../FormField';
import Card from '../Card';
import Button from '../Button';
import { InternshipUpdate } from '../../types';

interface InternshipUpdatesSectionProps {
  internships: InternshipUpdate[];
  onChange: (internships: InternshipUpdate[]) => void;
  errors: {
    [key: string]: string;
  };
}

const InternshipUpdatesSection: React.FC<InternshipUpdatesSectionProps> = ({
  internships,
  onChange,
  errors,
}) => {
  const handleAddInternship = () => {
    onChange([
      ...internships,
      {
        Company: '',
        Department: '',
        NumberOfStudents: 0,
        Status: '',
      },
    ]);
  };

  const handleRemoveInternship = (index: number) => {
    const newInternships = [...internships];
    newInternships.splice(index, 1);
    onChange(newInternships);
  };

  const handleInternshipChange = (
    index: number,
    field: keyof InternshipUpdate,
    value: string | number
  ) => {
    const newInternships = [...internships];
    newInternships[index] = {
      ...newInternships[index],
      [field]: field === 'NumberOfStudents' ? Number(value) : value,
    };
    onChange(newInternships);
  };

  return (
    <Card title="Internship Updates">
      {internships.map((internship, index) => (
        <div
          key={index}
          className="p-4 border border-gray-200 rounded-md mb-4 animate-fadeIn"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Internship #{index + 1}</h3>
            <Button
              variant="danger"
              onClick={() => handleRemoveInternship(index)}
            >
              Remove
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Company"
              name={`InternshipUpdates[${index}].Company`}
              value={internship.Company}
              onChange={(e) => handleInternshipChange(index, 'Company', e.target.value)}
              required
              error={errors[`InternshipUpdates[${index}].Company`]}
            />
            
            <FormField
              label="Department"
              name={`InternshipUpdates[${index}].Department`}
              value={internship.Department}
              onChange={(e) => handleInternshipChange(index, 'Department', e.target.value)}
              required
              error={errors[`InternshipUpdates[${index}].Department`]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField
              label="Number of Students"
              name={`InternshipUpdates[${index}].NumberOfStudents`}
              type="number"
              value={internship.NumberOfStudents}
              onChange={(e) => handleInternshipChange(index, 'NumberOfStudents', e.target.value)}
              required
              error={errors[`InternshipUpdates[${index}].NumberOfStudents`]}
            />
            
            <FormField
              label="Status"
              name={`InternshipUpdates[${index}].Status`}
              value={internship.Status}
              onChange={(e) => handleInternshipChange(index, 'Status', e.target.value)}
              required
              error={errors[`InternshipUpdates[${index}].Status`]}
            />
          </div>
        </div>
      ))}

      <div className="flex justify-center mt-4">
        <Button onClick={handleAddInternship}>
          Add Internship
        </Button>
      </div>
    </Card>
  );
};

export default InternshipUpdatesSection;