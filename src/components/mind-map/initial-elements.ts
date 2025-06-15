
import { Edge, Node } from '@xyflow/react';

export const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    data: { 
      label: 'Marxist Theory of Punishment', 
      type: 'topic' 
    },
    position: { x: 0, y: 0 },
  },
  {
    id: '2',
    type: 'custom',
    data: { 
      label: 'Core Principle', 
      type: 'definition' 
    },
    position: { x: -250, y: 150 },
  },
  {
    id: '3',
    type: 'custom',
    data: { 
      label: 'Law as an instrument of the ruling class to maintain power and control the proletariat.', 
      type: 'explanation'
    },
    position: { x: -450, y: 300 },
  },
  {
    id: '4',
    type: 'custom',
    data: { 
      label: 'Functions of Punishment', 
      type: 'critical-point'
    },
    position: { x: 250, y: 150 },
  },
  {
    id: '5',
    type: 'custom',
    data: {
      label: 'Maintain Social Order (for Bourgeoisie)',
      type: 'example',
    },
    position: { x: 250, y: 300 },
  },
  {
    id: '6',
    type: 'custom',
    data: { 
      label: 'Enforce Class Ideology',
      type: 'example'
    },
    position: { x: 450, y: 300 },
  },
];

export const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e1-4', source: '1', target: '4' },
  { id: 'e4-5', source: '4', target: '5' },
  { id: 'e4-6', source: '4', target: '6' },
];
