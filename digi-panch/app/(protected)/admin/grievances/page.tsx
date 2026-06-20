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
import { Trash2, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function AdminGrievancesPage() {
  const { getToken } = useAuth();
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadGrievances = async () => {
    try {
      const token = await getToken();
      const data = await fetchAPI('/grievances', { token });
      setGrievances(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrievances();
  }, [getToken]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to completely delete this grievance? This action cannot be undone.")) return;
    
    setDeletingId(id);
    try {
      const token = await getToken();
      await fetchAPI(`/grievances/${id}`, {
        method: 'DELETE',
        token
      });
      // Refresh list
      await loadGrievances();
    } catch (e) {
      console.error(e);
      alert("Failed to delete grievance. Please check permissions.");
    } finally {
      setDeletingId(null);
    }
  };

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

  // Sort grievances
  const sortedGrievances = [...grievances].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (loading) return <LoadingSpinner message="Loading grievances..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Manage Grievances</h1>
      </div>
      
      <div className="rounded-md border bg-white overflow-hidden">
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
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(g.id)}
                    disabled={deletingId === g.id}
                  >
                    {deletingId === g.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
