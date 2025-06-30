import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Book, Lightbulb, TestTube2, AlertTriangle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
// TODO: Import typeConfig from a separate configuration file
// import { typeConfig } from '@/config/nodeTypes';

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
