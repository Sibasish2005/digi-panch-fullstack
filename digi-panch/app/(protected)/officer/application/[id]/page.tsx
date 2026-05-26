'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { fetchAPI } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, FilePlus } from 'lucide-react';
import { ImageKitUploader } from '@/components/ImageKitUploader';
import { toast } from 'sonner';
import { Skeleton } from 'boneyard-js/react';

export default function ApplicationReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { getToken } = useAuth();
  const unwrappedParams = use(params);
  const applicationId = unwrappedParams.id;
  
  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [issuedDocUrl, setIssuedDocUrl] = useState('');

  const loadApplication = async () => {
    try {
      const token = await getToken();
      // Use the general applications endpoint which is role-aware (officers can view any)
      const data = await fetchAPI(`/applications/${applicationId}`, { token });
      setAppData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplication();
  }, [applicationId, getToken]);

  const handleAction = async (action: 'approve' | 'reject' | 'issue-document') => {
    if (action === 'reject' && !remarks) {
      toast.error("Please provide remarks for rejection.");
      return;
    }
    
    setActionLoading(true);
    try {
      const token = await getToken();
      
      const bodyPayload: any = { remarks };
      if (action === 'issue-document') {
        bodyPayload.file_url = issuedDocUrl;
      }

      await fetchAPI(`/officer/applications/${applicationId}/${action}`, {
        method: 'POST',
        token,
        body: JSON.stringify(bodyPayload)
      });
      
      if (action === 'reject' || action === 'issue-document') {
        router.push('/officer');
        router.refresh();
        toast.success(`Application successfully ${action === 'reject' ? 'rejected' : 'completed'}!`);
      } else {
        await loadApplication(); // reload data to show new status
        toast.success(`Application successfully ${action}d!`);
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${action} application.`);
    } finally {
      setActionLoading(false);
    }
  };

  if (!appData && !loading) return <div>Application not found.</div>;

  return (
    <Skeleton name="officer-application-review" loading={loading}>
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Review Application</h1>
        <Badge variant="outline" className="text-lg py-1 px-3 bg-white">
          {appData.status}
        </Badge>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Applicant Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Name:</strong> {appData.user?.name || 'Citizen'}</p>
            <p><strong>Application Number:</strong> {appData.application_number}</p>
            <p><strong>Document Type:</strong> {appData.document_type?.name}</p>
            <p><strong>Submitted On:</strong> {new Date(appData.created_at).toLocaleString()}</p>
            {appData.remarks && <p><strong>Citizen Remarks:</strong> {appData.remarks}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attached Proofs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {appData.proofs?.map((proof: any) => (
              <div key={proof.id} className="flex justify-between items-center p-3 border rounded-md">
                <span className="font-medium text-sm">{proof.file_type}</span>
                <Button variant="outline" size="sm" asChild>
                  <a href={proof.file_url} target="_blank" rel="noopener noreferrer">View File</a>
                </Button>
              </div>
            ))}
            {(!appData.proofs || appData.proofs.length === 0) && (
              <p className="text-muted-foreground text-sm">No proofs attached.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Officer Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Remarks</label>
            <Input 
              value={remarks} 
              onChange={(e) => setRemarks(e.target.value)} 
              placeholder="Add remarks before approving/rejecting..."
              disabled={appData.status === 'DOCUMENT_ISSUED'}
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          {appData.status === 'SUBMITTED' && (
            <>
              <Button onClick={() => handleAction('approve')} disabled={actionLoading} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" /> Approve
              </Button>
              <Button onClick={() => handleAction('reject')} disabled={actionLoading} variant="destructive">
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
            </>
          )}
          {appData.status === 'PENDING_PAYMENT' && (
            <p className="text-sm text-yellow-600 font-medium">Waiting for citizen payment.</p>
          )}
          {appData.status === 'APPROVED' && ( // Assuming APPROVED means fee is paid or no fee
            <div className="w-full space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Approved Document (PDF/Image)</label>
                {issuedDocUrl ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md border border-green-200">
                    ✓ Uploaded successfully
                    <Button variant="link" size="sm" onClick={() => setIssuedDocUrl('')}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <ImageKitUploader onUploadSuccess={(url) => setIssuedDocUrl(url)} />
                )}
              </div>
              <Button onClick={() => handleAction('issue-document')} disabled={actionLoading || !issuedDocUrl} className="bg-blue-600 hover:bg-blue-700">
                <FilePlus className="mr-2 h-4 w-4" /> Issue Document
              </Button>
            </div>
          )}
          {appData.status === 'DOCUMENT_ISSUED' && (
             <p className="text-sm text-green-600 font-medium">Document generated and issued successfully.</p>
          )}
        </CardFooter>
      </Card>
    </div>
    </Skeleton>
  );
}
