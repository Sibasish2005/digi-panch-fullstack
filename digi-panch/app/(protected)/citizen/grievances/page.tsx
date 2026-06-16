'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { fetchAPI } from '@/lib/api-client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function GrievancesPage() {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const role = (user?.publicMetadata?.role as string) || "CITIZEN";

  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ subject: '', category: '', description: '' });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = await getToken();
      await fetchAPI('/grievances', {
        method: 'POST',
        token,
        body: JSON.stringify(formData)
      });
      setFormData({ subject: '', category: '', description: '' });
      await loadGrievances();
    } catch (e) {
      console.error(e);
      alert('Failed to submit grievance');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoaded && user && role !== "CITIZEN" && role !== "USER") {
    return (
      <div className="flex-grow flex items-center justify-center p-6 h-[80vh]">
        <Card className="max-w-md w-full shadow-lg border-red-100 bg-red-50/30">
          <CardContent className="flex flex-col items-center text-center pt-10 pb-10">
            <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Access Denied</h2>
            <p className="text-slate-600 mb-8">
              This Grievances portal is strictly reserved for Citizens. As an {role.toLowerCase()}, please use your dedicated dashboard.
            </p>
            <Link href="/">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11">
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-6 w-32 mb-4" />
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mt-2" />
                  <Skeleton className="h-4 w-5/6 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Grievance Portal</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Submission Form */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Submit New Grievance</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input 
                    required 
                    value={formData.subject} 
                    onChange={e => setFormData({...formData, subject: e.target.value})} 
                    placeholder="E.g. Broken Streetlight"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select 
                    required 
                    value={formData.category} 
                    onValueChange={val => setFormData({...formData, category: val})} 
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Infrastructure and maintenance">Infrastructure and maintenance</SelectItem>
                      <SelectItem value="Social welfare and benefit schemes">Social welfare and benefit schemes</SelectItem>
                      <SelectItem value="Public utility services">Public utility services</SelectItem>
                      <SelectItem value="Administrative corruption or inaction">Administrative corruption or inaction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea 
                    required 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    placeholder="Detailed explanation..."
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Ticket
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Existing Grievances */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Your Tickets</h2>
          
          {grievances.length === 0 ? (
            <div className="text-center p-8 border rounded-md bg-white text-muted-foreground">
              You haven't submitted any grievances yet.
            </div>
          ) : (
            <div className="space-y-4">
              {grievances.map(ticket => (
                <Card key={ticket.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                        <p className="text-sm text-muted-foreground">{ticket.category} • {new Date(ticket.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={ticket.status === 'Resolved' ? 'default' : 'secondary'}>
                        {ticket.status || 'Pending'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{ticket.description}</p>
                    {ticket.resolution_notes && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
                        <span className="font-semibold text-blue-900">Official Reply:</span>
                        <p className="text-blue-800 mt-1">{ticket.resolution_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
