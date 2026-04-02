
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  Upload, 
  X, 
  Leaf, 
  ImageIcon, 
  Camera, 
  Search,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  Lightbulb,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import DiseaseResult from '@/components/DiseaseResult';
import { predictDisease, DiseasePredictionResult } from '@/lib/diseaseApi';
import { cn } from '@/lib/utils';

const crops = [
  'Apple', 'Blueberry', 'Cherry', 'Corn', 'Cotton', 'Grape', 'Orange', 
  'Peach', 'Pepper', 'Potato', 'Raspberry', 'Rice', 'Soybean', 
  'Squash', 'Strawberry', 'Sugarcane', 'Tomato', 'Wheat'
];

const DiseasePrediction: React.FC = () => {
  const { toast } = useToast();
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseasePredictionResult | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    } else {
      toast({
        title: "Unsupported Format",
        description: "Please provide a valid image file (JPEG, PNG).",
        variant: "destructive",
      });
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handlePredict = async () => {
    if (!image || !selectedCrop) {
      toast({
        title: "Required Information",
        description: "Selection of crop and image upload are mandatory for analysis.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const prediction = await predictDisease(image, selectedCrop);
      setResult(prediction);
      toast({
        title: "Analysis Successful",
        description: `Model has processed the ${selectedCrop} sample.`,
      });
    } catch (error: any) {
      toast({
        title: "System Error",
        description: error.message || "An error occurred during neural inference.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] pb-24">
      <Header scenario="normal" onScenarioChange={() => {}} />
      
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Page Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <BrainCircuit className="h-3 w-3" />
              AI-Powered Diagnostics
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Disease <span className="text-primary">Detection</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Utilize advanced computer vision to identify crop pathogens and receive 
              instant, science-backed treatment protocols.
            </p>
          </div>
          
          <div className="hidden lg:flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-bold">92.4% Accuracy</p>
              <p className="text-xs text-muted-foreground">Latest Model Benchmarks</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Input Section */}
          <div className="lg:col-span-12">
            <Card className="relative overflow-hidden border-0 shadow-xl bg-card/60 backdrop-blur-xl group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
              
              <CardContent className="p-8 md:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Left Column: Form */}
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">1</div>
                        <Label htmlFor="crop-select" className="text-sm font-bold uppercase tracking-widest opacity-70">Define Target Crop</Label>
                      </div>
                      <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                        <SelectTrigger id="crop-select" className="w-full h-14 text-lg border-2 bg-background/50 focus:ring-primary/20">
                          <div className="flex items-center gap-2">
                            <Leaf className="h-5 w-5 text-primary" />
                            <SelectValue placeholder="Select species..." />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          {crops.map((crop) => (
                            <SelectItem key={crop} value={crop} className="py-3 text-lg">
                              {crop}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">2</div>
                        <Label className="text-sm font-bold uppercase tracking-widest opacity-70">Capture/Upload Image</Label>
                      </div>
                      <div
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "relative group flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl transition-all duration-500",
                          isDragActive ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/30",
                          preview ? "h-[300px]" : "h-[300px]"
                        )}
                      >
                        <input type="file" ref={fileInputRef} onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFile(file);
                        }} accept="image/*" className="hidden" />
                        
                        {preview ? (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <div className="relative h-full aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-background ring-1 ring-border">
                              <img src={preview} alt="Leaf preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <p className="text-white font-bold text-sm bg-black/60 px-4 py-2 rounded-full">Change Image</p>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute -top-4 -right-4 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImage(null);
                                setPreview(null);
                                setResult(null);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center space-y-6">
                            <div className="relative mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                              <Camera className="h-10 w-10" />
                              <div className="absolute -bottom-2 -right-2 bg-background p-2 rounded-full shadow-lg">
                                <Upload className="h-4 w-4" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-2xl font-black">Drop or Click</p>
                              <p className="text-sm text-muted-foreground font-medium max-w-[200px]">Securely upload high-resolution leaf images.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Information/Action */}
                  <div className="flex flex-col justify-between">
                    <div className="space-y-6 p-6 rounded-3xl bg-primary/5 border border-primary/10">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        Best Practices
                      </h3>
                      <ul className="space-y-4">
                        {[
                          { icon: Search, text: "Ensure the leaf is in focus and well-lit." },
                          { icon: ImageIcon, text: "Capture the entire leaf against a neutral background." },
                          { icon: AlertCircle, text: "Include the interface between healthy and diseased tissue." }
                        ].map((item, i) => (
                          <li key={i} className="flex gap-3">
                            <div className="mt-1 h-5 w-5 rounded-full bg-background flex items-center justify-center shrink-0 shadow-sm">
                              <item.icon className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-foreground/80 leading-snug">{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      size="lg"
                      className="w-full h-16 text-xl font-black rounded-2xl shadow-2xl transition-all active:scale-[0.98] group"
                      disabled={!image || !selectedCrop || loading}
                      onClick={handlePredict}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                          Running Neural Engine...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-3 h-6 w-6 group-hover:animate-pulse" />
                          Execute Diagnosis
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          {result && (
            <div className="lg:col-span-12 peer-data-[state=loading]:opacity-50 transition-opacity">
              <div className="mb-6 flex items-center justify-between px-2">
                <h2 className="text-xl font-black uppercase tracking-[0.2em] text-foreground/50">
                  Analysis <span className="text-primary/50">Output</span>
                </h2>
                <div className="h-px flex-1 mx-8 bg-border/50" />
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  REAL-TIME DATA
                </div>
              </div>
              <DiseaseResult result={result} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Simple Sparkles icon helper
const Sparkles = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);

export default DiseasePrediction;
