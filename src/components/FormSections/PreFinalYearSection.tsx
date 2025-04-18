import React from 'react';
import FormField from '../FormField';
import Card from '../Card';

interface PreFinalYearSectionProps {
  offersToday: string;
  totalSinceApril: number;
  remarks: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errors: {
    'PreFinalYearInternships.OffersToday'?: string;
    'PreFinalYearInternships.TotalSinceApril'?: string;
    'PreFinalYearInternships.Remarks'?: string;
  };
}

const PreFinalYearSection: React.FC<PreFinalYearSectionProps> = ({
  offersToday,
  totalSinceApril,
  remarks,
  onChange,
  errors,
}) => {
  return (
    <Card title="Pre-Final Year Internships">
      <FormField
        label="Offers Today"
        name="PreFinalYearInternships.OffersToday"
        value={offersToday}
        onChange={onChange}
        required
        error={errors['PreFinalYearInternships.OffersToday']}
      />
      
      <div className="mt-4">
        <FormField
          label="Total Since April"
          name="PreFinalYearInternships.TotalSinceApril"
          type="number"
          value={totalSinceApril}
          onChange={onChange}
          required
          error={errors['PreFinalYearInternships.TotalSinceApril']}
        />
      </div>
      
      <div className="mt-4">
        <FormField
          label="Remarks"
          name="PreFinalYearInternships.Remarks"
          type="textarea"
          value={remarks}
          onChange={onChange}
          error={errors['PreFinalYearInternships.Remarks']}
        />
      </div>
    </Card>
  );
};

export default PreFinalYearSection;