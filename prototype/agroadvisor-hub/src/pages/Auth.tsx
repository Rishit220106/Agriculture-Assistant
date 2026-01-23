import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/ui/Panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Sprout, User, MapPin, Calendar, Wheat, Ruler } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

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

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [season, setSeason] = useState<"Kharif" | "Rabi" | "Zaid" | "">("");
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [landholding, setLandholding] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: err.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }
    
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    
    setLoading(false);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error.message === "Invalid login credentials" 
          ? "Invalid email or password. Please try again."
          : error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: err.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }
    
    if (!state || !district || !season || selectedCrops.length === 0 || !landholding) {
      toast({
        title: "Incomplete Profile",
        description: "Please complete all farm context fields.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    
    if (authError) {
      setLoading(false);
      toast({
        title: "Registration Failed",
        description: authError.message === "User already registered"
          ? "An account with this email already exists. Please login instead."
          : authError.message,
        variant: "destructive",
      });
      return;
    }
    
    if (authData.user) {
      const { error: profileError } = await supabase
        .from("farmer_profiles")
        .insert({
          user_id: authData.user.id,
          state,
          district,
          season,
          primary_crops: selectedCrops,
          landholding_size: landholding,
        });
      
      setLoading(false);
      
      if (profileError) {
        toast({
          title: "Profile Setup Issue",
          description: "Account created but profile setup failed. Please update your profile in settings.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Successful",
          description: "Your farm profile has been created.",
        });
      }
      
      navigate("/");
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Sprout className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">AgroGuide</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Integrated Decision Support Platform for Indian Farmers
          </p>
        </div>

        <Panel>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email Address</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-5">
                {/* Account Credentials */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground border-b border-border pb-2">
                    Account Credentials
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password (min. 6 characters)"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Farm Context Setup */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground border-b border-border pb-2">
                    Farm Context Setup
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Select value={state} onValueChange={setState}>
                        <SelectTrigger>
                          <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {indianStates.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="district">District</Label>
                      <Input
                        id="district"
                        placeholder="Enter district"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Farming Season</Label>
                      <Select value={season} onValueChange={(v) => setSeason(v as "Kharif" | "Rabi" | "Zaid")}>
                        <SelectTrigger>
                          <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                          <SelectValue placeholder="Select season" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kharif">Kharif (Monsoon)</SelectItem>
                          <SelectItem value="Rabi">Rabi (Winter)</SelectItem>
                          <SelectItem value="Zaid">Zaid (Summer)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Landholding Size</Label>
                      <Select value={landholding} onValueChange={setLandholding}>
                        <SelectTrigger>
                          <Ruler className="w-4 h-4 mr-2 text-muted-foreground" />
                          <SelectValue placeholder="Select size" />
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
                      Primary Crops of Interest
                    </Label>
                    <div className="grid grid-cols-3 gap-2 p-3 border border-border rounded-md bg-muted/20">
                      {cropOptions.map((crop) => (
                        <div key={crop} className="flex items-center space-x-2">
                          <Checkbox
                            id={`crop-${crop}`}
                            checked={selectedCrops.includes(crop)}
                            onCheckedChange={() => toggleCrop(crop)}
                          />
                          <Label 
                            htmlFor={`crop-${crop}`} 
                            className="text-xs font-normal cursor-pointer"
                          >
                            {crop}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedCrops.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {selectedCrops.join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account & Setup Profile"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Panel>
      </div>
    </div>
  );
}
