import { Bell, Settings, MapPin } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
}

export function PageLayout({ children, title, showHeader = true }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-[108px]">
      {showHeader && (
        <header className="bg-background border-b border-border px-4 py-3.5">
          <div className="max-w-screen-sm mx-auto">
            <div className="flex items-center justify-between">
              <div>
                {title ? (
                  <h1 className="text-2xl font-bold text-interactive tracking-[0.16px] leading-[31px]">
                    {title}
                  </h1>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-foreground tracking-[0.16px]">
                      Hello,
                    </p>
                    <h1 className="text-2xl font-bold text-interactive tracking-[0.16px] leading-[31px]">
                      Mr. Harrelson
                    </h1>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-md bg-interactive flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" fill="white" />
                </button>
                <button className="relative w-8 h-8 rounded-md bg-white flex items-center justify-center">
                  <Bell className="w-4 h-4 text-interactive" />
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-interactive rounded-full" />
                </button>
                <button className="w-8 h-8 rounded-md bg-white flex items-center justify-center">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="max-w-screen-sm mx-auto">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
