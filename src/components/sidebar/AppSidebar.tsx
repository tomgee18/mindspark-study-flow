
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, FilePlus, Sparkles, Wand2, Settings } from "lucide-react";
import { FileControls } from "./FileControls";
import { AiSettingsDialog } from "./AiSettingsDialog";

export function AppSidebar() {
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkApiKey = () => {
      const apiKey = localStorage.getItem('googleAiApiKey');
      setHasApiKey(!!apiKey);
    };

    checkApiKey();

    window.addEventListener('storage', checkApiKey);
    window.addEventListener('apiKeySet', checkApiKey);

    return () => {
      window.removeEventListener('storage', checkApiKey);
      window.removeEventListener('apiKeySet', checkApiKey);
    };
  }, []);

  return (
    <>
      <aside className="w-80 p-4 border-r bg-background/80 backdrop-blur-sm flex flex-col gap-6">
        <FileControls hasApiKey={hasApiKey} />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wand2 className="h-5 w-5" />
              Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <FilePlus className="mr-2 h-4 w-4" />
              Add Node
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-accent" />
              AI Assistant
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsAiSettingsOpen(true)}>
                <Settings className="h-5 w-5" />
                <span className="sr-only">AI Settings</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" disabled={!hasApiKey}>
                  <Bot className="mr-2 h-4 w-4" />
                  Generate from Topic
              </Button>
              <Button variant="outline" className="w-full" disabled={!hasApiKey}>
                  Expand Node
              </Button>
              <Button variant="outline" className="w-full" disabled={!hasApiKey}>
                  Create Quiz
              </Button>
          </CardContent>
        </Card>
      </aside>
      <AiSettingsDialog open={isAiSettingsOpen} onOpenChange={setIsAiSettingsOpen} />
    </>
  );
}
