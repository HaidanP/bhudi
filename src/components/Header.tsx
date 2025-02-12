
import { useIsMobile } from "@/hooks/use-mobile";

export const Header = () => {
  const isMobile = useIsMobile();
  
  return (
    <header className="text-center space-y-3 md:space-y-4">
      <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text`}>
        Sprettza
      </h1>
      <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
        Transform your fashion with AI-powered magic. Edit, reimagine, and bring your clothing ideas to life.
      </p>
    </header>
  );
};
