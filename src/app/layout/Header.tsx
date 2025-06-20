
import { BrainCircuit } from 'lucide-react';
import { ModeToggle } from '@/features/theme/ModeToggle'; // Adjusted path

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-card text-card-foreground shadow-sm">
      <div className="flex items-center gap-2">
        <BrainCircuit className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">MindSpark</h1>
      </div>
      <div className="flex items-center gap-4">
        <ModeToggle />
      </div>
    </header>
  );
};

export default Header;
