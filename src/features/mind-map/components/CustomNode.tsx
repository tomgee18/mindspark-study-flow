
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Book, Lightbulb, TestTube2, AlertTriangle, FileText, PlusCircle, MinusCircle } from 'lucide-react'; // Added PlusCircle, MinusCircle
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown'; // Added ReactMarkdown

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
  details?: string; // New optional property for markdown details
};

// We are not using the generic version of NodeProps (NodeProps<CustomNodeData>)
// due to a persistent TypeScript inference issue. Instead, we use the base
// NodeProps and cast the `data` object. This resolves the type errors.
// `selected` is a boolean prop automatically passed by React Flow for selected nodes.
const CustomNode = ({ data, id, selected }: NodeProps) => {
  const typedData = data as CustomNodeData;
  const config = typeConfig[typedData.type] || typeConfig.explanation;
  const Icon = config.icon;
  const isCollapsed = typedData.isCollapsed ?? false; // Use from typedData for consistency

  // No need for separate handleToggleCollapse, onClick can call directly
  // const handleToggleCollapse = () => {
  //   if (typedData.onToggleCollapse) {
  //     typedData.onToggleCollapse(id); // id is from NodeProps
  //   }
  // };

  return (
    <div className={cn(
      "rounded-lg border-2 shadow-md p-4 w-64 relative flex flex-col", // Added flex-col
      config.color,
      selected ? "ring-2 ring-offset-2 ring-primary dark:ring-offset-background" : ""
    )}>
      <Handle type="target" position={Position.Top} className="!bg-primary" />

      {/* Header section */}
      <div className="flex items-center gap-3">
        <Icon className={cn("h-6 w-6", config.iconColor)} />
        <div className={cn("font-semibold", config.textColor)}>{typedData.label}</div>
      </div>

      {/* Content section (conditionally rendered based on isCollapsed) */}
      {!isCollapsed && (
        <>
          {/* Placeholder for any non-details content that should also be collapsible */}
          {/* For example, if there was a subtitle or short description before details:
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Some brief content...</p>
          */}

          {/* Details section (Markdown) */}
          {typedData.details && typedData.details.trim() !== "" && (
            <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-700 text-sm prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{typedData.details}</ReactMarkdown>
            </div>
          )}
        </>
      )}

      {/* Collapse/Expand Button */}
      {typedData.onToggleCollapse && (
        <Button
            variant="ghost"
            size="icon" // Using size="icon" might make it too small if it just has +/- text.
                        // Let's use a small padding and ensure icon size is controlled.
            onClick={() => typedData.onToggleCollapse?.(id)} // id is from NodeProps
            className="absolute bottom-1 right-1 h-6 w-6 p-0.5" // Adjusted padding
            aria-label={isCollapsed ? 'Expand node' : 'Collapse node'}
        >
            {isCollapsed ? <PlusCircle className="h-4 w-4" /> : <MinusCircle className="h-4 w-4" />}
        </Button>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
};

export default memo(CustomNode);
