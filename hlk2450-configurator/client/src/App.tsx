import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home.tsx";
import NotFound from "@/pages/not-found";
import { useEffect, useState, useCallback } from "react";

// Detect Home Assistant ingress base path
function getBasePath() {
  const pathname = window.location.pathname;
  // Check if we're running under Home Assistant ingress
  if (pathname.includes('/hassio/ingress/')) {
    // Extract the ingress path up to and including the addon slug
    const match = pathname.match(/^(\/hassio\/ingress\/[^\/]+)/);
    const basePath = match ? match[1] : '';
    console.log('[Router] Detected ingress base path:', basePath, 'from pathname:', pathname);
    return basePath;
  }
  console.log('[Router] No ingress path detected, using root. pathname:', pathname);
  return '';
}



function Router() {
  const basePath = getBasePath();
  
  // Log router mounting info
  console.log('[Router] Mounting with base path:', basePath);
  console.log('[Router] Current URL:', window.location.href);
  
  // For wouter, we need to use a custom hook to handle ingress paths properly
  const currentPath = window.location.pathname;
  const routerPath = basePath ? currentPath.replace(basePath, '') || '/' : currentPath;
  
  console.log('[Router] Router path after base removal:', routerPath);
  
  return (
    <WouterRouter base={basePath} hook={customLocationHook}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/settings" component={() => <div className="p-8"><h1 className="text-2xl">Settings Page</h1></div>} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

// Custom location hook for wouter to handle ingress paths
const customLocationHook = () => {
  const [pathname, setPathname] = useState(() => {
    const basePath = getBasePath();
    const currentPath = window.location.pathname;
    // Remove base path to get the app-relative path
    const appPath = basePath && currentPath.startsWith(basePath) 
      ? currentPath.slice(basePath.length) || '/'
      : currentPath;
    console.log('[customLocationHook] Initial path:', appPath, 'from:', currentPath);
    return appPath;
  });

  useEffect(() => {
    const handler = () => {
      const basePath = getBasePath();
      const currentPath = window.location.pathname;
      const appPath = basePath && currentPath.startsWith(basePath) 
        ? currentPath.slice(basePath.length) || '/'
        : currentPath;
      console.log('[customLocationHook] Navigation to:', appPath);
      setPathname(appPath);
    };

    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const navigate = useCallback((to, { replace = false } = {}) => {
    const basePath = getBasePath();
    const fullPath = basePath + (to.startsWith('/') ? to : '/' + to);
    console.log('[customLocationHook] Navigating to:', fullPath);
    
    if (replace) {
      window.history.replaceState(null, "", fullPath);
    } else {
      window.history.pushState(null, "", fullPath);
    }
    
    setPathname(to);
  }, []);

  return [pathname, navigate];
};

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
