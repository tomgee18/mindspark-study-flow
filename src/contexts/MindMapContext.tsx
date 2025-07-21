
import React, {
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  Connection,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import { CustomNodeData } from '@/features/mind-map/components/CustomNode';
import {
  initialNodes as initialNodesData,
  initialEdges as initialEdgesData
} from '@/features/mind-map/config/initial-elements';
import { MindMapContext } from '@/hooks/use-mind-map';

export interface MindMapContextType {
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (params: Connection | Edge) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  setNodes: (updater: Node<CustomNodeData>[] | ((currentNodes: Node<CustomNodeData>[]) => Node<CustomNodeData>[])) => void;
  setEdges: (updater: Edge[] | ((currentEdges: Edge[]) => Edge[])) => void;
  toggleNodeCollapse: (nodeId: string) => void;
}

interface MindMapProviderProps {
  children: ReactNode;
}

export const MindMapProvider = ({ children }: MindMapProviderProps) => {
  const [nodes, setNodesState, onNodesChange] = useNodesState(initialNodesData);
  const [edges, setEdgesState, onEdgesChange] = useEdgesState(initialEdgesData);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const newEdge = {
        ...params,
        label: '', // Default empty label
      };
      setEdgesState((eds) => addEdge(newEdge, eds));
    },
    [setEdgesState]
  );

  const toggleNodeCollapse = useCallback(
    (nodeId: string) => {
      setNodesState((currentNodes) =>
        currentNodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, isCollapsed: !(node.data.isCollapsed ?? false) } }
            : node
        )
      );
    },
    [setNodesState]
  );

  const setNodes = useCallback(
    (updater: Node<CustomNodeData>[] | ((currentNodes: Node<CustomNodeData>[]) => Node<CustomNodeData>[])) => {
        setNodesState(updater);
    }, [setNodesState]
  );

  const setEdges = useCallback(
    (updater: Edge[] | ((currentEdges: Edge[]) => Edge[])) => {
        setEdgesState(updater);
    }, [setEdgesState]
  );

  const contextValue = useMemo(
    () => ({
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      selectedNodeId,
      setSelectedNodeId,
      setNodes,
      setEdges,
      toggleNodeCollapse,
    }),
    [
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      selectedNodeId,
      setSelectedNodeId,
      setNodes,
      setEdges,
      toggleNodeCollapse,
    ]
  );

  return (
    <MindMapContext.Provider value={contextValue}>
      {children}
    </MindMapContext.Provider>
  );
};
