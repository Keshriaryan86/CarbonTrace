import { StatsCards } from "@/components/dashboard/stats-cards";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          An overview of your carbon footprint and recent activities.
        </p>
      </div>
      
      <StatsCards />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Footprint Overview</CardTitle>
            <CardDescription>Your daily carbon emissions for the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Emission by Category</CardTitle>
             <CardDescription>A breakdown of your emissions by category.</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryChart />
          </CardContent>
        </Card>
      </div>

      <RecentActivities />
    </div>
  );
}
