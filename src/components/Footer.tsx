
export const Footer = () => {
  return (
    <footer className="relative mt-auto py-8">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent pointer-events-none" />
      <div className="relative container mx-auto">
        <p className="text-[15px] text-white/60 font-medium transition-all duration-300 hover:text-white/90 text-center backdrop-blur-sm py-2 rounded-full">
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
    </footer>
  );
};
