import type { LegalContent } from './types';

// Czech is the binding version. References to statutes: zákon č. 89/2012 Sb.,
// občanský zákoník (§ 1820 a násl., § 1837 písm. l)), zákon č. 634/1992 Sb.,
// o ochraně spotřebitele (§ 14), nařízení (EU) 2016/679 (GDPR), čl. 6, 9, 13.
export const cs: LegalContent = {
  updated: 'Poslední změna: {date}',
  incomplete: 'Údaje o provozovateli zatím nejsou doplněny. Do jejich doplnění nejsou tyto dokumenty úplné.',
  terms: {
    title: 'Obchodní podmínky',
    lead: 'Tyto podmínky platí pro používání webu NakedTruth a pro nákup placeného obsahu na něm.',
    sections: [
      {
        h: '1. Kdo službu provozuje',
        p: [
          'Provozovatelem a prodávajícím je {name}, IČO {id}, se sídlem {address}, {register}, {vat}.',
          'Kontakt pro dotazy, reklamace i žádosti týkající se osobních údajů: {email}.',
        ],
      },
      {
        h: '2. Co služba je a pro koho',
        p: [
          'NakedTruth nabízí testy a kvízy o vztazích a sexuálních preferencích: Kinkometr (test pro jednotlivce s možností porovnání s partnerem) a párový kvíz naslepo.',
          'Služba je určena výhradně osobám starším 18 let. Používáním služby potvrzujete, že vám je 18 let nebo více.',
          'Obsah má informační a zábavní povahu. Není lékařskou, psychologickou ani právní radou a nenahrazuje odbornou pomoc. Tipy, které služba zobrazuje, zkoušíte na vlastní odpovědnost, vždy jen se souhlasem všech zúčastněných a s ohledem na vlastní zdraví a bezpečí.',
        ],
      },
      {
        h: '3. Bezplatná a placená část',
        p: [
          'Základní použití služby je zdarma a bez registrace.',
          'Placený je: (a) podrobný rozbor výsledku Kinkometru, (b) odemčení prémiových balíčků otázek v párovém kvízu. Dobrovolný příspěvek „na kafe“ je dar provozovateli a nic neodemyká.',
          'Ceny jsou uvedeny u každé položky před zaplacením, jsou konečné a zahrnují všechny daně a poplatky. Platba je jednorázová, nejde o předplatné.',
        ],
      },
      {
        h: '4. Objednávka, platba a dodání',
        p: [
          'Smlouva je uzavřena okamžikem, kdy po stisknutí tlačítka s cenou dokončíte platbu. Platby zpracovává společnost Stripe; údaje o kartě provozovatel nevidí ani neukládá.',
          'Placený obsah je digitální obsah, který není dodán na hmotném nosiči. Zpřístupní se ihned po přijetí platby na stránce, na kterou vás platební brána vrátí. Podrobný rozbor zůstává dostupný na soukromém odkazu k danému výsledku.',
          'Potvrzení o platbě obdržíte e-mailem od poskytovatele platební služby na adresu, kterou při platbě uvedete.',
          'Smlouva se uzavírá v jazyce, ve kterém web používáte. Provozovatel smlouvu neukládá v podobě přístupné zákazníkovi; rozhodné je znění těchto podmínek účinné v den nákupu.',
        ],
      },
      {
        h: '5. Odstoupení od smlouvy',
        p: [
          'Jako spotřebitel máte obecně právo odstoupit od smlouvy uzavřené na dálku do 14 dnů bez udání důvodu.',
          'U digitálního obsahu, který není dodán na hmotném nosiči, toto právo zaniká, jakmile bylo započato s plněním s vaším předchozím výslovným souhlasem (§ 1837 písm. l) občanského zákoníku). Před zaplacením proto výslovně potvrzujete, že chcete obsah zpřístupnit ihned a že berete na vědomí, že tím právo odstoupit ztrácíte.',
          'Dobrovolný příspěvek je dar; vrátit ho lze po dohodě na výše uvedeném kontaktu.',
        ],
      },
      {
        h: '6. Reklamace',
        p: [
          'Provozovatel odpovídá za to, že placený obsah je dostupný a odpovídá popisu. Pokud se vám po zaplacení obsah neodemkl nebo není dostupný, napište na {email} a uveďte datum a čas platby. Provozovatel závadu odstraní, a nepůjde-li to v přiměřené době, vrátí vám zaplacenou částku.',
          'Reklamaci vyřídíme bez zbytečného odkladu, nejpozději do 30 dnů.',
        ],
      },
      {
        h: '7. Soukromé odkazy',
        p: [
          'Výsledky, porovnání, rozbory a relace kvízu jsou dostupné jen přes soukromý odkaz, který služba vygeneruje. Služba nemá uživatelské účty; kdo má odkaz, má k obsahu přístup. Odkaz si proto uložte a nesdílejte ho s nikým, komu obsah ukázat nechcete.',
          'Ztracený odkaz nelze obnovit, protože provozovatel neví, komu který výsledek patří.',
        ],
      },
      {
        h: '8. Pravidla používání',
        p: [
          'Službu nesmíte používat k obtěžování, nátlaku nebo k získávání informací o jiné osobě bez jejího vědomí. Pozvánku k porovnání posílejte jen člověku, který o ni stojí.',
          'Texty a grafika služby jsou chráněny autorským právem. Pro osobní potřebu je můžete tisknout a ukládat; další šíření vyžaduje souhlas provozovatele.',
        ],
      },
      {
        h: '9. Dostupnost a změny',
        p: [
          'Provozovatel může službu měnit, přerušit nebo ukončit. Zaplacený obsah zůstane dostupný nejméně 12 měsíců od nákupu; pokud by měl být zpřístupněn kratší dobu, vrátí provozovatel poměrnou část ceny.',
          'Podmínky se mohou měnit. Pro nákup platí znění účinné v den nákupu.',
        ],
      },
      {
        h: '10. Řešení sporů',
        p: [
          'Vztahy se řídí právem České republiky. Spotřebiteli s bydlištěm v jiném členském státě EU zůstává zachována ochrana, kterou mu poskytují kogentní předpisy jeho státu.',
          'K mimosoudnímu řešení spotřebitelských sporů je příslušná Česká obchodní inspekce, Ústřední inspektorát – oddělení ADR, Gorazdova 1969/24, 120 00 Praha 2, www.coi.cz, adr.coi.cz.',
          'Dozor nad ochranou osobních údajů vykonává Úřad pro ochranu osobních údajů, www.uoou.gov.cz.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Zásady ochrany soukromí',
    lead: 'Odpovědi v testech vypovídají o sexuálním životě, a proto s nimi zacházíme jako se zvláštní kategorií osobních údajů. Tady je přesně popsáno, co ukládáme, proč a jak to smazat.',
    sections: [
      {
        h: '1. Správce údajů',
        p: ['Správcem je {name}, IČO {id}, se sídlem {address}. Kontakt pro všechny žádosti: {email}.'],
      },
      {
        h: '2. Co ukládáme',
        p: [
          'Kinkometr: vaše odpovědi, z nich spočítané „poháry“, zvolený jazyk a typ testu, nepovinné údaje „jsem sám/sama“ a „sex pro mě není důležitý“, nepovinný vlastní text a informaci, zda byl odemčen podrobný rozbor. Neukládáme jméno, e-mail ani IP adresu. Výsledek je spojen jen s náhodným soukromým odkazem.',
          'Párový kvíz: odpovědi obou partnerů, nastavení kvízu a jazyk. Pokud zadáte e-mail (svůj nebo partnerův), ukládáme ho, abychom mohli poslat pozvánku, připomínku a oznámení o výsledcích. Bez e-mailu je kvíz anonymní.',
          'Platby: provádí je Stripe. My dostaneme jen potvrzení, že platba proběhla, a její identifikátor. Číslo karty nevidíme.',
          'Měření návštěvnosti: počítáme jen souhrnné počty událostí za den (například kolik lidí dokončilo test). Nepoužíváme k tomu cookies, neukládáme IP adresu ani žádný identifikátor zařízení a jednotlivé návštěvníky nesledujeme.',
          'Cookies: používáme jedinou, nezbytnou cookie pro zapamatování zvoleného jazyka. Reklamní ani analytické cookies nepoužíváme.',
        ],
      },
      {
        h: '3. Proč a na jakém základě',
        p: [
          'Odpovědi o sexuálním životě zpracováváme jen na základě vašeho výslovného souhlasu (čl. 9 odst. 2 písm. a) GDPR), který udělujete před začátkem testu, a jen proto, abychom vám – a v případě porovnání či kvízu i vašemu partnerovi – zobrazili výsledek.',
          'E-mail zpracováváme pro splnění služby, o kterou jste požádali (čl. 6 odst. 1 písm. b) GDPR). Údaje o platbě pro splnění smlouvy a zákonných účetních povinností (čl. 6 odst. 1 písm. b) a c) GDPR).',
          'Souhlas můžete kdykoli odvolat tím, že výsledek smažete nebo o smazání požádáte. Odvolání nemá vliv na zpracování, které proběhlo předtím.',
        ],
      },
      {
        h: '4. Kdo dalšího údaje vidí',
        p: [
          'Partner, kterého pozvete k porovnání Kinkometru, uvidí jen poháry, na kterých se shodnete, a souhrnnou shodu; ne vaše jednotlivé odpovědi ani celý výsledek. V párovém kvízu uvidí oba partneři odpovědi toho druhého – to je smysl kvízu – a to až poté, co oba dokončí.',
          'Zpracovatelé, které k provozu používáme: Neon (databáze, uložená v EU), Vercel (provoz webu), Stripe (platby) a Resend (odesílání e-mailů). Někteří z nich sídlí v USA; předání se řídí standardními smluvními doložkami nebo rámcem EU–USA pro ochranu údajů.',
          'Údaje neprodáváme a nepoužíváme k reklamě.',
        ],
      },
      {
        h: '5. Jak dlouho',
        p: [
          'Výsledky Kinkometru a relace kvízu uchováváme, dokud je nesmažete nebo o smazání nepožádáte, nejdéle však 24 měsíců od vytvoření.',
          'Doklady o platbách uchováváme po dobu, kterou ukládají účetní a daňové předpisy.',
        ],
      },
      {
        h: '6. Jak údaje smazat a jaká máte práva',
        p: [
          'Výsledek Kinkometru smažete sami tlačítkem „Smazat můj výsledek“ na stránce výsledku. Smazání je okamžité a nevratné, včetně případně zaplaceného rozboru.',
          'Relaci párového kvízu smažeme na žádost zaslanou na {email}; přiložte odkaz na relaci, podle kterého ji najdeme.',
          'Máte právo na přístup k údajům, opravu, výmaz, omezení zpracování, přenositelnost a právo odvolat souhlas. Protože výsledky nejsou spojeny s vaší identitou, dokážeme žádost vyřídit jen tehdy, když nám sdělíte soukromý odkaz na výsledek.',
          'Stížnost můžete podat u Úřadu pro ochranu osobních údajů, www.uoou.gov.cz.',
        ],
      },
      {
        h: '7. Zabezpečení',
        p: [
          'Přenos je šifrovaný, soukromé odkazy jsou náhodné a neuhodnutelné a stránky s výsledky jsou vyloučeny z vyhledávačů. Přesto platí: kdo zná váš soukromý odkaz, uvidí váš výsledek.',
        ],
      },
    ],
  },
};
