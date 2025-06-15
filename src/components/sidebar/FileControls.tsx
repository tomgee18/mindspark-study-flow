import { useCallback, useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileText, Loader2, FileCode } from 'lucide-react';
import { toast } from 'sonner';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { generateMindMapFromText } from '@/lib/ai';

// Set up the worker for pdfjs-dist from a CDN
if (typeof window !== 'undefined' && 'Worker' in window) {
  GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.mjs`;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function FileControls({ hasApiKey }: { hasApiKey: boolean }) {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);
  const txtFileInputRef = useRef<HTMLInputElement>(null);
  const mdFileInputRef = useRef<HTMLInputElement>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isTextLoading, setIsTextLoading] = useState(false);

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

  const onJsonImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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

  const handlePdfImportClick = () => {
    pdfFileInputRef.current?.click();
  };
  
  const handleTxtImportClick = () => {
    txtFileInputRef.current?.click();
  };
  
  const handleMdImportClick = () => {
    mdFileInputRef.current?.click();
  };

  const onTextFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large (max 10MB).");
      if (event.target) event.target.value = '';
      return;
    }

    setIsTextLoading(true);
    const promise = async () => {
      try {
        const textContent = await file.text();
        if (!textContent.trim()) {
            throw new Error(`Could not extract text from ${file.name}. The file might be empty.`);
        }
        
        const mindMap = await generateMindMapFromText(textContent);

        setNodes(mindMap.nodes);
        setEdges(mindMap.edges);
      } catch(error) {
        console.error(error);
        if (error instanceof Error) {
            throw new Error(error.message || `An unknown error occurred during ${file.name} processing.`);
        }
        throw new Error(`An unknown error occurred during ${file.name} processing.`);
      }
    };

    toast.promise(promise(), {
      loading: `Generating mind map from ${file.name}... This may take a moment.`,
      success: 'Mind map generated successfully!',
      error: (err) => err.message,
      finally: () => {
        setIsTextLoading(false);
        if (event.target) {
            event.target.value = '';
        }
      }
    });
  };

  const onPdfImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large (max 10MB).");
      if (event.target) event.target.value = '';
      return;
    }

    setIsPdfLoading(true);
    const promise = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await getDocument(arrayBuffer).promise;
        let textContent = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          textContent += text.items.map((s: any) => s.str).join(' ');
        }

        if (!textContent.trim()) {
            throw new Error("Could not extract text from PDF. The document might be empty or image-based.");
        }
        
        const mindMap = await generateMindMapFromText(textContent);

        setNodes(mindMap.nodes);
        setEdges(mindMap.edges);
      } catch(error) {
        console.error(error);
        if (error instanceof Error) {
            throw new Error(error.message || 'An unknown error occurred during PDF processing.');
        }
        throw new Error('An unknown error occurred during PDF processing.');
      }
    };

    toast.promise(promise(), {
      loading: 'Generating mind map from PDF... This may take a moment.',
      success: 'Mind map generated successfully!',
      error: (err) => err.message,
      finally: () => {
        setIsPdfLoading(false);
        if (event.target) {
            event.target.value = '';
        }
      }
    });
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
        <Button className="w-full" variant="outline" onClick={handleJsonImportClick}>
          <Upload className="mr-2 h-4 w-4" />
          Import JSON
        </Button>
        <Button className="w-full" variant="outline" onClick={handlePdfImportClick} disabled={!hasApiKey || isPdfLoading || isTextLoading}>
            {isPdfLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <FileText className="mr-2 h-4 w-4" />
            )}
            Import from PDF
        </Button>
        <Button className="w-full" variant="outline" onClick={handleTxtImportClick} disabled={!hasApiKey || isPdfLoading || isTextLoading}>
            {isTextLoading && !isPdfLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <FileText className="mr-2 h-4 w-4" />
            )}
            Import from Text
        </Button>
        <Button className="w-full" variant="outline" onClick={handleMdImportClick} disabled={!hasApiKey || isPdfLoading || isTextLoading}>
            {isTextLoading && !isPdfLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <FileCode className="mr-2 h-4 w-4" />
            )}
            Import from Markdown
        </Button>
        <input
          type="file"
          ref={jsonFileInputRef}
          onChange={onJsonImport}
          style={{ display: 'none' }}
          accept=".json"
        />
        <input
          type="file"
          ref={pdfFileInputRef}
          onChange={onPdfImport}
          style={{ display: 'none' }}
          accept=".pdf"
        />
        <input
          type="file"
          ref={txtFileInputRef}
          onChange={onTextFileImport}
          style={{ display: 'none' }}
          accept=".txt"
        />
        <input
          type="file"
          ref={mdFileInputRef}
          onChange={onTextFileImport}
          style={{ display: 'none' }}
          accept=".md,.markdown"
        />
      </CardContent>
    </Card>
  );
}
