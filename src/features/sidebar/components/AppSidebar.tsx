import { useState, useEffect, useCallback } from "react";
import { useReactFlow } from "@xyflow/react"; // Node and Edge types will come from useMindMap
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  generateMindMapFromText,
  generateExpansionForNode,
  generateQuizFromMindMap,
  generateSummaryFromNodes,
  QuizQuestion
} from "@/features/ai/aiService"; // Updated path
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Sparkles, Settings, Loader2, HelpCircle, BookText, FilePlus2 } from "lucide-react";
import { FileControls } from "./FileControls"; // Stays relative
import { AiSettingsDialog } from "./AiSettingsDialog"; // Stays relative
import { QuizDialog } from "@/features/quiz/components/QuizDialog"; // Updated path
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { decryptApiKey } from "@/lib/utils";
import { initialNodes as defaultInitialNodes, initialEdges as defaultInitialEdges } from "@/features/mind-map/config/initial-elements"; // Updated path
import { useMindMap } from "@/contexts/MindMapContext";

// Props are removed, AppSidebar now uses useMindMap context
export function AppSidebar() {
  const {
    nodes: currentNodesFromContext,      // Nodes from context
    edges: currentEdgesFromContext,      // Edges from context
    selectedNodeId,                 // Selected node ID from context
    setNodes: setContextNodes,         // Setter for nodes from context
    setEdges: setContextEdges,         // Setter for edges from context
  } = useMindMap();

  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Unified loading state for all AI operations
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
  const [isExpandingNode, setIsExpandingNode] = useState(false);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const isAnyAiGenerating = isGeneratingTopic || isExpandingNode || isCreatingQuiz || isGeneratingSummary;

  const { fitView } = useReactFlow(); // For fitView functionality

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [mindMapTitleForQuiz, setMindMapTitleForQuiz] = useState<string | undefined>(undefined);
  
  const [summaryContent, setSummaryContent] = useState("");
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [summaryDialogTitle, setSummaryDialogTitle] = useState("Summary");

  useEffect(() => {
    const checkApiKeyStatus = async () => {
      const key = await decryptApiKey();
      setHasApiKey(!!key);
    };
    checkApiKeyStatus();
    window.addEventListener('apiKeySet', checkApiKeyStatus as EventListener);
    return () => window.removeEventListener('apiKeySet', checkApiKeyStatus as EventListener);
  }, []);

  const handleGenerateFromTopic = useCallback(async () => {
    const topic = window.prompt("Enter the topic for your mind map:");
    if (!topic || topic.trim() === "") {
      toast.info("Mind map generation cancelled or topic is empty.");
      return;
    }
    setIsGeneratingTopic(true);
    toast.loading("Generating your mind map...", { id: "generating-topic" });
    try {
      const { nodes: newNodesFromAI, edges: newEdgesFromAI } = await generateMindMapFromText(topic);
      setContextNodes(newNodesFromAI);
      setContextEdges(newEdgesFromAI);
      toast.success("Mind map generated successfully!", { id: "generating-topic" });
      setTimeout(() => fitView?.({ padding: 0.2, duration: 500 }), 100);
    } catch (error: any) {
      console.error("Error generating mind map from topic:", error);
      toast.error(error.message || "Failed to generate mind map.", { id: "generating-topic" });
    } finally {
      setIsGeneratingTopic(false);
    }
  }, [setContextNodes, setContextEdges, fitView]);

  const handleExpandNode = useCallback(async () => {
    if (!selectedNodeId) {
      toast.error("No node selected to expand.");
      return;
    }
    const parentNode = currentNodesFromContext.find(n => n.id === selectedNodeId);
    if (!parentNode) {
      toast.error("Selected node not found.");
      return;
    }
    setIsExpandingNode(true);
    toast.loading("Expanding node...", { id: "expanding-node" });
    try {
      const { newNodes: newNodesFromAI, newEdges: newEdgesFromAI } = await generateExpansionForNode(parentNode);
      setContextNodes((prevNodes) => [...prevNodes, ...newNodesFromAI]);
      setContextEdges((prevEdges) => [...prevEdges, ...newEdgesFromAI]);
      toast.success("Node expanded successfully!", { id: "expanding-node" });
      setTimeout(() => fitView?.({ padding: 0.2, duration: 500 }), 100);
    } catch (error: any) {
      console.error("Error expanding node:", error);
      toast.error(error.message || "Failed to expand node.", { id: "expanding-node" });
    } finally {
      setIsExpandingNode(false);
    }
  }, [selectedNodeId, currentNodesFromContext, setContextNodes, setContextEdges, fitView]);

  const handleCreateQuiz = useCallback(async () => {
    if (!currentNodesFromContext || currentNodesFromContext.length === 0) {
      toast.error("Cannot generate quiz from an empty mind map.");
      return;
    }
    setIsCreatingQuiz(true);
    toast.loading("Generating quiz...", { id: "generating-quiz" });
    try {
      const questions = await generateQuizFromMindMap(currentNodesFromContext, currentEdgesFromContext);
      setQuizQuestions(questions);
      const rootNode = currentNodesFromContext.find(n => n.data.type === 'topic' && n.position.x === 0 && n.position.y === 0) ||
                       currentNodesFromContext.find(n => n.data.type === 'topic') ||
                       currentNodesFromContext[0];
      setMindMapTitleForQuiz(rootNode?.data?.label || "Mind Map Quiz");
      setIsQuizDialogOpen(true);
      toast.success("Quiz generated successfully!", { id: "generating-quiz" });
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      toast.error(error.message || "Failed to generate quiz.", { id: "generating-quiz" });
    } finally {
      setIsCreatingQuiz(false);
    }
  }, [currentNodesFromContext, currentEdgesFromContext, setQuizQuestions, setIsQuizDialogOpen, setMindMapTitleForQuiz ]);

  const handleGenerateSummary = useCallback(async () => {
    let nodesToSummarize = [];
    let titleForSummary = "Summary of Full Mind Map";

    if (selectedNodeId && currentNodesFromContext) {
      const selectedNode = currentNodesFromContext.find(n => n.id === selectedNodeId);
      if (selectedNode) {
        nodesToSummarize = [selectedNode]; // Summarize only the selected node
        titleForSummary = `Summary of "${selectedNode.data.label}"`;
      } else {
        toast.error("Selected node not found. Summarizing all nodes.");
        nodesToSummarize = currentNodesFromContext;
      }
    } else if (currentNodesFromContext && currentNodesFromContext.length > 0) {
      nodesToSummarize = currentNodesFromContext; // Summarize all nodes
    } else {
      toast.error("No content available to summarize.");
      return;
    }

    if (nodesToSummarize.length === 0) {
      toast.error("No nodes selected or available to summarize.");
      return;
    }

    setIsGeneratingSummary(true);
    toast.loading("Generating summary...", { id: "generating-summary" });
    try {
      const summary = await generateSummaryFromNodes(nodesToSummarize, titleForSummary);
      setSummaryContent(summary);
      setSummaryDialogTitle(titleForSummary);
      setIsSummaryDialogOpen(true);
      toast.success("Summary generated successfully!", { id: "generating-summary" });
    } catch (error: any) {
      console.error("Error generating summary:", error);
      toast.error(error.message || "Failed to generate summary.", { id: "generating-summary" });
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [selectedNodeId, currentNodesFromContext]);

  const handleNewMindMap = useCallback(() => {
    setContextNodes(defaultInitialNodes);
    setContextEdges(defaultInitialEdges);
    toast.info("New mind map created.");
    setTimeout(() => fitView?.({ padding: 0.2, duration: 500 }), 100);
  }, [setContextNodes, setContextEdges, fitView]);

  return (
    <>
      <aside className="w-80 p-4 border-r bg-background/80 backdrop-blur-sm flex flex-col gap-6">
        <FileControls
          hasApiKey={hasApiKey}
        />
        
        {/* Card for New Mind Map action */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FilePlus2 className="h-5 w-5" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleNewMindMap}
              disabled={isAnyAiGenerating}
            >
              <FilePlus2 className="mr-2 h-4 w-4" />
              New Mind Map
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-accent" />
              AI Assistant
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsAiSettingsOpen(true)} aria-label="AI Settings">
                <Settings className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                disabled={!hasApiKey || isAnyAiGenerating}
                onClick={handleGenerateFromTopic}
              >
                {isGeneratingTopic ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <Bot className="mr-2 h-4 w-4" /> )}
                {isGeneratingTopic ? "Generating..." : "Generate from Topic"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={!hasApiKey || isAnyAiGenerating || !selectedNodeId}
                onClick={handleExpandNode}
              >
                {isExpandingNode ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <Bot className="mr-2 h-4 w-4" /> )}
                Expand Node
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={!hasApiKey || isAnyAiGenerating || !currentNodesFromContext || currentNodesFromContext.length === 0}
                onClick={handleCreateQuiz}
              >
                {isCreatingQuiz ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <HelpCircle className="mr-2 h-4 w-4" /> )}
                Create Quiz
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={!hasApiKey || isAnyAiGenerating || !currentNodesFromContext || currentNodesFromContext.length === 0}
                onClick={handleGenerateSummary}
              >
                {isGeneratingSummary ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <BookText className="mr-2 h-4 w-4" /> )}
                {isGeneratingSummary ? "Summarizing..." : "Generate Summary"}
              </Button>
          </CardContent>
        </Card>
      </aside>
      <AiSettingsDialog open={isAiSettingsOpen} onOpenChange={setIsAiSettingsOpen} />
      <QuizDialog
        open={isQuizDialogOpen}
        onOpenChange={setIsQuizDialogOpen}
        quizQuestions={quizQuestions}
        mindMapTitle={mindMapTitleForQuiz}
      />
      
      {/* InfoDialog for Summary */}
      <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{summaryDialogTitle}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-grow my-4 pr-6 max-h-[60vh] overflow-y-auto">
            <div className="pre-line">
              {summaryContent}
            </div>
          </ScrollArea>
          <DialogFooter className="mt-auto">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
