
import { useRef, Dispatch, SetStateAction } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { generateMindMapFromText } from '@/lib/ai';

if (typeof window !== 'undefined' && 'Worker' in window) {
  GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.mjs`;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

type LoadingType = null | 'pdf' | 'text';

interface PdfImportProps {
  hasApiKey: boolean;
  loadingType: LoadingType;
  setLoadingType: Dispatch<SetStateAction<LoadingType>>;
}

export function PdfImport({ hasApiKey, loadingType, setLoadingType }: PdfImportProps) {
  const { setNodes, setEdges } = useReactFlow();
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  const handlePdfImportClick = () => {
    pdfFileInputRef.current?.click();
  };

  const onPdfImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        toast.error("Invalid file type. Please upload a valid PDF file.");
        if (event.target) event.target.value = '';
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large (max 10MB).");
      if (event.target) event.target.value = '';
      return;
    }

    setLoadingType('pdf');
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
        setLoadingType(null);
        if (event.target) {
            event.target.value = '';
        }
      }
    });
  };

  return (
    <>
      <Button className="w-full" variant="outline" onClick={handlePdfImportClick} disabled={!hasApiKey || loadingType !== null}>
        {loadingType === 'pdf' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
            <FileText className="mr-2 h-4 w-4" />
        )}
        Import from PDF
      </Button>
      <input
        type="file"
        ref={pdfFileInputRef}
        onChange={onPdfImport}
        style={{ display: 'none' }}
        accept=".pdf"
      />
    </>
  );
}
