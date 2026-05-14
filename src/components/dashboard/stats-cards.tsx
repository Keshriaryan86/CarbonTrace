'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footprints, GitBranch, TrendingUp } from "lucide-react";
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import type { CarbonActivity } from '@/lib/types';
import { startOfWeek, subWeeks } from 'date-fns';
import { useMemo, useState, useEffect } from "react";
import { Skeleton } from "../ui/skeleton";

const icons = {
  footprints: <Footprints className="h-4 w-4 text-muted-foreground" />,
  trending: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
  commits: <GitBranch className="h-4 w-4 text-muted-foreground" />,
};

export function StatsCards() {
  const { firestore, user } = useFirebase();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activitiesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'carbonActivities');
  }, [firestore, user]);

  const { data: activities, isLoading } = useCollection<CarbonActivity>(activitiesQuery);

  const stats = useMemo(() => {
    if (!activities || !mounted) {
      return {
        cumulativeFootprint: 0,
        blockchainCommits: 0,
        weeklyChange: 0,
      };
    }

    const cumulativeFootprint = activities.reduce((acc, activity) => acc + activity.co2e, 0);
    const blockchainCommits = activities.filter(activity => activity.status === 'Committed').length;

    const now = new Date();
    const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 });
    const startOfLastWeek = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    const thisWeekActivities = activities.filter(act => {
      const activityDate = act.activityDate instanceof Timestamp ? act.activityDate.toDate() : act.activityDate;
      return activityDate >= startOfThisWeek;
    });

    const lastWeekActivities = activities.filter(act => {
      const activityDate = act.activityDate instanceof Timestamp ? act.activityDate.toDate() : act.activityDate;
      return activityDate >= startOfLastWeek && activityDate < startOfThisWeek;
    });

    const thisWeekEmissions = thisWeekActivities.reduce((acc, act) => acc + act.co2e, 0);
    const lastWeekEmissions = lastWeekActivities.reduce((acc, act) => acc + act.co2e, 0);

    let weeklyChange = 0;
    if (lastWeekEmissions > 0) {
      weeklyChange = ((thisWeekEmissions - lastWeekEmissions) / lastWeekEmissions) * 100;
    } else if (thisWeekEmissions > 0 && lastWeekEmissions === 0) {
      weeklyChange = 100;
    }

    return {
      cumulativeFootprint,
      blockchainCommits,
      weeklyChange,
    };
  }, [activities, mounted]);

  if (isLoading || !mounted) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-7 w-24" />
                        <Skeleton className="h-3 w-48 mt-2" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumulative Footprint</CardTitle>
            {icons.footprints}
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{stats.cumulativeFootprint.toFixed(2)} kg CO₂e</div>
            <p className="text-xs text-muted-foreground">
                Your total emissions since tracking started
            </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Change</CardTitle>
            {icons.trending}
            </CardHeader>
            <CardContent>
            <div className={`text-2xl font-bold ${stats.weeklyChange > 0 ? 'text-destructive' : 'text-primary'}`}>
                {stats.weeklyChange >= 0 ? '+' : ''}{stats.weeklyChange.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
                Compared to the previous 7 days
            </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockchain Commits</CardTitle>
            {icons.commits}
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">+{stats.blockchainCommits}</div>
            <p className="text-xs text-muted-foreground">
                Total immutable records created
            </p>
            </CardContent>
        </Card>
    </div>
  );
}
