
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
  OnNodesChange, // Added
  OnEdgesChange, // Added
} from '@xyflow/react';

// ... (keep getDescendantNodeIds and CustomNode imports)
import { initialNodes as initialNodesData, initialEdges as initialEdgesData } from './initial-elements'; // Not used directly if props provide initial
import CustomNode, { CustomNodeData } from './CustomNode';


const nodeTypes = { custom: memo(CustomNode) };

interface MindMapProps {
  setSelectedNodeId: (id: string | null) => void;
  nodes: Node<CustomNodeData>[];
  edges: FlowEdge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (params: FlowEdge | Connection) => void;
  setNodes: (nodes: Node<CustomNodeData>[] | ((prevNodes: Node<CustomNodeData>[]) => Node<CustomNodeData>[])) => void;
  // setEdges: (edges: FlowEdge[] | ((prevEdges: FlowEdge[]) => FlowEdge[])) => void; // onConnect handles this via prop
}

// Note: getDescendantNodeIds is defined outside, so it's fine.

const MindMap = ({
  setSelectedNodeId,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  setNodes,
  // setEdges prop is not directly used if onConnect is passed and handles it.
}: MindMapProps) => {
  // const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>(initialNodesData); // Removed
  // const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdgesData); // Removed

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const toggleNodeCollapse = useCallback((nodeId: string) => {
    // Use the setNodes prop from IndexPage
    setNodes((currentNodes) =>
      currentNodes.map((n) => // renamed node to n to avoid conflict
        n.id === nodeId
          ? { ...n, data: { ...n.data, isCollapsed: !(n.data.isCollapsed ?? false) } }
          : n
      )
    );
  }, [setNodes]); // Dependency is now the prop setNodes

  // onConnect is now passed as a prop directly to ReactFlow.

  const { filteredNodes, filteredEdges } = useMemo(() => {
    const processedNodes = nodes.map(node => ({ // nodes from props
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
        const descendantNodeIds = getDescendantNodeIds(node.id, edges);
        descendantNodeIds.forEach(id => allHiddenNodeIds.add(id));
      }
    });

    const currentFilteredNodes = processedNodes.filter(node => !allHiddenNodeIds.has(node.id));
    const currentFilteredEdges = edges.filter(edge =>
        !allHiddenNodeIds.has(edge.source) &&
        !allHiddenNodeIds.has(edge.target)
    );

    return { filteredNodes: currentFilteredNodes, filteredEdges: currentFilteredEdges };
  }, [nodes, edges, toggleNodeCollapse /*, selectedNodeId if it were a prop used here */]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick} // Added onNodeClick handler
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
        // By default, clicking a node selects it and deselects others.
        // This internal selection state is what CustomNode will receive as `selected`.
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default MindMap;
