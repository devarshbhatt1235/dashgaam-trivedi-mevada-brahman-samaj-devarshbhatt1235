import { useState } from "react";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, Input, Label, Button } from "@/components/ui-elements";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { User, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login: setAuthToken } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        setAuthToken(data.token);
        toast({
          title: "સ્વાગત છે!",
          description: "લૉગિન સફળ થયું.",
        });
        if (data.user.role === "super_admin") {
          setLocation("/admin");
        } else {
          setLocation("/home");
        }
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "ભૂલ",
          description: "ખોટું વપરાશકર્તા નામ અથવા પાસવર્ડ.",
        });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    loginMutation.mutate({ data: { username, password } });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 md:p-10 shadow-2xl shadow-orange-900/10 border-t-8 border-t-primary">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-secondary mb-2">લૉગિન</h1>
            <p className="text-muted-foreground">એડમિન પેનલમાં પ્રવેશ કરો</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 relative">
              <Label htmlFor="username">વપરાશકર્તા નામ (Username)</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="username"
                  className="pl-10"
                  placeholder="વપરાશકર્તા નામ દાખલ કરો"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loginMutation.isPending}
                />
              </div>
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="password">પાસવર્ડ (Password)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loginMutation.isPending}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full text-lg py-6"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "પ્રતીક્ષા કરો..." : "લૉગિન"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
