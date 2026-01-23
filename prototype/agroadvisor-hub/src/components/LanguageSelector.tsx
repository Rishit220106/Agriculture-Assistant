import { useLanguage, Language, LANGUAGE_LABELS } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSelectorProps {
  showLabel?: boolean;
  size?: "default" | "large";
}

export function LanguageSelector({ showLabel = false, size = "default" }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();

  const isLarge = size === "large";

  return (
    <div className="flex flex-col gap-1.5">
      {showLabel && (
        <span className="text-sm font-semibold text-sidebar-foreground">
          {t("common.interfaceLanguage")}
        </span>
      )}
      <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
        <SelectTrigger 
          className={`${isLarge ? "w-full h-10 text-sm" : "w-[160px] h-9 text-sm"} bg-sidebar-accent/50 border-sidebar-border hover:bg-sidebar-accent font-medium text-white`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border z-50">
          <SelectItem value="en" className="text-sm font-medium">
            {LANGUAGE_LABELS.en}
          </SelectItem>
          <SelectItem value="hi" className="text-sm font-medium">
            {LANGUAGE_LABELS.hi}
          </SelectItem>
          <SelectItem value="mr" className="text-sm font-medium">
            {LANGUAGE_LABELS.mr}
          </SelectItem>
          <SelectItem value="ta" className="text-sm font-medium">
            {LANGUAGE_LABELS.ta}
          </SelectItem>
          <SelectItem value="te" className="text-sm font-medium">
            {LANGUAGE_LABELS.te}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
