import type { CupKey } from '@/lib/kink';

// Wording of the paid "detailed report" (podrobný rozbor) for a Kinkometr
// result. Czech is the source; the other locales translate this file key for
// key. {placeholders} are filled in by the app and must be kept as they are.
//
// Per cup:
//   talk    — one or two sentences the reader can say out loud to bring the
//             topic up with a partner. First person, quoted speech.
//   evening — one concrete, self-contained evening built around the cup:
//             what to prepare and how it goes. Second person, 2–3 sentences.
export type ReportContent = {
  cups: Record<CupKey, { talk: string; evening: string }>;
  ui: Record<keyof typeof ui, string>;
};

const cups: ReportContent['cups'] = {
  dominance: {
    talk: '„Napadlo mě, že bych jednou chtěl/a celý večer vést já — rozhodovat, co a jak. Lákalo by tě to? A je něco, co bys u toho nechtěl/a?“',
    evening: 'Odpoledne pošli zprávu, co má mít druhý na sobě a v kolik být doma. Večer rozhoduješ o všem: kde, jak, kdy smí promluvit a kdy vyvrcholit. Na konci hodinu jen ležte a řekni nahlas, co se ti na něm/ní líbilo.',
  },
  submission: {
    talk: '„Někdy bych chtěl/a úplně vypnout hlavu a nechat všechno na tobě. Zkusil/a bys mě jeden večer vést? Řeknu ti předem, co je pro mě mimo hru.“',
    evening: 'Domluvte si stopku a tři věci, které jsou tabu. Pak předej slovo: druhý vybírá oblečení, polohu i tempo a ty jen plníš, co slyšíš. Po všem si řekněte, která chvíle byla nejsilnější.',
  },
  bondage: {
    talk: '„Líbila by se mi představa, že mám svázané ruce a nemůžu nic dělat — nebo že je máš svázané ty. Zkusíme to někdy s šátkem?“',
    evening: 'Připrav dva šátky a nůžky na dosah. Svaž zápěstí k čelu postele tak, aby pod uzel prošly dva prsty, a dvacet minut se věnuj jen dráždění — nic víc. Každých pár minut se zeptej na barvu semaforu.',
  },
  impact: {
    talk: '„Když mě plácneš přes zadek, něco to se mnou dělá. Chtěl/a bych zkusit, kam až to jde — pomalu a s číslem od jedné do deseti.“',
    evening: 'Začněte masáží zad a zadku, ať se kůže prohřeje. Pak střídej hlazení a plácnutí, sílu přidávej po jedné a po každé sérii se zeptej na číslo. Skonči chladivým krémem a dekou.',
  },
  control: {
    talk: '„Vzrušuje mě představa, že o mém vyvrcholení rozhoduješ ty — nebo já o tvém. Chceš si na to jednou zahrát?“',
    evening: 'Domluvte se, že dnes rozhoduje jen jeden. Třikrát doveď druhého těsně před vrchol a zastav; počtvrté odpočítej nahlas od deseti. Mezi koly se dotýkej všude jinde.',
  },
  praise: {
    talk: '„Všiml/a jsem si, že když mi v posteli řekneš něco hezkého — nebo naopak drsného — hodně to se mnou dělá. Řeknu ti, která slova fungují a která ne?“',
    evening: 'Napište si každý tři slova, která chcete slyšet, a tři zakázaná. Večer je používejte nahlas a schválně — jeden mluví, druhý jen poslouchá. Po hře si řekněte něco úplně obyčejně hezkého.',
  },
  primal: {
    talk: '„Někdy bych chtěl/a, aby to bylo divočejší — přetlačovat se, kousat, nemluvit. Šel/šla bys do toho?“',
    evening: 'Odsuňte nábytek a dejte na zem deku. Pravidlo: žádná slova kromě stopky, a kdo koho přetlačí na záda, ten vede. Nehty a zuby jsou povolené tam, kde si je předem ukážete.',
  },
  sensation: {
    talk: '„Chtěl/a bych zkusit mít zavázané oči a jen hádat, čím se mě dotýkáš. Připravíš mi takový večer — nebo já tobě?“',
    evening: 'Nachystej šátek, kostky ledu, peříčko, teplý olej a něco drsnějšího, třeba kartáč. Zavaž oči a střídej předměty v náhodném pořadí; druhý hádá. Kdo uhodne, vybírá, čím se pokračuje.',
  },
  edge: {
    talk: '„Lákalo by mě zkusit něco ostřejšího — vosk nebo svorky. Jen na zkoušku a s tím, že kdykoli řeknu stop. Co ty na to?“',
    evening: 'Kup masážní svíčku a nastavitelné svorky. Vosk nejdřív kápni sobě na zápěstí, pak z výšky na záda druhého. Svorky nech nejdéle pár minut a sundávej pomalu — to je ta nejsilnější chvíle.',
  },
  anal: {
    talk: '„Jsem zvědavý/á na anální hrátky. Úplně pomalu, s hodně gelem, a tempo bude určovat ten, kdo přijímá. Chtěl/a bys to zkusit?“',
    evening: 'Společná sprcha, pak masáž zadku s lubrikantem — dlouho jen zvenku. Dovnitř jen tehdy, když si o to přijímající sám řekne, a nejdřív prst nebo malý kolík. Jakmile to přestane být příjemné, vraťte se o krok zpět.',
  },
  oral: {
    talk: '„Orál mám hodně rád/a. Chtěl/a bych jeden večer, kdy bude jen o tom — a řekneme si u toho nahlas, co je nejlepší.“',
    evening: 'Hoďte si korunou, kdo dnes jen dostává. Dvacet minut, žádné oplácení; ten, kdo dostává, říká nahlas „pomaleji“, „tam“, „ještě“. Příště se role otočí.',
  },
  toys: {
    talk: '„Co kdybychom si spolu vybrali nějakou hračku? Každý jednu pro toho druhého.“',
    evening: 'Sedněte si spolu k e-shopu a každý vyberte jednu věc pro druhého, do předem daného rozpočtu. Večer, kdy balík dorazí, je jen o rozbalování a zkoušení — bez cíle a s lubrikantem po ruce.',
  },
  roleplay: {
    talk: '„Chtěl/a bych si jednou zahrát, že se neznáme. Sejdeme se v baru, jako dva cizí lidé?“',
    evening: 'Domluvte si jména a jednu větu o tom, kdo jste. Přijďte do baru každý zvlášť, sbalte se znovu a domů jeďte „k tobě, nebo ke mně?“. Z role vystupte až ráno.',
  },
  verbal: {
    talk: '„Líbí se mi, když mi při tom něco říkáš. Zkusíš mi dneska přes den napsat, co se mnou večer uděláš?“',
    evening: 'Od rána si pište po jedné větě a stupňujte to. Večer zhasněte a pokračujte nahlas: jeden popisuje, co dělá, druhý, co cítí. Pravidlo: žádné ticho delší než deset vteřin.',
  },
  materials: {
    talk: '„Hrozně se mi líbíš v … (doplň). Vzal/a by sis to na sebe jen pro mě — a nechal/a si to?“',
    evening: 'Každý kupte tomu druhému jeden kousek a dejte mu ho zabalený. Oblékněte si je pod běžné oblečení, jděte na večeři a doma se svlékejte jen tak, aby dárek zůstal.',
  },
  feet: {
    talk: '„Mám slabost pro tvoje … (doplň). Můžu se jim dneska věnovat pořádně dlouho?“',
    evening: 'Teplá koupel a olej. Půl hodiny se věnuj jen jedné části těla — masíruj, líbej, dívej se. Druhý nesmí nic oplácet, jen říkat, co je příjemné.',
  },
  gender: {
    talk: '„Napadlo mě, že bychom si jednou prohodili role — kdo vede, kdo svléká, kdo co má na sobě. Bavilo by tě to?“',
    evening: 'Půjčte si navzájem jeden kus oblečení nebo prádla a vyměňte si i to, kdo co obvykle dělá. Dejte tomu celý večer a nikam nespěchejte; smích je dovolený.',
  },
  watch: {
    talk: '„Rád/a se na tebe dívám. Udělal/a bys to jednou jen pro mě — a já se nebudu smět dotknout?“',
    evening: 'Postavte k posteli zrcadlo a rozsviťte. Jeden se pomalu svléká a dotýká, druhý sedí v křesle s rukama za zády. Po deseti minutách se vyměňte.',
  },
  group: {
    talk: '„Chtěl/a bych s tebou mluvit o jedné fantazii — jen mluvit. Jak by vypadala trojka, kdyby byla úplně podle tebe?“',
    evening: 'Dnes jen slova: při sexu si vyprávějte, jak by to vypadalo, kdyby s vámi byl někdo třetí. Druhý den, střízliví, si řekněte, co z toho je fantazie a co byste chtěli doopravdy.',
  },
  sharing: {
    talk: '„Mám fantazii, o které se mi špatně mluví: ty a někdo další, a já u toho. Nemusíme to nikdy udělat — chci jen vědět, co na to říkáš.“',
    evening: 'Jděte do baru a jeden z vás ať hodinu flirtuje s cizími lidmi, zatímco druhý sleduje od vedlejšího stolu. Odejděte spolu a doma si řekněte, co kdo cítil — vzrušení i žárlivost.',
  },
  adventure: {
    talk: '„Co kdybychom to jednou udělali úplně jinde než v posteli? Vyber místo a já vyberu den.“',
    evening: 'Zarezervuj na jednu noc hotel ve vašem městě a neříkej kam. Sbal jen kartáčky a jednu věc navíc. Telefony zůstanou v autě.',
  },
  romance: {
    talk: '„Chybí mi, když na sebe máme čas a nikam nespěcháme. Uděláme si večer jen pro sebe — bez telefonů?“',
    evening: 'Čisté povlečení, svíčky, hudba bez slov. Hodinu se jen hlaďte a masírujte s pravidlem, že k sexu „nesmí“ dojít. Co se stane potom, je na vás.',
  },
  tantra: {
    talk: '„Chtěl/a bych zkusit večer, kdy nejde o orgasmus — jen o dotek a dech. Zní ti to divně, nebo zajímavě?“',
    evening: 'Sedněte si naproti sobě a pět minut dýchejte ve stejném rytmu s rukou na hrudi druhého. Pak půl hodiny masíruje jeden, půl hodiny druhý. Vyvrcholení dnes není cíl; když nepřijde, je to v pořádku.',
  },
};

const ui = {
  metaTitle: 'Podrobný rozbor | NakedTruth Kinkometr',
  productName: 'NakedTruth — podrobný rozbor Kinkometru',

  // Teaser / paywall
  teaserTitle: 'Podrobný rozbor',
  teaserLead: 'Poháry ukazují, co tě láká. Rozbor ti řekne, co s tím — krok za krokem a na míru tvým odpovědím.',
  item1: 'Mapa ano / možná / ne přes všechny poháry, k vytištění',
  item2: 'Tipy ke každému poháru, který tě láká — ne jen k pěti nejplnějším',
  item3: 'Jak o tom začít mluvit: hotové věty pro každý pohár',
  item4: 'Plán na čtyři večery sestavený z tvých pohárů',
  item5: 'Tisk nebo uložení do PDF',
  buy: 'Odemknout za {price}',
  oneTime: 'Jednorázově, bez předplatného a bez registrace. Platí pro tento výsledek napořád.',
  redirecting: 'Přesměrovávám na platbu…',
  unavailable: 'Platby teď nejsou dostupné. Zkus to prosím později.',
  failed: 'Platbu se nepodařilo spustit. Zkus to prosím znovu.',
  notVerified: 'Platbu se nepodařilo ověřit. Pokud ti byla částka stržena, obnov stránku — rozbor se odemkne, jakmile platba dorazí.',
  cancelled: 'Platba neproběhla — nic se nestalo.',
  open: 'Otevřít podrobný rozbor',
  unlockedBadge: 'Odemčeno',

  // Report
  title: 'Tvůj podrobný rozbor',
  thanks: 'Díky za podporu! Rozbor je odemčený a zůstane dostupný na tomto odkazu.',
  print: 'Vytisknout / uložit jako PDF',
  backToResult: 'Zpět na moje poháry',
  summaryTitle: 'Shrnutí',
  countsLine: '{yes} ano · {maybe} možná · {no} ne',
  roleDom: 'V mocenských hrách tě to táhne k vedení.',
  roleSub: 'V mocenských hrách tě to táhne k odevzdání.',
  roleSwitch: 'Umíš obojí — vést i se odevzdat. Tomu se říká switch.',
  roleNone: 'Mocenské hry pro tebe nejsou hlavní téma, a to je v pořádku.',
  depthLine: 'Tam, kde jsi šel/šla hlouběji, jdeš v průměru {depth}.',
  mapTitle: 'Tvoje mapa: ano / možná / ne',
  mapHint: 'Vytiskni si ji a projděte ji spolu. U každého „možná“ se zeptejte: co by muselo platit, aby z toho bylo ano?',
  mapYes: 'Ano',
  mapMaybe: 'Možná',
  mapNo: 'Ne',
  mapEmpty: 'nic',
  cupsTitle: 'Pohár po poháru',
  cupsLead: 'Všechno, co jsi označil/a jako ano nebo možná, od nejplnějšího.',
  talkLabel: 'Jak o tom začít mluvit',
  eveningLabel: 'Večer na míru',
  planTitle: 'Plán na čtyři večery',
  planLead: 'Začíná se zlehka a končí tvým nejplnějším pohárem. Mezi večery si nechte aspoň pár dní.',
  eveningN: 'Večer {n}',
  planShort: 'Na celý plán zatím nemáš dost plných pohárů — tady je to, co vychází.',
};

export const cs: ReportContent = { cups, ui };
