
import { BrainCircuit } from 'lucide-react';

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-card text-card-foreground shadow-sm">
      <div className="flex items-center gap-2">
        <BrainCircuit className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">MindSpark</h1>
      </div>
      {/* Placeholder for user button or other actions */}
    </header>
  );
};

export default Header;
