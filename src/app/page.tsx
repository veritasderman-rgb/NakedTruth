'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startSession } from "./actions/session";

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    appUrl: !!process.env.NEXT_PUBLIC_APP_URL,
  };

  const isConfigured = config.supabaseUrl && config.supabaseAnonKey && config.supabaseServiceKey;

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      await startSession(email);
    } catch (err: any) {
      console.error("Failed to start session:", err);
      setError(err.message || "Something went wrong. Please check your database connection.");
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        NakedTruth · Beta
      </span>
      <h1 className="text-balance text-4xl font-semibold tracking-tight">
        Get closer with blind-answer sessions.
      </h1>
      <p className="mt-4 text-pretty text-sm text-muted-foreground">
        Each partner answers the same questions privately. Compare answers only when both are done.
      </p>

      {!isConfigured && (
        <div className="mt-8 rounded-md bg-yellow-50 p-4 text-left text-xs text-yellow-800 border border-yellow-200">
          <p className="font-bold text-sm">Configuration Missing</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {!config.supabaseUrl && <li>NEXT_PUBLIC_SUPABASE_URL</li>}
            {!config.supabaseAnonKey && <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>}
            {!config.supabaseServiceKey && <li>SUPABASE_SERVICE_ROLE_KEY</li>}
            {!config.appUrl && <li>NEXT_PUBLIC_APP_URL (Recommended)</li>}
          </ul>
          <p className="mt-2">Please add these to your Vercel Project Settings {'>'} Environment Variables.</p>
        </div>
      )}

      <form onSubmit={handleStart} className="mt-8 w-full space-y-4">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={!isConfigured}
        />
        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={loading || !isConfigured}>
          {loading ? "Starting..." : "Start your first session"}
        </Button>
      </form>
    </main>
  );
}
