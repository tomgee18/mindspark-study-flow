
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Book, Lightbulb, TestTube2, AlertTriangle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeConfig = {
    topic: {
        icon: Book,
        color: 'bg-blue-100 border-blue-400 dark:bg-blue-900 dark:border-blue-700',
        textColor: 'text-blue-900 dark:text-blue-100',
        iconColor: 'text-blue-700 dark:text-blue-300'
    },
    definition: {
        icon: Lightbulb,
        color: 'bg-green-100 border-green-400 dark:bg-green-900 dark:border-green-700',
        textColor: 'text-green-900 dark:text-green-100',
        iconColor: 'text-green-700 dark:text-green-300'
    },
    explanation: {
        icon: FileText,
        color: 'bg-gray-100 border-gray-400 dark:bg-gray-800 dark:border-gray-600',
        textColor: 'text-gray-900 dark:text-gray-100',
        iconColor: 'text-gray-700 dark:text-gray-300'
    },
    'critical-point': {
        icon: AlertTriangle,
        color: 'bg-red-100 border-red-400 dark:bg-red-900 dark:border-red-700',
        textColor: 'text-red-900 dark:text-red-100',
        iconColor: 'text-red-700 dark:text-red-300'
    },
    example: {
        icon: TestTube2,
        color: 'bg-yellow-100 border-yellow-400 dark:bg-yellow-900 dark:border-yellow-700',
        textColor: 'text-yellow-900 dark:text-yellow-100',
        iconColor: 'text-yellow-700 dark:text-yellow-300'
    },
};

export type CustomNodeData = {
  label: string;
  type: keyof typeof typeConfig;
  isCollapsed?: boolean;
  onToggleCollapse?: (nodeId: string) => void; // Added for state lifting
};

// We are not using the generic version of NodeProps (NodeProps<CustomNodeData>)
// due to a persistent TypeScript inference issue. Instead, we use the base
// NodeProps and cast the `data` object. This resolves the type errors.
// `selected` is a boolean prop automatically passed by React Flow for selected nodes.
const CustomNode = ({ data, id, selected }: NodeProps) => {
  const typedData = data as CustomNodeData;
  const config = typeConfig[typedData.type] || typeConfig.explanation;
  const Icon = config.icon;
  const isCollapsed = typedData.isCollapsed ?? false;

  const handleToggleCollapse = () => {
    if (typedData.onToggleCollapse) {
      typedData.onToggleCollapse(id);
    }
  };

  return (
    <div className={cn(
      "rounded-lg border-2 shadow-md p-4 w-64 relative",
      config.color,
      selected ? "ring-2 ring-offset-2 ring-primary dark:ring-offset-background" : "" // Visual indicator for selection
    )}>
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <div className="flex items-center gap-3">
        <Icon className={cn("h-6 w-6", config.iconColor)} />
        <div className={cn("font-semibold", config.textColor)}>{typedData.label}</div>
      </div>
      {/* Conditional rendering based on isCollapsed from props */}
      {!isCollapsed && (
        <div className="mt-2">
          {/* Placeholder for content that would be hidden */}
          <p className="text-xs text-gray-500 dark:text-gray-400">Node content goes here...</p>
        </div>
      )}
      <Button
        onClick={handleToggleCollapse}
        size="sm"
        variant="ghost"
        className="absolute bottom-1 right-1 p-1 h-6 w-6 text-xs"
      >
        {isCollapsed ? '+' : '-'} {/* Text based on isCollapsed from props */}
      </Button>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
};

export default memo(CustomNode);
