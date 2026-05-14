'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { analyzeActivity, validateApiKey, type AnalyzedActivity } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Bot, CheckCircle2, Footprints, Loader2, Sparkles, XCircle } from 'lucide-react';
import { useFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

const activitySchema = z.object({
  description: z.string().min(10, 'Please provide a more detailed description.'),
});

type ActivityFormData = z.infer<typeof activitySchema>;

export function ActivityLogger() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [apiStatus, setApiStatus] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({ status: 'idle', message: '' });
  const [aiResult, setAiResult] = useState<AnalyzedActivity | null>(null);
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      description: '',
    },
  });

  const checkConnection = async () => {
    setIsValidating(true);
    const result = await validateApiKey();
    setApiStatus({
      status: result.success ? 'success' : 'error',
      message: result.message
    });
    setIsValidating(false);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleAnalyze = async () => {
    const description = form.getValues('description');
    if (!description || description.length < 10) {
      form.setError('description', {
        type: 'manual',
        message: 'Please enter at least 10 characters to analyze.',
      });
      return;
    }

    setIsAnalyzing(true);
    setAiResult(null);

    try {
      const result = await analyzeActivity({ activityDescription: description });
      
      if (result.success && result.data) {
        setAiResult(result.data);
        toast({
          title: 'Analysis Complete',
          description: `Carbon footprint calculated: ${result.data.co2e} kg CO₂e`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: result.success === false ? result.error : 'An unknown error occurred.',
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Unexpected Error',
        description: 'Failed to communicate with the analysis service.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit = (data: ActivityFormData) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Not Signed In',
        description: 'You must be signed in to log activities.',
      });
      return;
    }

    if (!aiResult) {
      toast({
        variant: 'destructive',
        title: 'No AI Result',
        description: 'Please analyze the activity first.',
      });
      return;
    }

    const activityData = {
      userId: user.uid,
      activityName: aiResult.activityName,
      category: aiResult.category,
      details: {
        itemName: aiResult.itemName,
        quantity: aiResult.quantity,
        unit: aiResult.unit,
      },
      rawInput: data.description,
      activityDate: new Date(),
      createdAt: serverTimestamp(),
      status: 'Pending',
      co2e: aiResult.co2e,
    };

    const activitiesRef = collection(firestore, 'users', user.uid, 'carbonActivities');
    addDocumentNonBlocking(activitiesRef, activityData);

    toast({
      title: 'Activity Logged!',
      description: `"${aiResult.activityName}" has been added to your history.`,
    });

    form.reset({ description: '' });
    setAiResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Label className="text-sm font-medium text-muted-foreground">AI Service Status:</Label>
          {isValidating ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Checking...
            </div>
          ) : (
            <Badge 
              variant={apiStatus.status === 'success' ? 'default' : apiStatus.status === 'error' ? 'destructive' : 'outline'}
              className="flex items-center gap-1 cursor-help"
              title={apiStatus.message}
              onClick={checkConnection}
            >
              {apiStatus.status === 'success' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {apiStatus.status === 'success' ? 'Online' : 'Offline / Error'}
            </Badge>
          )}
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">Describe Your Activity</CardTitle>
              <CardDescription>
                Write down what you did in plain English. For example, "I drove 15km to work in my petrol car".
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full gap-2">
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder="Describe your activity here..."
                      rows={6}
                      className="resize-none"
                      disabled={isAnalyzing}
                    />
                  )}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="button" onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
                {isAnalyzing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
              </Button>
            </CardFooter>
          </Card>

          <Card className={`lg:col-span-2 transition-all duration-500 ${aiResult || isAnalyzing ? 'opacity-100' : 'opacity-40 select-none grayscale'}`}>
            <CardHeader>
              <CardTitle className="font-headline">Structured Data & Footprint</CardTitle>
              <CardDescription>
                Review the data and calculated footprint.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground animate-pulse">AI is processing and calculating...</p>
                </div>
              )}
              {!isAnalyzing && aiResult && (
                <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                  <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-6 text-center border border-primary/20">
                    <span className="text-sm text-muted-foreground font-medium mb-1">Estimated Carbon Footprint</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold tracking-tight text-primary">{aiResult.co2e}</span>
                      <span className="text-xl font-medium text-muted-foreground">kg CO₂e</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                          <Label className="text-muted-foreground">Activity Name</Label>
                          <p className="font-bold text-lg">{aiResult.activityName}</p>
                      </div>
                       <div className="space-y-1">
                          <Label className="text-muted-foreground">Category</Label>
                          <p className="font-medium capitalize py-1 px-3 bg-primary/10 rounded-full w-fit">{aiResult.category.replace(/_/g, ' ')}</p>
                      </div>
                  </div>
                   <div className="pt-4 border-t">
                      <Label className="text-muted-foreground block mb-3">Extracted Metrics</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-muted rounded-lg">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Item</Label>
                          <p className="font-semibold capitalize text-sm">{aiResult.itemName}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Qty</Label>
                          <p className="font-semibold text-sm">{aiResult.quantity}</p>
                        </div>
                         <div className="p-3 bg-muted rounded-lg">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Unit</Label>
                          <p className="font-semibold text-sm">{aiResult.unit}</p>
                        </div>
                      </div>
                  </div>
                   {aiResult.reasoning && (
                     <div className="pt-4">
                        <Label className="text-muted-foreground">AI Reasoning</Label>
                        <p className="text-xs text-muted-foreground italic mt-2 p-3 bg-muted/50 rounded-md leading-relaxed">{aiResult.reasoning}</p>
                    </div>
                   )}
                </div>
              )}
              {!isAnalyzing && !aiResult && (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4 border-2 border-dashed rounded-lg bg-muted/20">
                      <Footprints className="h-10 w-10 text-muted-foreground/30" />
                      <p className="text-muted-foreground font-medium">Footprint calculation will appear here.</p>
                  </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={!aiResult || isAnalyzing} className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20">
                Log This Activity
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}