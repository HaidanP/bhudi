
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
    <form onSubmit={handleSubmit} className={`flex ${isMobile ? 'flex-col' : ''} gap-4 bg-black/60 backdrop-blur-2xl p-5 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.25)] border border-white/10 transition-all duration-300 hover:shadow-[0_4px_24px_rgba(255,255,255,0.05)] group`}>
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the changes you want to make..."
        className="flex-1 min-h-[48px] text-base placeholder:text-gray-500 bg-black/40 border-white/10 focus-visible:ring-rose-500/50 text-gray-200 rounded-xl transition-all duration-300 focus-within:shadow-lg"
        disabled={disabled}
      />
      <Button 
        type="submit" 
        disabled={disabled || !prompt.trim()} 
        className={`min-h-[48px] px-6 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-base font-medium disabled:opacity-50 rounded-xl transition-all duration-300 ${isMobile ? 'w-full' : 'min-w-[140px]'} transform hover:scale-105 active:scale-95 disabled:hover:scale-100 shadow-lg hover:shadow-xl`}
      >
        <Wand2 size={18} className="mr-2" />
        Generate
      </Button>
    </form>
  );
};
