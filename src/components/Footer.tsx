
import { Github, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative mt-auto py-12">
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
      <div className="relative container mx-auto">
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Social Links */}
          <div className="flex items-center justify-center space-x-6">
            <a
              href="https://twitter.com/haidan"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-110"
            >
              <Twitter className="w-5 h-5 text-rose-400 group-hover:text-rose-300 transition-colors duration-300" />
            </a>
            <a
              href="https://github.com/haidan"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-110"
            >
              <Github className="w-5 h-5 text-rose-400 group-hover:text-rose-300 transition-colors duration-300" />
            </a>
          </div>

          {/* Main Footer Content */}
          <div className="flex items-center justify-center space-x-2 bg-black/20 backdrop-blur-sm py-4 px-8 rounded-2xl max-w-lg mx-auto border border-white/10 hover:border-white/20 transition-all duration-300 group">
            <p className="text-[15px] text-white/80 font-medium transition-all duration-300 text-center">
              Made with{" "}
              <span className="inline-block animate-pulse text-rose-500">♥️</span>{" "}
              by{" "}
              <a
                href="https://twitter.com/haidan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-400 hover:text-rose-300 transition-colors duration-300 font-semibold hover:underline decoration-rose-400/30 underline-offset-4"
              >
                Haidan
              </a>
            </p>
          </div>

          {/* Copyright */}
          <p className="text-sm text-white/50 font-medium animate-fade-in">
            © {new Date().getFullYear()} Sprettza. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
