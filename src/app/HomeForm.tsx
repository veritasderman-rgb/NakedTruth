'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startSession } from "./actions/session";

export default function HomeForm({ isConfigured, missingVars }: { isConfigured: boolean, missingVars: string[] }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (emailToUse?: string) => {
    setLoading(true);
    setError(null);
    try {
      await startSession(emailToUse);
    } catch (err: any) {
      console.error("Failed to start session:", err);
      setError(err.message || "Něco se nepovedlo. Zkontrolujte připojení k databázi.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {!isConfigured && (
        <div className="mt-8 rounded-md bg-yellow-50 p-4 text-left text-xs text-yellow-800 border border-yellow-200">
          <p className="font-bold text-sm">Chybí konfigurace</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {missingVars.map(v => <li key={v}>{v}</li>)}
          </ul>
          <p className="mt-2">Přidejte tyto proměnné do nastavení projektu na Vercelu.</p>
        </div>
      )}

      <div className="mt-10 space-y-6">
        <form
          onSubmit={(e) => { e.preventDefault(); handleStart(email); }}
          className="space-y-3"
        >
          <div className="space-y-1 text-left">
            <label className="text-xs font-medium text-muted-foreground ml-1">E-mail (pro zaslání výsledků)</label>
            <Input
              type="email"
              placeholder="vás@email.cz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isConfigured || loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !isConfigured || !email}>
            {loading ? "Startuji..." : "Začít s e-mailem"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Nebo</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleStart()}
            disabled={loading || !isConfigured}
          >
            {loading ? "Startuji..." : "Začít anonymně"}
          </Button>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Při anonymním vstupu budete muset odkaz partnerovi poslat ručně. Výsledky se nebudou mít kam uložit pro pozdější přístup.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
