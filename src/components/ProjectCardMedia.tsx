import { FolderKanban, ShoppingBag, Sparkles } from "lucide-react";

type ProjectCardMediaProps = {
  imageUrl?: string | null;
  title: string;
};

export function ProjectCardMedia({ imageUrl, title }: ProjectCardMediaProps) {
  if (imageUrl) {
    return <img src={imageUrl} alt={title} className="h-56 w-full object-cover" />;
  }

  return (
    <div className="relative flex h-56 items-center justify-center overflow-hidden bg-surface">
      <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute left-6 top-6 rounded-full border border-border bg-background/80 p-3 shadow-sm">
        <ShoppingBag className="h-6 w-6 text-primary" />
      </div>
      <div className="absolute bottom-6 right-6 rounded-full border border-border bg-background/80 p-3 shadow-sm">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
        <FolderKanban className="h-14 w-14 text-primary" />
      </div>
    </div>
  );
}
