
import { useIsMobile } from "@/hooks/use-mobile";
import { SparklesCore } from "./ui/sparkles";

export const Header = () => {
  const isMobile = useIsMobile();
  
  return (
    <header className="relative pt-4 text-center space-y-4 animate-fade-in">
      <div className="relative flex flex-col justify-center items-center space-y-2">
        <img 
          src="/lovable-uploads/2435473f-cb4d-4821-a1c7-bb0fed62cd11.png"
          alt="Digital Butterfly"
          className={`${isMobile ? 'w-32' : 'w-48'} h-auto animate-float`}
        />
        
        <h1 className={`font-display ${isMobile ? 'text-6xl' : 'text-[84px]'} font-bold bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600 text-transparent bg-clip-text relative z-10 drop-shadow-[0_0_3px_rgba(255,107,107,0.4)]`}>
          Sprettza
        </h1>
      </div>
      
      <div className="space-y-4 container-width">
        <p className="text-[20px] font-medium text-white/90 leading-relaxed animate-fade-in [animation-delay:200ms]">
          Transform your fashion with AI-powered magic
        </p>
        <p className="text-[18px] font-normal text-white/70 leading-relaxed animate-fade-in [animation-delay:400ms]">
          Edit, reimagine, and bring your clothing ideas to life
        </p>
      </div>
    </header>
  );
};
