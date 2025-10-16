import { PageLayout } from "@/components/PageLayout";
import { MessageCircle } from "lucide-react";

export default function Messages() {
  return (
    <PageLayout title="Messages">
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8">
        <div className="w-20 h-20 rounded-full bg-interactive/10 flex items-center justify-center mb-6">
          <MessageCircle className="w-10 h-10 text-interactive" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Members</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Your family members whom you have interacted with will appear here
        </p>
      </div>
    </PageLayout>
  );
}
