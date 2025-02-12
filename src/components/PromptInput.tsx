
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Wand2 } from "lucide-react";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
}

export const PromptInput = ({ onSubmit, disabled }: PromptInputProps) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container-width space-y-6">
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the changes you want..."
        className="w-full h-[56px] text-lg bg-white/[0.02] text-white border border-[rgba(255,107,107,0.2)] placeholder:text-white/40 rounded-xl px-4 py-3 focus:border-[#ff6b6b] focus:ring-2 focus:ring-[#ff6b6b]/10 transition-all duration-200 resize-none overflow-hidden focus:min-h-[56px] focus:max-h-[200px] focus:resize-y"
        disabled={disabled}
        rows={1}
      />
      <Button 
        type="submit" 
        disabled={disabled || !prompt.trim()} 
        className="w-full h-[56px] bg-[#ff6b6b] hover:bg-[#ff8080] text-[18px] font-semibold tracking-[0.7px] rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        <Wand2 size={20} />
        {disabled ? 'Generating...' : 'Generate'}
      </Button>
    </form>
  );
};
