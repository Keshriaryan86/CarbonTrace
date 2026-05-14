import { ActivityLogger } from "@/components/activity/activity-logger";

export default function LogActivityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Log a New Activity</h1>
        <p className="text-muted-foreground">
          Describe an activity and let our AI help you categorize and quantify it.
        </p>
      </div>
      
      <ActivityLogger />

    </div>
  );
}
