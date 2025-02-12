
import { useIsMobile } from "@/hooks/use-mobile";
import { SparklesCore } from "./ui/sparkles";

export const Header = () => {
  const isMobile = useIsMobile();
  
  return (
    <header className="text-center space-y-4 md:space-y-6 py-6 md:py-10">
      <div className="flex items-center justify-center gap-3 relative">
        <div className="absolute inset-0 w-full">
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={60}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
        </div>
        <h1 className={`${isMobile ? 'text-4xl' : 'text-6xl'} font-bold bg-gradient-to-r from-rose-800 via-rose-700 to-rose-600 text-transparent bg-clip-text relative z-10`}>
          Sprettza
        </h1>
      </div>
      <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg font-medium px-4">
        Transform your fashion with AI-powered magic. Edit, reimagine, and bring your clothing ideas to life.
      </p>
    </header>
  );
};
