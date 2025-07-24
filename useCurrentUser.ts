'use client';
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getUser() {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      if (mounted) {
        setUser(data?.user || null);
        setLoading(false);
      }
    }

    getUser();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
} 