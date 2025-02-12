
import { useIsMobile } from "@/hooks/use-mobile";
import { Sparkles } from "lucide-react";

export const Header = () => {
  const isMobile = useIsMobile();
  
  return (
    <header className="text-center space-y-4 md:space-y-6 py-6 md:py-10">
      <div className="flex items-center justify-center gap-3">
        <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-purple-500" />
        <h1 className={`${isMobile ? 'text-4xl' : 'text-6xl'} font-bold bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 text-transparent bg-clip-text`}>
          Sprettza
        </h1>
      </div>
      <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-base md:text-lg font-medium">
        Transform your fashion with AI-powered magic. Edit, reimagine, and bring your clothing ideas to life.
      </p>
    </header>
  );
};
