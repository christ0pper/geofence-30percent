import { Home, Calendar, Activity, MessageCircle, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/reminders", label: "Reminders", icon: Calendar },
  { path: "/progress", label: "Progress", icon: Activity },
  { path: "/messages", label: "Members", icon: MessageCircle },
  { path: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="max-w-screen-sm mx-auto">
        <div className="flex items-center justify-around h-[74px] px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-[75px] h-full relative transition-colors",
                  isActive && "bg-white rounded-t-3xl"
                )}
              >
                {isActive && (
                  <div className="absolute top-2 w-14 h-10 bg-interactive rounded-3xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                )}
                {!isActive && (
                  <Icon className="w-6 h-6 text-foreground/25" strokeWidth={2} />
                )}
                <span 
                  className={cn(
                    "text-xs font-semibold leading-3",
                    isActive ? "text-foreground mt-7" : "text-foreground/25"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      {/* iOS Home Indicator */}
      <div className="h-[34px] bg-background flex items-start justify-center pt-[21px] pb-2 rounded-b-[44px]">
        <div className="w-36 h-1 bg-[#090A0A] rounded-full" />
      </div>
    </nav>
  );
}
