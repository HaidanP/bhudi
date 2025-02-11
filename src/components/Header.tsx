
export const Header = () => {
  return (
    <header className="text-center space-y-4">
      <h1 className="text-4xl font-semibold tracking-tight">
        AI Clothing Editor
      </h1>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Upload an image, mask the area you want to modify, and describe the changes you want to make.
      </p>
    </header>
  );
};
