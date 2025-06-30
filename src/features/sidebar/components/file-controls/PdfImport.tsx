
import { useRef, Dispatch, SetStateAction } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { generateMindMapFromText } from '@/features/ai/aiService';
import { sanitizeText } from '@/lib/utils'; // Import sanitizeText

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
        try { // Wrap pdf.js operations in their own try-catch for specific logging
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const text = await page.getTextContent();
              textContent += text.items.map((s: any) => s.str).join(' ');
              textContent += '\n'; // Add newline between pages
            }
        } catch (pdfParseError) {
            console.error("Error during PDF text extraction (pdfjs-dist):", pdfParseError);
            // Re-throw or throw a new specific error to be caught by the outer promise handler
            throw new Error("Failed to extract text content from PDF pages.");
        }

        console.log("Raw text extracted from PDF (length):", textContent.length);
        console.log("First 500 chars of raw PDF text:", textContent.substring(0, 500));
        const sanitizedTextForAI = sanitizeText(textContent);
        console.log("Sanitized text for AI (from PDF, length):", sanitizedTextForAI.length);
        console.log("First 500 chars of sanitized PDF text for AI:", sanitizedTextForAI.substring(0, 500));

        if (!sanitizedTextForAI.trim()) { // Check sanitized text
            throw new Error("Could not extract usable text from PDF. The document might be empty or image-based after sanitization.");
        }
        
        // Ensure generateMindMapFromText is called with sanitizedTextForAI
        const mindMap = await generateMindMapFromText(sanitizedTextForAI);

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
