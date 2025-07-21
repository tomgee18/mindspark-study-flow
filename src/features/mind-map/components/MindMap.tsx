
import { useCallback, useMemo, memo } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  Connection,
  Edge,
  BackgroundVariant,
  Node,
  Edge as FlowEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CustomNode from './CustomNode';
import { useMindMap } from '@/contexts/MindMapContext';

/**
 * Gets all descendant node IDs for a given node
 * 
 * @param nodeId - The ID of the node to get descendants for
 * @param allEdges - All edges in the graph
 * @returns A set of descendant node IDs
 */
const getDescendantNodeIds = (
  nodeId: string,
  allEdges: FlowEdge[]
): Set<string> => {
  const descendantIds = new Set<string>();
  const queue: string[] = [nodeId];
  const visitedInThisCall = new Set<string>([nodeId]);

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
        onlyRenderVisibleElements={true}
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
