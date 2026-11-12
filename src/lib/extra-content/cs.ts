// Wording for: purchase confirmation and link-recovery e-mails, sharing a
// Kinkometr result, the paid couple report, resuming an unfinished test and
// the search landing pages. Czech is the source; the other locales translate
// this file key for key. {placeholders} are filled in by the app and must be
// kept exactly as they are.

export type LandingKey = 'bdsm' | 'kink' | 'domsub';

export type Landing = {
  metaTitle: string;
  metaDesc: string;
  h1: string;
  lead: string;
  cta: string;
  // Three or four short selling points under the button.
  points: string[];
  sections: { h: string; p: string }[];
  faq: { q: string; a: string }[];
};

export type ExtraContent = {
  ui: Record<keyof typeof ui, string>;
  landing: Record<LandingKey, Landing>;
};

const ui = {
  // ---- E-mail: purchase confirmation ----
  mailReportSubject: 'Potvrzení nákupu: podrobný rozbor Kinkometru',
  mailReportHeading: 'Děkujeme, rozbor je odemčený',
  mailReportCta: 'Otevřít rozbor',
  mailPairSubject: 'Potvrzení nákupu: párový rozbor Kinkometru',
  mailPairHeading: 'Děkujeme, párový rozbor je odemčený',
  mailPairCta: 'Otevřít párový rozbor',
  mailPremiumSubject: 'Potvrzení nákupu: prémiové balíčky otázek',
  mailPremiumHeading: 'Děkujeme, prémium je odemčené',
  mailPremiumCta: 'Otevřít NakedTruth',
  mailPurchaseBody: 'Potvrzujeme uzavření smlouvy o dodání digitálního obsahu: {product}, cena {price}, zaplaceno {date}. Obsah byl zpřístupněn ihned po zaplacení.',
  mailWaiver: 'Před zaplacením jste výslovně souhlasil/a s okamžitým zpřístupněním obsahu a vzal/a jste na vědomí, že tím zaniká právo odstoupit od smlouvy do 14 dnů (§ 1837 písm. l) občanského zákoníku).',
  mailKeepLink: 'Odkaz níže je soukromý: kdo ho má, vidí váš výsledek. Uložte si ho a nikomu ho neposílejte.',
  mailStored: 'Tuto e-mailovou adresu jsme uložili k vašemu výsledku, abyste si odkaz mohli nechat kdykoli poslat znovu. Smaže se spolu s výsledkem.',
  mailSeller: 'Prodávající: {seller}',
  mailTerms: 'Obchodní podmínky: {url}',
  mailPurchaseFooter: 'Tento e-mail je potvrzením nákupu na webu NakedTruth. Reklamu vám posílat nebudeme.',

  // ---- E-mail: links to your results ----
  mailLinksSubject: 'Vaše odkazy na NakedTruth',
  mailLinksHeading: 'Tady jsou vaše odkazy',
  mailLinksBody: 'K této adrese máme uloženo následující. Odkazy jsou soukromé: kdo je má, vidí obsah.',
  mailLinkResult: 'Výsledek Kinkometru ze dne {date}',
  mailLinkReport: 'Podrobný rozbor ze dne {date}',
  mailLinkQuiz: 'Párový kvíz ze dne {date}',
  mailLinksFooter: 'O tento e-mail někdo požádal na webu NakedTruth. Pokud jste to nebyl/a vy, stačí ho ignorovat.',

  // ---- Save the link by e-mail (result page) ----
  saveLinkTitle: 'Nepřijď o svůj výsledek',
  saveLinkLead: 'Výsledek je dostupný jen přes tento odkaz. Nech si ho poslat e-mailem — a kdykoli později si ho necháš poslat znovu.',
  saveLinkConsent: 'E-mail uložíme k tomuto výsledku jen proto, abychom ti mohli odkaz poslat. Smaže se spolu s výsledkem.',
  saveLinkStored: 'E-mail je u tohoto výsledku uložený. Ztracený odkaz si necháš poslat na stránce „Ztracený odkaz“.',
  emailPlaceholder: 'tvuj@email.cz',
  saveLinkButton: 'Poslat mi odkaz',
  sending: 'Odesílám…',
  saveLinkSent: 'Odesláno. Podívej se do schránky, případně do spamu.',
  invalidEmail: 'Zadej platnou e-mailovou adresu.',
  tooMany: 'Na tuto adresu jsme dnes už poslali několik e-mailů. Zkus to zítra.',
  mailUnavailable: 'Odesílání e-mailů teď není dostupné. Ulož si prosím odkaz ručně.',
  mailFailed: 'E-mail se nepodařilo odeslat. Zkus to prosím znovu.',

  // ---- Lost link page ----
  recoverMetaTitle: 'Ztracený odkaz | NakedTruth',
  recoverLink: 'Ztracený odkaz',
  recoverTitle: 'Ztratil/a jsi odkaz?',
  recoverLead: 'Zadej e-mail, který sis uložil/a u výsledku, uvedl/a při nákupu nebo v párovém kvízu. Pošleme na něj všechny tvoje odkazy.',
  recoverButton: 'Poslat odkazy',
  recoverDone: 'Pokud k této adrese něco máme, e-mail je na cestě.',
  recoverNote: 'Výsledky, u kterých e-mail uložený není, takto obnovit nejde — nevíme, komu patří.',

  // ---- Unfinished test ----
  resumeTitle: 'Máš rozdělaný test',
  resumeText: 'Zodpovězeno {done} z {total} otázek. Odpovědi jsou uložené jen v tomto prohlížeči.',
  resumeContinue: 'Pokračovat',
  resumeRestart: 'Začít znovu',

  // ---- Sharing a result ----
  shareButton: 'Sdílet moje poháry',
  shareHint: 'Sdílí se jen tři nejplnější poháry — bez odkazu na tvůj výsledek a bez ostatních odpovědí.',
  shareCopied: 'Odkaz zkopírován',
  shareText: 'Moje nejplnější poháry v Kinkometru. Jaké máš ty?',
  shareMetaTitle: 'Moje poháry v Kinkometru: {cups}',
  shareMetaDesc: 'Kinkometr změří {n} oblastí toho, co tě v posteli láká. Anonymně, zdarma a za pár minut.',
  shareKicker: 'Něčí nejplnější poháry',
  shareHeading: 'A jaké poháry máš ty?',
  shareLead: 'Kinkometr je anonymní test: {n} pohárů, pár minut, žádná registrace. Výsledek uvidíš jen ty.',
  shareCta: 'Zjistit moje poháry',
  ogTitle: 'Moje nejplnější poháry',
  ogCta: 'Jaké máš ty?',

  // ---- Couple report: teaser ----
  pairProductName: 'NakedTruth — párový rozbor Kinkometru',
  pairMetaTitle: 'Párový rozbor | NakedTruth Kinkometr',
  pairTeaserTitle: 'Společný plán pro vás dva',
  pairTeaserLead: 'Porovnání ukazuje, na čem se shodnete. Párový rozbor z toho udělá plán: čím začít, kdo co vede a jak o tom spolu mluvit.',
  pairItem1: 'Společné večery — jeden pro každý pohár, na kterém se shodnete, od nejjemnějšího',
  pairItem2: 'Kdo dává a kdo přijímá tam, kde na tom záleží',
  pairItem3: 'Pozvánky: jak nabídnout to, co láká jen jednoho z vás, a první krok bez tlaku',
  pairItem4: 'Hotové věty, kterými téma otevřít, a tři dohody předem',
  pairItem5: 'Odemkne se vám oběma; verze pro tisk',
  pairBuy: 'Odemknout párový rozbor za {price}',
  pairOneTime: 'Jednorázová platba kartou, bez předplatného. Platí jeden, rozbor se odemkne oběma.',
  pairOpen: 'Otevřít párový rozbor',

  // ---- Couple report: page ----
  pairTitle: 'Váš společný plán',
  pairThanks: 'Díky za podporu! Rozbor je odemčený pro vás oba — partner ho otevře ze svého porovnání.',
  pairSummary: '{shared} společných · {invite} pozvánek · {explore} k prozkoumání',
  pairBack: 'Zpět na porovnání',
  pairAgreeTitle: 'Tři dohody předem',
  pairAgree1: 'Stopka: slovo nebo gesto, po kterém se okamžitě končí — bez vysvětlování.',
  pairAgree2: 'Co je dnes mimo hru. Každý řekne aspoň jednu věc.',
  pairAgree3: 'Co potom: deset minut spolu bez telefonu a každý řekne jednu věc, která byla dobrá.',
  pairEveningsTitle: 'Společné večery',
  pairEveningsLead: 'Jděte popořadě, od nejjemnějšího. Jeden večer, jeden pohár, mezi večery aspoň pár dní.',
  pairEveningsEmpty: 'Zatím nemáte pohár, na kterém byste se oba jasně shodli. Začněte pozvánkami níže — tam se shoda rodí.',
  pairRolesLabel: 'Kdo co vede',
  pairSayLabel: 'Jak to otevřít',
  pairEveningLabel: 'Večer',
  pairInvitesTitle: 'Pozvánky',
  pairInvitesLead: 'Tady pohár láká jednoho z vás a druhý si není jistý. Koho to láká, ten téma otevře; druhý určuje tempo a může kdykoli říct ne.',
  pairYouOpen: 'Otevíráš ty',
  pairPartnerOpens: 'Otevírá partner',
  pairFirstStepLabel: 'První krok',
  pairExploreTitle: 'Společné neznámo',
  pairExploreLead: 'Tady si nejste jistí ani jeden. Berte první krok jako pokus — a pak si řekněte, jaké to bylo.',
  pairHiddenNote: 'Poháry, které jeden z vás odmítl, v plánu nejsou a nikde se nezobrazí.',

  // ---- Landing pages (shared) ----
  // ---- Free sample of the detailed report ----
  sampleKicker: 'Ukázka zdarma',
  sampleTitle: 'Takhle vypadá tvůj rozbor',
  sampleLead: 'Tvůj nejplnější pohár máš odemčený celý. V plném rozboru je stejně podrobně rozebraný každý pohár, který tě láká — celkem {n}.',
  sampleLocked: 'Zamčeno',
  sampleMore: 'V plném rozboru tě čeká ještě',
  sampleLink: 'Podívat se na ukázku zdarma',

  // ---- VIP codes ----

  vipHave: 'Mám VIP kód',

  vipPlaceholder: 'VIP kód',

  vipApply: 'Odemknout kódem',

  vipInvalid: 'Kód neplatí, vypršel nebo je vyčerpaný.',

  vipActiveTitle: 'VIP přístup je aktivní',

  vipActiveLead: 'Kód {code} je uložený v tomto prohlížeči na 30 dní. Podrobný rozbor, párový rozbor i prémiové balíčky kvízu jím odemkneš bez placení — u každé nabídky stačí kliknout na „Odemknout kódem“.',

  vipInvalidTitle: 'Tento VIP kód neplatí',

  vipInvalidLead: 'Kód vypršel, je vyčerpaný, nebo je v odkazu překlep. Ozvi se tomu, kdo ti ho poslal.',


  landingFaqTitle: 'Časté otázky',
  landingMeasures: 'Co test měří',
  landingOther: 'Další testy',
};

const landing: ExtraContent['landing'] = {
  bdsm: {
    metaTitle: 'BDSM test zdarma a anonymně | NakedTruth Kinkometr',
    metaDesc: 'BDSM test na 2 minuty: dominance, submise, svazování, výprask, kontrola a další. Bez registrace, výsledek uvidíš jen ty. Můžeš ho porovnat s partnerem.',
    h1: 'BDSM test: zjisti, co tě opravdu láká',
    lead: 'Devět oblastí BDSM, dvě minuty, žádná registrace. Místo nálepky dostaneš poháry — u každé oblasti uvidíš, jak moc je plná, a co s tím dál.',
    cta: 'Spustit BDSM test',
    points: ['Anonymně a zdarma', 'Odpověď „nevím“ se počítá', 'Porovnání s partnerem jen tam, kde se shodnete'],
    sections: [
      {
        h: 'Jak BDSM test funguje',
        p: 'Odpovídáš na krátká tvrzení na škále od „to není pro mě“ po „ano, to chci“. Kdykoli můžeš říct „nevím“ — takový pohár se označí jako neprozkoumaný a dostaneš k němu jemný první krok místo hodnocení. Kdo chce, pokračuje druhým, ostřejším kolem, které rozliší, jestli raději dáváš, nebo přijímáš.',
      },
      {
        h: 'Pro začátečníky i zkušené',
        p: 'Nemusíš znát žádné pojmy ani mít zkušenosti. Test se neptá, co jsi dělal/a, ale co tě láká. Ke každému plnému poháru dostaneš konkrétní tipy na aktivity a pravidla bezpečné hry: stopku, semafor a péči po hře.',
      },
      {
        h: 'Porovnání bez trapných chvil',
        p: 'Výsledek můžeš poslat partnerovi jako pozvánku. Uvidíte jen to, na čem se shodnete. Co jeden z vás odmítl, zůstane skryté — nikdo se nedozví, o čem druhý řekl ne.',
      },
    ],
    faq: [
      { q: 'Je BDSM test opravdu anonymní?', a: 'Ano. Nechceme jméno ani e-mail a neukládáme IP adresu. Výsledek je dostupný jen přes náhodný soukromý odkaz a můžeš ho kdykoli smazat.' },
      { q: 'Jak dlouho test trvá?', a: 'První kolo zhruba dvě minuty. Druhé, hlubší kolo je dobrovolné a přidá pár minut podle toho, kolik oblastí si vybereš.' },
      { q: 'Co když nevím, jestli se mi něco líbí?', a: 'Pak zvol „nevím“. Je to plnohodnotná odpověď: pohár se označí jako neprozkoumaný a doporučíme ti nenápadný způsob, jak to zjistit.' },
      { q: 'Uvidí partner všechny moje odpovědi?', a: 'Ne. V porovnání se zobrazí jen oblasti, které lákají vás oba, a ty, kde si aspoň jeden není jistý a druhý chce. Odmítnuté oblasti zůstávají skryté.' },
    ],
  },
  kink: {
    metaTitle: 'Kink test: 23 pohárů toho, co tě láká | NakedTruth',
    metaDesc: 'Kink test zdarma a bez registrace. 23 oblastí od něžnosti po BDSM, fantazie a hry ve více lidech. Výsledek jako poháry, tipy na míru a porovnání s partnerem.',
    h1: 'Kink test: jak plné máš poháry?',
    lead: 'Dvacet tři oblastí — moc a odevzdání, tělo a smysly, fantazie, další lidé i něha. Za pět minut uvidíš, které poháry máš plné, které poloprázdné a které jsi ještě neprozkoumal/a.',
    cta: 'Spustit kink test',
    points: ['23 oblastí, 5 minut', 'Bez registrace, zdarma', 'Tipy na aktivity, polohy a místa'],
    sections: [
      {
        h: 'Víc než jedna nálepka',
        p: 'Většina testů ti přidělí jeden typ. Kinkometr ukazuje celou mapu: každá oblast je pohár s vlastní hladinou. Zjistíš, co je tvoje hlavní téma, co tě jen zajímá a kde zatím nevíš.',
      },
      {
        h: 'Od něžnosti po BDSM',
        p: 'Test nezačíná ani nekončí u BDSM. Měří i romantiku, tantru, orál, hračky, hraní rolí, sprostá slova, materiály, voyeurství nebo sex na neobvyklých místech. Kdo má chuť jen na rychlý přehled, zvolí krátkou verzi na dvě minuty.',
      },
      {
        h: 'Co s výsledkem',
        p: 'Ke každému plnému poháru dostaneš konkrétní aktivity, polohy a místa. K neprozkoumaným první krok. A pokud máš partnera, pošli mu pozvánku: porovnání ukáže jen to, na čem se shodnete.',
      },
    ],
    faq: [
      { q: 'Co je to kink?', a: 'Kink je cokoli, co tě v sexu vzrušuje nad rámec toho „běžného“ — od svazování přes hraní rolí po konkrétní materiály. Mít kink je normální; test ti jen pomůže pojmenovat ten svůj.' },
      { q: 'Je kink test zdarma?', a: 'Ano. Test, výsledek, doporučení i porovnání s partnerem jsou zdarma. Placený je jen dobrovolný podrobný rozbor.' },
      { q: 'Musím se registrovat?', a: 'Ne. Test je anonymní, bez účtu a bez e-mailu. Výsledek najdeš na soukromém odkazu.' },
      { q: 'Je test vhodný i pro lidi bez zkušeností?', a: 'Ano. Ptáme se na to, co tě láká, ne na to, co jsi zkusil/a. Odpověď „nevím“ je vždy k dispozici.' },
    ],
  },
  domsub: {
    metaTitle: 'Test dominance a submise: jsi dom, sub, nebo switch? | NakedTruth',
    metaDesc: 'Test dominance a submise zdarma. Za 2 minuty zjistíš, jestli tě to táhne vést, odevzdat se, nebo obojí. Anonymně, bez registrace, s porovnáním s partnerem.',
    h1: 'Test dominance a submise: dom, sub, nebo switch?',
    lead: 'Táhne tě to vést, nebo se odevzdat? A co když obojí? Test změří dominanci a submisi zvlášť — a s nimi i svazování, kontrolu, výprask a slova, která k tomu patří.',
    cta: 'Zjistit, co jsem',
    points: ['Dominance a submise měřené zvlášť', '2 minuty, anonymně', 'S partnerem zjistíte, kdo koho vede'],
    sections: [
      {
        h: 'Dom, sub a switch',
        p: 'Dominantní člověk si užívá vedení a rozhodování, submisivní odevzdání a důvěru. Switch má rád obojí, podle nálady a partnera. Protože test měří obě strany samostatně, nezařadí tě násilím jen do jedné škatulky.',
      },
      {
        h: 'Nejen role, ale i to, co k nim patří',
        p: 'Role sama nestačí. Test proto měří i to, čím se moc v posteli projevuje: svazování, výprask, kontrolu nad vyvrcholením, pochvalu a ponížení, divokost. U těchto oblastí druhé kolo rozliší, jestli raději dáváš, nebo přijímáš.',
      },
      {
        h: 'Zjistěte to spolu',
        p: 'Pošli partnerovi pozvánku a porovnání vám řekne, jak se vaše role potkávají: jeden vede a druhý se odevzdává, oba jste switch, nebo chcete vést oba. K tomu poháry, na kterých se shodnete.',
      },
    ],
    faq: [
      { q: 'Jak poznám, jestli jsem dominantní, nebo submisivní?', a: 'Podle toho, co tě vzrušuje v představách, ne podle toho, jaký/á jsi v běžném životě. Test se ptá na konkrétní situace a obě strany hodnotí zvlášť.' },
      { q: 'Co je switch?', a: 'Člověk, kterého láká jak vedení, tak odevzdání. Je to běžné — a test to ukáže, když máš plné oba poháry.' },
      { q: 'Je test anonymní?', a: 'Ano. Bez registrace, bez e-mailu, výsledek jen na soukromém odkazu, který můžeš kdykoli smazat.' },
      { q: 'Můžeme si test udělat jako pár?', a: 'Ano. Jeden vyplní test a pošle pozvánku, druhý vyplní stejný. Porovnání ukáže vaši dynamiku a společné poháry; odmítnuté oblasti zůstanou skryté.' },
    ],
  },
};

export const cs: ExtraContent = { ui, landing };
