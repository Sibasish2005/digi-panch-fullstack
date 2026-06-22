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
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export default function AmenitiesPage() {
  const { getToken } = useAuth();
  const [amenities, setAmenities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: string;
    amenity: any | null;
  }>({ isOpen: false, action: '', amenity: null });

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fee, setFee] = useState(0);
  const [allowMultiDay, setAllowMultiDay] = useState(false);
  const [formFields, setFormFields] = useState<{name: string, type: string, options?: string[]}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAmenities();
  }, [getToken]);

  async function loadAmenities() {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await fetchAPI('/amenities', { token });
      setAmenities(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setFee(0);
    setAllowMultiDay(false);
    setFormFields([]);
  };

  const handleCreateNewClick = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditClick = (amenity: any) => {
    setEditingId(amenity.id);
    setName(amenity.name);
    setDescription(amenity.description || '');
    setFee(amenity.fee_amount);
    setAllowMultiDay(amenity.allow_multi_day || false);
    setFormFields(amenity.form_fields || []);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (amenity: any) => {
    const action = amenity.is_active ? "deactivate" : "activate";
    setConfirmDialog({ isOpen: true, action, amenity });
  };

  const executeToggleStatus = async () => {
    if (!confirmDialog.amenity) return;
    const { action, amenity } = confirmDialog;
    
    try {
      const token = await getToken();
      await fetchAPI(`/amenities/${amenity.id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ is_active: !amenity.is_active })
      });
      toast.success(`Amenity successfully ${action}d.`);
      setConfirmDialog({ ...confirmDialog, isOpen: false });
      loadAmenities();
    } catch (error) {
      console.error(`Failed to ${action} amenity:`, error);
      toast.error(`Failed to ${action} amenity.`);
    }
  };

  const handleAddFormField = () => {
    setFormFields([...formFields, { name: '', type: 'text' }]);
  };

  const handleUpdateFormField = (index: number, field: string, value: string) => {
    const updated = [...formFields];
    updated[index] = { ...updated[index], [field]: value };
    setFormFields(updated);
  };

  const handleAddOption = (fieldIndex: number) => {
    const updated = [...formFields];
    if (!updated[fieldIndex].options) {
      updated[fieldIndex].options = [];
    }
    updated[fieldIndex].options!.push('');
    setFormFields(updated);
  };

  const handleUpdateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const updated = [...formFields];
    if (updated[fieldIndex].options) {
      updated[fieldIndex].options![optionIndex] = value;
    }
    setFormFields(updated);
  };

  const handleRemoveOption = (fieldIndex: number, optionIndex: number) => {
    const updated = [...formFields];
    if (updated[fieldIndex].options) {
      updated[fieldIndex].options!.splice(optionIndex, 1);
    }
    setFormFields(updated);
  };

  const handleRemoveFormField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = await getToken();
      
      const payload = {
        name,
        description,
        fee_amount: fee,
        allow_multi_day: allowMultiDay,
        form_fields: formFields
      };

      if (editingId) {
        await fetchAPI(`/amenities/${editingId}`, {
          method: 'PATCH',
          token,
          body: JSON.stringify(payload)
        });
      } else {
        await fetchAPI('/amenities', {
          method: 'POST',
          token,
          body: JSON.stringify(payload)
        });
      }
      
      toast.success(editingId ? "Amenity updated successfully" : "Amenity created successfully");
      setIsDialogOpen(false);
      resetForm();
      loadAmenities();
    } catch (error: any) {
      console.error("Failed to save amenity:", error);
      toast.error(error.message || "Failed to save amenity. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 style={{ fontFamily: "var(--font-noto-serif)" }} className="text-3xl font-black text-[#0f2a5e] tracking-tight">Amenities</h1>
          <p className="text-muted-foreground">Manage bookable amenities and their dynamic forms.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateNewClick}>
              <Plus className="mr-2 h-4 w-4" /> Add Amenity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Update Amenity' : 'Add New Amenity'}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Amenity Name</label>
                  <Input 
                    placeholder="e.g. Community Hall" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input 
                    placeholder="Brief description of the amenity..." 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fee Amount (₹)</label>
                  <Input 
                    type="number" 
                    min="0"
                    value={Number.isNaN(fee) ? '' : fee} 
                    onChange={(e) => setFee(parseFloat(e.target.value))} 
                    required 
                  />
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pt-6">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={allowMultiDay}
                      onChange={(e) => setAllowMultiDay(e.target.checked)}
                    />
                    <span className="text-sm font-medium">Allow Multi-Day Bookings</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 space-y-3 border-t">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Form Fields (Data to Collect)</h3>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddFormField}>
                    <Plus className="mr-2 h-4 w-4" /> Add Field
                  </Button>
                </div>
                
                {formFields.length === 0 && (
                  <div className="text-sm text-gray-500 italic py-2">No form fields specified.</div>
                )}
                
                {formFields.map((field, idx) => (
                  <div key={idx} className="space-y-2 border p-3 rounded-md bg-gray-50/50">
                    <div className="flex gap-3 items-center">
                      <Input 
                        placeholder="Field Name (e.g. Event Type)" 
                        value={field.name} 
                        onChange={(e) => handleUpdateFormField(idx, 'name', e.target.value)} 
                        required
                        className="flex-1 bg-white"
                      />
                      <select 
                        className="flex h-9 w-32 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors"
                        value={field.type}
                        onChange={(e) => handleUpdateFormField(idx, 'type', e.target.value)}
                        aria-label="Field Type"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="file">File Upload</option>
                        <option value="radio">Dropdown</option>
                      </select>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveFormField(idx)} className="text-red-500 hover:text-red-700 bg-white border">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {field.type === 'radio' && (
                      <div className="ml-4 mt-3 space-y-2 border-l-2 pl-4 border-gray-200">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">Dropdown Options</label>
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleAddOption(idx)} className="h-7 text-xs text-blue-600 hover:text-blue-700 bg-blue-50">
                            <Plus className="mr-1 h-3 w-3" /> Add Option
                          </Button>
                        </div>
                        {(!field.options || field.options.length === 0) && (
                          <div className="text-xs text-red-500 italic">Please add at least one option.</div>
                        )}
                        {field.options?.map((opt, optIdx) => (
                          <div key={optIdx} className="flex gap-2 items-center">
                            <Input 
                              className="h-8 text-sm bg-white"
                              placeholder={`Option ${optIdx + 1}`}
                              value={opt}
                              onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)}
                              required
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveOption(idx, optIdx)} className="h-8 w-8 text-red-500 hover:bg-red-50">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingId ? 'Save Changes' : 'Create Amenity'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white overflow-hidden shadow-sm">
        {loading && amenities.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Loading amenities...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead>Amenity Name</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {amenities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No amenities found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
              {amenities.map((amenity) => (
                <TableRow key={amenity.id}>
                  <TableCell className="font-medium">
                    {amenity.name}
                    {amenity.description && (
                      <p 
                        className="text-xs text-muted-foreground font-normal max-w-md line-clamp-2 mt-1" 
                        title={amenity.description}
                      >
                        {amenity.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    ₹{amenity.fee_amount}
                    {amenity.allow_multi_day && (
                      <Badge variant="outline" className="ml-2 text-xs">Multi-Day</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={amenity.is_active ? "default" : "destructive"}>
                      {amenity.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                        onClick={() => handleEditClick(amenity)}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Update
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`h-8 px-2.5 ${amenity.is_active ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200' : 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200'}`}
                        onClick={() => handleToggleStatus(amenity)}
                      >
                        {amenity.is_active ? <Ban className="h-3.5 w-3.5 mr-1.5" /> : <CheckCircle className="h-3.5 w-3.5 mr-1.5" />}
                        {amenity.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={executeToggleStatus}
        title={`Confirm ${confirmDialog.action === 'activate' ? 'Activation' : 'Deactivation'}`}
        description={`Are you sure you want to ${confirmDialog.action} the amenity "${confirmDialog.amenity?.name}"?`}
        confirmText="Yes, I'm sure"
        isDestructive={confirmDialog.action === 'deactivate'}
      />
    </div>
  );
}
