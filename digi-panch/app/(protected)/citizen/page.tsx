'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchAPI } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, FileText, LayoutDashboard, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function CitizenDashboard() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total_applications: 0,
    pending_applications: 0,
    approved_applications: 0,
    pending_grievances: 0,
  });
  const [issuedDocs, setIssuedDocs] = useState<any[]>([]);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const loadSummary = async () => {
    try {
      const token = await getToken();
        
        // Fetch user's own applications
        const apps = await fetchAPI('/applications', { token });
        const total_applications = apps.length;
        const pending_applications = apps.filter((a: any) => a.status === 'SUBMITTED').length;
        const approved_applications = apps.filter((a: any) => a.status === 'APPROVED' || a.status === 'DOCUMENT_ISSUED').length;
        
        // Fetch user's own grievances
        const grievances = await fetchAPI('/grievances', { token });
        const pending_grievances = grievances.filter((g: any) => g.status !== 'Resolved').length;
        
        setSummary({ total_applications, pending_applications, approved_applications, pending_grievances });
        setIssuedDocs(apps.filter((a: any) => a.status === 'DOCUMENT_ISSUED'));
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    loadSummary();
  }, [getToken]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) return;
    
    setDeleteLoading(id);
    try {
      const token = await getToken();
      await fetchAPI(`/applications/${id}`, { method: 'DELETE', token });
      await loadSummary();
    } catch (e) {
      console.error('Failed to delete application', e);
      alert('Failed to delete the certificate.');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border bg-white p-6 shadow-sm">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Citizen Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Apps</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_applications}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Apps</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pending_applications}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/citizen/applications" className="text-blue-600 hover:underline">Track status</Link>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Apps</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.approved_applications}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grievances</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pending_grievances}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/citizen/grievances" className="text-blue-600 hover:underline">View all</Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {issuedDocs.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-xl font-bold tracking-tight">Your Issued Documents</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {issuedDocs.map((doc) => (
              <Card key={doc.id} className="overflow-hidden border-green-200">
                <div className="bg-green-50 px-4 py-2 border-b border-green-100 flex justify-between items-center">
                  <span className="text-sm font-semibold text-green-800 uppercase">{doc.document_type?.name || 'Document'}</span>
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Application No.</p>
                    <p className="font-medium text-sm">{doc.application_number}</p>
                  </div>
                  {doc.final_document?.pdf_url && (
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700" asChild>
                        <a href={doc.final_document.pdf_url} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        disabled={deleteLoading === doc.id}
                        onClick={() => handleDelete(doc.id)}
                      >
                        {deleteLoading === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
