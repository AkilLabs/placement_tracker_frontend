import React from 'react';
import FormField from '../FormField';
import Card from '../Card';

interface FinalYearSectionProps {
  offersReceived: string;
  unplacedSNSCE: number;
  unplacedSNSCT: number;
  awaitedResults: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errors: {
    'FinalYearPlacementUpdates.OffersReceived'?: string;
    'FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCE'?: string;
    'FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCT'?: string;
    'FinalYearPlacementUpdates.AwaitedResults'?: string;
  };
}

const FinalYearSection: React.FC<FinalYearSectionProps> = ({
  offersReceived,
  unplacedSNSCE,
  unplacedSNSCT,
  awaitedResults,
  onChange,
  errors,
}) => {
  return (
    <Card title="Final Year Placement Updates">
      <FormField
        label="Offers Received"
        name="FinalYearPlacementUpdates.OffersReceived"
        value={offersReceived}
        onChange={onChange}
        required
        error={errors['FinalYearPlacementUpdates.OffersReceived']}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <FormField
          label="Unplaced Students (SNSCE)"
          name="FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCE"
          type="number"
          value={unplacedSNSCE}
          onChange={onChange}
          required
          error={errors['FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCE']}
        />
        <FormField
          label="Unplaced Students (SNSCT)"
          name="FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCT"
          type="number"
          value={unplacedSNSCT}
          onChange={onChange}
          required
          error={errors['FinalYearPlacementUpdates.UnplacedStudentsCount.SNSCT']}
        />
      </div>
      
      <div className="mt-4">
        <FormField
          label="Awaited Results"
          name="FinalYearPlacementUpdates.AwaitedResults"
          value={awaitedResults}
          onChange={onChange}
          required
          error={errors['FinalYearPlacementUpdates.AwaitedResults']}
        />
      </div>
    </Card>
  );
};

export default FinalYearSection;