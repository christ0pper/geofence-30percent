import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StatusCardProps {
  title: string;
  icon: LucideIcon;
  iconBgColor: string;
  className?: string;
  onClick?: () => void;
}

export function StatusCard({ title, icon: Icon, iconBgColor, className, onClick }: StatusCardProps) {
  return (
    <div 
      className={cn("w-full aspect-[96/116] max-w-[96px] rounded-xl shadow-lg cursor-pointer", className)}
      onClick={onClick}
    >
      <div className="w-full h-full rounded-xl bg-card-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.166]">
          <div className="absolute top-2 left-1 right-1 bottom-5 bg-muted/50" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-between h-full px-3.5 py-3">
          <div className={cn("w-[58px] h-[58px] rounded-md flex items-center justify-center", iconBgColor)}>
            <Icon className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <span className="text-white text-xs font-semibold text-center leading-4">
            {title}
          </span>
        </div>
      </div>
    </div>
  );
}