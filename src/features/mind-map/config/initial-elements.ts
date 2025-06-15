
import { Edge, Node } from '@xyflow/react';
import { CustomNodeData } from './CustomNode';

export const initialNodes: Node<CustomNodeData>[] = [
  {
    id: '1',
    type: 'custom',
    data: {
      label: 'Introduction to AI',
      type: 'topic',
      isCollapsed: false,
      details: `Artificial Intelligence is a broad field encompassing various techniques.
### Key Areas:
*   Machine Learning
*   Natural Language Processing
*   Computer Vision

Check out [OpenAI](https://openai.com) for cutting-edge research.`
    },
    position: { x: 250, y: 5 },
  },
  {
    id: '2',
    type: 'custom',
    data: {
      label: 'What is Machine Learning?',
      type: 'definition',
      isCollapsed: false,
      details: `Machine Learning (ML) is a subset of AI that allows systems to **learn and improve from experience** without being explicitly programmed.

It involves algorithms that can identify patterns in data. This node *should not be collapsed initially*.`
    },
    position: { x: 100, y: 100 },
  },
  {
    id: '3',
    type: 'custom',
    data: {
      label: 'Supervised Learning',
      type: 'explanation',
      isCollapsed: false,
      details: 'Input data is labeled. Algorithm learns to map input to output. Example: Image classification (cat vs. dog).'
    },
    position: { x: 400, y: 100 },
  },
  {
    id: '4',
    type: 'custom',
    data: {
      label: 'Example: Spam Detection',
      type: 'example',
      isCollapsed: true, // Example of a collapsed node
      details: 'This node is initially collapsed. Its details should only be visible when expanded.'
    },
    position: { x: 100, y: 200 },
  },
];

export const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, label: 'defines' },
  { id: 'e1-3', source: '1', target: '3', animated: true, label: 'explains type' },
  { id: 'e2-4', source: '2', target: '4', animated: true, label: 'example of' },
];
