import { PageLayout } from "@/components/PageLayout";
import { Calendar } from "lucide-react";

export default function Reminders() {
  return (
    <PageLayout title="Reminders">
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8">
        <div className="w-20 h-20 rounded-full bg-interactive/10 flex items-center justify-center mb-6">
          <Calendar className="w-10 h-10 text-interactive" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Reminders</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          This page will show your medication reminders and scheduled appointments. 
          Continue prompting to add content here.
        </p>
      </div>
    </PageLayout>
  );
}
