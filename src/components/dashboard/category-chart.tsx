'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { CarbonActivity } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

const chartConfig = {
  co2: {
    label: 'CO₂ (kg)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function CategoryChart() {
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

  const chartData = useMemo(() => {
    if (!activities || activities.length === 0 || !mounted) return [];
    
    const categoryData: { [key: string]: number } = {};
    
    activities.forEach(activity => {
        const categoryName = activity.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        if (!categoryData[categoryName]) {
            categoryData[categoryName] = 0;
        }
        categoryData[categoryName] += activity.co2e;
    });

    return Object.entries(categoryData)
        .map(([category, co2]) => ({
            category,
            co2: parseFloat(co2.toFixed(2))
        }))
        .sort((a, b) => b.co2 - a.co2);
  }, [activities, mounted]);

  if (isLoading || !mounted) {
      return <Skeleton className="h-[250px] w-full" />
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-center text-muted-foreground p-4">
        Log an activity to see your emission breakdown by category.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <BarChart 
        accessibilityLayer 
        data={chartData}
        layout="vertical"
        margin={{ left: 10, right: 20 }}
      >
        <YAxis
          dataKey="category"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={100}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <XAxis 
          dataKey="co2"
          type="number"
          hide
        />
        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
        <Bar dataKey="co2" layout="vertical" radius={5} fill="hsl(var(--primary))" />
      </BarChart>
    </ChartContainer>
  );
}
