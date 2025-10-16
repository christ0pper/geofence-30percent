import { cn } from "@/lib/utils";

interface MemberCardProps {
  name: string;
  role: string;
  avatar: string;
  hasNotification?: boolean;
  notificationCount?: number;
  className?: string;
}

export function MemberCard({ 
  name, 
  role, 
  avatar, 
  hasNotification = false,
  notificationCount,
  className 
}: MemberCardProps) {
  return (
    <div className={cn(
      "w-full h-[66px] bg-white border-b border-border flex items-center gap-3 px-4",
      className
    )}>
      <div className="w-[52px] h-[52px] rounded-full overflow-hidden flex-shrink-0 bg-tag-blue-bg">
        <img 
          src={avatar} 
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-foreground leading-[18px] tracking-[0.16px]">
          {name}
        </h3>
        <p className="text-xs text-[#1E1E1E] font-normal leading-[18px] tracking-[0.16px]">
          {role}
        </p>
      </div>
      {hasNotification && notificationCount && (
        <div className="w-4 h-[18px] flex items-center justify-center">
          <span className="text-sm font-semibold text-white leading-[18px] tracking-[0.16px]">
            {notificationCount}
          </span>
        </div>
      )}
    </div>
  );
}
