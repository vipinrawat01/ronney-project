import React, { createContext, useContext, useEffect, useState } from 'react';
import { getStoreBranding } from '@/api/EcommerceApi.js';
import { applyBrandingTheme, DEFAULT_BRANDING, mergeBranding } from '@/lib/branding.js';

const BrandingContext = createContext({
  branding: DEFAULT_BRANDING,
  loading: true,
  refreshBranding: async () => {},
});

const UPDATED_AT_KEY = 'alliraa_branding_updated_at';

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);

  const refreshBranding = async () => {
    try {
      const data = await getStoreBranding();
      const merged = mergeBranding(data);
      setBranding(merged);
      applyBrandingTheme(merged);
    } catch {
      applyBrandingTheme(DEFAULT_BRANDING);
      setBranding(DEFAULT_BRANDING);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyBrandingTheme(DEFAULT_BRANDING);
    refreshBranding();

    const onFocus = () => refreshBranding();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refreshBranding();
    };
    const onStorage = (e) => {
      if (e.key === UPDATED_AT_KEY) refreshBranding();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('storage', onStorage);
    const poll = window.setInterval(refreshBranding, 15000);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('storage', onStorage);
      window.clearInterval(poll);
    };
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, loading, refreshBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
