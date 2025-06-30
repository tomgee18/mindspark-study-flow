
import { useRef, Dispatch, SetStateAction } from 'react';
import { useMindMap } from '@/contexts/MindMapContext';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { generateMindMapFromText } from '@/features/ai/aiService';

// Use a more reliable worker setup
if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

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
        // Using a sanitization function to prevent log injection
        console.log(`Starting PDF processing for ${sanitizeLog(file.name)} (${(file.size / 1024 / 1024).toFixed(2)}MB)...`);
        const arrayBuffer = await file.arrayBuffer();
        
        // Create a more robust PDF loading configuration

        const loadingTask = getDocument({
          data: arrayBuffer,
          useSystemFonts: true,
          standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@4.4.168/standard_fonts/',
        });
        
        const pdf = await loadingTask.promise;
        // Sanitize the log message to prevent log injection
        console.log(`PDF loaded successfully. Pages: ${sanitizeLog(pdf.numPages.toString())}`);
        
        let textContent = '';
        for (let i = 1; i <= pdf.numPages; i++) {

          console.log(`Processing page ${sanitizeLog(i.toString())}/${sanitizeLog(pdf.numPages.toString())}`);
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          

          // Improved text extraction with proper spacing and line breaks
          const pageText = text.items
            .map((textItem: any) => {
              if (textItem.str && textItem.str.trim()) {
                return textItem.str;
              }
              return '';
            })

            .filter(str => str.length > 0)
            .join(' ')
            .replace(/\s+/g, ' '); // Normalize whitespace
          
          if (pageText.trim()) {
            textContent += pageText + '\n\n';
          }
        }

        console.log(`Extracted text length: ${textContent.length.toLocaleString()} characters`);

        if (!textContent.trim()) {
            throw new Error("Could not extract text from PDF. The document might be empty, image-based, or protected.");
        }

        if (textContent.length < 100) {
            throw new Error("PDF contains very little text content. Please ensure the PDF has readable text.");
        }

        // Show specific message for very large texts
        if (textContent.length > 400000) {
            console.log("Processing large PDF text content...");
        }
        
        console.log("Sending text to AI for mind map generation...");
        const mindMap = await generateMindMapFromText(textContent);

        setNodes(mindMap.nodes);
        setEdges(mindMap.edges);
        setEdges(mindMap.edges);
      } catch(error) {
        console.error("PDF processing error:", error);
        if (error instanceof Error) {
            if (error.name === 'InvalidPDFException') {
                throw new Error('The PDF file is invalid or corrupted. Please try a different file.');
            } else if (error.name === 'MissingPDFException') {
                throw new Error('The PDF file is missing or could not be found. Please check the file and try again.');
            } else if (error.name === 'UnexpectedResponseException') {
                throw new Error('An unexpected error occurred while processing the PDF. Please try again later.');
            } else if (error.message.includes('Input text is too long')) {
                throw new Error(`PDF is too large to process (${(file.size / 1024 / 1024).toFixed(2)}MB). Try a smaller PDF or break it into sections.`);
            }

        }
        throw new Error('An unknown error occurred during PDF processing.');
      }
    };

    toast.promise(promise(), {
      loading: `Processing ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) and generating mind map... This may take a moment.`,
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
