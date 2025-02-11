
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
    <form onSubmit={handleSubmit} className={`flex ${isMobile ? 'flex-col' : ''} gap-2`}>
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the changes you want to make..."
        className="flex-1"
        disabled={disabled}
      />
      <Button 
        type="submit" 
        disabled={disabled || !prompt.trim()} 
        className={`gap-2 ${isMobile ? 'w-full' : ''}`}
      >
        <Wand2 size={16} />
        Generate
      </Button>
    </form>
  );
};
