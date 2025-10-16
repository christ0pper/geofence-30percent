import { Bell, Settings, MapPin, Activity, Calendar as CalendarIcon, RotateCcw, Check } from "lucide-react";
import { StatusCard } from "@/components/StatusCard";
import { EventCard } from "@/components/EventCard";
import { MemberCard } from "@/components/MemberCard";
import { BottomNav } from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-[108px]">
      {/* Header */}
      <header className="bg-background border-b border-border px-4 sm:px-6 py-3.5">
        <div className="max-w-screen-sm mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground tracking-[0.16px]">
                Hello,
              </p>
              <h1 className="text-2xl font-bold text-interactive tracking-[0.16px] leading-[31px]">
                Mr. Augustine
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="w-8 h-8 rounded-md bg-interactive flex items-center justify-center hover:bg-interactive/90 transition-colors"
                onClick={() => navigate("/gps")}
              >
                <MapPin className="w-4 h-4 text-white" fill="white" />
              </button>
              <button className="relative w-8 h-8 rounded-md bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
                <Bell className="w-4 h-4 text-interactive" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-interactive rounded-full" />
              </button>
              <button className="w-8 h-8 rounded-md bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-sm mx-auto">
        {/* Overview Section */}
        <section className="px-4 sm:px-6 pt-6 pb-5">
          <h2 className="text-sm font-medium text-muted-foreground tracking-[0.16px] mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <StatusCard
              title="Status"
              icon={RotateCcw}
              iconBgColor="bg-status-error"
            />
            <StatusCard
              title="GPS"
              icon={MapPin}
              iconBgColor="bg-status-warning"
              onClick={() => navigate("/gps")}
            />
            <StatusCard
              title="Schedule"
              icon={CalendarIcon}
              iconBgColor="bg-status-success"
            />
          </div>
        </section>

        {/* Events Section */}
        <section className="px-4 sm:px-6 pt-1 pb-5">
          <h2 className="text-sm font-medium text-muted-foreground tracking-[0.16px] mb-3.5">
            Events
          </h2>
          <div className="space-y-4">
            <EventCard
              type="medication"
              title="Rivastigmine"
              dosage="150Mg, 1 Capsule"
              icon="💊"
              tags={[
                { label: "Before Breakfast", variant: "green" },
                { label: "Before Dinner", variant: "magenta" },
              ]}
            />
            <EventCard
              type="appointment"
              title="Hospital"
              time="9:30am"
              description="Appointment with Dr Thomas Kurien at Aster"
              icon={CalendarIcon}
              iconBgColor="bg-interactive"
            />
          </div>
          <div className="flex justify-center mt-6">
            <button className="text-sm font-normal text-card-dark tracking-[0.16px] leading-[18px] px-3 py-1 hover:bg-muted/50 rounded-md transition-colors">
              View All
            </button>
          </div>
        </section>

        {/* Members Section */}
        <section className="pt-1">
          <h2 className="text-sm font-medium text-muted-foreground tracking-[0.16px] mb-3.5 px-4 sm:px-6">
            Members
          </h2>
          <div className="sm:px-4">
            <MemberCard
              name="Dr. Andrew Lucas"
              role="Your doctor"
              avatar="https://api.builder.io/api/v1/image/assets/TEMP/f41799bb5f22d9b9e33b31ca4441ddab978270f5?width=104"
              hasNotification
              notificationCount={3}
            />
            <MemberCard
              name="Marcus"
              role="Your son, who took you to hospital yesterday"
              avatar="https://api.builder.io/api/v1/image/assets/TEMP/aa9bdfc8c9f5612fc88e426943579a0577807b4a?width=104"
            />
            <MemberCard
              name="Natasha"
              role="Your wife, she take cares of you"
              avatar="https://api.builder.io/api/v1/image/assets/TEMP/626ccfcecae2407580683634098e1eb0ab285bf3?width=104"
            />
          </div>
          <div className="flex justify-center mt-5 pb-6">
            <button className="text-sm font-normal text-card-dark tracking-[0.16px] leading-[18px] px-3 py-1 hover:bg-muted/50 rounded-md transition-colors">
              View All
            </button>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}