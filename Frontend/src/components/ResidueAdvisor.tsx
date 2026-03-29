import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, CheckCircle2, List } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ResidueAdvisorProps {
  residueData: {
    primary_method: string;
    alternatives: string[];
    benefit_key: string;
    steps_key: string;
  } | null;
}

const ResidueAdvisor = ({ residueData }: ResidueAdvisorProps) => {
  const { t } = useI18n();

  if (!residueData) return null;

  return (
    <Card className="border-t-4 border-t-primary shadow-sm bg-gradient-to-b from-card to-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-primary">
          <Leaf className="h-6 w-6" />
          <span>{t('residue_advisor_title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        
        {/* Primary Recommendation */}
        <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">{t('primary_recommendation')}</span>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
              <span className="text-xl font-bold text-foreground">
                {t(residueData.primary_method)}
              </span>
            </div>
            {residueData.benefit_key && (
              <p className="text-sm font-medium text-muted-foreground mt-2 pl-9 border-l-2 border-primary/30 ml-3">
                <span className="text-foreground mr-1">{t('key_benefit')}:</span> 
                {t(residueData.benefit_key)}
              </p>
            )}
          </div>
        </div>

        {/* Alternatives */}
        {residueData.alternatives && residueData.alternatives.length > 0 && (
          <div>
            <span className="text-sm font-medium text-muted-foreground mb-2 block">{t('alternative_methods')}</span>
            <div className="flex flex-wrap gap-2">
              {residueData.alternatives.map((alt) => (
                <Badge key={alt} variant="secondary" className="px-3 py-1">
                  {t(alt)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Steps */}
        {residueData.steps_key && (
          <Accordion type="single" collapsible className="w-full mt-2">
            <AccordionItem value="steps" className="border rounded-lg px-4 bg-card/50">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{t('how_to_do_it')}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <ul className="space-y-3">
                  {(() => {
                    const rawSteps: any = t(residueData.steps_key);
                    const steps = Array.isArray(rawSteps) ? rawSteps : typeof rawSteps === 'string' ? rawSteps.split('. ') : [];
                    return steps.map((step: string, index: number) => (
                      <li key={index} className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs">
                          {index + 1}
                        </span>
                        <span className="mt-0.5 text-muted-foreground leading-relaxed">{step}</span>
                      </li>
                    ));
                  })()}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
      </CardContent>
    </Card>
  );
};

export default ResidueAdvisor;
