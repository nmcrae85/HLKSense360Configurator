import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home.tsx";
import NotFound from "@/pages/not-found";

// Detect Home Assistant ingress base path
function getBasePath() {
  const pathname = window.location.pathname;
  // Check if we're running under Home Assistant ingress
  if (pathname.includes('/hassio/ingress/')) {
    // Extract the ingress path up to and including the addon slug
    const match = pathname.match(/^(\/hassio\/ingress\/[^\/]+)/);
    return match ? match[1] : '';
  }
  return '';
}

function Router() {
  const basePath = getBasePath();
  
  return (
    <WouterRouter base={basePath}>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
