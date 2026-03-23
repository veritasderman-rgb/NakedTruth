# NakedTruth — Rozvojový plán aplikace

> Poslední aktualizace: 2026-03-23

---

## Aktuální stav (co už funguje)

| Funkce | Stav |
|---|---|
| Landing page s konfigurátorem (tier, počet otázek, email/anonym) | ✅ Hotovo |
| Supabase backend (sessions, questions, answers, couples, users) | ✅ Hotovo |
| Quiz flow — Partner A odpovídá na otázky | ✅ Hotovo |
| Invite Partner — kopírovatelný link + email pozvánka (Resend) | ✅ Hotovo |
| Quiz flow — Partner B odpovídá přes unikátní odkaz | ✅ Hotovo |
| Comparison View — odpovědi vedle sebe s označením shody | ✅ Hotovo |
| Generování dalšího kola (non-repeating otázky) | ✅ Hotovo |
| Banka otázek (~50+ seedovaných, tier_1/tier_2, 3 typy) | ✅ Základ hotov |
| Token-based přístup k session | ✅ Hotovo |

**Tech stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Shadcn UI, Supabase (Postgres + RPC), Resend

---

## Fáze 1 — Dotažení MVP do produkční kvality (P0)

Cíl: Aby se dalo hrát bez tření, s dostatečně velkou bankou otázek.

### 1.1 Rozšíření banky otázek
- [ ] Minimálně **100 tier_1** (vztahové) + **100 tier_2** (intimní) otázek
- [ ] Kvalitní česky psané otázky — ne strojový překlad, záleží na nuancích
- [ ] Rovnoměrné zastoupení typů: yes_no, frequency_1_5, short_answer
- [ ] Tagování dle podkategorií (komunikace, důvěra, intimita, budoucnost, fantazie...)

### 1.2 UX vylepšení reveal stránky
- [ ] Postupné odhalování otázek (klik/swipe pro další) místo scrollování
- [ ] Animace při revealu odpovědí (fade-in, flip card efekt)
- [ ] Celkové skóre shody nahoře (např. "Shodli jste se v 7 z 10 otázek")
- [ ] Mobilní optimalizace (swipe gesta)

### 1.3 Sdílení odkazu — rozšíření
- [ ] Tlačítko "Sdílet přes WhatsApp" (prefilled message s odkazem)
- [ ] Tlačítko "Sdílet přes Messenger / SMS"
- [ ] QR kód pro situace kdy sedíte vedle sebe
- [ ] Web Share API na mobilech (nativní share sheet)

### 1.4 Error handling a edge cases
- [ ] Co se stane při výpadku spojení uprostřed kvízu (uložit partial progress)
- [ ] Validace na backendu — zabránit dvojitému submitu
- [ ] Loading states a skeleton UI
- [ ] 404 / expired session handling

**Odhad:** 1–2 týdny

---

## Fáze 2 — Monetizace (P1)

Cíl: První koruna z produktu.

### 2.1 Autentizace a uživatelské účty
- [ ] Supabase Auth — magic link přes email
- [ ] Volitelně Google OAuth
- [ ] Propojení existujících anonymních session s nově vytvořeným účtem
- [ ] Profil s historií (viz 3.3)

### 2.2 Stripe paywall
- [ ] Integrace Stripe Checkout (CZK)
- [ ] Free tier: 1 kompletní kvíz zdarma, pak max 2 session/měsíc po 5 otázkách
- [ ] Premium: 99 CZK/měsíc nebo 699 CZK/rok
- [ ] Stripe Customer Portal pro správu předplatného
- [ ] Webhook handling (subscription created/cancelled/renewed)

### 2.3 Premium obsah
- [ ] Otázky rozdělené na free / premium
- [ ] Tematické balíčky: "Hluboký ponor do intimity", "Budoucnost ve dvou", "Fantazie bez filtrů"
- [ ] Upsell screen po dokončení free kvízu

### 2.4 Email notifikace (transakční)
- [ ] Reminder pro Partnera B pokud neodpověděl do 24h
- [ ] Notifikace "Výsledky jsou připraveny" (oba dokončili)
- [ ] Welcome email po registraci
- [ ] Weekly digest s nabídkou nového kola (retence)
- Resend je už integrovaný — jde o rozšíření stávajícího systému

**Odhad:** 2–3 týdny

---

## Fáze 3 — Viralita a retence (P2)

Cíl: Organický růst a důvod se vracet.

### 3.1 Sdílitelné výsledky (OG images)
- [ ] Server-side generovaný obrázek se shrnutím kvízu
- [ ] Formát: "Naše shoda: 73%" / "V 7 z 10 otázek jsme si odpověděli stejně!"
- [ ] Instagram Story formát (1080×1920) + čtvercový pro feed
- [ ] Technicky: Vercel OG / Satori
- [ ] Tlačítko "Sdílet výsledky" na reveal stránce

### 3.2 Skóre a match metriky
- [ ] Algoritmus pro porovnání odpovědí — číselné skóre
- [ ] Kategorie shody ("Jste na stejné vlně" / "Máte o čem mluvit" / "Překvapení čeká")
- [ ] Per-kategorie breakdown (intimita: 80%, komunikace: 60%...)
- [ ] Vizuální grafy (radar chart / bar chart)

### 3.3 Historie kvízů a dashboard
- [ ] Přehled minulých kol s výsledky
- [ ] Vývoj skóre v čase (trend graf)
- [ ] "Zahrajte si znovu za měsíc a porovnejte" CTA
- [ ] Dashboard jako hlavní stránka pro přihlášené uživatele

### 3.4 PWA (Progressive Web App)
- [ ] Web App Manifest + service worker
- [ ] Instalace na plochu telefonu
- [ ] Push notifikace (Web Push API) pro remindery
- [ ] Offline fallback stránka

**Odhad:** 3–4 týdny

---

## Fáze 4 — B2B funkce (P3)

Cíl: Komerční partnerství s terapeuty a dalšími B2B klienty.

### 4.1 Terapeut dashboard
- [ ] Oddělené rozhraní `/therapist`
- [ ] Vytváření session pro klientský pár
- [ ] Výběr specifických otázek jako "domácí úkol"
- [ ] Přehled výsledků (se souhlasem páru)
- [ ] Role-based access v Supabase (RLS policies)
- [ ] Onboarding flow pro terapeuty

### 4.2 Admin panel
- [ ] CRUD správa otázek
- [ ] Analytika: sessions, completion rate, konverze free→paid, churn
- [ ] Moderace obsahu (short_answer odpovědi)
- [ ] Možnost: Payload CMS nebo custom admin

### 4.3 Affiliate / referral systém
- [ ] Referral kódy pro terapeuty a influencery
- [ ] Tracking konverzí (UTM + Stripe coupon)
- [ ] Automatická provize / slevy
- [ ] Dashboard pro affiliate partnery

**Odhad:** 4–6 týdnů

---

## Fáze 5 — Škálování a expanze (P4)

Cíl: Nové trhy a diferenciace.

### 5.1 Lokalizace (i18n)
- [ ] Next.js i18n routing
- [ ] Slovenština (nejsnazší — 90% hotová přes Czech)
- [ ] Angličtina
- [ ] Němčina (pro DACH trh)
- [ ] Profesionální překlad otázek — ne strojový, záleží na kulturním kontextu

### 5.2 AI-generované follow-up otázky
- [ ] Na základě odpovědí páru nabídnout personalizované navazující otázky
- [ ] API call na Claude pro generování
- [ ] Kontextově relevantní — "Oba jste řekli X, co kdybyste zkusili...?"
- [ ] Rate limiting a caching

### 5.3 Nativní mobilní app
- [ ] Až po validaci PMF (5,000+ MAU)
- [ ] React Native / Expo (sdílení kódu s webem)
- [ ] Push notifikace (native)
- [ ] Offline podpora
- [ ] Pozor na 30% App Store daň — zvážit web payment

---

## Souhrnná prioritizace

| Co | Náročnost | Dopad | Priorita |
|---|---|---|---|
| Rozšíření banky otázek (200+) | 1 týden (content) | Kvalita zážitku | P0 |
| UX vylepšení reveal stránky | 3–5 dní | Engagement + WOW moment | P0 |
| Rozšíření sdílení (WhatsApp, QR) | 2–3 dny | Completion rate | P0 |
| Error handling + edge cases | 2–3 dny | Produkční stabilita | P0 |
| Email notifikace (reminders) | 2–3 dny | +40% completion rate | P1 |
| Auth + uživatelské účty | 3–5 dní | Nutné pro monetizaci | P1 |
| Stripe paywall | 3–5 dní | Revenue | P1 |
| Sdílitelné výsledky (OG images) | 3–5 dní | Hlavní virální páka | P1 |
| Skóre / match metriky | 2–3 dny | Engagement + sdílení | P2 |
| PWA + push notifikace | 2–3 dny | Retence | P2 |
| Historie kvízů + dashboard | 1 týden | Retence + upsell | P2 |
| Terapeut dashboard | 2–3 týdny | B2B revenue | P3 |
| Admin panel | 1–2 týdny | Operační efektivita | P3 |
| Affiliate systém | 1 týden | Distribuce | P3 |
| i18n (SK, EN, DE) | 1–2 týdny + překlady | Expanze trhu | P4 |
| AI follow-up otázky | 1 týden | Diferenciace | P4 |
| Nativní mobilní app | 6–8 týdnů | Škálování | P4 |

---

## Časový odhad od teď k milníkům

| Milník | Odhad |
|---|---|
| Produkční MVP (P0 hotovo) | 1–2 týdny |
| První revenue (P1 hotovo) | +2–3 týdny |
| Virální loop (P2 hotovo) | +3–4 týdny |
| B2B ready (P3 hotovo) | +4–6 týdnů |
| Multi-market (P4) | +průběžně |

**Realisticky:** Od aktuálního stavu k plně monetizovanému produktu s virálním potenciálem = **6–8 týdnů po večerech, 4–5 týdnů full-time.** Základ pro letní sezónu (svatby, dovolené, spa pobyty) je dosažitelný, pokud se začne teď.
