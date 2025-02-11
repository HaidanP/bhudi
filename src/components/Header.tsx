
import { useIsMobile } from "@/hooks/use-mobile";

export const Header = () => {
  const isMobile = useIsMobile();
  
  return (
    <header className="text-center space-y-3 md:space-y-4">
      <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-semibold tracking-tight`}>
        AI Clothing Editor
      </h1>
      <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
        Upload an image, mask the area you want to modify, and describe the changes you want to make.
      </p>
    </header>
  );
};
