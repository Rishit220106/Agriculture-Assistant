import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Landmark, Filter, Info, HelpCircle, FileText, Volume2 } from "lucide-react";
import schemesData from "@/data/schemes.json";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface SchemeData {
  scheme_id: string;
  scheme_name: string;
  states: string[];
  crop_types: string[];
  landholding_categories: string[];
  ministry: string;
  benefit_summary: string;
  category: string;
  eligibility_notes: string;
}

interface ProcessedScheme {
  id: string;
  name: string;
  ministry: string;
  benefit: string;
  category: string;
  eligibility: "eligible" | "partial";
  eligibilityNotes: string;
}

const stateMapping: Record<string, string> = {
  maharashtra: "Maharashtra",
  karnataka: "Karnataka",
  "madhya-pradesh": "Madhya Pradesh",
  "uttar-pradesh": "Uttar Pradesh",
  punjab: "Punjab",
  rajasthan: "Rajasthan",
  gujarat: "Gujarat",
  "tamil-nadu": "Tamil Nadu",
  "andhra-pradesh": "Andhra Pradesh",
  telangana: "Telangana",
};

const cropTypeMapping: Record<string, string> = {
  cereals: "Cereals",
  pulses: "Pulses",
  oilseeds: "Oilseeds",
  cotton: "Cotton",
  sugarcane: "Sugarcane",
  vegetables: "Vegetables",
  fruits: "Fruits",
  spices: "Spices",
};

const landholdingMapping: Record<string, string> = {
  marginal: "Marginal",
  small: "Small",
  "semi-medium": "Semi-Medium",
  medium: "Medium",
  large: "Large",
};

export default function GovernmentSchemes() {
  const { t, language } = useLanguage();
  const [filters, setFilters] = useState({
    state: "",
    cropType: "",
    landholding: "",
  });
  const [showResults, setShowResults] = useState(false);
  const { speak, stop, isSpeaking } = useTextToSpeech(language);

  // Validate all required inputs
  const isFormValid = useMemo(() => {
    return (
      filters.state.trim() !== "" &&
      filters.cropType.trim() !== "" &&
      filters.landholding.trim() !== ""
    );
  }, [filters]);

  // Clear results when inputs change
  useEffect(() => {
    if (showResults) {
      setShowResults(false);
    }
  }, [filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
  };

  const schemes = useMemo(() => {
    if (!showResults || !isFormValid) return [];
    
    const rawSchemes = schemesData as SchemeData[];
    const selectedState = stateMapping[filters.state] || "";
    const selectedCrop = cropTypeMapping[filters.cropType] || "";
    const selectedLandholding = landholdingMapping[filters.landholding] || "";

    return rawSchemes
      .map((scheme) => {
        const stateMatch =
          scheme.states.includes("All") ||
          scheme.states.includes(selectedState);
        const cropMatch =
          scheme.crop_types.includes("All") ||
          scheme.crop_types.includes(selectedCrop);
        const landholdingMatch =
          scheme.landholding_categories.includes("All") ||
          scheme.landholding_categories.includes(selectedLandholding);

        const matchCount = [stateMatch, cropMatch, landholdingMatch].filter(
          Boolean
        ).length;

        if (matchCount >= 2) {
          return {
            id: scheme.scheme_id,
            name: scheme.scheme_name,
            ministry: scheme.ministry,
            benefit: scheme.benefit_summary,
            category: scheme.category,
            eligibility: matchCount === 3 ? "eligible" : "partial",
            eligibilityNotes: scheme.eligibility_notes,
          } as ProcessedScheme;
        }
        return null;
      })
      .filter((scheme): scheme is ProcessedScheme => scheme !== null);
  }, [showResults, filters, isFormValid]);

  const handleSearch = () => {
    // Strict validation - do not proceed if form is invalid
    if (!isFormValid) {
      return;
    }
    setShowResults(true);
  };

  const eligibleCount = schemes.filter((s) => s.eligibility === "eligible").length;
  const partialCount = schemes.filter((s) => s.eligibility === "partial").length;

  const generateAdvisorySummary = (): string => {
    if (schemes.length === 0) return "";

    const categories = [...new Set(schemes.map((s) => s.category))];
    const eligibleSchemes = schemes.filter((s) => s.eligibility === "eligible");

    let summary = t("schemes.advisorySummaryIntro");

    if (eligibleSchemes.length > 0) {
      summary += " " + t("schemes.advisoryEligibleNote").replace("{count}", eligibleSchemes.length.toString());
    }

    if (categories.length > 0) {
      summary += " " + t("schemes.advisoryCategoriesNote").replace("{categories}", categories.slice(0, 3).join(", "));
    }

    summary += " " + t("schemes.advisoryDisclaimer");

    return summary;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="section-header">
        <h1 className="section-title">{t("schemes.title")}</h1>
      </div>

      {/* Filter Panel */}
      <Panel title={t("schemes.filterCriteria")}>
        <p className="text-sm text-muted-foreground mb-4">
          {t("schemes.filterHelperText")}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="form-group">
            <Label className="form-label">{t("schemes.state")}</Label>
            <Select
              value={filters.state}
              onValueChange={(v) => handleFilterChange("state", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("schemes.selectState")} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="maharashtra">Maharashtra</SelectItem>
                <SelectItem value="karnataka">Karnataka</SelectItem>
                <SelectItem value="madhya-pradesh">Madhya Pradesh</SelectItem>
                <SelectItem value="uttar-pradesh">Uttar Pradesh</SelectItem>
                <SelectItem value="punjab">Punjab</SelectItem>
                <SelectItem value="rajasthan">Rajasthan</SelectItem>
                <SelectItem value="gujarat">Gujarat</SelectItem>
                <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                <SelectItem value="andhra-pradesh">Andhra Pradesh</SelectItem>
                <SelectItem value="telangana">Telangana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="form-group">
            <Label className="form-label">{t("schemes.cropType")}</Label>
            <Select
              value={filters.cropType}
              onValueChange={(v) => handleFilterChange("cropType", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("schemes.selectCrop")} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="cereals">
                  {t("schemes.cropTypes.cereals")}
                </SelectItem>
                <SelectItem value="pulses">
                  {t("schemes.cropTypes.pulses")}
                </SelectItem>
                <SelectItem value="oilseeds">
                  {t("schemes.cropTypes.oilseeds")}
                </SelectItem>
                <SelectItem value="cotton">
                  {t("schemes.cropTypes.cotton")}
                </SelectItem>
                <SelectItem value="sugarcane">
                  {t("schemes.cropTypes.sugarcane")}
                </SelectItem>
                <SelectItem value="vegetables">
                  {t("schemes.cropTypes.vegetables")}
                </SelectItem>
                <SelectItem value="fruits">
                  {t("schemes.cropTypes.fruits")}
                </SelectItem>
                <SelectItem value="spices">
                  {t("schemes.cropTypes.spices")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="form-group">
            <Label className="form-label">{t("schemes.landholdingCategory")}</Label>
            <Select
              value={filters.landholding}
              onValueChange={(v) => handleFilterChange("landholding", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("schemes.selectCategory")} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="marginal">
                  {t("schemes.landCategories.marginal")}
                </SelectItem>
                <SelectItem value="small">
                  {t("schemes.landCategories.small")}
                </SelectItem>
                <SelectItem value="semi-medium">
                  {t("schemes.landCategories.semiMedium")}
                </SelectItem>
                <SelectItem value="medium">
                  {t("schemes.landCategories.medium")}
                </SelectItem>
                <SelectItem value="large">
                  {t("schemes.landCategories.large")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="form-group flex items-end">
            <Button 
              onClick={handleSearch} 
              className="w-full gap-2"
              disabled={!isFormValid}
            >
              <Filter className="w-4 h-4" />
              {t("schemes.findSchemes")}
            </Button>
          </div>
        </div>
      </Panel>

      {/* Results */}
      {showResults && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="info-card border-l-4 border-l-primary">
              <p className="text-sm text-muted-foreground mb-1">
                {t("schemes.totalSchemesFound")}
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {schemes.length}
              </p>
            </div>
            <div className="info-card border-l-4 border-l-green-500">
              <p className="text-sm text-muted-foreground mb-1">
                {t("schemes.fullyEligible")}
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {eligibleCount}
              </p>
            </div>
            <div className="info-card border-l-4 border-l-amber-500">
              <p className="text-sm text-muted-foreground mb-1">
                {t("schemes.partialEligibility")}
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {partialCount}
              </p>
            </div>
          </div>

          {/* Results Explanation */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border border-border">
            <Info className="w-4 h-4 text-primary flex-shrink-0" />
            <p>{t("schemes.resultsExplanation")}</p>
          </div>

          {/* Scheme List Table */}
          <Panel title={t("schemes.applicableSchemes")}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      {t("schemes.schemeName")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      {t("schemes.ministry")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      {t("schemes.keyBenefit")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-help">
                              {t("schemes.eligibility")}
                              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs bg-popover border-border">
                            <p className="text-xs">{t("schemes.eligibilityTooltip")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schemes.map((scheme) => (
                    <tr
                      key={scheme.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30"
                    >
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-foreground">
                          {scheme.name}
                        </span>
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          {scheme.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {scheme.ministry}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">
                          {scheme.benefit}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            scheme.eligibility === "eligible"
                              ? "bg-green-500/15 text-green-600 dark:text-green-400"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {scheme.eligibility === "eligible"
                            ? t("schemes.eligible")
                            : t("schemes.partial")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Advisory Summary Section */}
          {schemes.length > 0 && (
            <Panel title={t("schemes.advisorySummaryTitle")}>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <p className="text-sm text-foreground leading-relaxed">
                      {generateAdvisorySummary()}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const advisoryText = generateAdvisorySummary();
                        if (isSpeaking) {
                          stop();
                        } else {
                          speak(advisoryText);
                        }
                      }}
                      className="w-full gap-2 mt-3"
                    >
                      <Volume2 className="w-4 h-4" />
                      {isSpeaking ? "Stop Listening" : "🔊 Listen Advisory"}
                    </Button>
                    <p className="text-xs text-muted-foreground italic mt-2">
                      {t("schemes.advisoryNote")}
                    </p>
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {/* Detailed Scheme Information */}
          <Panel title={t("schemes.schemeDetails")}>
            <Accordion type="single" collapsible className="w-full">
              {schemes.map((scheme) => (
                <AccordionItem key={scheme.id} value={scheme.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <Landmark className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-medium text-foreground">
                          {scheme.name}
                        </span>
                        <span
                          className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            scheme.eligibility === "eligible"
                              ? "bg-green-500/15 text-green-600 dark:text-green-400"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {scheme.eligibility === "eligible"
                            ? t("schemes.eligible")
                            : t("schemes.partial")}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-8 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            {t("schemes.categoryLabel")}
                          </p>
                          <p className="text-sm text-foreground">{scheme.category}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            {t("schemes.ministry")}
                          </p>
                          <p className="text-sm text-foreground">{scheme.ministry}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                          {t("schemes.keyBenefit")}
                        </p>
                        <p className="text-sm text-foreground">{scheme.benefit}</p>
                      </div>

                      <div className="bg-muted/50 rounded-md p-4">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground mb-1">
                              {t("schemes.eligibilityNotesLabel")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {scheme.eligibilityNotes}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Panel>
        </>
      )}

      {!showResults && (
        <Panel title={t("schemes.applicableSchemes")}>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <Landmark className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {t("schemes.noSearch")}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Please provide the required inputs to view recommendations.
            </p>
          </div>
        </Panel>
      )}
    </div>
  );
}
