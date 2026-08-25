import { useEffect, useState } from "react";
import { STORE_CONTACT, STORE_SOCIALS } from "../config/store.config";
import { connecter } from "./connecter";

export interface SiteSettings {
  contact_email: string;
  phone_number: string;
  facebook_url: string;
  instagram_url: string;
  whatsapp_url: string;
  tiktok_url: string;
  youtube_url: string;
  updated_at?: string;
}

const FALLBACK_SITE_SETTINGS: SiteSettings = {
  contact_email: STORE_CONTACT.email,
  phone_number: STORE_CONTACT.phone,
  facebook_url: STORE_SOCIALS.facebook,
  instagram_url: STORE_SOCIALS.instagram,
  whatsapp_url: STORE_SOCIALS.whatsapp,
  tiktok_url: STORE_SOCIALS.tiktok,
  youtube_url: STORE_SOCIALS.youtube,
};

let cachedSettings: SiteSettings | null = null;
let pendingRequest: Promise<SiteSettings> | null = null;

const loadSiteSettings = (): Promise<SiteSettings> => {
  if (cachedSettings) return Promise.resolve(cachedSettings);

  if (!pendingRequest) {
    pendingRequest = connecter
      .get<SiteSettings>("api/site-settings/")
      .then(({ data }) => {
        cachedSettings = data;
        return data;
      })
      .catch(() => FALLBACK_SITE_SETTINGS)
      .finally(() => {
        pendingRequest = null;
      });
  }

  return pendingRequest;
};

/** Load the public footer configuration once per storefront session. */
export const useSiteSettings = (): SiteSettings => {
  const [settings, setSettings] = useState<SiteSettings>(
    cachedSettings ?? FALLBACK_SITE_SETTINGS,
  );

  useEffect(() => {
    let active = true;
    loadSiteSettings().then((data) => {
      if (active) setSettings(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return settings;
};
