'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GitBranch, Loader2, MoreHorizontal, Copy, Leaf } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirebase, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, Timestamp, serverTimestamp } from 'firebase/firestore';
import type { CarbonActivity } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { commitActivityToBlockchain } from '@/lib/blockchain-service';

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
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function HistoryTable() {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const [committingId, setCommittingId] = useState<string | null>(null);
    const [activityToView, setActivityToView] = useState<CarbonActivity | null>(null);

    const activitiesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
          collection(firestore, 'users', user.uid, 'carbonActivities'),
          orderBy('createdAt', 'desc')
        );
      }, [firestore, user]);
    
    const { data: activities, isLoading } = useCollection<CarbonActivity>(activitiesQuery);

    const handleCommit = async (activityId: string) => {
        if (!user || !firestore) return;
        setCommittingId(activityId);
        
        try {
            // 1. Simulate blockchain transaction using the service
            const txHash = await commitActivityToBlockchain(activityId);
            
            // 2. Create the commitment record in Firestore (following backend.json schema)
            const commitmentRef = collection(firestore, 'users', user.uid, 'blockchainCommitments');
            await addDocumentNonBlocking(commitmentRef, {
                userId: user.uid,
                carbonActivityId: activityId, // Link to the specific activity
                committedHash: txHash,
                transactionId: txHash,
                blockNumber: Math.floor(Math.random() * 1000000),
                committedAt: serverTimestamp(),
                status: 'confirmed',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // 3. Update the activity status
            const activityRef = doc(firestore, 'users', user.uid, 'carbonActivities', activityId);
            updateDocumentNonBlocking(activityRef, { 
                status: 'Committed', 
                txHash: txHash 
            });
            
            toast({
                title: '🎉 Commit Successful!',
                description: `Activity recorded on the blockchain with hash: ${txHash.slice(0, 10)}...`,
            });
        } catch (error: any) {
            console.error('Commit error:', error);
            toast({
                variant: 'destructive',
                title: 'Commit Failed',
                description: 'Could not connect to the blockchain provider or database.',
            });
        } finally {
            setCommittingId(null);
        }
    };

    const copyTxHash = (txHash: string) => {
        navigator.clipboard.writeText(txHash);
        toast({ title: 'Copied!', description: 'Transaction hash copied to clipboard.' });
    };

  return (
    <>
        <Card>
        <CardContent className="p-0">
            {isLoading && (
                <div className="space-y-px bg-muted">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-4 bg-background">
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-8 rounded-full" />
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
                    <TableHead className="hidden md:table-cell">CO₂e (kg)</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>Status / Tx Hash</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {activities.map((activity) => (
                    <TableRow key={activity.id}>
                        <TableCell>
                        <div className="font-medium">{activity.activityName}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                            {activity.rawInput}
                        </div>
                        </TableCell>
                        <TableCell>
                        <Badge variant="outline" className={categoryColors[activity.category] || ''}>
                            {activity.category.replace(/_/g, ' ')}
                        </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-right">{activity.co2e.toFixed(2)}</TableCell>
                        <TableCell className="hidden md:table-cell">{formatDate(activity.activityDate)}</TableCell>
                        <TableCell>
                            {activity.status === 'Pending' && committingId !== activity.id && (
                                <Button variant="outline" size="sm" onClick={() => handleCommit(activity.id)}>
                                    <GitBranch className="mr-2 h-3 w-3" />
                                    Commit
                                </Button>
                            )}
                            {committingId === activity.id && (
                                <Button variant="outline" size="sm" disabled>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Committing...
                                </Button>
                            )}
                            {activity.status === 'Committed' && activity.txHash && (
                                <div className="flex items-center gap-2 group">
                                    <Badge variant="secondary" className="font-code text-primary border-primary/50">
                                        {activity.txHash.slice(0, 8)}...{activity.txHash.slice(-6)}
                                    </Badge>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => copyTxHash(activity.txHash)}>
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                        </TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => setActivityToView(activity)}>
                                    View Details
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            )}

            {!isLoading && (!activities || activities.length === 0) && (
                <div className="flex flex-col items-center justify-center h-96 space-y-4 border-t text-center p-4">
                    <Leaf className="h-16 w-16 text-muted-foreground/30" />
                    <h3 className="font-headline text-xl font-semibold">Your History is Empty</h3>
                    <p className="text-muted-foreground max-w-sm">
                        Start by logging your first activity to see it appear here.
                    </p>
                    <Button asChild>
                        <Link href="/dashboard/log">Log Your First Activity</Link>
                    </Button>
                </div>
            )}
        </CardContent>
        </Card>

        {/* View Details Dialog */}
        <Dialog open={!!activityToView} onOpenChange={(open) => { if (!open) setActivityToView(null); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{activityToView?.activityName}</DialogTitle>
                    <DialogDescription>
                        Logged on {activityToView && formatDate(activityToView.activityDate)}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label className="text-muted-foreground">Original Description</Label>
                        <p className="text-sm">{activityToView?.rawInput}</p>
                    </div>
                    <div>
                        <Label className="text-muted-foreground">Category</Label>
                        <p className="text-sm capitalize">{activityToView?.category.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                        <Label className="text-muted-foreground">CO₂e</Label>
                        <p className="text-sm font-bold">{activityToView?.co2e.toFixed(2)} kg</p>
                    </div>
                    <div>
                        <Label className="text-muted-foreground">Extracted Details</Label>
                        <pre className="mt-1 text-xs bg-muted p-3 rounded-md overflow-x-auto">
                            <code>{JSON.stringify(activityToView?.details, null, 2)}</code>
                        </pre>
                    </div>
                    {activityToView?.status === 'Committed' && (
                        <div>
                            <Label className="text-muted-foreground">Blockchain Transaction</Label>
                            <p className="text-xs font-code break-all">{activityToView?.txHash}</p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setActivityToView(null)}>
                    Close
                </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}