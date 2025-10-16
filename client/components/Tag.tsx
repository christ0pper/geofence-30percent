import { cn } from "@/lib/utils";

interface TagProps {
  label: string;
  variant?: "green" | "magenta" | "blue";
  className?: string;
}

export function Tag({ label, variant = "green", className }: TagProps) {
  const variantStyles = {
    green: "bg-tag-green-bg text-tag-green-text",
    magenta: "bg-tag-magenta-bg text-tag-magenta-text",
    blue: "bg-tag-blue-bg text-tag-blue-text",
  };

  return (
    <div className={cn(
      "inline-flex items-center rounded-full px-2 pb-0.5 h-6",
      variantStyles[variant],
      className
    )}>
      <span className="text-xs font-normal leading-4 tracking-[0.32px]">
        {label}
      </span>
    </div>
  );
}
