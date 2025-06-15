
import { useState, useEffect, useCallback } from "react";
import { useReactFlow, Node, Edge } from "@xyflow/react"; // Added Node type & Edge
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateMindMapFromText, generateExpansionForNode, generateQuizFromMindMap, QuizQuestion } from "@/lib/ai"; // Added generateQuizFromMindMap and QuizQuestion
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Sparkles, Settings, Loader2, HelpCircle } from "lucide-react"; // Added HelpCircle for Quiz Icon
import { FileControls } from "./FileControls";
import { AiSettingsDialog } from "./AiSettingsDialog";
import { QuizDialog } from "../quiz/QuizDialog"; // Added QuizDialog
import { decryptApiKey } from "@/lib/utils";
import { initialNodes as defaultInitialNodes, initialEdges as defaultInitialEdges } from "../mind-map/initial-elements";
import { CustomNodeData } from "../mind-map/CustomNode";


interface AppSidebarProps {
  selectedNodeId: string | null;
  nodes: Node<CustomNodeData>[];
  edges: Edge[]; // Added edges prop
}

export function AppSidebar({ selectedNodeId, nodes: currentNodes, edges: currentEdges }: AppSidebarProps) {
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { setNodes, setEdges, fitView, getEdges: getFlowEdges } = useReactFlow(); // Renamed getEdges to getFlowEdges to avoid conflict

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [mindMapTitleForQuiz, setMindMapTitleForQuiz] = useState<string | undefined>(undefined);


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
    setIsGenerating(true);
    toast.loading("Generating your mind map... This may take a moment.", { id: "generating-topic" });
    try {
      const { nodes: newNodesFromAI, edges: newEdgesFromAI } = await generateMindMapFromText(topic);
      // Nodes from AI will be processed by MindMap's useMemo to add onToggleCollapse
      setNodes(newNodesFromAI);
      setEdges(newEdgesFromAI);
      toast.success("Mind map generated successfully!", { id: "generating-topic" });
      setTimeout(() => fitView?.({ padding: 0.2, duration: 500 }), 100);
    } catch (error: any) {
      console.error("Error generating mind map from topic:", error);
      toast.error(error.message || "Failed to generate mind map.", { id: "generating-topic" });
    } finally {
      setIsGenerating(false);
    }
  }, [setNodes, setEdges, fitView]);

  const handleExpandNode = useCallback(async () => {
    if (!selectedNodeId) {
      toast.error("No node selected to expand.");
      return;
    }

    const parentNode = currentNodes.find(n => n.id === selectedNodeId);
    if (!parentNode) {
      toast.error("Selected node not found.");
      return;
    }

    setIsGenerating(true);
    toast.loading("Expanding node... This may take a moment.", { id: "expanding-node" });
    try {
      // Pass all current nodes and edges for context if the AI function evolves to use them
      const { newNodes: newNodesFromAI, newEdges: newEdgesFromAI } = await generateExpansionForNode(
        parentNode,
        // currentNodes, // Pass if AI function needs it
        // getEdges()    // Pass if AI function needs it
      );

      // Nodes from AI will be processed by MindMap's useMemo to add onToggleCollapse
      setNodes((prevNodes) => [...prevNodes, ...newNodesFromAI]);
      setEdges((prevEdges) => [...prevEdges, ...newEdgesFromAI]);

      toast.success("Node expanded successfully!", { id: "expanding-node" });
      // Optionally, fit view to the newly expanded area or the parent node
      setTimeout(() => fitView?.({ padding: 0.2, duration: 500 }), 100);
    } catch (error: any) {
      console.error("Error expanding node:", error);
      toast.error(error.message || "Failed to expand node.", { id: "expanding-node" });
    } finally {
      setIsGenerating(false);
    }
  }, [selectedNodeId, currentNodes, setNodes, setEdges, fitView, /* getEdges */]);

  return (
    <>
      <aside className="w-80 p-4 border-r bg-background/80 backdrop-blur-sm flex flex-col gap-6">
        <FileControls
          hasApiKey={hasApiKey}
          onNewMindMap={() => {
            // Nodes set here will also be processed by MindMap's useMemo
            setNodes(defaultInitialNodes);
            setEdges(defaultInitialEdges);
            toast.info("New mind map created.");
            setTimeout(() => fitView?.({ padding: 0.2, duration: 500 }), 100);
          }}
        />
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
                disabled={!hasApiKey || isGenerating}
                onClick={handleGenerateFromTopic}
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bot className="mr-2 h-4 w-4" />
                )}
                {isGenerating ? "Generating..." : "Generate from Topic"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={!hasApiKey || isGenerating || !selectedNodeId}
              >
                Expand Node
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={!hasApiKey || isGenerating || !selectedNodeId} // Also disable if no node selected, for consistency
              >
                Create Quiz
              </Button>
          </CardContent>
        </Card>
      </aside>
      <AiSettingsDialog open={isAiSettingsOpen} onOpenChange={setIsAiSettingsOpen} />
    </>
  );
}
