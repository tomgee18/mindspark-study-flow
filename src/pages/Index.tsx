
// Removed useState, useCallback, useNodesState, useEdgesState, addEdge etc.
// These will now be handled by MindMapProvider
import MindMap from '@/components/mind-map/MindMap';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import MainLayout from '@/components/layout/MainLayout';
import { MindMapProvider } from '@/contexts/MindMapContext'; // Import the provider

// initialNodesData and initialEdgesData are used by the provider internally.
// CustomNodeData might not be needed here anymore.

const IndexPage = () => {
  // All state management (nodes, edges, selectedNodeId, setters) is moved to MindMapProvider.
  // IndexPage is now much simpler.

  return (
    <MindMapProvider> {/* Wrap MainLayout (or its children) with the Provider */}
      <MainLayout
        sidebar={<AppSidebar /* Props like selectedNodeId, nodes, edges will come from context */ />}
        mainContent={<MindMap /* Props like nodes, edges, handlers, setSelectedNodeId will come from context */ />}
      />
    </MindMapProvider>
  );
};

export default IndexPage;

