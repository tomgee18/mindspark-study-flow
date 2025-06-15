
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, FilePlus, Sparkles, Wand2, Settings } from "lucide-react";
import { FileControls } from "./FileControls";
import { AiSettingsDialog } from "./AiSettingsDialog";
import { Sidebar, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";

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
      <Sidebar>
        <SidebarContent className="p-4 flex flex-col gap-6">
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-accent" />
                AI Assistant
              </CardTitle>
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
        </SidebarContent>
        <SidebarFooter>
            <Button variant="outline" className="w-full" onClick={() => setIsAiSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                AI Settings
            </Button>
        </SidebarFooter>
      </Sidebar>
      <AiSettingsDialog open={isAiSettingsOpen} onOpenChange={setIsAiSettingsOpen} />
    </>
  );
}
