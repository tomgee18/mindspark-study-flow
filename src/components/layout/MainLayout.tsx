
import React from 'react';
import Header from '@/components/Header';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { ReactFlowProvider } from '@xyflow/react';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <ReactFlowProvider>
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default MainLayout;
