
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
    <form onSubmit={handleSubmit} className={`flex ${isMobile ? 'flex-col' : ''} gap-3 bg-black/40 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/10`}>
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the changes you want to make..."
        className="flex-1 h-12 text-base placeholder:text-gray-500 bg-black/20 border-white/10 focus-visible:ring-rose-700 text-gray-200"
        disabled={disabled}
      />
      <Button 
        type="submit" 
        disabled={disabled || !prompt.trim()} 
        className={`h-12 px-6 bg-gradient-to-r from-rose-800 to-rose-700 hover:from-rose-900 hover:to-rose-800 text-base font-medium disabled:opacity-50 ${isMobile ? 'w-full' : 'min-w-[140px]'}`}
      >
        <Wand2 size={18} className="mr-2" />
        Generate
      </Button>
    </form>
  );
};
