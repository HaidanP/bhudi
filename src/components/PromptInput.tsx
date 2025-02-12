
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Wand2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
}

export const PromptInput = ({ onSubmit, disabled }: PromptInputProps) => {
  const [prompt, setPrompt] = useState("");
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex ${isMobile ? 'flex-col' : ''} gap-3 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-lg border border-purple-100`}>
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the changes you want to make..."
        className="flex-1 h-12 text-base placeholder:text-slate-400 border-slate-200 focus-visible:ring-purple-500"
        disabled={disabled}
      />
      <Button 
        type="submit" 
        disabled={disabled || !prompt.trim()} 
        className={`h-12 px-6 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-base font-medium ${isMobile ? 'w-full' : 'min-w-[140px]'}`}
      >
        <Wand2 size={18} className="mr-2" />
        Generate
      </Button>
    </form>
  );
};
