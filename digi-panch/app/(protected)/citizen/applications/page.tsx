'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchAPI } from '@/lib/api-client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RazorpayCheckout } from '@/components/RazorpayCheckout';
import { Loader2 } from 'lucide-react';
import { Skeleton } from 'boneyard-js/react';

export default function ApplicationsTrackingPage() {
  const { getToken } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    try {
      const token = await getToken();
      // Assuming GET /applications returns the citizen's applications
      const data = await fetchAPI('/applications', { token });
      setApplications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [getToken]);

  const getStatusColor = (status: string) => {
    switch(status.toUpperCase()) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING_PAYMENT': return 'bg-yellow-100 text-yellow-800';
      case 'DOCUMENT_ISSUED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Skeleton name="citizen-applications" loading={loading}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
        
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>App ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted On</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No applications found.
                  </TableCell>
                </TableRow>
              )}
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.application_number || app.id.split('-')[0]}</TableCell>
                  <TableCell>{app.document_type?.name || 'Document'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(app.status)} variant="outline">
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(app.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {app.status === 'PENDING_PAYMENT' && (
                      <RazorpayCheckout 
                        applicationId={app.id} 
                        amount={app.document_type?.fee_amount || 100} 
                        onSuccess={loadApplications} 
                      />
                    )}
                    {app.status === 'DOCUMENT_ISSUED' && app.final_document?.pdf_url && (
                      <Button variant="outline" asChild>
                        <a href={app.final_document.pdf_url} target="_blank" rel="noopener noreferrer">
                          Download PDF
                        </a>
                      </Button>
                    )}
                    {app.status !== 'PENDING_PAYMENT' && app.status !== 'DOCUMENT_ISSUED' && (
                      <span className="text-sm text-gray-500">Under Review</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Skeleton>
  );
}
