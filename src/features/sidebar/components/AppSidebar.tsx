
import { useState, useEffect, useCallback } from "react";
import { useReactFlow } from "@xyflow/react"; // Node and Edge types will come from useMindMap
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  generateMindMapFromText,
  generateExpansionForNode,
  generateQuizFromMindMap,
  QuizQuestion,
  generateSummaryFromNodes
} from "@/features/ai/aiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Sparkles, Settings, Loader2, HelpCircle, BookText, FilePlus2, ChevronLeft, ChevronRight } from "lucide-react"; // Added Chevrons
import { FileControls } from "./FileControls";
import { AiSettingsDialog } from "./AiSettingsDialog";
import { cn } from "@/lib/utils"; // Import cn utility
import { QuizDialog } from "@/features/quiz/components/QuizDialog";
import { InfoDialog } from "@/features/common/components/InfoDialog"; // Added InfoDialog
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

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // State for sidebar collapse

  const { fitView } = useReactFlow();

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [mindMapTitleForQuiz, setMindMapTitleForQuiz] = useState<string | undefined>(undefined);

  const [summaryContent, setSummaryContent] = useState("");
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [summaryDialogTitle, setSummaryDialogTitle] = useState("Summary");

  const handleNewMindMap = useCallback(() => {
    setContextNodes(defaultInitialNodes);
    setContextEdges(defaultInitialEdges);
    toast.info("New mind map created.");
    setTimeout(() => fitView?.({ padding: 0.2, duration: 500 }), 100);
  }, [setContextNodes, setContextEdges, fitView]); // defaultInitialNodes/Edges are module constants

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
  }, [selectedNodeId, currentNodesFromContext, setSummaryContent, setSummaryDialogTitle, setIsSummaryDialogOpen]); // Added setters to dep array


  return (
    <>
      <aside
        className={cn(
          "border-r bg-background/80 backdrop-blur-sm flex flex-col gap-6 overflow-y-auto transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "w-20 p-2" : "w-80 p-4"
        )}
      >
        <FileControls hasApiKey={hasApiKey} isCollapsed={isSidebarCollapsed} />

        <Card>
          <CardHeader className={cn("pb-2", isSidebarCollapsed ? "p-0 pt-2 flex justify-center" : "")}>
            <CardTitle className={cn("flex items-center gap-2 text-lg", isSidebarCollapsed ? "justify-center" : "")}>
              <FilePlus2 className={cn("h-5 w-5", isSidebarCollapsed ? "m-0" : "")} />
              {!isSidebarCollapsed && "Actions"}
            </CardTitle>
          </CardHeader>
          {!isSidebarCollapsed && ( // Only render content if not collapsed, or style for icon only
            <CardContent className={cn(isSidebarCollapsed ? "p-0" : "")}>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleNewMindMap}
                disabled={isAnyAiGenerating}
                title="New Mind Map"
              >
                <FilePlus2 className={cn("h-4 w-4", !isSidebarCollapsed && "mr-2")} />
                {!isSidebarCollapsed && "New Mind Map"}
              </Button>
            </CardContent>
          )}
          {isSidebarCollapsed && ( // Icon-only button when collapsed
             <CardContent className="p-0 flex justify-center mt-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNewMindMap}
                    disabled={isAnyAiGenerating}
                    title="New Mind Map"
                >
                    <FilePlus2 className="h-5 w-5" />
                </Button>
             </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader className={cn("flex flex-row items-center justify-between pb-2", isSidebarCollapsed ? "p-0 pt-2 flex-col" : "")}>
            <CardTitle className={cn("flex items-center gap-2 text-lg", isSidebarCollapsed ? "justify-center" : "")}>
              <Sparkles className={cn("h-5 w-5 text-accent", isSidebarCollapsed ? "m-0" : "")} />
              {!isSidebarCollapsed && "AI Assistant"}
            </CardTitle>
            {!isSidebarCollapsed && (
                <Button variant="ghost" size="icon" onClick={() => setIsAiSettingsOpen(true)} aria-label="AI Settings">
                    <Settings className="h-5 w-5" />
                </Button>
            )}
             {isSidebarCollapsed && (
                 <Button variant="ghost" size="icon" className="mt-1" onClick={() => setIsAiSettingsOpen(true)} aria-label="AI Settings">
                    <Settings className="h-5 w-5" />
                </Button>
            )}
          </CardHeader>
          <CardContent className={cn("space-y-2", isSidebarCollapsed ? "p-0 mt-2 flex flex-col items-center gap-2" : "")}>
              <Button
                variant="outline"
                className={cn("w-full", isSidebarCollapsed ? "w-auto justify-center" : "")}
                disabled={!hasApiKey || isAnyAiGenerating}
                onClick={handleGenerateFromTopic}
                title="Generate from Topic"
              >
                {isGeneratingTopic ? ( <Loader2 className={cn("h-4 w-4 animate-spin", !isSidebarCollapsed && "mr-2")} /> ) : ( <Bot className={cn("h-4 w-4", !isSidebarCollapsed && "mr-2")} /> )}
                {!isSidebarCollapsed && (isGeneratingTopic ? "Generating..." : "Generate from Topic")}
              </Button>
              <Button
                variant="outline"
                className={cn("w-full", isSidebarCollapsed ? "w-auto justify-center" : "")}
                disabled={!hasApiKey || isAnyAiGenerating || !selectedNodeId}
                onClick={handleExpandNode}
                title="Expand Node"
              >
                {isExpandingNode ? ( <Loader2 className={cn("h-4 w-4 animate-spin", !isSidebarCollapsed && "mr-2")} /> ) : ( <Bot className={cn("h-4 w-4", !isSidebarCollapsed && "mr-2")} /> )}
                {!isSidebarCollapsed && "Expand Node"}
              </Button>
              <Button
                variant="outline"
                className={cn("w-full", isSidebarCollapsed ? "w-auto justify-center" : "")}
                disabled={!hasApiKey || isAnyAiGenerating || !currentNodesFromContext || currentNodesFromContext.length === 0}
                onClick={handleCreateQuiz}
                title="Create Quiz"
              >
                {isCreatingQuiz ? ( <Loader2 className={cn("h-4 w-4 animate-spin", !isSidebarCollapsed && "mr-2")} /> ) : ( <HelpCircle className={cn("h-4 w-4", !isSidebarCollapsed && "mr-2")} /> )}
                {!isSidebarCollapsed && "Create Quiz"}
              </Button>
              <Button
                variant="outline"
                className={cn("w-full", isSidebarCollapsed ? "w-auto justify-center" : "")}
                disabled={!hasApiKey || isAnyAiGenerating || !currentNodesFromContext || currentNodesFromContext.length === 0}
                onClick={handleGenerateSummary}
                title="Generate Summary"
              >
                {isGeneratingSummary ? ( <Loader2 className={cn("h-4 w-4 animate-spin", !isSidebarCollapsed && "mr-2")} /> ) : ( <BookText className={cn("h-4 w-4", !isSidebarCollapsed && "mr-2")} /> )}
                {!isSidebarCollapsed && (isGeneratingSummary ? "Summarizing..." : "Generate Summary")}
              </Button>
          </CardContent>
        </Card>

        {/* Toggle Button */}
        <div className={cn("mt-auto border-t pt-2", isSidebarCollapsed ? "px-0" : "")}>
            <Button
            variant="ghost"
            className="w-full flex justify-center"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
            {isSidebarCollapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
            </Button>
        </div>
      </aside>
      <AiSettingsDialog open={isAiSettingsOpen} onOpenChange={setIsAiSettingsOpen} />
      <QuizDialog
        open={isQuizDialogOpen}
        onOpenChange={setIsQuizDialogOpen}
        quizQuestions={quizQuestions}
        mindMapTitle={mindMapTitleForQuiz}
      />
      <InfoDialog
        open={isSummaryDialogOpen}
        onOpenChange={setIsSummaryDialogOpen}
        title={summaryDialogTitle}
        content={summaryContent}
      />
    </>
  );
}
