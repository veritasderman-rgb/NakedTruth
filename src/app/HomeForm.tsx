'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startSession } from "./actions/session";

export default function HomeForm({ isConfigured, missingVars }: { isConfigured: boolean, missingVars: string[] }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="w-full">
      {!isConfigured && (
        <div className="mt-8 rounded-md bg-yellow-50 p-4 text-left text-xs text-yellow-800 border border-yellow-200">
          <p className="font-bold text-sm">Configuration Missing</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {missingVars.map(v => <li key={v}>{v}</li>)}
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
    </div>
  );
}
