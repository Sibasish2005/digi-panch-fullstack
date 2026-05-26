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
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from 'boneyard-js/react';

export default function OfficerQueuePage() {
  const { getToken } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      try {
        const token = await getToken();
        // Fetch only SUBMITTED (pending) tasks for officers
        const data = await fetchAPI('/officer/applications?status=SUBMITTED', { token });
        setApplications(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
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
    <Skeleton name="officer-dashboard" loading={loading}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Pending Application Queue</h1>
        
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>App ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted On</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No applications in queue.
                  </TableCell>
                </TableRow>
              )}
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.application_number || app.id.split('-')[0]}</TableCell>
                  <TableCell>{app.document_type?.name || 'Document'}</TableCell>
                  <TableCell>{app.user?.name || 'Citizen'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(app.status)} variant="outline">
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(app.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/officer/application/${app.id}`}>
                      <Button variant="outline" size="sm">Review</Button>
                    </Link>
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
