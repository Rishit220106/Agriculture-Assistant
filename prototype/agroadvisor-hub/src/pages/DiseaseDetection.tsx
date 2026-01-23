import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Camera, 
  Upload, 
  Plane,
  AlertCircle,
  CheckCircle,
  Info,
  Grid3X3,
  Leaf,
  ShieldCheck,
  Search,
  Loader2,
  Volume2
} from "lucide-react";
import { toast } from "sonner";
import diseaseAdvisory from "@/data/disease_advisory.json";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface PredictionResult {
  predicted_disease: string;
}

interface AdvisoryData {
  crop: string;
  severity: "High" | "Medium" | "Low" | "None";
  advisory: string;
}

interface DroneZone {
  id: string;
  status: "healthy" | "attention" | "risk";
  possibleCategory?: "Fungal" | "Bacterial" | "Pest" | "Nutrient Deficiency" | "Water Stress";
  coverage: number;
}

const advisoryMap = diseaseAdvisory as Record<string, AdvisoryData>;

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "High":
      return "bg-red-100 text-red-700 border-red-200";
    case "Medium":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Low":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "None":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export default function DiseaseDetection() {
  const { t, language } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [droneAnalyzed, setDroneAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const { speak, stop, isSpeaking } = useTextToSpeech(language);

  const CROP_OPTIONS = [
    { value: "rice", label: t("disease.crops.rice") },
    { value: "wheat", label: t("disease.crops.wheat") },
    { value: "maize", label: t("disease.crops.maize") },
    { value: "cotton", label: t("disease.crops.cotton") },
    { value: "tomato", label: t("disease.crops.tomato") },
    { value: "potato", label: t("disease.crops.potato") },
    { value: "sugarcane", label: t("disease.crops.sugarcane") },
    { value: "groundnut", label: t("disease.crops.groundnut") },
    { value: "soybean", label: t("disease.crops.soybean") },
    { value: "other", label: t("disease.crops.other") },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { 
        setUploadedImage(reader.result as string); 
        setPredictionResult(null); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeLeaf = async () => {
    if (!uploadedFile) {
      toast.error("Please upload an image first");
      return;
    }

    setIsAnalyzing(true);
    setPredictionResult(null);
    setServiceError(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await fetch("http://127.0.0.1:8000/predict-disease", {
  method: "POST",
  body: formData,
});


      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      setPredictionResult({ predicted_disease: data.predicted_disease });
      setServiceError(null);
    } catch (error) {
      console.error("Error analyzing image:", error);
      setServiceError("Disease analysis service is temporarily unavailable.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => { 
    setPredictionResult(null); 
    setUploadedImage(null); 
    setUploadedFile(null);
    setServiceError(null);
  };

  const droneZones: DroneZone[] = [
    { id: "A1", status: "healthy", coverage: 12 }, { id: "A2", status: "healthy", coverage: 12 },
    { id: "A3", status: "attention", possibleCategory: "Fungal", coverage: 12 }, { id: "A4", status: "healthy", coverage: 12 },
    { id: "B1", status: "healthy", coverage: 12 }, { id: "B2", status: "attention", possibleCategory: "Nutrient Deficiency", coverage: 12 },
    { id: "B3", status: "risk", possibleCategory: "Pest", coverage: 12 }, { id: "B4", status: "attention", possibleCategory: "Water Stress", coverage: 12 },
    { id: "C1", status: "healthy", coverage: 12 }, { id: "C2", status: "healthy", coverage: 12 },
    { id: "C3", status: "attention", possibleCategory: "Fungal", coverage: 12 }, { id: "C4", status: "healthy", coverage: 12 },
  ];

  const healthySections = droneZones.filter(z => z.status === "healthy").length;
  const attentionSections = droneZones.filter(z => z.status === "attention").length;
  const riskSections = droneZones.filter(z => z.status === "risk").length;
  const affectedPercentage = Math.round(((attentionSections + riskSections) / droneZones.length) * 100);

  const handleDroneAnalysis = () => { setIsAnalyzing(true); setTimeout(() => { setDroneAnalyzed(true); setIsAnalyzing(false); }, 2500); };

  // Get advisory data from the JSON file based on predicted disease
  const getAdvisoryData = (): AdvisoryData | null => {
    if (!predictionResult) return null;
    const diseaseName = predictionResult.predicted_disease;
    return advisoryMap[diseaseName] || null;
  };

  const advisoryData = getAdvisoryData();
  const isHealthy = advisoryData?.severity === "None";

  return (
    <div className="space-y-6">
      <div className="section-header">
        <h1 className="section-title">{t("disease.title")}</h1>
        <p className="section-description">{t("disease.description")}</p>
      </div>

      <Tabs defaultValue="camera" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="camera" className="gap-2"><Camera className="w-4 h-4" />{t("disease.smartphoneCamera")}</TabsTrigger>
          <TabsTrigger value="drone" className="gap-2"><Plane className="w-4 h-4" />{t("disease.droneAssessment")}</TabsTrigger>
        </TabsList>

        <TabsContent value="camera" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel title={t("disease.imageAnalysis")}>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-primary" />
                    {t("disease.cropType")} <span className="text-muted-foreground text-xs">(Optional)</span>
                  </label>
                  <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                    <SelectTrigger><SelectValue placeholder={t("disease.selectCrop")} /></SelectTrigger>
                    <SelectContent>{CROP_OPTIONS.map((crop) => (<SelectItem key={crop.value} value={crop.value}>{crop.label}</SelectItem>))}</SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{t("disease.cropContextHelp")}</p>
                </div>

                <div 
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/20" 
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  {uploadedImage ? (
                    <div className="space-y-3">
                      <img src={uploadedImage} alt="Uploaded leaf" className="max-h-48 mx-auto rounded-md shadow-sm" />
                      <p className="text-sm text-muted-foreground">{t("disease.clickToReplace")}</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="font-medium text-foreground mb-1">{t("disease.uploadImage")}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{t("disease.uploadHint")}</p>
                      <p className="text-xs text-muted-foreground">{t("disease.supported")}</p>
                    </>
                  )}
                  <input 
                    id="image-upload" 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden" 
                    onChange={handleImageUpload} 
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 gap-2" 
                    onClick={handleAnalyzeLeaf} 
                    disabled={!uploadedFile || isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Analyze Leaf
                      </>
                    )}
                  </Button>
                  {(predictionResult || uploadedImage) && (
                    <Button variant="outline" onClick={resetAnalysis}>
                      {t("disease.newAnalysis")}
                    </Button>
                  )}
                </div>
              </div>
            </Panel>

            <div className="space-y-5">
              {serviceError ? (
                <Panel title="Detected Condition">
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 mx-auto text-status-attention mb-4" />
                    <h3 className="font-medium text-foreground mb-2">Service Unavailable</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      {serviceError}
                    </p>
                  </div>
                </Panel>
              ) : predictionResult && advisoryData ? (
                <>
                  <Panel title="Detected Condition">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        {isHealthy ? (
                          <ShieldCheck className="w-8 h-8 text-status-healthy flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-8 h-8 text-status-attention flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground">
                            {predictionResult.predicted_disease}
                          </h3>
                          <span className={`inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full border ${getSeverityColor(advisoryData.severity)}`}>
                            Severity: {advisoryData.severity}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Disease Name</p>
                          <p className="text-sm font-semibold text-foreground">
                            {predictionResult.predicted_disease}
                          </p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Affected Crop</p>
                          <p className="text-sm font-semibold text-foreground">
                            {advisoryData.crop}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Panel>

                  <Panel title="Advisory">
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          {advisoryData.advisory}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (isSpeaking) {
                              stop();
                            } else {
                              speak(advisoryData.advisory);
                            }
                          }}
                          className="w-full gap-2"
                        >
                          <Volume2 className="w-4 h-4" />
                          {isSpeaking ? "Stop Listening" : "🔊 Listen Advisory"}
                        </Button>
                      </div>
                    </div>
                  </Panel>
                </>
              ) : predictionResult && !advisoryData ? (
                <Panel title="Detected Condition">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-8 h-8 text-status-attention flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground">
                          {predictionResult.predicted_disease}
                        </h3>
                        <span className="inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full border bg-muted text-muted-foreground border-border">
                          Advisory data not available
                        </span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        No predefined advisory available for this condition. 
                        Please consult with a local agricultural extension officer for guidance.
                      </p>
                    </div>
                  </div>
                </Panel>
              ) : (
                <Panel title="Detected Condition">
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium text-foreground mb-2">{t("disease.awaitingImage")}</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      {t("disease.awaitingImageDesc")}
                    </p>
                  </div>
                </Panel>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="drone" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Panel title={t("disease.fieldHealthOverview")}>
                {droneAnalyzed ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-2">{droneZones.map((zone) => (<div key={zone.id} className={`aspect-square rounded-md flex flex-col items-center justify-center text-sm font-medium ${zone.status === 'healthy' ? 'bg-status-healthy-bg text-status-healthy' : zone.status === 'attention' ? 'bg-status-attention-bg text-status-attention' : 'bg-status-risk-bg text-status-risk'}`}><span className="text-xs opacity-70">Zone</span><span>{zone.id}</span></div>))}</div>
                    <div className="flex items-center gap-6 pt-4 border-t border-border"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-status-healthy" /><span className="text-xs text-muted-foreground">{t("status.healthy")}</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-status-attention" /><span className="text-xs text-muted-foreground">{t("status.attention")}</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-status-risk" /><span className="text-xs text-muted-foreground">{t("status.risk")}</span></div></div>
                  </div>
                ) : (
                  <div className="text-center py-12"><Grid3X3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" /><h3 className="font-medium mb-2">{t("disease.awaitingImage")}</h3><Button onClick={handleDroneAnalysis} disabled={isAnalyzing}>{isAnalyzing ? t("disease.analyzingField") : t("disease.startDrone")}</Button></div>
                )}
              </Panel>
            </div>
            <div className="space-y-5">
              {droneAnalyzed && (
                <>
                  <Panel title={t("disease.affectedPercentage")}><div className="text-center py-3 bg-muted/50 rounded-lg"><p className="text-3xl font-bold">{affectedPercentage}%</p></div><div className="space-y-2 pt-3 border-t"><div className="flex justify-between"><span className="text-status-healthy">{t("status.healthy")}</span><span>{healthySections}</span></div><div className="flex justify-between"><span className="text-status-attention">{t("status.attention")}</span><span>{attentionSections}</span></div><div className="flex justify-between"><span className="text-status-risk">{t("status.risk")}</span><span>{riskSections}</span></div></div></Panel>
                  <Panel title={t("disease.nextSteps")}><div className="space-y-2"><div className="flex gap-2"><CheckCircle className="w-4 h-4 text-primary mt-1" /><p className="text-sm text-muted-foreground">{t("disease.conductInspection")}</p></div><div className="flex gap-2"><CheckCircle className="w-4 h-4 text-primary mt-1" /><p className="text-sm text-muted-foreground">{t("disease.collectSamples")}</p></div></div></Panel>
                </>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
