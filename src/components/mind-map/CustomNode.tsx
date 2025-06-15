
import { memo, FC } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Book, Lightbulb, TestTube2, AlertTriangle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeConfig = {
    topic: {
        icon: Book,
        color: 'bg-blue-100 border-blue-400',
    },
    definition: {
        icon: Lightbulb,
        color: 'bg-green-100 border-green-400',
    },
    explanation: {
        icon: FileText,
        color: 'bg-gray-100 border-gray-400',
    },
    'critical-point': {
        icon: AlertTriangle,
        color: 'bg-red-100 border-red-400',
    },
    example: {
        icon: TestTube2,
        color: 'bg-yellow-100 border-yellow-400',
    },
};

export type CustomNodeData = {
  label: string;
  type: keyof typeof typeConfig;
};

const CustomNode: FC<NodeProps<CustomNodeData>> = ({ data }) => {
  const config = typeConfig[data.type] || typeConfig.explanation;
  const Icon = config.icon;

  return (
    <div className={cn("rounded-lg border-2 shadow-md bg-card p-4 w-64", config.color)}>
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 text-foreground/70" />
        <div className="font-semibold text-foreground">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
};

export default memo(CustomNode);
