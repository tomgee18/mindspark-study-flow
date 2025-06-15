
<<<<<<< HEAD
import { useState, useCallback } from 'react';
import { useNodesState, useEdgesState, addEdge, OnNodesChange, OnEdgesChange, Connection, Edge as FlowEdge, Node } from '@xyflow/react';
import MindMap from '@/components/mind-map/MindMap';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import MainLayout from '@/components/layout/MainLayout';
import { initialNodes as initialNodesData, initialEdges as initialEdgesData } from '@/components/mind-map/initial-elements';
import { CustomNodeData } from '@/components/mind-map/CustomNode';


const IndexPage = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>(initialNodesData);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdgesData);

  const onConnect = useCallback(
    (params: FlowEdge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Pass nodes to AppSidebar for context, setNodes/setEdges for updates
  // Pass all necessary props to MindMap
  return (
    <MainLayout
      sidebar={
        <AppSidebar
          selectedNodeId={selectedNodeId}
          nodes={nodes}
          edges={edges} // Pass the current edges
        />
      }
      mainContent={
        <MindMap
          setSelectedNodeId={setSelectedNodeId}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          // setNodes and setEdges are not directly passed if MindMap is to use its own state handlers
          // But since we lifted state, MindMap needs them (or rather, onNodesChange/onEdgesChange handle this)
          // The toggleNodeCollapse and other internal logic in MindMap will use the lifted setNodes.
          setNodes={setNodes} // For toggleNodeCollapse
          setEdges={setEdges} // For onConnect (already handled by passing onConnect)
        />
      }
    />
=======
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
>>>>>>> f644a7097baca551df34745558072d767618914b
  );
};

export default IndexPage;
<<<<<<< HEAD
=======
        />
      }
    />
  );
};

export default IndexPage;
>>>>>>> f644a7097baca551df34745558072d767618914b
