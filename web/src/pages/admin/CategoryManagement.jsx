import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  uploadImage,
} from '@/api/AdminApi.js';

const emptyFabric = () => ({ id: '', name: '', image: '' });
const emptyPrint = () => ({ id: '', name: '', image: '' });

const emptyForm = {
  id: null,
  name: '',
  slug: '',
  type: 'women',
  parent_id: '',
  description: '',
  image_url: '',
  fabrics: [],
  prints: [],
  sort_order: 0,
};

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await listCategories(true);
      setCategories(data.categories || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load categories');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (c) => {
    setForm({
      id: c.id,
      name: c.name || '',
      slug: c.slug || '',
      type: c.type || 'women',
      parent_id: c.parent_id || '',
      description: c.description || '',
      image_url: c.image_url || '',
      fabrics: Array.isArray(c.fabrics)
        ? c.fabrics.map((f) => ({
            id: f.id || '',
            name: f.name || '',
            image: f.image || '',
          }))
        : [],
      prints: Array.isArray(c.prints)
        ? c.prints.map((p) => ({
            id: p.id || '',
            name: p.name || '',
            image: p.image || '',
          }))
        : [],
      sort_order: c.sort_order || 0,
    });
    setOpen(true);
  };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadImage(file);
      setForm((f) => ({ ...f, image_url: url }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    }
  };

  const onFabricImageUpload = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadImage(file);
      setForm((f) => {
        const fabrics = [...f.fabrics];
        fabrics[index] = { ...fabrics[index], image: url };
        return { ...f, fabrics };
      });
      toast.success('Fabric image uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    }
  };

  const updateFabric = (index, patch) => {
    setForm((f) => {
      const fabrics = [...f.fabrics];
      fabrics[index] = { ...fabrics[index], ...patch };
      return { ...f, fabrics };
    });
  };

  const addFabric = () => {
    setForm((f) => ({ ...f, fabrics: [...f.fabrics, emptyFabric()] }));
  };

  const removeFabric = (index) => {
    setForm((f) => ({
      ...f,
      fabrics: f.fabrics.filter((_, i) => i !== index),
    }));
  };

  const onPrintImageUpload = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadImage(file);
      setForm((f) => {
        const prints = [...f.prints];
        prints[index] = { ...prints[index], image: url };
        return { ...f, prints };
      });
      toast.success('Print image uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    }
  };

  const updatePrint = (index, patch) => {
    setForm((f) => {
      const prints = [...f.prints];
      prints[index] = { ...prints[index], ...patch };
      return { ...f, prints };
    });
  };

  const addPrint = () => {
    setForm((f) => ({ ...f, prints: [...f.prints, emptyPrint()] }));
  };

  const removePrint = (index) => {
    setForm((f) => ({
      ...f,
      prints: f.prints.filter((_, i) => i !== index),
    }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fabrics = (form.fabrics || [])
      .map((fabric) => ({
        id: fabric.id?.trim() || slugify(fabric.name),
        name: fabric.name?.trim() || '',
        image: fabric.image?.trim() || '',
      }))
      .filter((fabric) => fabric.name);

    const prints = (form.prints || [])
      .map((print) => ({
        id: print.id?.trim() || slugify(print.name),
        name: print.name?.trim() || '',
        image: print.image?.trim() || '',
      }))
      .filter((print) => print.name);

    const body = {
      name: form.name,
      slug: form.slug,
      type: form.type,
      parent_id: form.parent_id ? Number(form.parent_id) : null,
      description: form.description || null,
      image_url: form.image_url || null,
      fabrics,
      prints,
      sort_order: Number(form.sort_order) || 0,
      is_active: true,
    };
    try {
      if (form.id) await updateCategory(form.id, body);
      else await createCategory(body);
      toast.success('Category saved');
      setOpen(false);
      await load();
    } catch (err) {
      toast.error(err.message || 'Save failed — sign in via Go admin first to set token');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      toast.success('Deleted');
      await load();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-serif">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Prefer the full admin at <a className="underline" href="http://localhost:8081/admin/" target="_blank" rel="noreferrer">localhost:8081/admin</a>
          </p>
        </div>
        <Button onClick={openCreate}>Add Category</Button>
      </div>

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Fabrics</TableHead>
              <TableHead>Prints</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  {c.image_url ? (
                    <img src={c.image_url} alt="" className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.type}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {Array.isArray(c.fabrics) && c.fabrics.length
                    ? c.fabrics.map((f) => f.name).filter(Boolean).join(', ')
                    : '—'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {Array.isArray(c.prints) && c.prints.length
                    ? c.prints.map((p) => p.name).filter(Boolean).join(', ')
                    : '—'}
                </TableCell>
                <TableCell>{categories.find((p) => p.id === c.parent_id)?.name || '—'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => openEdit(c)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(c.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No categories found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={onSave} className="bg-card border border-border rounded-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-serif">{form.id ? 'Edit category' : 'Add category'}</h2>
            <input className="w-full border rounded px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="w-full border rounded px-3 py-2" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <select className="w-full border rounded px-3 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="unisex">Unisex</option>
            </select>
            <select className="w-full border rounded px-3 py-2" value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}>
              <option value="">No parent (top-level)</option>
              {categories.filter((c) => c.id !== form.id).map((c) => (
                <option key={c.id} value={c.id}>{c.type} / {c.name}</option>
              ))}
            </select>
            <textarea className="w-full border rounded px-3 py-2" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="space-y-2">
              <input type="file" accept="image/*" onChange={onUpload} />
              {form.image_url && <img src={form.image_url} alt="" className="w-24 h-24 object-cover rounded" />}
            </div>

            <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">Fabrics</p>
                  <p className="text-xs text-muted-foreground">Shown on the category brochure page as swatches.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addFabric}>
                  <Plus className="w-4 h-4 mr-1" /> Add fabric
                </Button>
              </div>

              {form.fabrics.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">No fabrics yet. Add one for this category.</p>
              )}

              {form.fabrics.map((fabric, index) => (
                <div key={index} className="grid grid-cols-[72px_1fr_auto] gap-3 items-start border border-border rounded-md p-3 bg-background">
                  <div className="space-y-2">
                    <div className="w-[72px] h-[72px] rounded-full overflow-hidden bg-muted border border-border">
                      {fabric.image ? (
                        <img src={fabric.image} alt="" className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="text-[10px] w-full"
                      onChange={(e) => onFabricImageUpload(index, e)}
                    />
                  </div>
                  <div className="space-y-2 min-w-0">
                    <input
                      className="w-full border rounded px-3 py-2"
                      placeholder="Fabric name (e.g. Canvas)"
                      value={fabric.name}
                      onChange={(e) => updateFabric(index, { name: e.target.value })}
                    />
                    <input
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder="Image URL"
                      value={fabric.image}
                      onChange={(e) => updateFabric(index, { image: e.target.value })}
                    />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFabric(index)} aria-label="Remove fabric">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">Prints</p>
                  <p className="text-xs text-muted-foreground">Shown as print option buttons (Solid, Floral, Geo, Stripe…).</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addPrint}>
                  <Plus className="w-4 h-4 mr-1" /> Add print
                </Button>
              </div>

              {form.prints.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">No prints yet. Add one for this category.</p>
              )}

              {form.prints.map((print, index) => (
                <div key={index} className="grid grid-cols-[72px_1fr_auto] gap-3 items-start border border-border rounded-md p-3 bg-background">
                  <div className="space-y-2">
                    <div className="w-[72px] h-[72px] rounded-md overflow-hidden bg-muted border border-border flex items-center justify-center">
                      {print.image ? (
                        <img src={print.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground px-1 text-center">
                          {print.name || 'Print'}
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="text-[10px] w-full"
                      onChange={(e) => onPrintImageUpload(index, e)}
                    />
                  </div>
                  <div className="space-y-2 min-w-0">
                    <input
                      className="w-full border rounded px-3 py-2"
                      placeholder="Print name (e.g. Solid)"
                      value={print.name}
                      onChange={(e) => updatePrint(index, { name: e.target.value })}
                    />
                    <input
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder="Image URL (optional)"
                      value={print.image}
                      onChange={(e) => updatePrint(index, { image: e.target.value })}
                    />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removePrint(index)} aria-label="Remove print">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
