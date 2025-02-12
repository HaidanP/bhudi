
interface GeneratedResultProps {
  imageUrl: string;
}

export const GeneratedResult = ({ imageUrl }: GeneratedResultProps) => {
  return (
    <div className="w-full flex-1">
      <h3 className="text-base font-medium text-gray-300 mb-3">Generated Result</h3>
      <div className="bg-black/80 rounded-xl overflow-hidden shadow-lg border border-white/10 flex items-center justify-center">
        <img 
          src={imageUrl} 
          alt="Generated" 
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};
