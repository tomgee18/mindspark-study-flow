import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import MainLayout from "@/app/layout/MainLayout";
import { ThemeProvider } from "@/app/theme-provider";
import { AppSidebar } from "@/features/sidebar/components/AppSidebar";
import { MindMapProvider } from "@/contexts/MindMapContext";

const queryClient = new QueryClient();

// Layout wrapper to avoid repeating MainLayout with AppSidebar
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <MindMapProvider>
    <MainLayout 
      sidebar={<AppSidebar />} 
      mainContent={children} 
    />
  </MindMapProvider>
);

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout><Index /></AppLayout>} />
              <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;