import React from 'react';
import Header from './Header';
import { ReactFlowProvider } from '@xyflow/react';

/**
 * Props for the MainLayout component
 */
interface IMainLayoutProps {
  /**
   * The sidebar content to display
   */
  sidebar: React.ReactNode;
  
  /**
   * The main content to display
   */
  mainContent: React.ReactNode;
}

/**
 * MainLayout component that provides the main layout structure for the application
 * 
 * @param props - The component props
 * @param props.sidebar - The sidebar content to display
 * @param props.mainContent - The main content to display
 * @returns The MainLayout component
 */
const MainLayout: React.FC<IMainLayoutProps> = ({ sidebar, mainContent }) => {
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