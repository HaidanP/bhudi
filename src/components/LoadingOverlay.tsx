
interface LoadingOverlayProps {
  isVisible: boolean;
}

export const LoadingOverlay = ({ isVisible }: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 text-white text-center space-y-4">
        <div className="animate-spin w-12 h-12 border-4 border-rose-800/30 border-t-rose-800 rounded-full mx-auto" />
        <p className="text-lg font-medium">Processing your image...</p>
      </div>
    </div>
  );
};
