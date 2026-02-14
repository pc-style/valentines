import { useState, useEffect, useCallback } from "react";
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";

interface AuthState {
  authenticated: boolean;
  username: string | null;
  loading: boolean;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    authenticated: false,
    username: null,
    loading: true,
  });

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setAuth({ authenticated: data.authenticated, username: data.username || null, loading: false });
    } catch {
      setAuth({ authenticated: false, username: null, loading: false });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setAuth({ authenticated: data.authenticated, username: data.username || null, loading: false });
      })
      .catch(() => {
        if (!cancelled) setAuth({ authenticated: false, username: null, loading: false });
      });
    return () => { cancelled = true; };
  }, []);

  const register = async (username: string, registrationKey: string) => {
    const optionsRes = await fetch("/api/webauthn/register/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, registrationKey }),
    });

    if (!optionsRes.ok) {
      const err = await optionsRes.json();
      throw new Error(err.error || "Failed to get registration options");
    }

    const options = await optionsRes.json();
    const credential = await startRegistration({ optionsJSON: options });

    const verifyRes = await fetch("/api/webauthn/register/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, credential }),
    });

    if (!verifyRes.ok) {
      const err = await verifyRes.json();
      throw new Error(err.error || "Registration verification failed");
    }

    await checkAuth();
  };

  const login = async (username: string) => {
    const optionsRes = await fetch("/api/webauthn/authenticate/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (!optionsRes.ok) {
      const err = await optionsRes.json();
      throw new Error(err.error || "Failed to get authentication options");
    }

    const options = await optionsRes.json();
    const credential = await startAuthentication({ optionsJSON: options });

    const verifyRes = await fetch("/api/webauthn/authenticate/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, credential }),
    });

    if (!verifyRes.ok) {
      const err = await verifyRes.json();
      throw new Error(err.error || "Authentication failed");
    }

    await checkAuth();
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuth({ authenticated: false, username: null, loading: false });
  };

  return { ...auth, register, login, logout };
}
