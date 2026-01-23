import { useAuth, FarmerProfile } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { 
  Sprout, 
  ScanLine, 
  Landmark, 
  MapPin,
  Calendar,
  Wheat,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Ruler
} from "lucide-react";
import { Link } from "react-router-dom";

// Generate context-aware mock data based on user profile
function generateInsights(profile: FarmerProfile) {
  const seasonData: Record<string, { crops: string[]; yields: Record<string, string>; profits: Record<string, string> }> = {
    Kharif: {
      crops: ["Rice", "Cotton", "Soybean", "Maize", "Groundnut"],
      yields: { Rice: "40–52 q/ha", Cotton: "12–18 q/ha", Soybean: "18–24 q/ha", Maize: "45–60 q/ha", Groundnut: "15–22 q/ha" },
      profits: { Rice: "₹48K–62K/ha", Cotton: "₹55K–70K/ha", Soybean: "₹42K–55K/ha", Maize: "₹38K–50K/ha", Groundnut: "₹45K–58K/ha" }
    },
    Rabi: {
      crops: ["Wheat", "Chickpea", "Mustard", "Potato", "Onion"],
      yields: { Wheat: "38–48 q/ha", Chickpea: "12–16 q/ha", Mustard: "10–14 q/ha", Potato: "180–240 q/ha", Onion: "200–280 q/ha" },
      profits: { Wheat: "₹45K–58K/ha", Chickpea: "₹52K–68K/ha", Mustard: "₹38K–48K/ha", Potato: "₹65K–85K/ha", Onion: "₹55K–75K/ha" }
    },
    Zaid: {
      crops: ["Vegetables", "Maize", "Groundnut", "Sugarcane", "Fruits"],
      yields: { Vegetables: "120–180 q/ha", Maize: "35–45 q/ha", Groundnut: "14–20 q/ha", Sugarcane: "650–800 q/ha", Fruits: "80–120 q/ha" },
      profits: { Vegetables: "₹70K–95K/ha", Maize: "₹35K–45K/ha", Groundnut: "₹42K–55K/ha", Sugarcane: "₹85K–110K/ha", Fruits: "₹75K–100K/ha" }
    }
  };

  const currentSeasonData = seasonData[profile.season] || seasonData.Kharif;
  
  // Find best matching crop from user's interests
  const matchingCrops = profile.primary_crops.filter(crop => 
    currentSeasonData.crops.includes(crop)
  );
  
  const recommendedCrop = matchingCrops.length > 0 
    ? matchingCrops[0] 
    : currentSeasonData.crops[0];

  // State-based scheme counts
  const schemesByState: Record<string, { total: number; eligible: number }> = {
    Maharashtra: { total: 8, eligible: 5 },
    Punjab: { total: 7, eligible: 4 },
    Karnataka: { total: 9, eligible: 6 },
    Gujarat: { total: 7, eligible: 5 },
    default: { total: 6, eligible: 4 }
  };

  const schemes = schemesByState[profile.state] || schemesByState.default;

  // Generate recent recommendations
  const recentRecommendations = currentSeasonData.crops.slice(0, 3).map((crop, idx) => ({
    crop,
    timing: idx === 0 ? "Updated today" : idx === 1 ? "Recently" : "Last week",
    suitability: (matchingCrops.includes(crop) ? "high" : idx < 2 ? "medium" : "low") as "high" | "medium" | "low",
    yieldRange: currentSeasonData.yields[crop] || "—"
  }));

  // Generate field data based on landholding
  const landholdingAreas: Record<string, number> = {
    "Less than 1 hectare": 0.8,
    "1–2 hectares": 1.5,
    "2–5 hectares": 3.5,
    "5–10 hectares": 7,
    "More than 10 hectares": 12
  };
  
  const totalArea = landholdingAreas[profile.landholding_size] || 2;
  
  const fields: Array<{
    name: string;
    area: string;
    status: "healthy" | "attention" | "risk" | "pending";
    lastAssessed: string;
  }> = [
    { 
      name: `Main Plot (${profile.district} North)`, 
      area: `${(totalArea * 0.4).toFixed(1)} ha`, 
      status: "healthy", 
      lastAssessed: "Recently assessed" 
    },
    { 
      name: `${profile.district} Central Section`, 
      area: `${(totalArea * 0.35).toFixed(1)} ha`, 
      status: "attention", 
      lastAssessed: "Assessed yesterday" 
    },
    { 
      name: "Southern Fields", 
      area: `${(totalArea * 0.25).toFixed(1)} ha`, 
      status: "pending", 
      lastAssessed: "Assessment pending" 
    }
  ];

  return {
    recommendation: {
      crop: recommendedCrop,
      suitability: "high" as const,
      yieldRange: currentSeasonData.yields[recommendedCrop] || "—",
      profitRange: currentSeasonData.profits[recommendedCrop] || "—"
    },
    healthStatus: {
      status: "healthy" as const,
      description: "No immediate concerns detected"
    },
    schemes,
    recentRecommendations,
    fields
  };
}

export default function Dashboard() {
  const { profile, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{t("dashboard.loading")}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t("dashboard.noProfileMessage")}</p>
          <Link to="/settings" className="text-primary hover:underline">{t("dashboard.goToSettings")}</Link>
        </div>
      </div>
    );
  }

  const insights = generateInsights(profile);
  
  const healthyFields = insights.fields.filter(f => f.status === "healthy").length;
  const attentionFields = insights.fields.filter(f => f.status === "attention").length;
  const riskFields = insights.fields.filter(f => f.status === "risk").length;
  const pendingFields = insights.fields.filter(f => f.status === "pending").length;
  const totalFields = insights.fields.length;

  const getHealthPercentage = (count: number) => {
    const pct = Math.round((count / totalFields) * 100);
    return pct > 0 ? `~${pct}%` : "—";
  };

  const getSeasonLabel = (season: string) => {
    const labels: Record<string, string> = {
      Kharif: t("dashboard.seasons.kharif"),
      Rabi: t("dashboard.seasons.rabi"),
      Zaid: t("dashboard.seasons.zaid")
    };
    return labels[season] || season;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="section-header">
        <h1 className="section-title">{t("dashboard.title")}</h1>
        <p className="section-description">
          {t("dashboard.description")}
        </p>
      </div>

      {/* Compact Farmer Context Bar */}
      <div className="bg-card border border-border rounded-md px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{t("dashboard.location")}:</span>
            <span className="font-medium text-foreground">{profile.district}, {profile.state}</span>
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{t("dashboard.season")}:</span>
            <span className="font-medium text-foreground">{getSeasonLabel(profile.season)}</span>
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <Wheat className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{t("dashboard.interest")}:</span>
            <span className="font-medium text-foreground">{profile.primary_crops.slice(0, 3).join(", ")}</span>
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{t("dashboard.land")}:</span>
            <span className="font-medium text-foreground">{profile.landholding_size}</span>
          </div>
        </div>
      </div>

      {/* Primary Insight Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dominant Card - Current Recommendation */}
        <Link 
          to="/crop-recommendation" 
          className="lg:col-span-2 bg-card border border-border rounded-md p-6 hover:border-primary/40 transition-colors group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-status-healthy-bg">
                <Sprout className="w-6 h-6 text-status-healthy" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{t("dashboard.currentRecommendation")}</p>
                <h2 className="text-2xl font-semibold text-foreground">{insights.recommendation.crop}</h2>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("dashboard.suitability")}</p>
              <StatusBadge status={insights.recommendation.suitability} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("dashboard.expectedYield")}</p>
              <p className="text-sm font-medium text-foreground">{insights.recommendation.yieldRange}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("dashboard.estReturns")}</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-status-healthy" />
                <span className="text-sm font-medium text-foreground">{insights.recommendation.profitRange}</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Secondary Cards Stack */}
        <div className="flex flex-col gap-4">
          {/* Crop Health Status */}
          <Link 
            to="/disease-detection" 
            className="flex-1 bg-card border border-border rounded-md p-4 hover:border-primary/40 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-status-healthy-bg">
                  <ScanLine className="w-5 h-5 text-status-healthy" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{t("dashboard.cropHealth")}</p>
                  <p className="text-lg font-semibold text-foreground capitalize">{t(`status.${insights.healthStatus.status}`)}</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">{insights.healthStatus.description}</p>
            </div>
          </Link>

          {/* Applicable Schemes */}
          <Link 
            to="/schemes" 
            className="flex-1 bg-card border border-border rounded-md p-4 hover:border-primary/40 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-md">
                  <Landmark className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{t("dashboard.schemes")}</p>
                  <p className="text-lg font-semibold text-foreground">{insights.schemes.total} {t("dashboard.available")}</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">{insights.schemes.eligible} {t("dashboard.fullyEligible")}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Advisory History */}
        <Panel title={t("dashboard.recentRecommendations")}>
          <div className="space-y-2">
            {insights.recentRecommendations.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    item.suitability === 'high' ? 'bg-status-healthy' : 
                    item.suitability === 'medium' ? 'bg-status-attention' : 'bg-status-risk'
                  }`} />
                  <span className="text-sm font-medium text-foreground">{item.crop}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">{item.yieldRange}</span>
                  <span className="text-muted-foreground w-20 text-right">{item.timing}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Field Health Summary */}
        <Panel title={t("dashboard.fieldHealthSummary")}>
          <div className="space-y-3">
            {insights.fields.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between py-2.5 px-3 rounded-md bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${
                    item.status === 'healthy' ? 'bg-status-healthy-bg text-status-healthy' : 
                    item.status === 'attention' ? 'bg-status-attention-bg text-status-attention' : 
                    item.status === 'risk' ? 'bg-status-risk-bg text-status-risk' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.area}</p>
                  </div>
                </div>
                <div className="text-right">
                  {item.status === 'pending' ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <RefreshCw className="w-3 h-3" />
                      {t("dashboard.pending")}
                    </span>
                  ) : (
                    <StatusBadge status={item.status} />
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{item.lastAssessed}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-base font-semibold text-status-healthy">{getHealthPercentage(healthyFields)}</p>
              <p className="text-xs text-muted-foreground">{t("dashboard.healthy")}</p>
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-status-attention">{getHealthPercentage(attentionFields)}</p>
              <p className="text-xs text-muted-foreground">{t("dashboard.attention")}</p>
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-status-risk">{getHealthPercentage(riskFields)}</p>
              <p className="text-xs text-muted-foreground">{t("dashboard.atRisk")}</p>
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-muted-foreground">{getHealthPercentage(pendingFields)}</p>
              <p className="text-xs text-muted-foreground">{t("dashboard.pending")}</p>
            </div>
          </div>
        </Panel>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        {t("dashboard.profileNote")}
      </p>
    </div>
  );
}
