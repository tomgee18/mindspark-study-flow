
import { Edge, Node } from '@xyflow/react';
import { CustomNodeData } from '../components/CustomNode';

export const initialNodes: Node<CustomNodeData>[] = [
  {
    id: '1',
    type: 'custom',
    data: { label: 'Introduction to AI', type: 'topic', isCollapsed: false },
    position: { x: 250, y: 5 },
  },
  {
    id: '2',
    type: 'custom',
    data: { label: 'What is Machine Learning?', type: 'definition', isCollapsed: false },
    position: { x: 100, y: 100 },
  },
  {
    id: '3',
    type: 'custom',
    data: { label: 'Supervised Learning', type: 'explanation', isCollapsed: false },
    position: { x: 400, y: 100 },
  },
  {
    id: '4',
    type: 'custom',
    data: { label: 'Example: Spam Detection', type: 'example', isCollapsed: true },
    position: { x: 100, y: 200 },
  },
];

export const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
  { id: 'e2-4', source: '2', target: '4', animated: true },
];
