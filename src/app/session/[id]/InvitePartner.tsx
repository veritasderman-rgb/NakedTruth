'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { invitePartner } from "../../actions/session";
import { Check, Copy } from "lucide-react";

export default function InvitePartner({ sessionId, session, role }: { sessionId: string, session: any, role: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await invitePartner(sessionId, email);
      setInviteLink(res.inviteLink || "");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12">
      <Card className="w-full border-none shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Skvělá práce!</CardTitle>
          <CardDescription>
            Máte hotovo. Teď je řada na vašem partnerovi, aby odpověděl na stejné otázky.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm font-medium text-center">Nasdílejte partnerovi tento unikátní odkaz:</p>
            <div className="flex items-center space-x-2">
              <Input value={inviteLink} readOnly className="flex-grow bg-muted" />
              <Button size="icon" variant="outline" onClick={copyLink}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground">
              Partner uvidí otázky, ale vaše odpovědi zůstanou skryté, dokud nedokončí i on svou část.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-background px-2 text-muted-foreground font-semibold">Nebo poslat e-mailem</span>
            </div>
          </div>

          {!inviteLink.includes('undefined') && (
            <form onSubmit={handleInvite} className="space-y-3">
              <Input
                type="email"
                placeholder="Partnerův e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" variant="secondary" className="w-full" disabled={loading || !email}>
                {loading ? "Odesílám..." : "Poslat pozvánku"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="mt-12 text-sm text-muted-foreground text-center animate-pulse">
        {role === 'partner_a' && !session.partner_b_user_id
          ? "Čekáme, až se partner připojí..."
          : "Čekáme na dokončení partnerem..."}
      </p>
    </main>
  );
}
