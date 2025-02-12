
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
    <form onSubmit={handleSubmit} className={`flex ${isMobile ? 'flex-col' : ''} gap-4`}>
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the changes you want..."
        className="w-full bg-gray-900 text-gray-200 placeholder-gray-400 py-3 px-4 min-h-[48px] text-lg rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all duration-300"
        disabled={disabled}
      />
      <Button 
        type="submit" 
        disabled={disabled || !prompt.trim()} 
        className={`min-h-[48px] px-6 bg-rose-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-rose-600 transition-all duration-300 ${isMobile ? 'w-full min-w-[200px]' : 'min-w-[140px]'} transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2`}
      >
        <Wand2 size={18} />
        Generate
      </Button>
    </form>
  );
};
