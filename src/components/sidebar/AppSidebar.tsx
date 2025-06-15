
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, FilePlus, Sparkles, Wand2 } from "lucide-react";

export function AppSidebar() {
  return (
    <aside className="w-80 p-4 border-r bg-background/80 backdrop-blur-sm flex flex-col gap-6">
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
            <Button variant="outline" className="w-full" disabled>
                <Bot className="mr-2 h-4 w-4" />
                Generate from Topic
            </Button>
            <Button variant="outline" className="w-full" disabled>
                Expand Node
            </Button>
            <Button variant="outline" className="w-full" disabled>
                Create Quiz
            </Button>
        </CardContent>
      </Card>
    </aside>
  );
}
