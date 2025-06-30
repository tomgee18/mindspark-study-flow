
import { useCallback, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils'; // Import cn
import { JsonImport } from './file-controls/JsonImport';
import { PdfImport } from './file-controls/PdfImport';
import { TextImport } from './file-controls/TextImport';

type LoadingType = null | 'pdf' | 'text';

interface FileControlsProps {
  hasApiKey: boolean;
  isCollapsed?: boolean;
}

export function FileControls({ hasApiKey, isCollapsed }: FileControlsProps) {
  const { getNodes, getEdges } = useReactFlow();
  const [loadingType, setLoadingType] = useState<LoadingType>(null);

  const onExport = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();

    if (nodes.length === 0) {
      toast.error("Cannot export an empty mind map.");
      return;
    }

    const flow = { nodes, edges };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(flow, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'mindmap.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Mind map exported successfully!");
  }, [getNodes, getEdges]);

  return (
    <Card>
      <CardHeader className={cn(isCollapsed ? "p-0 pt-2 flex justify-center items-center" : "pb-2")}>
        <CardTitle className={cn("flex items-center gap-2 text-lg", isCollapsed ? "justify-center" : "")}>
          <Download className={cn("h-5 w-5", isCollapsed ? "m-0" : "")} />
          {!isCollapsed && "File"}
        </CardTitle>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="space-y-2">
          <Button className="w-full" onClick={onExport} title="Export JSON">
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          <JsonImport />
          {/* TODO: Adapt JsonImport, PdfImport, TextImport to also accept isCollapsed
                     or render them as icon-only buttons if isCollapsed is true,
                     similar to how AppSidebar handles its direct buttons.
                     For now, they will only be visible when sidebar is expanded.
          */}
          <PdfImport
            hasApiKey={hasApiKey}
            loadingType={loadingType}
            setLoadingType={setLoadingType}
          />
          <TextImport
            hasApiKey={hasApiKey}
            loadingType={loadingType}
            setLoadingType={setLoadingType}
          />
        </CardContent>
      )}
    </Card>
  );
}
