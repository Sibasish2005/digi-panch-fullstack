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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Plus, Trash2, Pencil, Ban, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ImageKitUploader } from '@/components/ImageKitUploader';
import Image from 'next/image';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export default function AdminNewsPage() {
  const { getToken } = useAuth();
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: string;
    news: any | null;
  }>({ isOpen: false, action: '', news: null });

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('News');
  const [publishedDate, setPublishedDate] = useState(new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadNewsItems();
  }, [getToken]);

  async function loadNewsItems() {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await fetchAPI('/news', { token });
      setNewsItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setCategory('News');
    setPublishedDate(new Date().toISOString().split('T')[0]);
    setImageUrl('');
  };

  const handleCreateNewClick = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditClick = (news: any) => {
    setEditingId(news.id);
    setTitle(news.title);
    setDescription(news.description);
    setCategory(news.category);
    setPublishedDate(news.published_date);
    setImageUrl(news.image_url);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (news: any) => {
    const action = news.is_active ? "deactivate" : "activate";
    setConfirmDialog({ isOpen: true, action, news });
  };

  const executeToggleStatus = async () => {
    if (!confirmDialog.news) return;
    const { action, news } = confirmDialog;
    
    try {
      const token = await getToken();
      await fetchAPI(`/news/${news.id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ is_active: !news.is_active })
      });
      toast.success(`News item successfully ${action}d.`);
      setConfirmDialog({ ...confirmDialog, isOpen: false });
      loadNewsItems();
    } catch (error) {
      console.error(`Failed to ${action} news item:`, error);
      toast.error(`Failed to ${action} news item.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      toast.error("Please upload an image thumbnail.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = await getToken();
      
      const payload = {
        title,
        description,
        category,
        published_date: publishedDate,
        image_url: imageUrl,
        is_active: true
      };

      if (editingId) {
        await fetchAPI(`/news/${editingId}`, {
          method: 'PATCH',
          token,
          body: JSON.stringify(payload)
        });
      } else {
        await fetchAPI('/news', {
          method: 'POST',
          token,
          body: JSON.stringify(payload)
        });
      }

      toast.success(editingId ? "News item updated successfully" : "News item created successfully");
      setIsDialogOpen(false);
      resetForm();
      loadNewsItems();
    } catch (error) {
      console.error("Failed to save news item:", error);
      toast.error("Failed to save news item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading news items..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">News & Announcements</h1>
          <p className="text-muted-foreground">Manage dynamic news content for the landing page.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateNewClick} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md h-11 px-6">
              <Plus className="mr-2 h-4 w-4" /> Add News Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit News Item' : 'Add New News Item'}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input 
                    required 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="e.g. Smart Village Initiative"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input 
                    required 
                    value={category} 
                    onChange={e => setCategory(e.target.value)} 
                    placeholder="e.g. Development"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  required 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  rows={3}
                  placeholder="Short description for the card."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Published Date (Display format)</label>
                <Input 
                  required 
                  value={publishedDate} 
                  onChange={e => setPublishedDate(e.target.value)} 
                  placeholder="e.g. May 6, 2026 or YYYY-MM-DD"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Thumbnail Image</label>
                {imageUrl ? (
                  <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden mb-2 border border-gray-200">
                    <Image src={imageUrl} alt="Thumbnail" fill className="object-cover" />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={() => setImageUrl('')}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-md p-4">
                    <ImageKitUploader onUploadSuccess={(url) => setImageUrl(url)} />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingId ? 'Update News' : 'Create News'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {newsItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No news items found.
                </TableCell>
              </TableRow>
            ) : (
              newsItems.map((news) => (
                <TableRow key={news.id}>
                  <TableCell>
                    <div className="relative w-16 h-10 rounded overflow-hidden bg-gray-100">
                      {news.image_url && <Image src={news.image_url} alt={news.title} fill className="object-cover" />}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {news.title}
                    <div className="text-xs text-gray-500 font-normal">{news.published_date}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50">{news.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {news.is_active ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-transparent hover:bg-green-100">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-800 border-transparent hover:bg-slate-100">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(news)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleToggleStatus(news)}
                        title={news.is_active ? "Deactivate" : "Activate"}
                        className={news.is_active ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                      >
                        {news.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={executeToggleStatus}
        title={`Confirm ${confirmDialog.action === 'activate' ? 'Activation' : 'Deactivation'}`}
        description={`Are you sure you want to ${confirmDialog.action} the news item "${confirmDialog.news?.title}"?`}
        confirmText="Yes, I'm sure"
        isDestructive={confirmDialog.action === 'deactivate'}
      />
    </div>
  );
}
