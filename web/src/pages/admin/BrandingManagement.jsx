import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getBranding, updateBranding, uploadImage } from '@/api/AdminApi.js';
import { useBranding } from '@/contexts/BrandingContext.jsx';
import { DEFAULT_BRANDING, mergeBranding } from '@/lib/branding.js';

const FONT_OPTIONS = [
  'Playfair Display',
  'Cormorant Garamond',
  'Libre Baskerville',
  'Lora',
  'DM Serif Display',
  'Manrope',
  'DM Sans',
  'Inter',
  'Source Sans 3',
  'Great Vibes',
];

const emptyPromo = () => ({
  badge: '',
  title: '',
  sub: '',
  cta: 'Shop Now',
  link: '/shop',
  image: '',
});

const ColorField = ({ label, value, onChange }) => (
  <label className="space-y-1.5 block">
    <span className="text-sm font-medium">{label}</span>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className="h-10 w-12 rounded border border-border bg-background cursor-pointer"
      />
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 border border-border rounded-md px-3 py-2 bg-background"
        placeholder="#B89043"
      />
    </div>
  </label>
);

const BrandingManagement = () => {
  const { refreshBranding } = useBranding();
  const [form, setForm] = useState(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getBranding();
      setForm(mergeBranding(data.branding));
    } catch (err) {
      toast.error(err.message || 'Failed to load branding — sign in via Go admin first to set token');
      setForm(DEFAULT_BRANDING);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setPath = (path, value) => {
    setForm((prev) => {
      const next = structuredClone(prev);
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i += 1) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const onUpload = async (path, file) => {
    if (!file) return;
    try {
      const { url } = await uploadImage(file);
      setPath(path, url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await updateBranding(form);
      setForm(mergeBranding(data.branding));
      try {
        localStorage.setItem('alliraa_branding_updated_at', String(Date.now()));
      } catch {}
      await refreshBranding();
      toast.success('Branding saved successfully', {
        description: 'Theme, fonts, and banners are updated on the website.',
        duration: 4000,
      });
    } catch (err) {
      toast.error(err.message || 'Save failed — sign in via Go admin first to set token');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading branding…</p>;
  }

  return (
    <form onSubmit={onSave} className="max-w-4xl space-y-8">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-serif">Branding</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theme colours, fonts, hero, and banners shown on the storefront.
          </p>
        </div>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
      </div>

      <section className="border border-border rounded-lg bg-card p-5 space-y-4">
        <h2 className="text-lg font-serif">Store identity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1.5 block">
            <span className="text-sm font-medium">Store name</span>
            <input className="w-full border border-border rounded-md px-3 py-2 bg-background" value={form.store_name} onChange={(e) => setPath('store_name', e.target.value)} />
          </label>
          <label className="space-y-1.5 block">
            <span className="text-sm font-medium">Logo</span>
            <input type="file" accept="image/*" onChange={(e) => onUpload('logo_url', e.target.files?.[0])} />
            {form.logo_url && <img src={form.logo_url} alt="" className="mt-2 h-12 object-contain" />}
          </label>
        </div>
      </section>

      <section className="border border-border rounded-lg bg-card p-5 space-y-4">
        <h2 className="text-lg font-serif">Theme colours</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorField label="Primary" value={form.colors.primary} onChange={(v) => setPath('colors.primary', v)} />
          <ColorField label="Secondary" value={form.colors.secondary} onChange={(v) => setPath('colors.secondary', v)} />
          <ColorField label="Background" value={form.colors.background} onChange={(v) => setPath('colors.background', v)} />
          <ColorField label="Foreground" value={form.colors.foreground} onChange={(v) => setPath('colors.foreground', v)} />
        </div>
      </section>

      <section className="border border-border rounded-lg bg-card p-5 space-y-4">
        <h2 className="text-lg font-serif">Fonts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ['fonts.heading', 'Heading', form.fonts.heading],
            ['fonts.body', 'Body', form.fonts.body],
            ['fonts.accent', 'Accent', form.fonts.accent],
          ].map(([path, label, value]) => (
            <label key={path} className="space-y-1.5 block">
              <span className="text-sm font-medium">{label}</span>
              <select className="w-full border border-border rounded-md px-3 py-2 bg-background" value={value} onChange={(e) => setPath(path, e.target.value)}>
                {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
          ))}
        </div>
      </section>

      <section className="border border-border rounded-lg bg-card p-5 space-y-4">
        <h2 className="text-lg font-serif">Hero banner</h2>
        <div className="space-y-2">
          <input type="file" accept="image/*" onChange={(e) => onUpload('hero.image_url', e.target.files?.[0])} />
          {form.hero.image_url && <img src={form.hero.image_url} alt="" className="w-full max-w-md h-40 object-cover rounded-lg" />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border border-border rounded-md px-3 py-2 bg-background" placeholder="Badge" value={form.hero.badge} onChange={(e) => setPath('hero.badge', e.target.value)} />
          <input className="border border-border rounded-md px-3 py-2 bg-background" placeholder="Title" value={form.hero.title} onChange={(e) => setPath('hero.title', e.target.value)} />
        </div>
        <textarea className="w-full border border-border rounded-md px-3 py-2 bg-background" rows={2} placeholder="Subtitle" value={form.hero.subtitle} onChange={(e) => setPath('hero.subtitle', e.target.value)} />
      </section>

      <section className="border border-border rounded-lg bg-card p-5 space-y-4">
        <div className="flex justify-between items-center gap-3 flex-wrap">
          <h2 className="text-lg font-serif">Promo banners</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.show_promo_banners !== false}
              onChange={(e) => setPath('show_promo_banners', e.target.checked)}
            />
            Show on website
          </label>
        </div>
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={() => setForm((f) => ({ ...f, promo_banners: [...(f.promo_banners || []), emptyPromo()] }))}>
            Add banner
          </Button>
        </div>
        {(form.promo_banners || []).map((banner, i) => (
          <div key={i} className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
            <div className="flex justify-between items-center">
              <p className="font-medium text-sm">Banner {i + 1}</p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setForm((f) => ({ ...f, promo_banners: f.promo_banners.filter((_, idx) => idx !== i) }))}
              >
                Remove
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['badge', 'title', 'sub', 'cta', 'link'].map((field) => (
                <input
                  key={field}
                  className="border border-border rounded-md px-3 py-2 bg-background"
                  placeholder={field}
                  value={banner[field] || ''}
                  onChange={(e) => {
                    const next = [...form.promo_banners];
                    next[i] = { ...next[i], [field]: e.target.value };
                    setForm({ ...form, promo_banners: next });
                  }}
                />
              ))}
            </div>
            <input type="file" accept="image/*" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const { url } = await uploadImage(file);
                const next = [...form.promo_banners];
                next[i] = { ...next[i], image: url };
                setForm({ ...form, promo_banners: next });
                toast.success('Image uploaded');
              } catch (err) {
                toast.error(err.message || 'Upload failed');
              }
            }} />
            {banner.image && <img src={banner.image} alt="" className="h-28 w-full max-w-sm object-cover rounded-lg" />}
          </div>
        ))}
      </section>

      <section className="border border-border rounded-lg bg-card p-5 space-y-4">
        <div className="flex justify-between items-center gap-3 flex-wrap">
          <h2 className="text-lg font-serif">Brand story</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.show_brand_story !== false}
              onChange={(e) => setPath('show_brand_story', e.target.checked)}
            />
            Show on website
          </label>
        </div>
        <input type="file" accept="image/*" onChange={(e) => onUpload('brand_story.image_url', e.target.files?.[0])} />
        {form.brand_story.image_url && <img src={form.brand_story.image_url} alt="" className="w-full max-w-md h-40 object-cover rounded-lg" />}
        <input className="w-full border border-border rounded-md px-3 py-2 bg-background" placeholder="Story title" value={form.brand_story.title} onChange={(e) => setPath('brand_story.title', e.target.value)} />
        <textarea className="w-full border border-border rounded-md px-3 py-2 bg-background" rows={3} placeholder="Paragraph 1" value={form.brand_story.paragraph_1} onChange={(e) => setPath('brand_story.paragraph_1', e.target.value)} />
        <textarea className="w-full border border-border rounded-md px-3 py-2 bg-background" rows={3} placeholder="Paragraph 2" value={form.brand_story.paragraph_2} onChange={(e) => setPath('brand_story.paragraph_2', e.target.value)} />
      </section>

      <section className="border border-border rounded-lg bg-card p-5 space-y-4">
        <div className="flex justify-between items-center gap-3 flex-wrap">
          <h2 className="text-lg font-serif">Manifesto</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.show_manifesto !== false}
              onChange={(e) => setPath('show_manifesto', e.target.checked)}
            />
            Show on website
          </label>
        </div>
        <input className="w-full border border-border rounded-md px-3 py-2 bg-background" placeholder="Manifesto" value={form.manifesto} onChange={(e) => setPath('manifesto', e.target.value)} />
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
      </div>
    </form>
  );
};

export default BrandingManagement;
