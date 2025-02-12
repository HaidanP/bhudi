
import { useIsMobile } from "@/hooks/use-mobile";
import { SparklesCore } from "./ui/sparkles";

export const Header = () => {
  const isMobile = useIsMobile();
  
  return (
    <header className="relative pt-[12vh] text-center space-y-12 animate-fade-in">
      <div className="relative flex justify-center items-center">
        <h1 className={`font-display ${isMobile ? 'text-6xl' : 'text-[84px]'} font-bold bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600 text-transparent bg-clip-text relative z-10 drop-shadow-[0_0_3px_rgba(255,107,107,0.4)]`}>
          Sprettza
        </h1>
      </div>
      
      <div className="space-y-6 container-width">
        <p className="text-[22px] font-medium text-white/90 leading-relaxed animate-fade-in [animation-delay:200ms]">
          Transform your fashion with AI-powered magic
        </p>
        <p className="text-[20px] font-normal text-white/70 leading-relaxed animate-fade-in [animation-delay:400ms]">
          Edit, reimagine, and bring your clothing ideas to life
        </p>
      </div>
    </header>
  );
};
