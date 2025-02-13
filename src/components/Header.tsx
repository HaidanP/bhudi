
import { useIsMobile } from "@/hooks/use-mobile";
import { StarBorder } from "./ui/star-border";

export const Header = () => {
  const isMobile = useIsMobile();
  
  return (
    <header className="relative pt-2 text-center animate-fade-in">
      <StarBorder 
        as="nav"
        className="w-full mb-6"
        color="white"
      >
        <div className="container-width">
          <div className="flex items-center justify-center space-x-4">
            <img 
              src="/lovable-uploads/2435473f-cb4d-4821-a1c7-bb0fed62cd11.png"
              alt="Digital Butterfly"
              className={`${isMobile ? 'w-12' : 'w-16'} h-auto animate-float`}
            />
            
            <h1 className={`font-display ${isMobile ? 'text-4xl' : 'text-5xl'} font-bold bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600 text-transparent bg-clip-text relative z-10 drop-shadow-[0_0_3px_rgba(255,107,107,0.4)]`}>
              Sprettza
            </h1>
          </div>
        </div>
      </StarBorder>

      <div className="space-y-3 container-width mt-8">
        <p className="text-lg font-medium text-white/90 leading-relaxed animate-fade-in [animation-delay:200ms]">
          Transform your fashion with AI-powered magic
        </p>
        <p className="text-base font-normal text-white/70 leading-relaxed animate-fade-in [animation-delay:400ms]">
          Edit, reimagine, and bring your clothing ideas to life
        </p>
      </div>
    </header>
  );
};
