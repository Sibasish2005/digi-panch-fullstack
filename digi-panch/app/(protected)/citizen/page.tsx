'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchAPI } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, FileText, LayoutDashboard, MessageSquare, Loader2, Trash2, Calendar, CalendarDays, Receipt } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { format } from "date-fns";
import { toast } from "sonner";

export default function CitizenDashboard() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total_applications: 0,
    pending_applications: 0,
    approved_applications: 0,
    pending_grievances: 0,
    total_bookings: 0,
    pending_bookings: 0,
  });
  const [issuedDocs, setIssuedDocs] = useState<any[]>([]);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

        // Fetch user's own bookings
        const bookings = await fetchAPI('/amenities/bookings/my', { token });
        const total_bookings = bookings.length;
        const pending_bookings = bookings.filter((b: any) => b.status === 'PENDING').length;
        
        setSummary({ total_applications, pending_applications, approved_applications, pending_grievances, total_bookings, pending_bookings });
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
    setDeleteLoading(id);
    try {
      const token = await getToken();
      await fetchAPI(`/applications/${id}`, { method: 'DELETE', token });
      toast.success('Certificate deleted successfully.');
      await loadSummary();
    } catch (e) {
      console.error('Failed to delete application', e);
      toast.error('Failed to delete the certificate.');
    } finally {
      setDeleteLoading(null);
      setDeleteConfirmId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <h1 style={{ fontFamily: "var(--font-noto-serif)" }} className="text-3xl font-black text-[#0f2a5e] tracking-tight">Citizen Dashboard</h1>
      
      <Card className="rounded-sm border border-slate-200 shadow-sm overflow-hidden bg-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px]">
          
          {/* Total Apps */}
          <div className="p-6 bg-white">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-bold text-[#0f2a5e]">Total Apps</span>
              <LayoutDashboard className="h-4 w-4 text-[#0f2a5e]" />
            </div>
            <div className="text-2xl font-bold text-[#0f2a5e]">{summary.total_applications}</div>
          </div>

          {/* Pending Apps */}
          <div className="p-6 bg-white">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-bold text-[#0f2a5e]">Pending Apps</span>
              <FileText className="h-4 w-4 text-[#0f2a5e]" />
            </div>
            <div className="text-2xl font-bold text-[#0f2a5e]">{summary.pending_applications}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/citizen/applications" className="text-[#0f2a5e] font-semibold hover:underline">Track status</Link>
            </p>
          </div>
          
          {/* Approved Apps */}
          <div className="p-6 bg-white">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-bold text-[#0f2a5e]">Approved Apps</span>
              <Activity className="h-4 w-4 text-[#0f2a5e]" />
            </div>
            <div className="text-2xl font-bold text-[#0f2a5e]">{summary.approved_applications}</div>
          </div>
          
          {/* Pending Grievances */}
          <div className="p-6 bg-white">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-bold text-[#0f2a5e]">Pending Grievances</span>
              <MessageSquare className="h-4 w-4 text-[#0f2a5e]" />
            </div>
            <div className="text-2xl font-bold text-[#0f2a5e]">{summary.pending_grievances}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/citizen/grievances" className="text-[#0f2a5e] font-semibold hover:underline">View all</Link>
            </p>
          </div>

          {/* Total Bookings */}
          <div className="p-6 bg-white">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-bold text-[#0f2a5e]">Total Bookings</span>
              <CalendarDays className="h-4 w-4 text-[#0f2a5e]" />
            </div>
            <div className="text-2xl font-bold text-[#0f2a5e]">{summary.total_bookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/citizen/my-bookings" className="text-[#0f2a5e] font-semibold hover:underline">Manage bookings</Link>
            </p>
          </div>

          {/* Pending Bookings */}
          <div className="p-6 bg-white">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-bold text-[#0f2a5e]">Pending Bookings</span>
              <Calendar className="h-4 w-4 text-[#0f2a5e]" />
            </div>
            <div className="text-2xl font-bold text-[#0f2a5e]">{summary.pending_bookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/citizen/my-bookings" className="text-[#0f2a5e] font-semibold hover:underline">View all</Link>
            </p>
          </div>

        </div>
      </Card>

      {/* Taxes & Bills - Coming Soon */}
      <Card className="rounded-sm border border-[#0f2a5e]/20 shadow-sm overflow-hidden relative bg-transparent">
        {/* Base white background */}
        <div className="absolute inset-0 z-0 bg-transparent" />
        {/* Money.png background image */}
        <div 
          className="absolute inset-0 z-[1]"
          style={{ 
            backgroundImage: "url('/images/money.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.25
          }}
        />
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-blue-50/60 to-indigo-50/40" />
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#0f2a5e]/10 rounded-md">
                  <Receipt className="h-5 w-5 text-[#0f2a5e]" />
                </div>
                <h2 style={{ fontFamily: "var(--font-noto-serif)" }} className="text-2xl font-black text-[#0f2a5e] tracking-tight">Taxes & Bills</h2>
                <span className="px-2.5 py-1 bg-[#0f2a5e] text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">Coming Soon</span>
              </div>
              <p className="text-sm md:text-base text-slate-700 leading-relaxed font-medium">
                Pay your property taxes, water bills, and other municipal dues conveniently from your citizen dashboard. We are currently building this feature and it will be available in the near future!
              </p>
            </div>
            <Button disabled className="bg-[#0f2a5e] text-white opacity-50 cursor-not-allowed shrink-0 px-8 py-6 rounded-[4px] font-semibold text-base w-full md:w-auto">
              Pay Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {issuedDocs.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 style={{ fontFamily: "var(--font-noto-serif)" }} className="text-xl font-black text-[#0f2a5e] tracking-tight">Your Issued Documents</h2>
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
                      <Button className="flex-1 bg-[#0f2a5e] hover:bg-[#0a1e46] text-white" asChild>
                        <a href={doc.final_document.pdf_url} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        disabled={deleteLoading === doc.id}
                        onClick={() => setDeleteConfirmId(doc.id)}
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
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent className="w-[calc(100vw-32px)] max-w-[440px] rounded-sm p-6 border border-slate-200">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold text-[#0f2a5e]">
              Delete Certificate?
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 leading-relaxed">
              Are you sure you want to delete this certificate? This action cannot be undone and will permanently remove it from your records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="rounded-[4px] flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirmId) handleDelete(deleteConfirmId);
              }}
              disabled={deleteLoading === deleteConfirmId}
              className="rounded-[4px] flex-1 h-11 bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              {deleteLoading === deleteConfirmId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
