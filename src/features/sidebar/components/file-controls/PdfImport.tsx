
import { useRef, Dispatch, SetStateAction } from 'react';
import { useMindMap } from '@/contexts/MindMapContext';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { generateMindMapFromText } from '@/features/ai/aiService';

if (typeof window !== 'undefined' && 'Worker' in window) {
  GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.mjs`;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // Increased to 50 MB

type LoadingType = null | 'pdf' | 'text';

interface PdfImportProps {
  hasApiKey: boolean;
  loadingType: LoadingType;
  setLoadingType: Dispatch<SetStateAction<LoadingType>>;
}

export function PdfImport({ hasApiKey, loadingType, setLoadingType }: PdfImportProps) {
  const { setNodes, setEdges } = useMindMap();
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
      toast.error("File is too large (max 50MB).");
      if (event.target) event.target.value = '';
      return;
    }

    setLoadingType('pdf');
    const promise = async () => {
      try {
        console.log("Starting PDF processing...");
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await getDocument(arrayBuffer).promise;
        console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);
        
        let textContent = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          console.log(`Processing page ${i}/${pdf.numPages}`);
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          
          // Improved text extraction with proper spacing
          const pageText = text.items
            .map((item: any) => {
              if (item.str) {
                return item.str;
              }
              return '';
            })
            .filter(str => str.trim().length > 0)
            .join(' ');
          
          if (pageText.trim()) {
            textContent += pageText + '\n\n';
          }
        }

        console.log(`Extracted text length: ${textContent.length} characters`);

        if (!textContent.trim()) {
            throw new Error("Could not extract text from PDF. The document might be empty, image-based, or protected.");
        }

        if (textContent.length < 50) {
            throw new Error("PDF contains very little text content. Please ensure the PDF has readable text.");
        }
        
        console.log("Sending text to AI for mind map generation...");
        const mindMap = await generateMindMapFromText(textContent);

        setNodes(mindMap.nodes);
        setEdges(mindMap.edges);
      } catch(error) {
        console.error("PDF processing error:", error);
        if (error instanceof Error) {
            throw new Error(error.message || 'An error occurred during PDF processing.');
        }
        throw new Error('An unknown error occurred during PDF processing.');
      }
    };

    toast.promise(promise(), {
      loading: 'Extracting text from PDF and generating mind map... This may take a moment.',
      success: 'Mind map generated successfully from PDF!',
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
