
import { useCallback, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function FileControls() {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const onImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          try {
            const flow = JSON.parse(content);
            if (flow && Array.isArray(flow.nodes) && Array.isArray(flow.edges)) {
              setNodes(flow.nodes);
              setEdges(flow.edges);
              toast.success("Mind map imported successfully!");
            } else {
              toast.error('Invalid JSON format for mind map.');
            }
          } catch (error) {
            toast.error('Error parsing JSON file.');
            console.error('Error parsing JSON file:', error);
          }
        }
      };
      reader.onerror = () => {
        toast.error('Failed to read file.');
      };
      reader.readAsText(file);
    }
    if(event.target) {
        event.target.value = '';
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

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
        <Button className="w-full" variant="outline" onClick={handleImportClick}>
          <Upload className="mr-2 h-4 w-4" />
          Import JSON
        </Button>
        <Button className="w-full" variant="outline" disabled>
            <FileText className="mr-2 h-4 w-4" />
            Import from PDF
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onImport}
          style={{ display: 'none' }}
          accept=".json"
        />
      </CardContent>
    </Card>
  );
}
