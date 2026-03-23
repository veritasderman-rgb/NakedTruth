'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { invitePartner } from "../../actions/session";
import { Check, Copy, MessageCircle, Share, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function InvitePartner({ sessionId, session, role, tokenB }: { sessionId: string, session: any, role: string, tokenB: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [canShare, setCanShare] = useState(false);

  const inviteLink = typeof window !== 'undefined'
    ? `${window.location.origin}/session/${sessionId}?token=${tokenB}`
    : '';

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await invitePartner(sessionId, email);
      setEmail("");
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

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Pozvi se do NakedTruth a odpověz na stejné otázky jako já. Výsledky uvidíme až oba dokončíme: ${inviteLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareNative = async () => {
    try {
      await navigator.share({
        title: 'NakedTruth — pozvánka',
        text: 'Pozvi se do NakedTruth a odpověz na stejné otázky jako já. Výsledky uvidíme až oba dokončíme.',
        url: inviteLink,
      });
    } catch { /* user cancelled */ }
  };

  const waitingForPartner = role === 'partner_a' && !session.partner_b_user_id;
  const waitingForCompletion = !waitingForPartner;

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
          {/* Copy link */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-center">Nasdílejte partnerovi tento unikátní odkaz:</p>
            <div className="flex items-center space-x-2">
              <Input value={inviteLink} readOnly className="flex-grow bg-muted text-xs" />
              <Button size="icon" variant="outline" onClick={copyLink}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-11" onClick={shareWhatsApp}>
              <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
              <span className="text-sm">WhatsApp</span>
            </Button>
            {canShare ? (
              <Button variant="outline" className="h-11" onClick={shareNative}>
                <Share className="h-4 w-4 mr-2" />
                <span className="text-sm">Sdílet</span>
              </Button>
            ) : (
              <Button variant="outline" className="h-11" onClick={() => setShowQR(!showQR)}>
                <QrCode className="h-4 w-4 mr-2" />
                <span className="text-sm">QR kód</span>
              </Button>
            )}
          </div>

          {/* QR code toggle (always available on mobile via long-press area) */}
          {!canShare && showQR && inviteLink && (
            <div className="flex flex-col items-center gap-3 py-4 animate-in fade-in duration-300">
              <QRCodeSVG value={inviteLink} size={180} level="M" />
              <p className="text-[10px] text-muted-foreground text-center">
                Partner naskenuje QR kód fotoaparátem
              </p>
            </div>
          )}

          {/* QR code for mobile (behind a toggle since they have native share) */}
          {canShare && (
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full text-center text-xs text-muted-foreground underline hover:text-foreground transition-colors"
            >
              {showQR ? 'Skrýt QR kód' : 'Zobrazit QR kód (pro skenování vedle sebe)'}
            </button>
          )}
          {canShare && showQR && inviteLink && (
            <div className="flex flex-col items-center gap-3 py-4 animate-in fade-in duration-300">
              <QRCodeSVG value={inviteLink} size={180} level="M" />
              <p className="text-[10px] text-muted-foreground text-center">
                Partner naskenuje QR kód fotoaparátem
              </p>
            </div>
          )}

          <p className="text-[10px] text-center text-muted-foreground">
            Partner uvidí otázky, ale vaše odpovědi zůstanou skryté, dokud nedokončí i on svou část.
          </p>

          {/* Email divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-background px-2 text-muted-foreground font-semibold">Nebo poslat e-mailem</span>
            </div>
          </div>

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
        </CardContent>
      </Card>

      <p className="mt-12 text-sm text-muted-foreground text-center animate-pulse">
        {waitingForPartner
          ? "Čekáme, až se partner připojí..."
          : "Čekáme na dokončení partnerem..."}
      </p>
    </main>
  );
}
