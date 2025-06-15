
import React from 'react';
import Header from '@/components/Header';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { ReactFlowProvider } from '@xyflow/react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <ReactFlowProvider>
        <SidebarProvider>
          <div className="flex flex-1 overflow-hidden">
            <AppSidebar />
            <main className="flex-1 overflow-y-auto p-4">
              <SidebarTrigger className="md:hidden" />
              <div className="mt-4 md:mt-0">{children}</div>
            </main>
          </div>
        </SidebarProvider>
      </ReactFlowProvider>
    </div>
  );
};

export default MainLayout;
