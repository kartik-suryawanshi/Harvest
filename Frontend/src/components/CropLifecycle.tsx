import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Leaf, 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp,
  Droplets,
  Sun,
  Sprout,
  Wheat,
  TreePine,
  Scissors
} from 'lucide-react';

interface CropLifecycleProps {
  prediction?: {
    yield_t_ha: number;
    ci_lower: number;
    ci_upper: number;
    crop_type: string;
  };
  cropCycle?: {
    sowing_date: string;
    season_length_days: number;
    days_to_maturity: number;
    predicted_maturity_date: string;
    harvest_window: {
      start: string;
      end: string;
    };
    growth_stages: {
      [key: string]: {
        name: string;
        bbch_code: number;
        days_from_sowing: number;
        predicted_date: string;
      };
    };
  };
  featureImportances?: Array<{
    name: string;
    impact: number;
  }>;
  explanationText?: string;
}

const CropLifecycle = ({ 
  prediction, 
  cropCycle, 
  featureImportances = [], 
  explanationText 
}: CropLifecycleProps) => {
  if (!prediction || !cropCycle) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Leaf className="h-5 w-5 text-green-600" />
            <span>Crop Lifecycle</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Leaf className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No crop lifecycle data available</p>
            <p className="text-sm">Generate a prediction to view detailed crop lifecycle information</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStageIcon = (stageName: string) => {
    const name = stageName.toLowerCase();
    if (name.includes('germination')) return <Sprout className="h-4 w-4" />;
    if (name.includes('tillering')) return <Wheat className="h-4 w-4" />;
    if (name.includes('growth')) return <TreePine className="h-4 w-4" />;
    if (name.includes('maturity')) return <Scissors className="h-4 w-4" />;
    return <Leaf className="h-4 w-4" />;
  };

  const getStageColor = (stageName: string) => {
    const name = stageName.toLowerCase();
    if (name.includes('germination')) return 'bg-green-100 text-green-800 border-green-200';
    if (name.includes('tillering')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (name.includes('growth')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (name.includes('maturity')) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const growthStages = Object.values(cropCycle.growth_stages).sort((a, b) => a.days_from_sowing - b.days_from_sowing);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Leaf className="h-5 w-5 text-green-600" />
          <span>Crop Lifecycle</span>
          <Badge variant="outline" className="ml-auto">
            {prediction.crop_type}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sowing Date - Prominent Display */}
        <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-green-600" />
            <div>
              <div className="text-sm font-medium text-green-800">Sowing Date</div>
              <div className="text-2xl font-bold text-green-900">
                {formatDate(cropCycle.sowing_date)}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg border bg-muted/50">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Days to Maturity</span>
            </div>
            <div className="text-xl font-bold text-blue-900">
              {cropCycle.days_to_maturity} days
            </div>
          </div>
          
          <div className="p-3 rounded-lg border bg-muted/50">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Season Length</span>
            </div>
            <div className="text-xl font-bold text-purple-900">
              {cropCycle.season_length_days} days
            </div>
          </div>
        </div>

        {/* Predicted Maturity Date */}
        <div className="p-3 rounded-lg border bg-orange-50 border-orange-200">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Predicted Maturity Date</span>
          </div>
          <div className="text-lg font-bold text-orange-900">
            {formatDate(cropCycle.predicted_maturity_date)}
          </div>
        </div>

        {/* Harvest Window */}
        <div className="p-3 rounded-lg border bg-red-50 border-red-200">
          <div className="flex items-center space-x-2 mb-2">
            <Scissors className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Harvest Window</span>
          </div>
          <div className="text-sm text-red-900">
            <div className="font-semibold">Start: {formatDate(cropCycle.harvest_window.start)}</div>
            <div className="font-semibold">End: {formatDate(cropCycle.harvest_window.end)}</div>
          </div>
        </div>

        {/* Growth Stages Timeline */}
        <div>
          <h4 className="text-sm font-medium mb-4 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Growth Stages Timeline</span>
          </h4>
          <div className="space-y-3">
            {growthStages.map((stage, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg border">
                <div className="flex-shrink-0">
                  <div className={`p-2 rounded-full border ${getStageColor(stage.name)}`}>
                    {getStageIcon(stage.name)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{stage.name}</div>
                    <Badge variant="outline" className="text-xs">
                      BBCH {stage.bbch_code}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Day {stage.days_from_sowing} • {formatDate(stage.predicted_date)}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, (stage.days_from_sowing / cropCycle.days_to_maturity) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Yield Prediction with Confidence Interval */}
        <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-800">Predicted Yield</span>
          </div>
          <div className="text-3xl font-bold text-blue-900 mb-2">
            {prediction.yield_t_ha.toFixed(1)} t/ha
          </div>
          <div className="text-sm text-blue-700">
            <div>Confidence Interval: {prediction.ci_lower.toFixed(1)} - {prediction.ci_upper.toFixed(1)} t/ha</div>
            <div className="mt-1">
              <Progress 
                value={((prediction.yield_t_ha - prediction.ci_lower) / (prediction.ci_upper - prediction.ci_lower)) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </div>

        {/* Feature Importance */}
        {featureImportances.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Key Factors Impact</span>
            </h4>
            <div className="space-y-2">
              {featureImportances.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-20 text-xs text-muted-foreground truncate">
                    {feature.name.replace('Crop_', '').replace(/_/g, ' ')}
                  </div>
                  <Progress value={feature.impact * 100} className="flex-1 h-2" />
                  <div className="w-12 text-xs font-medium text-right">
                    {(feature.impact * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explanation Text */}
        {explanationText && (
          <div className="p-3 rounded-lg border bg-muted/40">
            <div className="text-sm font-medium mb-2">Prediction Summary</div>
            <p className="text-sm text-muted-foreground">
              {explanationText}
            </p>
          </div>
        )}

        {/* Progress Timeline */}
        <div>
          <h4 className="text-sm font-medium mb-3">Overall Progress</h4>
          <div className="relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-muted rounded-full" />
            <div className="relative flex justify-between">
              {growthStages.map((stage, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 bg-background ${
                    index === 0 ? 'border-green-500 bg-green-500' : 'border-muted-foreground'
                  }`} />
                  <div className="mt-2 text-xs text-center max-w-16">
                    <div className="font-medium">{stage.name}</div>
                    <div className="text-muted-foreground">Day {stage.days_from_sowing}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CropLifecycle;
