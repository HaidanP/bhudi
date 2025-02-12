
import { useIsMobile } from "@/hooks/use-mobile";
import { SparklesCore } from "./ui/sparkles";

export const Header = () => {
  const isMobile = useIsMobile();
  
  return (
    <header className="relative z-10 text-center space-y-12 md:space-y-16 py-12 md:py-16 px-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-center gap-3 relative">
        <div className="absolute inset-0 w-full">
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
        </div>
        <h1 className={`font-display tracking-wider ${isMobile ? 'text-6xl' : 'text-8xl'} font-bold bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600 text-transparent bg-clip-text relative z-10 drop-shadow-lg`}>
          Sprettza
        </h1>
      </div>
      <p className="text-gray-300/90 max-w-3xl mx-auto text-lg md:text-xl font-medium leading-relaxed backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl bg-black/10 border border-white/20">
        Transform your fashion with AI-powered magic. Edit, reimagine, and bring your clothing ideas to life.
      </p>
    </header>
  );
};
