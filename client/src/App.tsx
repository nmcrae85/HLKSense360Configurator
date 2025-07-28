import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home.tsx";
import NotFound from "@/pages/not-found";
import { useEffect, useState, useCallback, useMemo } from "react";

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



// Create a custom hook that properly handles ingress paths
const useHashLocation = () => {
  const getPath = () => {
    const basePath = getBasePath();
    const pathname = window.location.pathname;
    
    // If we're under ingress, strip the base path
    if (basePath && pathname.startsWith(basePath)) {
      const path = pathname.slice(basePath.length) || '/';
      console.log('[useHashLocation] Stripped path:', path, 'from:', pathname);
      return path;
    }
    
    return pathname;
  };

  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const handlePopState = () => {
      const newPath = getPath();
      console.log('[useHashLocation] Location changed to:', newPath);
      setPath(newPath);
    };

    // Listen for navigation events
    window.addEventListener('popstate', handlePopState);
    
    // Also listen for clicks on the page that might change location
    const checkLocationChange = () => {
      const newPath = getPath();
      if (newPath !== path) {
        setPath(newPath);
      }
    };
    
    const interval = setInterval(checkLocationChange, 100);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearInterval(interval);
    };
  }, [path]);

  const navigate = useCallback((to, { replace = false } = {}) => {
    const basePath = getBasePath();
    const fullPath = basePath + (to.startsWith('/') ? to : '/' + to);
    
    console.log('[useHashLocation] Navigating to:', fullPath);
    
    if (replace) {
      window.history.replaceState(null, '', fullPath);
    } else {
      window.history.pushState(null, '', fullPath);
    }
    
    // Trigger popstate to update the path
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  return [path, navigate];
};

function Router() {
  const basePath = getBasePath();
  
  // Log router mounting info
  console.log('[Router] Mounting with base path:', basePath);
  console.log('[Router] Current URL:', window.location.href);
  
  // Use custom location hook that handles ingress paths
  return (
    <WouterRouter hook={useHashLocation}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/settings" component={() => <div className="p-8"><h1 className="text-2xl">Settings Page</h1></div>} />
        <Route path="/:rest*" component={NotFound} />
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
