# NakedTruth — UX audit & komercializační plán

> Zpracováno: 2026-06-01 · Rozpočet na propagaci: **10 000 Kč**
> Podklad: analýza repozitáře (Next.js 15 / React 19 / Supabase / Resend), 300 seedovaných otázek (100 tier_1 + 200 tier_2), kompletní flow landing → kvíz → pozvánka → porovnání.

---

## 0. TL;DR

- **Produkt je technicky hotové MVP** s nadprůměrně dobrým reveal momentem (progresivní odhalování + % shody + sdílení). To je největší aktivum a virální páka.
- **3 věci blokují monetizaci a placenou propagaci:** (1) chybí měření funnelu (analytika), (2) chybí 18+ gate a silné privacy/trust prvky nutné pro intimní obsah i pro schválení reklam, (3) chybí jakýkoli platební mechanismus.
- **Doporučený model:** Freemium s **jednorázovým odemčením páru za 199 Kč** jako hero nabídkou + tematické balíčky 79–99 Kč jako upsell. Předplatné jen jako sekundární volba. (Páry nehrají denně → subscription churn je vysoký, impulzní jednorázový nákup konvertuje líp.)
- **10 000 Kč utratit jako validační/seed rozpočet**, ne jako výkonnostní kanál — těžiště na mikro-influencery + virální smyčku, malý ad test.
- **Realistický výhled:** paid akvizice se sama o sobě při 10k *nezaplatí v měsíci 1*. Zisk přichází přes virální koeficient + opakované nákupy + B2B (terapeuti) v horizontu **3–6 měsíců**. Modelované scénáře níže.

---

## ČÁST A — UX AUDIT

Hodnoceno po obrazovkách. Značení: 🟢 funguje dobře · 🟡 drobnost · 🔴 blokátor konverze/růstu.

### A.1 Landing page (`page.tsx`, `HomeForm.tsx`)

🟢 **Co je dobré**
- Jasný value prop v češtině: „Každý odpovídá soukromě, výsledky uvidíte společně až oba dokončíte." To je přesně ten háček.
- Konfigurátor (tier / počet otázek / e-mail vs. anonym) dává uživateli kontrolu hned na startu.
- Vizuálně čistý Shadcn/Tailwind, mobile-first `max-w-md`.

🔴 **Blokátory**
1. **Chybí „jak to funguje" ve 3 krocích a ukázka otázek.** Uživatel se rozhoduje naslepo. U intimního obsahu je to brzdou — přidat 2–3 sample otázky (blur efekt) jako teaser.
2. **Žádné trust/privacy ujištění nad záhybem.** U obsahu „pod peřinou" je důvěra rozhodující. Chybí: „Odpovědi vidíte jen vy dva", „Nic neukládáme veřejně", odkaz na mazání dat. Bez toho velká část lidí neklikne.
3. **Konfigurační warning (`Chybí konfigurace` se jmény ENV proměnných) se renderuje koncovému uživateli.** Leakuje interní detaily a působí rozbitě. Schovat za `NODE_ENV !== 'production'`.

🟡 **Drobnosti**
- Dvě soupeřící CTA („Začít s e-mailem" vs. „Začít anonymně") bez vizuální hierarchie — nejasné, co je doporučené.
- Default 20 otázek je možná moc na první dojem; první kolo by mělo být kratší (5–10) kvůli completion rate a virálnímu loopu.
- E-mail validace jen `type=email` + `!email` — chybí kontrola formátu/typo (gmial.com apod.).

### A.2 Kvíz (`QuestionnaireForm.tsx`)

🟢 Jedna otázka na obrazovku, progress bar, tlačítko Zpět, per-otázkové škálové popisky (1=…, 5=…). Slušné.

🔴 **Blokátory**
1. **Žádné průběžné ukládání.** Odpovědi žijí jen ve stavu Reactu — zavření prohlížeče / refresh = ztráta celého kola. U 20–40 otázek to znamená vysoký drop-off. (ROADMAP to zná, ale je to P0 pro placenou návštěvnost — neplaťte za kliky, které pak ztratíte.)
2. **`window.location.reload()` po odeslání** je trhavý, vypadá to jako chyba. Nahradit `router.refresh()` / přechodem se stavem „odesláno".

🟡 **Drobnosti**
- Logika `handleBack` (pop posledního prvku z pole) je křehká — při více skocích zpět se index a pole můžou rozejít.
- Nelze otázku přeskočit; u citlivé otázky to uživatele může zaseknout.
- `short_answer` bez nápovědy k délce / počtu znaků.

### A.3 Pozvánka partnera (`InvitePartner.tsx`)

🟢 Výborné pokrytí sdílení: kopírovat link, WhatsApp, nativní share, QR, e-mail. Tohle je hotové dobře.

🔴 **Blokátory**
1. **Stav „Čekáme na partnera" je statický.** Žádný realtime ani polling — uživatel musí ručně refreshovat, aby zjistil, že partner dokončil. Supabase Realtime je dostupné zdarma; tohle výrazně zlepší dokončenost druhého kola revealu.
2. **Žádný automatický reminder partnerovi B.** Resend je integrovaný, ale follow-up po 24 h chybí — to je dle ROADMAPu +40 % completion. Klíčové pro virální K-faktor.

🟡 Pozvánkový e-mail je **v angličtině** (`mail.ts`), zbytek appky v češtině — nekonzistentní, působí podezřele (spam dojem).

### A.4 Porovnání výsledků (`ComparisonView.tsx`)

🟢 **Nejsilnější obrazovka.** Progresivní odhalování, animace, % shody, slovní kategorie, sdílení. Tohle je WOW moment i virální spouštěč zároveň. Dobře navržené.

🔴 **Blokátory pro růst**
1. **Sdílí se jen textový odkaz, ne obrázek.** Hlavní virální páka (OG „Naše shoda: 73 %" pro IG Story 1080×1920) chybí. Tohle je #1 organická páka — viz ROADMAP P2, ale prioritu bych zvedl.
2. **Partner A / Partner B = generické štítky.** Uživatel netuší, kdo je „já". Zmást → ztráta emoce. Stačí jednoduchá jména/přezdívky na startu.
3. **„Další kolo" přesměruje jen partnera A.** Anonymní partner B se k novému kolu nedostane → smyčka se rozpadá.

🟡 `short_answer` se počítá mimo skóre (správně), ale uživateli to není nikde vysvětleno.

### A.5 Průřezově — to nejdůležitější před utracením 10 000 Kč

| # | Problém | Proč to blokuje peníze |
|---|---|---|
| 1 | 🔴 **Žádná analytika** (PostHog/GA/Plausible) | Nemůžete měřit funnel ani CPA → 10k utratíte naslepo. **Musí být první.** |
| 2 | 🔴 **Žádný 18+ gate** u tier_2 obsahu | Meta i Google reklamy na sexuální obsah vyžadují ověření věku; bez něj reklamu zamítnou / účet zablokují. |
| 3 | 🔴 **Žádný platební mechanismus** | Není co monetizovat. |
| 4 | 🔴 **Privacy/mazání dat, souhlas, ToS** | Citlivá data (intimita) = GDPR riziko + nutné pro důvěru. |
| 5 | 🟡 Jen čeština | OK pro start (CZ trh), SK je skoro zdarma navrch. |
| 6 | 🟡 Anonymní flow „výsledky se neuloží" | Tření; po monetizaci tlačit na účet/magic link. |

**Závěr auditu:** Produkt je z 80 % hotový a reveal moment je nadprůměrný. Před propagací je ale nutné dodělat **měření + 18+/privacy + platby**. Bez prvních dvou nemá smysl utrácet za reklamu vůbec.

---

## ČÁST B — KOMERCIALIZAČNÍ MODEL

### B.1 Volba modelu — proč ne čisté předplatné

ROADMAP počítá s předplatným (99 Kč/měs, 699 Kč/rok). Pro tento typ produktu to doporučuji **přehodnotit jako primární model**:

- Páry hrají **příležitostně** (večer, na rande, o víkendu), ne denně → není to návykový habit jako Duolingo. Předplatné má proto vysoký churn po 1. měsíci.
- Nákup je **impulzní a emoční** (jsme spolu, chceme se poznat teď) → líp sedí jednorázová mikro-transakce.

**Doporučený model: Freemium + jednorázové odemčení + balíčky (hybrid).**

| Vrstva | Cena | Co obsahuje |
|---|---|---|
| **Free** | 0 Kč | 1 plné kolo zdarma (10 otázek, jen tier_1) — naplno funguje reveal + sdílení (virální háček musí být zdarma!) |
| **Couple Unlock** ⭐ hero | **199 Kč jednorázově / pár, napořád** | Neomezená kola, plný přístup k tier_1, historie, OG sdílení výsledků |
| **Tematické balíčky** (upsell) | 79–99 Kč / balíček | „Pod peřinou", „Budoucnost ve dvou", „Fantazie bez filtrů", „Po hádce" |
| **Předplatné** (sekundární) | 99 Kč/měs · 699 Kč/rok | Pro power-uživatele: vše + nové balíčky každý měsíc + AI follow-up otázky |
| **B2B — terapeuti** | 299–499 Kč/měs | Dashboard, otázky jako „domácí úkol", reporty (se souhlasem páru) |

Hero nabídka = **199 Kč one-time za pár**. Nízká bariéra, „zaplatí jeden, hrají dva", emoční dárek. Předplatné necháváme jako možnost, ne jako hlavní zeď.

### B.2 Kde postavit paywall (psychologie)

Paywall **až po prvním kompletním revealu zdarma.** Uživatel musí nejdřív zažít WOW (% shody, sdílení), pak teprve narazí na zeď u „Dalšího kola" nebo u tier_2 obsahu. Tehdy je ochota platit nejvyšší. Upsell screen: *„Líbilo se vám to? Odemkněte všechna kola a peprnější otázky — 199 Kč napořád, pro oba."*

### B.3 Funkcionality nutné pro monetizaci (priorita)

Seřazeno dle poměru dopad/náročnost — co dodělat **před** 10k kampaní a co po ní.

**P0 — MUSÍ být před spuštěním propagace (cca 5–8 dní práce):**
1. **Analytika + funnel eventy** (PostHog zdarma): start → dokončení kola → pozvánka odeslána → partner dokončil → reveal → klik na sdílení → nákup. Bez toho neměříte CPA.
2. **18+ gate + privacy/ToS + mazání dat** (právní i reklamní nutnost).
3. **Stripe Checkout (CZK)** + 1 produkt „Couple Unlock 199 Kč" + webhook.
4. **Průběžné ukládání kvízu** (proti ztrátě placené návštěvnosti).
5. **Zkrácené první kolo na 10 otázek** zdarma (completion + virální loop).
6. **Sjednotit pozvánkový e-mail do češtiny.**

**P1 — hned po spuštění (zvyšuje ROAS):**
7. **OG obrázek výsledku** („Naše shoda: 73 %", IG Story formát) — hlavní organická páka.
8. **Realtime stav partnera + reminder e-mail po 24 h** (+completion).
9. **Jména/přezdívky** místo Partner A/B.
10. **Magic-link účet** (retence + opakovaný nákup balíčků).

**P2 — škálování:**
11. Tematické balíčky jako samostatné produkty (upsell).
12. Per-kategorie breakdown shody (radar chart) — sdílitelné.
13. B2B dashboard pro terapeuty.

### B.4 Náklady na provoz (marže)

- Vercel + Supabase: free tier pokryje start, ~600 Kč/měs (~$25) při škálování.
- Resend: 3 000 e-mailů/měs zdarma.
- Stripe EU: ~1,4 % + 6 Kč / transakce → z 199 Kč zůstane ~190 Kč.
- **Hrubá marže ~90 %** (digitální obsah). To je klíčové pro návratnost.

---

## ČÁST C — ROZPOČET 10 000 Kč NA PROPAGACI

**Princip:** 10k je málo na výkonnostní reklamu (CZ trh). Ber to jako **validační/seed rozpočet** — těžiště na virální smyčku a mikro-influencery, malý A/B ad test pro data.

| Položka | Částka | Co za to |
|---|---|---|
| **Mikro-influenceři (CZ, páry/lifestyle/vztahy)** | **4 000 Kč** | 2–4 tvůrci na IG/TikTok (5–30k followerů), kombinace baráž + drobný honorář. Autentické „my dva jsme to zkusili" video s reveal momentem. **Nejlepší ROI na tomto trhu.** |
| **Meta/IG ads test** | **3 000 Kč** | 2–3 kreativy × ~1 000 Kč, cíl = *dokončené kolo* (ne klik). Targeting 18+, páry, vztahy, ČR. Účel: získat CPA data, ne škálovat. |
| **Vizuály / branding / OG kreativy** | **1 200 Kč** | Canva Pro (~1 měs) + grafika pro OG sdílení a reklamy. |
| **Doména + drobnosti** | **800 Kč** | `.cz` doména na rok, vizitka projektu. |
| **Rezerva / re-investice do vítězného kanálu** | **1 000 Kč** | Přihodit na ten kanál, který v testu vyjde nejlíp. |
| **Celkem** | **10 000 Kč** | |

Analytika (PostHog), Vercel, Supabase, Resend zůstávají na free tierech → 0 Kč.

**Sezónní timing:** spustit směřovat na léto (festivaly, dovolené ve dvou), Valentýn, výročí. ROADMAP zmiňuje svatby/spa — relevantní pro influencer seeding.

---

## ČÁST D — ODHADOVANÝ ZISK (3 scénáře)

Upřímně: **paid akvizice se z 10k v měsíci 1 sama nezaplatí.** Hodnota je ve virální smyčce a opakování. Níže poctivý model, ne hokejka.

### Předpoklady
- Hero produkt 199 Kč, marže ~90 % → ~179 Kč zisk/nákup.
- Virální koeficient: každé hrající kolo zve partnera (vestavěné) + sdílení výsledku → konzervativně **+0,3 nového páru** na zapojený pár.
- Konverze zapojený pár → platba: 3–6 % (impulzní mikro-cena).

### Funnel z 10 000 Kč (mix influenceři + ads + organika)

| | Konzervativní | Bazický | Optimistický |
|---|---|---|---|
| Zásah (imprese) | 25 000 | 50 000 | 100 000 |
| Návštěvy landingu | 2 000 | 4 000 | 8 000 |
| Začne kolo (~40 %) | 800 | 1 600 | 3 200 |
| Dokončí oba partneři | 480 | 1 040 | 2 240 |
| + virální přírůstek (×1,3) | 624 | 1 350 | 2 900 |
| **Zapojené páry celkem** | **~620** | **~1 350** | **~2 900** |
| Konverze na platbu | 3 % | 4,5 % | 6 % |
| **Platící páry** | **~19** | **~61** | **~174** |
| Tržby (×199 Kč) | 3 700 Kč | 12 100 Kč | 34 600 Kč |
| **Zisk po marži (×179)** | **~3 300 Kč** | **~10 900 Kč** | **~31 100 Kč** |
| **vs. 10k spend** | **−6 700 Kč** | **+900 Kč** | **+21 100 Kč** |

### Výhled na 3–6 měsíců (proč se to vyplatí)
Měsíc 1 je o **datech a virálním zasetí**, ne o zisku. Pokud virální koeficient drží a přidají se:
- **opakované nákupy balíčků** (79–99 Kč) u ~20 % platících,
- **organický růst** z OG sdílení (každý reveal = reklama zdarma),
- **B2B terapeuti** (1 terapeut = 299–499 Kč/měs, vysoká marže, nízký churn),

pak se ekonomika otáčí. Konzervativně:

| Horizont | Realistický kumulativní zisk |
|---|---|
| Měsíc 1 (těch 10k) | **−7 000 až +1 000 Kč** (validace) |
| Měsíc 3 | **+15 000 až +40 000 Kč** (virální + repeat, bez dalšího spendu) |
| Měsíc 6 | **+40 000 až +120 000 Kč** (+5–10 terapeutů B2B, SK trh) |

> Čísla jsou ilustrativní projekce, ne příslib. Skutečnost stojí a padá s konverzní mírou a virálním koeficientem — **proto je analytika P0**: po měsíci 1 budete mít reálné CPA a K-faktor a model přepočítáte na tvrdých datech.

### Co rozhoduje o tom, jestli to bude konzervativní, nebo optimistický scénář
1. **OG sdílení výsledků** (P1) — největší páka organiky.
2. **Completion rate** druhého partnera (reminder + realtime).
3. **Cena/positioning** — 199 Kč one-time „pro oba" testovat proti 99 Kč/měs.
4. **Kvalita influencer výběru** — autentičtí > velcí.

---

## Doporučené pořadí kroků

1. **Dodělat P0** (analytika, 18+/privacy, Stripe, autosave, kratší free kolo, CZ e-mail) — ~1 týden.
2. **Nasadit OG sdílení + reminder** (P1) — ~3 dny. Až teď má smysl platit za návštěvnost.
3. **Spustit 10k kampaň** s důrazem na influencery + malý ad test, vše měřeno.
4. **Po 2–3 týdnech vyhodnotit** CPA a K-faktor, re-investovat rezervu do vítězného kanálu.
5. **Otevřít B2B kanál** (terapeuti) — nejvyšší marže, nejnižší akviziční náklad.
