import { cn } from "@/lib/utils";
import { LucideIcon, MoreVertical } from "lucide-react";
import { Tag } from "./Tag";

interface MedicationCardProps {
  type: "medication";
  title: string;
  dosage: string;
  tags: { label: string; variant: "green" | "magenta" | "blue" }[];
  icon: string;
}

interface AppointmentCardProps {
  type: "appointment";
  title: string;
  time: string;
  description: string;
  icon: LucideIcon;
  iconBgColor: string;
}

type EventCardProps = MedicationCardProps | AppointmentCardProps;

export function EventCard(props: EventCardProps) {
  if (props.type === "medication") {
    return (
      <div className="w-full h-[110px] rounded-xl bg-white shadow-sm relative">
        <div className="flex items-start gap-3 p-3">
          <div className="w-[68px] h-[68px] rounded-full bg-[#E8F4FD] flex items-center justify-center flex-shrink-0">
            <div className="text-4xl">{props.icon}</div>
          </div>
          <div className="flex-1 pt-0.5">
            <h3 className="text-sm font-bold text-foreground leading-[18px] tracking-[0.16px]">
              {props.title}
            </h3>
            <p className="text-xs text-text-placeholder font-normal leading-4 tracking-[0.16px] mt-0.5">
              {props.dosage}
            </p>
            <div className="flex gap-2 mt-3.5">
              {props.tags.map((tag, index) => (
                <Tag key={index} label={tag.label} variant={tag.variant} />
              ))}
            </div>
          </div>
          <button className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <MoreVertical className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[104px] rounded-xl relative overflow-hidden shadow-md">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50" />
      <div className="relative z-10 flex items-center gap-4 p-4">
        <div className={cn(
          "w-[68px] h-[68px] rounded-full flex items-center justify-center flex-shrink-0",
          props.iconBgColor
        )}>
          <props.icon className="w-9 h-9 text-white" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-semibold text-foreground leading-[18px] tracking-[0.16px]">
              {props.title}
            </h3>
            <span className="text-sm font-semibold text-foreground leading-[18px] tracking-[0.16px]">
              {props.time}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-normal leading-[18px] tracking-[0.16px] mt-2 pr-4">
            {props.description}
          </p>
        </div>
      </div>
    </div>
  );
}
