import { useState } from 'react';
import ResidueForm from './ResidueForm';
import ResidueResult from './ResidueResult';
import { getResidueRecommendation, ResidueRecommendationResponse } from '@/services/residueService';
import { toast } from '@/hooks/use-toast';
import { Leaf } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

const ResidueAdvisor = () => {
  const { t, lang } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [residueData, setResidueData] = useState<ResidueRecommendationResponse | null>(null);

  const handleGetRecommendation = async (data: { crop: string; condition: string; livestock: boolean; goal: string }) => {
    setIsLoading(true);
    setResidueData(null);
    try {
      const rData = await getResidueRecommendation({ ...data, lang });
      setResidueData(rData);

      toast({
        title: t('recommendation_generated') || "Recommendation Generated",
        description: t('customized_plan_ready') || "Your customized residue management plan is ready."
      });
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message?.includes('ML API') 
        ? err.message.split(': ').slice(1).join(': ') 
        : (t('check_connection_try_again') || "Please check your connection and try again.");
      
      try {
        // Try to parse if it's a JSON error from the API
        const jsonError = JSON.parse(errorMessage);
        if (jsonError.error) {
          toast({
            title: t('error_generating_rec') || "Error Generating Recommendation",
            description: jsonError.error,
            variant: "destructive"
          });
          return;
        }
      } catch (e) {
        // fallback to the raw message
      }

      toast({
        title: t('error_generating_rec') || "Error Generating Recommendation",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {

      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-full">
          <Leaf className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('residue_advisor_title')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('residue_advisor_desc') || "Get smart recommendations for managing your crop residue and improving your farm's ecosystem."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <ResidueForm isLoading={isLoading} onSubmit={handleGetRecommendation} />
        </div>
        <div className="md:col-span-2">
          <ResidueResult residueData={residueData} />
        </div>
      </div>
    </div>
  );
};

export default ResidueAdvisor;
