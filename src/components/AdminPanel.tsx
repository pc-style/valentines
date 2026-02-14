import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/hooks/useAuth";
import type { Photo } from "@/hooks/usePhotos";

function LoginForm({ onLogin, onRegister }: {
  onLogin: (username: string) => Promise<void>;
  onRegister: (username: string, key: string) => Promise<void>;
}) {
  const [username, setUsername] = useState<"adas" | "roksanka">("adas");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [registrationKey, setRegistrationKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await onLogin(username);
      } else {
        await onRegister(username, registrationKey);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="font-serif text-sm text-drift-text/70">Uzytkownik</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setUsername("adas")}
            className={`flex-1 rounded-lg px-3 py-2 font-serif text-sm transition-colors ${
              username === "adas"
                ? "bg-drift-rose/20 text-drift-rose ring-1 ring-drift-rose/30"
                : "bg-white/50 text-drift-text/60 hover:bg-white/80"
            }`}
          >
            adas
          </button>
          <button
            type="button"
            onClick={() => setUsername("roksanka")}
            className={`flex-1 rounded-lg px-3 py-2 font-serif text-sm transition-colors ${
              username === "roksanka"
                ? "bg-drift-rose/20 text-drift-rose ring-1 ring-drift-rose/30"
                : "bg-white/50 text-drift-text/60 hover:bg-white/80"
            }`}
          >
            roksanka
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`text-xs font-serif ${mode === "login" ? "text-drift-rose underline" : "text-drift-text/40"}`}
        >
          Zaloguj sie
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`text-xs font-serif ${mode === "register" ? "text-drift-rose underline" : "text-drift-text/40"}`}
        >
          Zarejestruj klucz
        </button>
      </div>

      {mode === "register" && (
        <input
          type="password"
          value={registrationKey}
          onChange={(e) => setRegistrationKey(e.target.value)}
          placeholder="Klucz rejestracji"
          className="rounded-lg border border-drift-rose/20 bg-white/50 px-3 py-2 font-serif text-sm text-drift-text placeholder:text-drift-text/30 focus:outline-none focus:ring-1 focus:ring-drift-rose/40"
        />
      )}

      {error && <p className="font-serif text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-drift-rose/80 px-4 py-2 font-serif text-sm text-white transition-colors hover:bg-drift-rose disabled:opacity-50"
      >
        {loading ? "..." : mode === "login" ? "Zaloguj z kluczem" : "Zarejestruj klucz"}
      </button>
    </form>
  );
}

function UploadForm({ onUpload }: { onUpload: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [section, setSection] = useState<"polaroid" | "film">("polaroid");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ filename: file.name, section });
      if (date) params.set("date", date);
      if (message) params.set("message", message);

      const res = await fetch(`/api/photos/upload?${params}`, {
        method: "POST",
        body: file,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      setFile(null);
      setDate("");
      setMessage("");
      if (fileRef.current) fileRef.current.value = "";
      onUpload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-3">
      <label className="font-serif text-sm font-medium text-drift-text/70">Dodaj zdjecie</label>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="font-serif text-xs text-drift-text/60"
      />

      <input
        type="text"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        placeholder="Data (np. 14 lutego 2026)"
        className="rounded-lg border border-drift-rose/20 bg-white/50 px-3 py-2 font-serif text-sm text-drift-text placeholder:text-drift-text/30 focus:outline-none focus:ring-1 focus:ring-drift-rose/40"
      />

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Wiadomosc (domyslnie <3)"
        className="rounded-lg border border-drift-rose/20 bg-white/50 px-3 py-2 font-serif text-sm text-drift-text placeholder:text-drift-text/30 focus:outline-none focus:ring-1 focus:ring-drift-rose/40"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setSection("polaroid")}
          className={`flex-1 rounded-lg px-3 py-1.5 font-serif text-xs transition-colors ${
            section === "polaroid"
              ? "bg-drift-rose/20 text-drift-rose ring-1 ring-drift-rose/30"
              : "bg-white/50 text-drift-text/60"
          }`}
        >
          Polaroid
        </button>
        <button
          type="button"
          onClick={() => setSection("film")}
          className={`flex-1 rounded-lg px-3 py-1.5 font-serif text-xs transition-colors ${
            section === "film"
              ? "bg-drift-rose/20 text-drift-rose ring-1 ring-drift-rose/30"
              : "bg-white/50 text-drift-text/60"
          }`}
        >
          Film
        </button>
      </div>

      {error && <p className="font-serif text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={uploading || !file}
        className="rounded-lg bg-drift-rose/80 px-4 py-2 font-serif text-sm text-white transition-colors hover:bg-drift-rose disabled:opacity-50"
      >
        {uploading ? "Wysylanie..." : "Dodaj zdjecie"}
      </button>
    </form>
  );
}

function EditableMessage({ photo, onSave }: { photo: Photo; onSave: () => void }) {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(photo.message);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!photo.id || message === photo.message) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await fetch(`/api/photos/${photo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      onSave();
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className="cursor-pointer border-b border-dashed border-drift-rose/30 hover:border-drift-rose/60"
        title="Kliknij aby edytowac"
      >
        {photo.message}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <input
        autoFocus
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
        className="w-full rounded border border-drift-rose/30 bg-white/80 px-2 py-0.5 font-serif text-sm text-drift-text focus:outline-none focus:ring-1 focus:ring-drift-rose/40"
        disabled={saving}
      />
      <button onClick={save} disabled={saving} className="text-xs text-drift-rose hover:text-drift-rose/80">
        {saving ? "..." : "OK"}
      </button>
    </span>
  );
}

export function AdminPanel({ onPhotosChange }: { onPhotosChange: () => void }) {
  const { authenticated, username, loading, login, register, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) return null;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-drift-rose/20 text-drift-rose/60 shadow-lg backdrop-blur-sm transition-colors hover:bg-drift-rose/30 hover:text-drift-rose"
        title="Panel administracyjny"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 right-0 top-0 z-50 w-80 overflow-y-auto bg-drift-cream/95 p-6 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg italic text-drift-text">Panel</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="text-drift-text/40 hover:text-drift-text/60"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {!authenticated ? (
                <LoginForm onLogin={login} onRegister={register} />
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm text-drift-text/70">
                      Zalogowano jako <strong className="text-drift-rose">{username}</strong>
                    </span>
                    <button
                      onClick={logout}
                      className="font-serif text-xs text-drift-text/40 hover:text-drift-text/60"
                    >
                      Wyloguj
                    </button>
                  </div>

                  <div className="h-px bg-drift-rose/10" />

                  <UploadForm onUpload={onPhotosChange} />
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export { EditableMessage };
