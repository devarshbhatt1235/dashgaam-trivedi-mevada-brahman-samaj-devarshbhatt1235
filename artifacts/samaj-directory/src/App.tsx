import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/lib/auth";
import { setupApiInterceptor } from "@/lib/api-setup";
import NotFound from "@/pages/not-found";

// Pages
import Home from "./pages/Home";
import Directory from "./pages/Directory";
import Login from "./pages/Login";
import HomeAdmin from "./pages/HomeAdmin";
import SuperAdmin from "./pages/SuperAdmin";

// Initialize API Interceptor
setupApiInterceptor();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/directory" component={Directory} />
        <Route path="/login" component={Login} />
        <Route path="/home" component={HomeAdmin} />
        <Route path="/admin" component={SuperAdmin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
