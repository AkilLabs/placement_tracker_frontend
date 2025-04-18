import React from 'react';
import FormField from '../FormField';
import Card from '../Card';

interface BasicInfoSectionProps {
  date: string;
  reportedBy: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: {
    Date?: string;
    ReportedBy?: string;
  };
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  date,
  reportedBy,
  onChange,
  errors,
}) => {
  return (
    <Card title="Basic Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Date"
          name="Date"
          type="date"
          value={date}
          onChange={onChange}
          required
          error={errors.Date}
        />
        <FormField
          label="Reported By"
          name="ReportedBy"
          value={reportedBy}
          onChange={onChange}
          required
          error={errors.ReportedBy}
        />
      </div>
    </Card>
  );
};

export default BasicInfoSection;