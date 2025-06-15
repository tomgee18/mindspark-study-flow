
import { useCallback, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { JsonImport } from './file-controls/JsonImport';
import { PdfImport } from './file-controls/PdfImport';
import { TextImport } from './file-controls/TextImport';

type LoadingType = null | 'pdf' | 'text';

export function FileControls({ hasApiKey }: { hasApiKey: boolean }) {
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="h-5 w-5" />
          File
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button className="w-full" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export JSON
        </Button>
        <JsonImport />
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
    </Card>
  );
}
