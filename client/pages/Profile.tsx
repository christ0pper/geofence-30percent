import { PageLayout } from "@/components/PageLayout";
import { User } from "lucide-react";

export default function Profile() {
  return (
    <PageLayout title="Profile">
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8">
        <div className="w-20 h-20 rounded-full bg-interactive/10 flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-interactive" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Profile</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          View and manage your profile information and settings. 
          Continue prompting to add content to this page.
        </p>
      </div>
    </PageLayout>
  );
}
