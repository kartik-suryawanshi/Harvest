import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf, Loader2 } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

const crops = [
  { value: 'rice', label: 'Rice' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'maize', label: 'Maize' },
  { value: 'sugarcane', label: 'Sugarcane' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'soybean', label: 'Soyabean' }
];

interface ResidueFormProps {
  isLoading: boolean;
  onSubmit: (data: { crop: string; condition: string; livestock: boolean; goal: string }) => void;
}

const ResidueForm = ({ isLoading, onSubmit }: ResidueFormProps) => {
  const { t } = useI18n();
  const [selectedCrop, setSelectedCrop] = useState('');
  const [residueCondition, setResidueCondition] = useState('');
  const [livestockAvailability, setLivestockAvailability] = useState(false);
  const [farmerGoal, setFarmerGoal] = useState('');

  const handleSubmit = () => {
    onSubmit({
      crop: selectedCrop,
      condition: residueCondition,
      livestock: livestockAvailability,
      goal: farmerGoal
    });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{t('farm_parameters') || 'Farm Parameters'}</CardTitle>
        <CardDescription>{t('enter_details_desc') || 'Enter details about your crop and goals'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{t('crop_selection')}</label>
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger>
              <SelectValue placeholder={t('choose_crop')} />
            </SelectTrigger>
            <SelectContent>
              {crops.map((crop) => (
                <SelectItem key={crop.value} value={crop.value}>{crop.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{t('residue_condition')}</label>
          <Select value={residueCondition} onValueChange={setResidueCondition}>
            <SelectTrigger>
              <SelectValue placeholder={t('residue_condition')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dry">{t('dry')}</SelectItem>
              <SelectItem value="wet">{t('wet')}</SelectItem>
              <SelectItem value="green">{t('green')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{t('livestock_availability')}</label>
          <Select value={livestockAvailability ? 'yes' : 'no'} onValueChange={(v) => setLivestockAvailability(v === 'yes')}>
            <SelectTrigger>
              <SelectValue placeholder={t('livestock_availability')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">{t('yes')}</SelectItem>
              <SelectItem value="no">{t('no')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{t('farmer_goal')}</label>
          <Select value={farmerGoal} onValueChange={setFarmerGoal}>
            <SelectTrigger>
              <SelectValue placeholder={t('farmer_goal')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fodder">{t('fodder')}</SelectItem>
              <SelectItem value="income">{t('income')}</SelectItem>
              <SelectItem value="soil">{t('soil')}</SelectItem>
              <SelectItem value="energy">{t('energy')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="w-full mt-4" 
          onClick={handleSubmit}
          disabled={!selectedCrop || !residueCondition || !farmerGoal || isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Leaf className="w-4 h-4 mr-2" />}
          {t('get_recommendation') || 'Get Recommendation'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ResidueForm;
