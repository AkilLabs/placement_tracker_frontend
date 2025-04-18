import React from 'react';
import FormField from '../FormField';
import Card from '../Card';

interface HighSalarySectionProps {
  offersToday: string;
  totalSinceApril: string;
  remarks: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errors: {
    'PreFinalYearHighSalaryOpportunities.OffersToday'?: string;
    'PreFinalYearHighSalaryOpportunities.TotalSinceApril'?: string;
    'PreFinalYearHighSalaryOpportunities.Remarks'?: string;
  };
}

const HighSalarySection: React.FC<HighSalarySectionProps> = ({
  offersToday,
  totalSinceApril,
  remarks,
  onChange,
  errors,
}) => {
  return (
    <Card title="Pre-Final Year High Salary Opportunities">
      <FormField
        label="Offers Today"
        name="PreFinalYearHighSalaryOpportunities.OffersToday"
        value={offersToday}
        onChange={onChange}
        required
        error={errors['PreFinalYearHighSalaryOpportunities.OffersToday']}
      />
      
      <div className="mt-4">
        <FormField
          label="Total Since April"
          name="PreFinalYearHighSalaryOpportunities.TotalSinceApril"
          value={totalSinceApril}
          onChange={onChange}
          required
          error={errors['PreFinalYearHighSalaryOpportunities.TotalSinceApril']}
        />
      </div>
      
      <div className="mt-4">
        <FormField
          label="Remarks"
          name="PreFinalYearHighSalaryOpportunities.Remarks"
          type="textarea"
          value={remarks}
          onChange={onChange}
          error={errors['PreFinalYearHighSalaryOpportunities.Remarks']}
        />
      </div>
    </Card>
  );
};

export default HighSalarySection;