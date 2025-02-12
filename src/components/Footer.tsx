
export const Footer = () => {
  return (
    <footer className="relative mt-auto py-12">
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
      <div className="relative container mx-auto">
        <div className="flex items-center justify-center">
          <div className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-black/30 via-black/20 to-black/30 backdrop-blur-sm border border-white/10 hover:border-rose-500/20 transition-all duration-500 hover:shadow-[0_0_2rem_-0.5rem_#ff6b6b]">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/5 to-rose-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <p className="relative text-[15px] text-white/80 font-medium transition-all duration-300 text-center group-hover:text-white">
              Made with{" "}
              <span className="inline-block animate-pulse text-rose-500 group-hover:scale-110 transition-all duration-300">
                ♥️
              </span>{" "}
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
        </div>
      </div>
    </footer>
  );
};
