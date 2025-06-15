import React, {
  createContext,
  useState,
  useCallback,
  useMemo,
  useContext,
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
  XYPosition,
} from '@xyflow/react';
import { CustomNodeData } from '@/components/mind-map/CustomNode'; // Adjust path as needed
import {
  initialNodes as initialNodesData,
  initialEdges as initialEdgesData
} from '@/components/mind-map/initial-elements'; // Adjust path as needed

// 1. Define the shape of the context value
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
  // We can add more specific updater functions later if needed, e.g.:
  // addNode: (newNodeData: CustomNodeData, position: XYPosition) => void;
  // addEdge: (newEdge: Edge) => void;
}

// 2. Create the context
export const MindMapContext = createContext<MindMapContextType | undefined>(undefined);

// 3. Create a hook for consuming the context
export const useMindMap = (): MindMapContextType => {
  const context = useContext(MindMapContext);
  if (context === undefined) {
    throw new Error('useMindMap must be used within a MindMapProvider');
  }
  return context;
};

// 4. Implement MindMapProvider
interface MindMapProviderProps {
  children: ReactNode;
}

export const MindMapProvider = ({ children }: MindMapProviderProps) => {
  const [nodes, setNodesState, onNodesChange] = useNodesState<CustomNodeData>(initialNodesData);
  const [edges, setEdgesState, onEdgesChange] = useEdgesState(initialEdgesData);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdgesState((eds) => addEdge(params, eds)),
    [setEdgesState]
  );

  const toggleNodeCollapse = useCallback(
    (nodeId: string) => {
      setNodesState((currentNodes) =>
        currentNodes.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, isCollapsed: !(n.data.isCollapsed ?? false) } }
            : n
        )
      );
    },
    [setNodesState]
  );

  // Direct setNodes and setEdges for more complex updates from outside (e.g., AI generation)
  // The types for setNodesState and setEdgesState from useNodesState/useEdgesState are compatible
  // with what we defined in MindMapContextType.
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
      setNodes, // Provide the wrapped setter
      setEdges, // Provide the wrapped setter
      toggleNodeCollapse,
    }),
    [
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      selectedNodeId,
      // setSelectedNodeId is stable from useState
      setNodes, // Dependency on wrapped setter
      setEdges, // Dependency on wrapped setter
      toggleNodeCollapse,
    ]
  );

  return (
    <MindMapContext.Provider value={contextValue}>
      {children}
    </MindMapContext.Provider>
  );
};
