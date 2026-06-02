'use client';

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { invitePartner } from "@/app/actions/session";
import { track } from "@/lib/analytics";
import { Check, Copy, MessageCircle, Share, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function InvitePartner({ sessionId, session, role, tokenB }: { sessionId: string, session: any, role: string, tokenB: string }) {
  const t = useTranslations('invite');
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [emailStatus, setEmailStatus] = useState<null | { ok: boolean; detail?: string }>(null);

  const inviteLink = typeof window !== 'undefined'
    ? `${window.location.origin}/${locale}/session/${sessionId}?token=${tokenB}`
    : '';

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEmailStatus(null);
    try {
      const res = await invitePartner(sessionId, email);
      if (res.emailSent) {
        track('invite_sent', { channel: 'email' });
        setEmailStatus({ ok: true });
        setEmail("");
      } else {
        // Email failed — keep the address and tell the user to use the link instead.
        setEmailStatus({ ok: false, detail: res.emailError });
      }
    } catch (error) {
      console.error(error);
      setEmailStatus({ ok: false });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    track('invite_sent', { channel: 'copy' });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(t('whatsappText', { link: inviteLink }));
    track('invite_sent', { channel: 'whatsapp' });
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareNative = async () => {
    try {
      await navigator.share({
        title: t('title'),
        text: t('shareText'),
        url: inviteLink,
      });
      track('invite_sent', { channel: 'native' });
    } catch { /* user cancelled */ }
  };

  const waitingForPartner = role === 'partner_a' && !session.partner_b_user_id;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12">
      <Card className="w-full border-none shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Copy link */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-center">{t('shareLinkLabel')}</p>
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
              <span className="text-sm">{t('whatsapp')}</span>
            </Button>
            {canShare ? (
              <Button variant="outline" className="h-11" onClick={shareNative}>
                <Share className="h-4 w-4 mr-2" />
                <span className="text-sm">{t('share')}</span>
              </Button>
            ) : (
              <Button variant="outline" className="h-11" onClick={() => setShowQR(!showQR)}>
                <QrCode className="h-4 w-4 mr-2" />
                <span className="text-sm">{t('qr')}</span>
              </Button>
            )}
          </div>

          {!canShare && showQR && inviteLink && (
            <div className="flex flex-col items-center gap-3 py-4 animate-in fade-in duration-300">
              <QRCodeSVG value={inviteLink} size={180} level="M" />
              <p className="text-[10px] text-muted-foreground text-center">{t('qrHint')}</p>
            </div>
          )}

          {canShare && (
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full text-center text-xs text-muted-foreground underline hover:text-foreground transition-colors"
            >
              {showQR ? t('hideQr') : t('showQr')}
            </button>
          )}
          {canShare && showQR && inviteLink && (
            <div className="flex flex-col items-center gap-3 py-4 animate-in fade-in duration-300">
              <QRCodeSVG value={inviteLink} size={180} level="M" />
              <p className="text-[10px] text-muted-foreground text-center">{t('qrHint')}</p>
            </div>
          )}

          <p className="text-[10px] text-center text-muted-foreground">{t('privacyNote')}</p>

          {/* Email divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-background px-2 text-muted-foreground font-semibold">{t('emailDivider')}</span>
            </div>
          </div>

          <form onSubmit={handleInvite} className="space-y-3">
            <Input
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="secondary" className="w-full" disabled={loading || !email}>
              {loading ? t('sending') : t('sendInvite')}
            </Button>
            {emailStatus?.ok && (
              <p className="text-xs text-green-600 text-center">{t('emailSentOk')}</p>
            )}
            {emailStatus && !emailStatus.ok && (
              <p className="text-xs text-amber-600 text-center">{t('emailFailed')}</p>
            )}
          </form>
        </CardContent>
      </Card>

      <p className="mt-12 text-sm text-muted-foreground text-center animate-pulse">
        {waitingForPartner ? t('waitingForPartner') : t('waitingForCompletion')}
      </p>
    </main>
  );
}
