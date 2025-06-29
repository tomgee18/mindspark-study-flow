
import { useRef, Dispatch, SetStateAction } from 'react';
import { useMindMap } from '@/contexts/MindMapContext';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, FileCode } from 'lucide-react';
import { toast } from 'sonner';
import { generateMindMapFromText } from '@/features/ai/aiService';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // Increased to 50 MB

type LoadingType = null | 'pdf' | 'text';

interface TextImportProps {
  hasApiKey: boolean;
  loadingType: LoadingType;
  setLoadingType: Dispatch<SetStateAction<LoadingType>>;
}

export function TextImport({ hasApiKey, loadingType, setLoadingType }: TextImportProps) {
  const { setNodes, setEdges } = useMindMap();
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

    const isTextFile = file.type === 'text/plain' || file.name.endsWith('.txt');
    const isMarkdownFile = file.type === 'text/markdown' || file.name.endsWith('.md') || file.name.endsWith('.markdown');

    if (!isTextFile && !isMarkdownFile) {
        toast.error("Invalid file type. Please upload a .txt or .md file.");
        if (event.target) event.target.value = '';
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large (max 50MB).");
      if (event.target) event.target.value = '';
      return;
    }

    setLoadingType('text');
    const promise = async () => {
      try {
        console.log(`Processing ${file.name}...`);
        const textContent = await file.text();
        console.log(`File content length: ${textContent.length} characters`);
        
        if (!textContent.trim()) {
            throw new Error(`Could not extract text from ${file.name}. The file appears to be empty.`);
        }

        if (textContent.length < 10) {
            throw new Error(`${file.name} contains very little content. Please ensure the file has meaningful text.`);
        }
        
        console.log("Sending text to AI for mind map generation...");
        const mindMap = await generateMindMapFromText(textContent);

        setNodes(mindMap.nodes);
        setEdges(mindMap.edges);
      } catch(error) {
        console.error(`Text file processing error:`, error);
        if (error instanceof Error) {
            throw new Error(error.message || `An error occurred while processing ${file.name}.`);
        }
        throw new Error(`An unknown error occurred while processing ${file.name}.`);
      }
    };

    toast.promise(promise(), {
      loading: `Analyzing ${file.name} and generating mind map... This may take a moment.`,
      success: 'Mind map generated successfully from text file!',
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
