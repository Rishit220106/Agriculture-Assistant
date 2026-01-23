import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Sprout, 
  ScanLine, 
  Landmark,
  Settings,
  LogOut,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";

export function AppSidebar() {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();

  const navigation = [
    {
      name: t("nav.dashboard"),
      href: "/",
      icon: LayoutDashboard,
      description: t("sidebar.navDescriptions.dashboard")
    },
    {
      name: t("nav.cropRecommendation"),
      href: "/crop-recommendation",
      icon: Sprout,
      description: t("sidebar.navDescriptions.cropRecommendation")
    },
    {
      name: t("nav.diseaseDetection"),
      href: "/disease-detection",
      icon: ScanLine,
      description: t("sidebar.navDescriptions.diseaseDetection")
    },
    {
      name: t("nav.governmentSchemes"),
      href: "/schemes",
      icon: Landmark,
      description: t("sidebar.navDescriptions.governmentSchemes")
    },
    {
      name: t("nav.settings"),
      href: "/settings",
      icon: Settings,
      description: t("sidebar.navDescriptions.settings")
    }
  ];

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-sidebar-primary flex items-center justify-center">
            <Sprout className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-sidebar-foreground">{t("sidebar.appName")}</h1>
            <p className="text-xs text-sidebar-muted">{t("sidebar.tagline")}</p>
          </div>
        </div>
      </div>

      {/* Language Selector - Prominent Position */}
      <div className="px-4 py-4 border-b border-sidebar-border bg-sidebar-accent/20">
        <LanguageSelector showLabel={true} size="large" />
      </div>

      {/* User Context */}
      {user && profile && (
        <div className="px-4 py-3 border-b border-sidebar-border bg-sidebar-accent/40">
          <p className="text-xs font-semibold text-sidebar-foreground/80 uppercase tracking-wide mb-1">{t("sidebar.loggedInAs")}</p>
          <p className="text-sm font-medium text-sidebar-foreground truncate">{user.email}</p>
          <p className="text-sm text-sidebar-foreground/90 mt-1 font-medium">
            {profile.district}, {profile.state}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors group",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-sidebar-primary" : "text-sidebar-muted"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-sidebar-muted truncate">{item.description}</div>
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-sidebar-primary" />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start text-sidebar-muted hover:text-sidebar-foreground"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t("nav.signOut")}
        </Button>
        <div className="text-xs text-sidebar-muted">
          <div className="font-medium text-sidebar-foreground mb-1">{t("sidebar.agricultureTech")}</div>
          <div>{t("sidebar.collegeProject")}</div>
          <div className="mt-2 text-sidebar-muted/70">{t("sidebar.version")}</div>
        </div>
      </div>
    </aside>
  );
}
