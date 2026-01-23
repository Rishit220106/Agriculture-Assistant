import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, MapPin, Calendar, Wheat, Ruler, Save } from "lucide-react";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const cropOptions = [
  "Rice", "Wheat", "Cotton", "Soybean", "Maize", "Sugarcane",
  "Groundnut", "Mustard", "Chickpea", "Pigeon Pea", "Potato",
  "Onion", "Tomato", "Vegetables", "Fruits"
];

const landholdingOptions = [
  "Less than 1 hectare",
  "1–2 hectares",
  "2–5 hectares",
  "5–10 hectares",
  "More than 10 hectares"
];

export default function Settings() {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [season, setSeason] = useState<"Kharif" | "Rabi" | "Zaid" | "">("");
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [landholding, setLandholding] = useState("");

  useEffect(() => {
    if (profile) {
      setState(profile.state);
      setDistrict(profile.district);
      setSeason(profile.season);
      setSelectedCrops(profile.primary_crops || []);
      setLandholding(profile.landholding_size);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    
    if (!state || !district || !season || selectedCrops.length === 0 || !landholding) {
      toast({
        title: t("common.error"),
        description: t("settings.description"),
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    const { error } = await supabase
      .from("farmer_profiles")
      .update({
        state,
        district,
        season,
        primary_crops: selectedCrops,
        landholding_size: landholding,
      })
      .eq("user_id", user.id);
    
    setLoading(false);
    
    if (error) {
      toast({
        title: t("common.error"),
        description: t("common.error"),
        variant: "destructive",
      });
    } else {
      await refreshProfile();
      toast({
        title: t("common.success"),
        description: t("settings.profileNote"),
      });
    }
  };

  const toggleCrop = (crop: string) => {
    setSelectedCrops(prev => 
      prev.includes(crop) 
        ? prev.filter(c => c !== crop)
        : [...prev, crop]
    );
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <h1 className="section-title">{t("settings.title")}</h1>
        <p className="section-description">
          {t("settings.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <Panel title={t("settings.accountInfo")}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md">
              <div className="p-2 bg-primary/10 rounded-full">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t("settings.emailAddress")}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              {t("settings.accountCreated")}: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
            </p>
          </div>
        </Panel>

        {/* Farm Context */}
        <Panel title={t("settings.farmContext")}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  {t("settings.state")}
                </Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.selectState")} />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">{t("settings.district")}</Label>
                <Input
                  id="district"
                  placeholder={t("settings.enterDistrict")}
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {t("settings.farmingSeason")}
                </Label>
                <Select value={season} onValueChange={(v) => setSeason(v as "Kharif" | "Rabi" | "Zaid")}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.selectSeason")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kharif">{t("settings.seasons.kharif")}</SelectItem>
                    <SelectItem value="Rabi">{t("settings.seasons.rabi")}</SelectItem>
                    <SelectItem value="Zaid">{t("settings.seasons.zaid")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-muted-foreground" />
                  {t("settings.landholdingSize")}
                </Label>
                <Select value={landholding} onValueChange={setLandholding}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.selectSize")} />
                  </SelectTrigger>
                  <SelectContent>
                    {landholdingOptions.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Wheat className="w-4 h-4 text-muted-foreground" />
                {t("settings.primaryCrops")}
              </Label>
              <div className="grid grid-cols-3 gap-2 p-3 border border-border rounded-md bg-muted/20">
                {cropOptions.map((crop) => (
                  <div key={crop} className="flex items-center space-x-2">
                    <Checkbox
                      id={`settings-crop-${crop}`}
                      checked={selectedCrops.includes(crop)}
                      onCheckedChange={() => toggleCrop(crop)}
                    />
                    <Label 
                      htmlFor={`settings-crop-${crop}`} 
                      className="text-xs font-normal cursor-pointer"
                    >
                      {crop}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedCrops.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("settings.selected")}: {selectedCrops.join(", ")}
                </p>
              )}
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {loading ? t("settings.saving") : t("settings.saveChanges")}
            </Button>
          </div>
        </Panel>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {t("settings.profileNote")}
      </p>
    </div>
  );
}
