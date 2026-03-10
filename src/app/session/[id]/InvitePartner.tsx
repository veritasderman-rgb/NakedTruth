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
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Great job!</CardTitle>
          <CardDescription>
            You&apos;ve completed your part. Now invite your partner to answer the same questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!inviteLink ? (
            <form onSubmit={handleInvite} className="space-y-4">
              <Input
                type="email"
                placeholder="Partner&apos;s email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending invite..." : "Invite Partner"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">Invite link generated:</p>
              <div className="flex items-center space-x-2">
                <Input value={inviteLink} readOnly className="flex-grow" />
                <Button size="icon" variant="outline" onClick={copyLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                You can also share this link manually.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {role === 'partner_a' && !session.partner_b_user_id && (
        <p className="mt-8 text-sm text-muted-foreground text-center">
          Waiting for your partner to join and complete the session...
        </p>
      )}
    </main>
  );
}
