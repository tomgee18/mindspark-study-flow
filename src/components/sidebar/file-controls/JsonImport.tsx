
import { useRef } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function JsonImport() {
  const { setNodes, setEdges } = useReactFlow();
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  const onJsonImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        toast.error("Invalid file type. Please upload a valid JSON file.");
        if(event.target) event.target.value = '';
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File is too large (max 10MB).");
        if(event.target) event.target.value = '';
        return;
      }

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

  const handleJsonImportClick = () => {
    jsonFileInputRef.current?.click();
  };

  return (
    <>
      <Button className="w-full" variant="outline" onClick={handleJsonImportClick}>
        <Upload className="mr-2 h-4 w-4" />
        Import JSON
      </Button>
      <input
        type="file"
        ref={jsonFileInputRef}
        onChange={onJsonImport}
        style={{ display: 'none' }}
        accept=".json"
      />
    </>
  );
}
