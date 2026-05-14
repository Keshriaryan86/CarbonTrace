'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowUpRight, Leaf } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import type { CarbonActivity } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

const categoryColors: { [key: string]: string } = {
  transportation: 'bg-blue-500/20 text-blue-300 border-blue-400/50',
  food_consumption: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50',
  electricity_usage: 'bg-green-500/20 text-green-300 border-green-400/50',
  shopping_lifestyle: 'bg-purple-500/20 text-purple-300 border-purple-400/50',
};

function formatDate(date: Date | Timestamp) {
  if (date instanceof Timestamp) {
    return date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function RecentActivities() {
  const { firestore, user } = useFirebase();

  const activitiesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'carbonActivities'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [firestore, user]);

  const { data: activities, isLoading } = useCollection<CarbonActivity>(activitiesQuery);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
            <CardTitle className="font-headline">Recent Activities</CardTitle>
            <CardDescription>
                Here are the last activities you logged.
            </CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/dashboard/history">
                View All
                <ArrowUpRight className="h-4 w-4" />
            </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                ))}
            </div>
        )}

        {!isLoading && activities && activities.length > 0 && (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">CO₂e (kg)</TableHead>
                <TableHead>Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {activities.map((activity) => (
                <TableRow key={activity.id}>
                    <TableCell>
                    <div className="font-medium">{activity.activityName}</div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline" className={categoryColors[activity.category] || ''}>
                            {activity.category.replace(/_/g, ' ')}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">{activity.co2e.toFixed(2)}</TableCell>
                    <TableCell>{formatDate(activity.activityDate)}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        )}

        {!isLoading && (!activities || activities.length === 0) && (
            <div className="flex flex-col items-center justify-center h-48 space-y-4 border-2 border-dashed rounded-lg text-center p-4">
                <Leaf className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="font-headline text-lg font-semibold">No Activities Logged Yet</h3>
                <p className="text-sm text-muted-foreground">
                    Start by logging your first activity to see it appear here.
                </p>
                <Button asChild>
                    <Link href="/dashboard/log">Log an Activity</Link>
                </Button>
            </div>
        )}

      </CardContent>
    </Card>
  );
}
