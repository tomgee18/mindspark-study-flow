
import { useCallback, useEffect, useMemo, memo } from 'react'; // Import memo
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  BackgroundVariant,
  Node,
  Edge as FlowEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { initialNodes as initialNodesData, initialEdges as initialEdgesData } from './initial-elements';
import CustomNode, { CustomNodeData } from './CustomNode';

// Renamed for clarity: this function now only returns descendant node IDs.
const getDescendantNodeIds = (
  nodeId: string, // The ID of the node that was collapsed
  allEdges: FlowEdge[] // All edges in the graph, to find paths
): Set<string> => {
  const descendantIds = new Set<string>();
  const queue: string[] = [nodeId]; // Start BFS from the collapsed node
  const visitedInThisCall = new Set<string>([nodeId]); // Track visited nodes for this specific call

  let head = 0;
  while (head < queue.length) {
    const currentParentId = queue[head++];
    for (const edge of allEdges) {
      if (edge.source === currentParentId) {
        const targetNodeId = edge.target;
        if (!visitedInThisCall.has(targetNodeId)) {
          descendantIds.add(targetNodeId);
          visitedInThisCall.add(targetNodeId);
          queue.push(targetNodeId);
        }
      }
    }
  }
  return descendantIds;
};

const nodeTypes = { custom: memo(CustomNode) };

import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  // useNodesState, // Removed
  // useEdgesState, // Removed
  Connection,
  Edge,
  BackgroundVariant,
  Node,
  Edge as FlowEdge,
  // OnNodesChange and OnEdgesChange types are implicitly handled by useNodesState/useEdgesState if used locally,
  // but will be explicitly used from context.
} from '@xyflow/react';
import { useMindMap } from '@/contexts/MindMapContext'; // Import the context hook

// ... (keep getDescendantNodeIds and CustomNode imports)
// initialNodesData and initialEdgesData are not used here as context provides initial state.
import CustomNode from './CustomNode'; // CustomNodeData is imported by MindMapContext

const nodeTypes = { custom: memo(CustomNode) };

// No more MindMapProps needed as everything comes from context

const MindMap = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
    toggleNodeCollapse,
  } = useMindMap();

  // onNodeClick is removed as onSelectionChange will handle selection updates.
  // If other onNodeClick specific logic was needed, it could be kept.

  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      if (selectedNodes.length === 1) {
        setSelectedNodeId(selectedNodes[0].id);
      } else {
        setSelectedNodeId(null);
      }
    },
    [setSelectedNodeId]
  );

  const { filteredNodes, filteredEdges } = useMemo(() => {
    const processedNodes = nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isCollapsed: node.data.isCollapsed ?? false,
        onToggleCollapse: toggleNodeCollapse,
      },
    }));

    const allHiddenNodeIds = new Set<string>();
    processedNodes.forEach(node => {
      if (node.data.isCollapsed) {
        const descendantNodeIds = getDescendantNodeIds(node.id, edges); // edges from context
        descendantNodeIds.forEach(id => allHiddenNodeIds.add(id));
      }
    });

    const currentFilteredNodes = processedNodes.filter(node => !allHiddenNodeIds.has(node.id));
    const currentFilteredEdges = edges.filter(edge => // edges from context
        !allHiddenNodeIds.has(edge.source) &&
        !allHiddenNodeIds.has(edge.target)
    );

    return { filteredNodes: currentFilteredNodes, filteredEdges: currentFilteredEdges };
  }, [nodes, edges, toggleNodeCollapse]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={handleSelectionChange}
        nodesFocusable={true}
        onlyRenderVisibleElements={true} // Added this prop
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default MindMap;
