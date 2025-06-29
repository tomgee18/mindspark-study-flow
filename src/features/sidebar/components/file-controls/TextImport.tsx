import { useRef, Dispatch, SetStateAction } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, FileCode } from 'lucide-react';
import { toast } from 'sonner';
import { generateMindMapFromText } from '@/features/ai/aiService';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

type LoadingType = null | 'pdf' | 'text';

interface TextImportProps {
  hasApiKey: boolean;
  loadingType: LoadingType;
  setLoadingType: Dispatch<SetStateAction<LoadingType>>;
}

export function TextImport({ hasApiKey, loadingType, setLoadingType }: TextImportProps) {
  const { setNodes, setEdges } = useReactFlow();
  const txtFileInputRef = useRef<HTMLInputElement>(null);
  const mdFileInputRef = useRef<HTMLInputElement>(null);

  const handleTxtImportClick = () => {
    txtFileInputRef.current?.click();
  };
  
  const handleMdImportClick = () => {
    mdFileInputRef.current?.click();
  };

  const onTextFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain' && file.type !== 'text/markdown') {
        toast.error("Invalid file type. Please upload a .txt or .md file.");
        if (event.target) event.target.value = '';
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large (max 10MB).");
      if (event.target) event.target.value = '';
      return;
    }

    setLoadingType('text');
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
        setLoadingType(null);
        if (event.target) {
            event.target.value = '';
        }
      }
    });
  };

  return (
    <>
        <Button className="w-full" variant="outline" onClick={handleTxtImportClick} disabled={!hasApiKey || loadingType !== null}>
            {loadingType === 'text' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <FileText className="mr-2 h-4 w-4" />
            )}
            Import from Text
        </Button>
        <Button className="w-full" variant="outline" onClick={handleMdImportClick} disabled={!hasApiKey || loadingType !== null}>
            {loadingType === 'text' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <FileCode className="mr-2 h-4 w-4" />
            )}
            Import from Markdown
        </Button>
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
    </>
  );
}
