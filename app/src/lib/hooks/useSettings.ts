import { useEffect, useState } from 'react';

export interface AppSettings {
  company_name?: string;
  company_address?: string;
  company_certifications?: string;
  certification?: string;
  consultant?: string;
  energy_policy_approved_by?: string;
  energy_policy_date?: string;
  [key: string]: string | undefined;
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}
