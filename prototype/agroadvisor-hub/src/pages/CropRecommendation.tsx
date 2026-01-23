import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sprout, TrendingUp, Info, Check } from "lucide-react";

interface RecommendationResult {
  primaryCrop: {
    name: string;
    suitability: "high" | "medium" | "low";
    profitability: string;
    explanation: string;
  };
  alternatives: Array<{
    name: string;
    suitability: "medium" | "low";
    reason: string;
  }>;
}

export default function CropRecommendation() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    soilType: "",
    soilPh: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    rainfall: "",
    temperature: "",
    humidity: "",
    region: "",
  });
  
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Validate all required inputs
  const isFormValid = useMemo(() => {
    return (
      formData.soilType.trim() !== "" &&
      formData.soilPh.trim() !== "" &&
      formData.nitrogen.trim() !== "" &&
      formData.phosphorus.trim() !== "" &&
      formData.potassium.trim() !== "" &&
      formData.rainfall.trim() !== "" &&
      formData.temperature.trim() !== "" &&
      formData.humidity.trim() !== "" &&
      formData.region.trim() !== "" &&
      !isNaN(parseFloat(formData.soilPh)) &&
      !isNaN(parseFloat(formData.nitrogen)) &&
      !isNaN(parseFloat(formData.phosphorus)) &&
      !isNaN(parseFloat(formData.potassium)) &&
      !isNaN(parseFloat(formData.rainfall)) &&
      !isNaN(parseFloat(formData.temperature)) &&
      !isNaN(parseFloat(formData.humidity))
    );
  }, [formData]);

  // Clear results when inputs change
  useEffect(() => {
    if (result) {
      setResult(null);
    }
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict validation - do not proceed if form is invalid
    if (!isFormValid) {
      return;
    }
    
    setIsAnalyzing(true);
    
    // Simulate analysis
    setTimeout(() => {
      setResult({
        primaryCrop: {
          name: "Soybean",
          suitability: "high",
          profitability: "₹45,000 - ₹55,000 per hectare",
          explanation: "Based on the soil conditions you provided, soybean is well-suited for your region. The nitrogen-fixing properties of soybean will benefit your soil health. The current moisture levels and temperature range are optimal for soybean cultivation during the Kharif season."
        },
        alternatives: [
          { name: "Cotton", suitability: "medium", reason: "Requires slightly higher temperature; good market demand in your region" },
          { name: "Pigeon Pea", suitability: "medium", reason: "Drought-tolerant option; consider if rainfall is below expected levels" }
        ]
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="section-header">
        <h1 className="section-title">{t("cropRec.title")}</h1>
        <p className="section-description">
          {t("cropRec.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-6">
          <Panel title={t("cropRec.soilParams")}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <Label className="form-label">{t("cropRec.soilType")}</Label>
                <Select value={formData.soilType} onValueChange={(v) => handleInputChange("soilType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("cropRec.selectSoilType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clay">{t("cropRec.soilTypes.clay")}</SelectItem>
                    <SelectItem value="sandy">{t("cropRec.soilTypes.sandy")}</SelectItem>
                    <SelectItem value="loamy">{t("cropRec.soilTypes.loamy")}</SelectItem>
                    <SelectItem value="black">{t("cropRec.soilTypes.black")}</SelectItem>
                    <SelectItem value="red">{t("cropRec.soilTypes.red")}</SelectItem>
                    <SelectItem value="alluvial">{t("cropRec.soilTypes.alluvial")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <Label className="form-label">{t("cropRec.soilPh")}</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    placeholder="e.g., 6.5"
                    value={formData.soilPh}
                    onChange={(e) => handleInputChange("soilPh", e.target.value)}
                  />
                  <p className="form-hint">{t("cropRec.range")}</p>
                </div>
                <div className="form-group">
                  <Label className="form-label">{t("cropRec.nitrogen")}</Label>
                  <Input 
                    type="number"
                    placeholder="e.g., 40"
                    value={formData.nitrogen}
                    onChange={(e) => handleInputChange("nitrogen", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <Label className="form-label">{t("cropRec.phosphorus")}</Label>
                  <Input 
                    type="number"
                    placeholder="e.g., 35"
                    value={formData.phosphorus}
                    onChange={(e) => handleInputChange("phosphorus", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <Label className="form-label">{t("cropRec.potassium")}</Label>
                  <Input 
                    type="number"
                    placeholder="e.g., 30"
                    value={formData.potassium}
                    onChange={(e) => handleInputChange("potassium", e.target.value)}
                  />
                </div>
              </div>
            </form>
          </Panel>

          <Panel title={t("cropRec.weatherLocation")}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <Label className="form-label">{t("cropRec.avgRainfall")}</Label>
                  <Input 
                    type="number"
                    placeholder="e.g., 850"
                    value={formData.rainfall}
                    onChange={(e) => handleInputChange("rainfall", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <Label className="form-label">{t("cropRec.temperature")}</Label>
                  <Input 
                    type="number"
                    placeholder="e.g., 28"
                    value={formData.temperature}
                    onChange={(e) => handleInputChange("temperature", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <Label className="form-label">{t("cropRec.humidity")}</Label>
                  <Input 
                    type="number"
                    placeholder="e.g., 70"
                    value={formData.humidity}
                    onChange={(e) => handleInputChange("humidity", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <Label className="form-label">{t("cropRec.region")}</Label>
                  <Select value={formData.region} onValueChange={(v) => handleInputChange("region", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("cropRec.selectRegion")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="central">{t("cropRec.regions.central")}</SelectItem>
                      <SelectItem value="north">{t("cropRec.regions.north")}</SelectItem>
                      <SelectItem value="south">{t("cropRec.regions.south")}</SelectItem>
                      <SelectItem value="east">{t("cropRec.regions.east")}</SelectItem>
                      <SelectItem value="west">{t("cropRec.regions.west")}</SelectItem>
                      <SelectItem value="northeast">{t("cropRec.regions.northeast")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                onClick={handleSubmit}
                disabled={!isFormValid || isAnalyzing}
              >
                {isAnalyzing ? t("cropRec.analyzing") : t("cropRec.getRecommendation")}
              </Button>
            </div>
          </Panel>
        </div>

        {/* Output Panel */}
        <div className="space-y-6">
          {result ? (
            <>
              <Panel title={t("cropRec.recommendedCrop")}>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-status-healthy-bg rounded-md">
                      <Sprout className="w-8 h-8 text-status-healthy" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold text-foreground">{result.primaryCrop.name}</h3>
                        <StatusBadge status={result.primaryCrop.suitability} label={t("cropRec.highSuitability")} />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        <span>{t("cropRec.estProfitability")}: {result.primaryCrop.profitability}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>

              <Panel title={t("cropRec.whyRecommended")}>
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">
                    {result.primaryCrop.explanation}
                  </p>
                </div>
              </Panel>

              <Panel title={t("cropRec.alternatives")}>
                <div className="space-y-3">
                  {result.alternatives.map((alt, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-md">
                      <div className="p-1.5 bg-card rounded">
                        <Sprout className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{alt.name}</span>
                          <StatusBadge status={alt.suitability} label={t("cropRec.mediumSuitability")} />
                        </div>
                        <p className="text-sm text-muted-foreground">{alt.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </>
          ) : (
            <Panel title={t("cropRec.recommendedCrop")}>
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <Sprout className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">{t("cropRec.noRecommendation")}</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Please provide the required inputs to view recommendations.
                </p>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
