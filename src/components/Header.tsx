
import { useIsMobile } from "@/hooks/use-mobile";
import { SparklesCore } from "./ui/sparkles";

export const Header = () => {
  const isMobile = useIsMobile();
  
  return (
    <header className="relative z-10 text-center space-y-8 md:space-y-10 py-8 md:py-12 px-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-center gap-3 relative">
        <div className="absolute inset-0 w-full">
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={80}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
        </div>
        <h1 className={`font-display tracking-wide ${isMobile ? 'text-3xl' : 'text-5xl'} font-bold bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-transparent bg-clip-text relative z-10 drop-shadow-sm`}>
          Sprettza
        </h1>
      </div>
      <p className="text-gray-300/90 max-w-2xl mx-auto text-base md:text-lg font-medium leading-relaxed backdrop-blur-sm rounded-lg p-4 shadow-xl bg-black/5 border border-white/10">
        Transform your fashion with AI-powered magic. Edit, reimagine, and bring your clothing ideas to life.
      </p>
    </header>
  );
};
