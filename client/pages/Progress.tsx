import { PageLayout } from "@/components/PageLayout";
import { Activity } from "lucide-react";

export default function Progress() {
  return (
    <PageLayout title="Progress">
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8">
        <div className="w-20 h-20 rounded-full bg-interactive/10 flex items-center justify-center mb-6">
          <Activity className="w-10 h-10 text-interactive" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Progress</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Track your health progress and recovery metrics here. 
          Continue prompting to add content to this page.
        </p>
      </div>
    </PageLayout>
  );
}
