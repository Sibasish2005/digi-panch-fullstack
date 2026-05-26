'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { fetchAPI } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function GrievanceReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { getToken } = useAuth();
  const unwrappedParams = use(params);
  const grievanceId = unwrappedParams.id;

  const [grievance, setGrievance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const loadGrievance = async () => {
    try {
      const token = await getToken();
      const data = await fetchAPI(`/grievances/${grievanceId}`, { token });
      setGrievance(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load grievance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrievance();
  }, [grievanceId, getToken]);

  const handleAction = async (action: 'RESOLVED' | 'REJECTED') => {
    if (!resolutionNotes.trim()) {
      toast.error("Please provide resolution notes before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      await fetchAPI(`/grievances/${grievanceId}/resolve`, {
        method: 'POST',
        token,
        body: JSON.stringify({
          status: action,
          resolution_notes: resolutionNotes
        })
      });
      
      toast.success(`Grievance marked as ${action.toLowerCase()}`);
      router.push('/officer/grievances');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to update grievance status.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-gray-500" /></div>;
  }

  if (!grievance) {
    return <div>Grievance not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/officer/grievances" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Queue
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Review Grievance: {grievance.ticket_number}</h1>
        <Badge variant="outline" className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800">
          {grievance.status}
        </Badge>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grievance Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p>{grievance.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted On</p>
                <p>{new Date(grievance.created_at).toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Subject</p>
                <p className="font-semibold">{grievance.subject}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <div className="mt-2 p-4 bg-muted/50 rounded-md whitespace-pre-wrap text-sm border border-border">
                  {grievance.description}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {grievance.status === 'OPEN' || grievance.status === 'IN_PROGRESS' ? (
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-4">
              <CardTitle className="text-blue-800">Officer Action</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Resolution Notes / Remarks <span className="text-red-500">*</span></label>
                <Textarea 
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail the steps taken to resolve this issue or reasons for rejection..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-blue-100 pt-6">
              <Button 
                onClick={() => handleAction('RESOLVED')}
                disabled={submitting}
                className="w-full sm:w-auto min-w-[200px] gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4" />
                Resolve Grievance
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Resolution Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolution Notes</p>
                <div className="mt-2 p-4 bg-muted/50 rounded-md whitespace-pre-wrap text-sm border border-border">
                  {grievance.resolution_notes || "No notes provided."}
                </div>
              </div>
              {grievance.resolved_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved On</p>
                  <p>{new Date(grievance.resolved_at).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
