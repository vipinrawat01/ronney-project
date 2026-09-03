import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  createProduct,
  deleteProduct,
  getProduct,
  listCategories,
  listProducts,
  updateProduct,
  uploadImage,
} from '@/api/AdminApi.js';

const emptyVariant = () => ({
  title: 'Default',
  sku: '',
  price_cents: 0,
  sale_price_cents: null,
  currency: 'usd',
  inventory_quantity: 10,
  manage_inventory: true,
  images: [],
});

const emptyForm = {
  id: null,
  title: '',
  slug: '',
  subtitle: '',
  description: '',
  thumbnail: '',
  category_id: '',
  ribbon_text: '',
  status: 'active',
  images: [],
  variants: [emptyVariant()],
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [p, c] = await Promise.all([listProducts({ limit: 100 }), listCategories(true)]);
      setProducts(p.products || []);
      setCategories(c.categories || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load products');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm({ ...emptyForm, variants: [emptyVariant()] });
    setOpen(true);
  };

  const openEdit = async (id) => {
    try {
      const data = await getProduct(id);
      const p = data.product || data;
      setForm({
        id: p.id,
        title: p.title || '',
        slug: p.slug || '',
        subtitle: p.subtitle || '',
        description: p.description || '',
        thumbnail: p.thumbnail || '',
        category_id: p.category_id || '',
        ribbon_text: p.ribbon_text || '',
        status: p.status || 'active',
        images: (p.images || []).map((img) => img.url || img),
        variants: (p.variants || []).length
          ? p.variants.map((v) => ({
              title: v.title,
              sku: v.sku || '',
              price_cents: v.price_cents ?? v.price_in_cents ?? 0,
              sale_price_cents: v.sale_price_cents ?? v.sale_price_in_cents ?? null,
              currency: v.currency || 'usd',
              inventory_quantity: v.inventory_quantity ?? 0,
              manage_inventory: v.manage_inventory !== false,
              images: (v.images || []).map((img) => img.url || img).filter(Boolean).length
                ? (v.images || []).map((img) => img.url || img)
                : v.image_url
                  ? [v.image_url]
                  : [],
            }))
          : [emptyVariant()],
      });
      setOpen(true);
    } catch (err) {
      toast.error(err.message || 'Failed to load product');
    }
  };

  const upload = async (file) => {
    const { url } = await uploadImage(file);
    return url;
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      title: form.title,
      slug: form.slug,
      subtitle: form.subtitle || null,
      description: form.description || null,
      thumbnail: form.thumbnail || form.images[0] || null,
      category_id: form.category_id ? Number(form.category_id) : null,
      ribbon_text: form.ribbon_text || null,
      status: form.status,
      purchasable: true,
      images: form.images,
      variants: form.variants.filter((v) => v.title).map((v) => ({
        ...v,
        price_cents: Number(v.price_cents) || 0,
        sale_price_cents: v.sale_price_cents === '' || v.sale_price_cents == null ? null : Number(v.sale_price_cents),
        inventory_quantity: Number(v.inventory_quantity) || 0,
        image_url: v.images?.[0] || null,
      })),
    };
    try {
      if (form.id) await updateProduct(form.id, body);
      else await createProduct(body);
      toast.success('Product saved');
      setOpen(false);
      await load();
    } catch (err) {
      toast.error(err.message || 'Save failed — sign in at Go admin to set token');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
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
          <h1 className="text-2xl font-serif">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Full variant/image editor: <a className="underline" href="http://localhost:8081/admin/" target="_blank" rel="noreferrer">localhost:8081/admin</a>
          </p>
        </div>
        <Button onClick={openCreate}>Add Product</Button>
      </div>

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {(p.thumbnail || p.image) ? (
                    <img src={p.thumbnail || p.image} alt="" className="w-12 h-12 object-cover rounded" />
                  ) : '—'}
                </TableCell>
                <TableCell className="font-medium">{p.title || p.name}</TableCell>
                <TableCell>{p.category?.name || '—'}</TableCell>
                <TableCell>{(p.variants || []).length}</TableCell>
                <TableCell>${((p.price_in_cents || 0) / 100).toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => openEdit(p.id)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(p.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No products found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto">
          <form onSubmit={onSave} className="bg-card border border-border rounded-xl w-full max-w-3xl p-6 space-y-4 my-8">
            <h2 className="text-xl font-serif">{form.id ? 'Edit product' : 'Add product'}</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <input className="border rounded px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <input className="border rounded px-3 py-2" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <input className="w-full border rounded px-3 py-2" placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            <textarea className="w-full border rounded px-3 py-2" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid md:grid-cols-2 gap-3">
              <select className="border rounded px-3 py-2" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.type} / {c.name}</option>
                ))}
              </select>
              <select className="border rounded px-3 py-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Thumbnail / gallery</label>
              <input type="file" accept="image/*" multiple className="block mt-1" onChange={async (e) => {
                try {
                  const urls = [];
                  for (const file of [...(e.target.files || [])]) urls.push(await upload(file));
                  setForm((f) => ({ ...f, images: [...f.images, ...urls], thumbnail: f.thumbnail || urls[0] || '' }));
                } catch (err) {
                  toast.error(err.message);
                }
              }} />
              <div className="flex flex-wrap gap-2 mt-2">
                {form.images.map((url) => (
                  <img key={url} src={url} alt="" className="w-16 h-16 object-cover rounded" />
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Variants</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, variants: [...form.variants, emptyVariant()] })}>+ Variant</Button>
              </div>
              {form.variants.map((v, i) => (
                <div key={i} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                  <div className="grid md:grid-cols-3 gap-2">
                    <input className="border rounded px-3 py-2" placeholder="Title" value={v.title} onChange={(e) => {
                      const variants = [...form.variants];
                      variants[i] = { ...v, title: e.target.value };
                      setForm({ ...form, variants });
                    }} />
                    <input className="border rounded px-3 py-2" placeholder="SKU" value={v.sku} onChange={(e) => {
                      const variants = [...form.variants];
                      variants[i] = { ...v, sku: e.target.value };
                      setForm({ ...form, variants });
                    }} />
                    <input className="border rounded px-3 py-2" type="number" placeholder="Price (cents)" value={v.price_cents} onChange={(e) => {
                      const variants = [...form.variants];
                      variants[i] = { ...v, price_cents: e.target.value };
                      setForm({ ...form, variants });
                    }} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-2">
                    <input className="border rounded px-3 py-2" type="number" placeholder="Stock" value={v.inventory_quantity} onChange={(e) => {
                      const variants = [...form.variants];
                      variants[i] = { ...v, inventory_quantity: e.target.value };
                      setForm({ ...form, variants });
                    }} />
                    <input type="file" accept="image/*" multiple onChange={async (e) => {
                      try {
                        const urls = [];
                        for (const file of [...(e.target.files || [])]) urls.push(await upload(file));
                        const variants = [...form.variants];
                        variants[i] = { ...v, images: [...(v.images || []), ...urls] };
                        setForm({ ...form, variants });
                      } catch (err) {
                        toast.error(err.message);
                      }
                    }} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(v.images || []).map((url) => (
                      <img key={url} src={url} alt="" className="w-14 h-14 object-cover rounded" />
                    ))}
                  </div>
                  {form.variants.length > 1 && (
                    <Button type="button" variant="destructive" size="sm" onClick={() => setForm({ ...form, variants: form.variants.filter((_, idx) => idx !== i) })}>Remove variant</Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save product'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
