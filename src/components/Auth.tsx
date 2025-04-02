
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Lock } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Registration successful",
        description: "Please check your email for verification instructions",
      });
      
      setActiveTab("login");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter your email and password",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // User will be redirected by the AuthProvider
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Login to Your Account
              </CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-qris-red hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="register">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Create an Account
              </CardTitle>
              <CardDescription className="text-center">
                Enter your information to create an account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerPassword">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <Input
                      id="registerPassword"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-qris-red hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
