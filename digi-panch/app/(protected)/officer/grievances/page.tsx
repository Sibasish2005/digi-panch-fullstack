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

export default function OfficerGrievancesPage() {
  const { getToken } = useAuth();
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGrievances() {
      try {
        const token = await getToken();
        // Fetch all grievances for officers
        const data = await fetchAPI('/grievances', { token });
        // Filter out closed/resolved ones if you want, or show all
        setGrievances(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadGrievances();
  }, [getToken]);

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-gray-500" /></div>;
  }

  const getStatusColor = (status: string) => {
    switch(status.toUpperCase()) {
      case 'OPEN': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Sort grievances to show OPEN first
  const sortedGrievances = [...grievances].sort((a, b) => {
    if (a.status === 'OPEN' && b.status !== 'OPEN') return -1;
    if (a.status !== 'OPEN' && b.status === 'OPEN') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Grievance Queue</h1>
      
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket No.</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted On</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedGrievances.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No grievances found.
                </TableCell>
              </TableRow>
            )}
            {sortedGrievances.map((g) => (
              <TableRow key={g.id}>
                <TableCell className="font-medium">{g.ticket_number}</TableCell>
                <TableCell>{g.category}</TableCell>
                <TableCell className="max-w-xs truncate">{g.subject}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(g.status)} variant="outline">
                    {g.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(g.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/officer/grievances/${g.id}`}>
                    <Button variant={g.status === 'OPEN' ? "default" : "outline"} size="sm">
                      {g.status === 'OPEN' ? 'Review' : 'View'}
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
