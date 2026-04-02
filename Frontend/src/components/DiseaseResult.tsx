
import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import html2pdf from 'html2pdf.js';
import { 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Droplets, 
  Info, 
  TrendingUp,
  Activity,
  Zap,
  ChevronRight,
  Download
} from 'lucide-react';
import { DiseasePredictionResult } from '@/lib/diseaseApi';
import { cn } from '@/lib/utils';

interface DiseaseResultProps {
  result: DiseasePredictionResult;
}

const DiseaseResult: React.FC<DiseaseResultProps> = ({ result }) => {
  const isHealthy = result.healthy;
  const reportRef = useRef<HTMLDivElement>(null);
  
  const handleExportPDF = () => {
    if (!reportRef.current) return;

    const element = reportRef.current;
    const opt = {
      margin: 10,
      filename: `HarvestIQ_Result_${result.crop}_${result.disease.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };
  
  const severityConfig = {
    High: {
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      gradient: 'from-red-500/20 via-red-500/5 to-transparent',
      icon: AlertCircle
    },
    Medium: {
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      gradient: 'from-orange-500/20 via-orange-500/5 to-transparent',
      icon: AlertCircle
    },
    Low: {
      color: 'text-yellow-600',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      gradient: 'from-yellow-500/20 via-yellow-500/5 to-transparent',
      icon: Info
    },
    None: {
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
      icon: CheckCircle2
    }
  };

  const config = severityConfig[result.severity] || severityConfig.None;
  const SeverityIcon = config.icon;

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div ref={reportRef} className="bg-white rounded-xl overflow-hidden p-[1px]">
        {/* Main Analysis Card */}
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-card/60 backdrop-blur-xl group">
        {/* Decorative Background Gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-40 transition-opacity group-hover:opacity-60 duration-500",
          config.gradient
        )} />

        <CardContent className="relative p-0">
          {/* Header Section */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", config.bg)}>
                  <SeverityIcon className={cn("h-6 w-6", config.color)} />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {result.disease}
                </h2>
              </div>
              <p className="text-muted-foreground font-medium flex items-center gap-2">
                Subject: <span className="text-primary font-bold px-2 py-0.5 rounded bg-primary/10">{result.crop}</span>
                <ChevronRight className="h-4 w-4 opacity-50" />
                Diagnostic Report
              </p>
            </div>

            <Badge variant="outline" className={cn(
              "px-4 py-1.5 text-sm font-bold uppercase tracking-widest border-2 shadow-sm rounded-full",
              config.bg, config.color, config.border
            )}>
              {result.severity} Severity
            </Badge>
          </div>

          {/* Stats Bar */}
          <div className="px-6 md:px-8 pb-8 space-y-6">
            <div className="bg-background/40 backdrop-blur-md rounded-2xl p-6 border border-border/50 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span className="font-bold text-sm tracking-wide uppercase opacity-70">Detection Confidence</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-primary">{result.confidence}</span>
                  <span className="text-sm font-bold opacity-50">%</span>
                </div>
              </div>
              <div className="relative h-4 w-full bg-muted/30 rounded-full overflow-hidden border border-border/50">
                <div 
                  className={cn(
                    "absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,0,0,0.1)]",
                    result.confidence > 70 ? "bg-gradient-to-r from-primary to-emerald-400" : 
                    result.confidence > 40 ? "bg-gradient-to-r from-primary to-orange-400" :
                    "bg-gradient-to-r from-primary to-red-400"
                  )}
                  style={{ width: `${result.confidence}%` }}
                />
                {/* Tick marks */}
                <div className="absolute inset-0 flex justify-between px-1 opacity-20">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-full w-px bg-foreground" />
                  ))}
                </div>
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-tighter opacity-40">
                <span>Low Margin</span>
                <span>Optimized Analysis</span>
                <span>High Certainty</span>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Treatment Module */}
              <div className="group/card relative overflow-hidden p-6 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/30 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/card:opacity-10 transition-opacity">
                  <ShieldAlert className="h-16 w-16 text-primary" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-base uppercase tracking-wider">Protocol</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-xl font-bold text-foreground leading-tight">
                    {result.treatment}
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    Certified phytosanitary recommendation based on historical efficacy data.
                  </p>
                </div>
              </div>

              {/* Nutrition Module */}
              <div className="group/card relative overflow-hidden p-6 rounded-2xl bg-background/50 border border-border/50 hover:border-blue-500/30 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/card:opacity-10 transition-opacity">
                  <Droplets className="h-16 w-16 text-blue-500" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <h3 className="font-bold text-base uppercase tracking-wider">Nutritional Adjustments</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-xl font-bold text-foreground leading-tight">
                    {result.fertilizer}
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    Optimizing nutrient uptake to maximize immune response and yield recovery.
                  </p>
                </div>
              </div>
            </div>

            {/* Critical Actions Footer */}
            {!isHealthy && (
              <div className="relative mt-2 p-6 rounded-2xl bg-red-500/5 border border-red-500/20 overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
                <h4 className="text-xs font-black text-red-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Immediate Field Intervention
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  {[
                    "Isolate the affected area if possible",
                    "Maintain strict sanitation between plots",
                    "Monitor neighboring plants daily",
                    "Document progression with timestamps"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 group/item">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500/50 mt-1.5 group-hover/item:scale-125 transition-transform" />
                      <span className="text-sm font-medium text-foreground/80 leading-tight">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
      
      {/* Informational Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center px-4 gap-4 opacity-70">
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
          <Activity className="h-3 w-3" />
          Model: HarvestIQ CNN-v2.1  •  Last Call: Just Now
        </p>
        <div className="flex gap-4">
          <button 
            onClick={handleExportPDF}
            className="text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2"
          >
            <Download className="h-3 w-3" />
            Export Report (PDF)
          </button>
          <button className="text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors">Contact Agronomist</button>
        </div>
      </div>
    </div>
  );
};

export default DiseaseResult;
