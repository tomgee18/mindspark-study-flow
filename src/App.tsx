import React from "react";
import { Toaster, Toaster as Sonner, TooltipProvider } from "@/components/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { MainLayout } from "@/features/layout";
import { ThemeProvider } from "@/theme-provider";
import { AppSidebar } from "@/features/sidebar";
import { MindMapProvider } from "@/contexts/MindMapContext";

const queryClient = new QueryClient();

interface IAppLayoutProps {
  children: React.ReactNode;
}

// Layout wrapper to avoid repeating MainLayout with AppSidebar
const AppLayout: React.FC<IAppLayoutProps> = ({ children }) => (
  <MindMapProvider>
    <MainLayout 
      sidebar={<AppSidebar />} 
      mainContent={children} 
    />
  </MindMapProvider>
);

const App: React.FC = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout><Index /></AppLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;