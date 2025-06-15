
import React from 'react';
import Header from '@/app/layout/Header'; // Adjusted path
// AppSidebar will be passed as a prop, so no direct import needed here for rendering.
import { ReactFlowProvider } from '@xyflow/react';

interface MainLayoutProps {
  sidebar: React.ReactNode;
  mainContent: React.ReactNode;
}

const MainLayout = ({ sidebar, mainContent }: MainLayoutProps) => {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      {/* ReactFlowProvider needs to wrap any part of the tree that uses useReactFlow or other RF hooks */}
      {/* If AppSidebar or MindMap (mainContent) use RF hooks, it should be within this provider */}
      <ReactFlowProvider>
        <div className="flex flex-1 overflow-hidden">
          {sidebar}
          {/* Added min-w-0 to allow the main content to shrink properly with flex-1 */}
          <main className="flex-1 overflow-y-auto min-w-0">
            {mainContent}
          </main>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default MainLayout;
