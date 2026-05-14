
'use client';

import { Line, LineChart, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import type { CarbonActivity } from '@/lib/types';
import { subDays, format, startOfDay, isAfter } from 'date-fns';
import { useMemo, useState, useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

const chartConfig = {
  co2: {
    label: 'CO₂ (kg)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;


export function OverviewChart() {
  const { firestore, user } = useFirebase();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sevenDaysAgo = useMemo(() => {
    if (!mounted) return null;
    return startOfDay(subDays(new Date(), 6));
  }, [mounted]);

  // Fetch full collection and filter client-side to avoid index requirements for prototypes
  const activitiesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'carbonActivities');
  }, [firestore, user]);

  const { data: activities, isLoading } = useCollection<CarbonActivity>(activitiesQuery);

  const chartData = useMemo(() => {
    if (!mounted) return [];
    
    const dailyData: { [key: string]: number } = {};
    for (let i = 0; i < 7; i++) {
        const d = subDays(new Date(), i);
        const formattedDate = format(d, 'yyyy-MM-dd');
        dailyData[formattedDate] = 0;
    }

    if (activities && sevenDaysAgo) {
        activities.forEach(activity => {
            const activityDate = activity.activityDate instanceof Timestamp ? activity.activityDate.toDate() : new Date(activity.activityDate);
            if (isAfter(activityDate, sevenDaysAgo)) {
              const formattedDate = format(activityDate, 'yyyy-MM-dd');
              if (dailyData.hasOwnProperty(formattedDate)) {
                  dailyData[formattedDate] += activity.co2e;
              }
            }
        });
    }

    return Object.entries(dailyData)
        .map(([date, co2]) => ({ date, co2: parseFloat(co2.toFixed(2)) }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [activities, mounted, sevenDaysAgo]);

  if (isLoading || !mounted) {
    return <Skeleton className="h-[250px] w-full" />
  }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 0,
        }}
      >
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
         <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}kg`}
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent 
            indicator="line"
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0 && payload[0].payload.date) {
                return new Date(payload[0].payload.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                });
              }
              return label;
            }}
          />}
        />
        <Line
          type="monotone"
          dataKey="co2"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ChartContainer>
  );
}
