// Kinkometr — solo test. Every area of interest is a "cup" (pohár) that fills
// up according to the answers. Pure data + scoring, shared by the test UI, the
// server action and the result / comparison pages.

export type CupKey =
  | 'dominance'
  | 'submission'
  | 'bondage'
  | 'impact'
  | 'sensation'
  | 'roleplay'
  | 'watch'
  | 'toys'
  | 'group'
  | 'verbal'
  | 'adventure'
  | 'romance';

export type Cup = {
  key: CupKey;
  label: string;
  // Short "who you are" tag used when this is somebody's fullest cup.
  persona: string;
  desc: string;
  color: string;
  bdsm: boolean;
};

export const CUPS: Cup[] = [
  { key: 'dominance', label: 'Vedení', persona: 'Dirigent', desc: 'Dominance — určovat tempo, pravidla a směr', color: '#ff3d6e', bdsm: true },
  { key: 'submission', label: 'Odevzdání', persona: 'Odevzdaná duše', desc: 'Submise — nechat se vést a pustit kontrolu', color: '#b05cff', bdsm: true },
  { key: 'bondage', label: 'Svazování', persona: 'Uzlař', desc: 'Pouta, šátky, provazy a sladká bezmoc', color: '#ff7a1a', bdsm: true },
  { key: 'impact', label: 'Plácání & intenzita', persona: 'Hledač intenzity', desc: 'Výprask, kousnutí a slast na hraně bolesti', color: '#ff2ea6', bdsm: true },
  { key: 'sensation', label: 'Smyslové hry', persona: 'Smyslový labužník', desc: 'Zavázané oči, led, vosk, peříčko, napětí', color: '#00d5ff', bdsm: true },
  { key: 'roleplay', label: 'Role & scénáře', persona: 'Herec', desc: 'Převleky, cizinci v baru, domluvené příběhy', color: '#ffd400', bdsm: false },
  { key: 'watch', label: 'Dívat se & předvádět', persona: 'Divák i hvězda', desc: 'Voyeurismus a exhibicionismus ve dvou', color: '#3d8bff', bdsm: false },
  { key: 'toys', label: 'Hračky', persona: 'Sběratel hraček', desc: 'Vibrátory, kroužky, kolíky a jiné vychytávky', color: '#35f0a0', bdsm: false },
  { key: 'group', label: 'Víc lidí', persona: 'Objevitel', desc: 'Trojka, swingers, otevřenost', color: '#ff5c5c', bdsm: false },
  { key: 'verbal', label: 'Slova', persona: 'Šeptal', desc: 'Dirty talk, zprávy, pochvaly a pokyny', color: '#c8ff2e', bdsm: false },
  { key: 'adventure', label: 'Místa & dobrodružství', persona: 'Dobrodruh', desc: 'Sex mimo postel a špetka rizika', color: '#2effd5', bdsm: false },
  { key: 'romance', label: 'Něha & smyslnost', persona: 'Romantik', desc: 'Pomalu, zblízka, s dlouhou předehrou', color: '#ff9ecb', bdsm: false },
];

export const CUP_BY_KEY: Record<CupKey, Cup> = Object.fromEntries(CUPS.map((c) => [c.key, c])) as Record<CupKey, Cup>;

export type KinkQuestion = { id: string; cup: CupKey; text: string };

// Four statements per cup. The first two of each cup form the quick test.
const STATEMENTS: Record<CupKey, [string, string, string, string]> = {
  dominance: [
    'Vzrušuje mě, když v posteli určuju, co se bude dít.',
    'Líbí se mi držet partnera/ku za zápěstí nebo ho/ji přitlačit k posteli.',
    'Baví mě dávat pokyny a sledovat, jak je druhý plní.',
    'Lákalo by mě mít na celý večer hlavní slovo — pravidla, úkoly, odměny.',
  ],
  submission: [
    'Vzrušuje mě, když se můžu úplně odevzdat a nechat se vést.',
    'Líbí se mi, když mi partner/ka říká, co mám udělat.',
    'Baví mě snažit se druhého potěšit a slyšet za to pochvalu.',
    'Lákalo by mě jeden večer jen poslouchat a o ničem nerozhodovat.',
  ],
  bondage: [
    'Láká mě nechat si svázat ruce (šátek, pouta, pásek).',
    'Láká mě svázat nebo připoutat partnera/ku.',
    'Vzrušuje mě pocit, že se nemůžu (nebo druhý nemůže) hýbat.',
    'Zajímá mě vázání provazem (šibari) — i jako něco krásného na pohled.',
  ],
  impact: [
    'Plácnutí přes zadek mě při sexu vzrušuje.',
    'Líbí se mi tahání za vlasy, kousání nebo škrábání.',
    'Lákalo by mě zkusit plácačku, důtky nebo bičík.',
    'Trocha bolesti mi umí slast zesílit.',
  ],
  sensation: [
    'Líbilo by se mi mít zavázané oči a nevědět, co přijde.',
    'Láká mě hra s teplotou — led, teplý olej, masážní svíčka.',
    'Užívám si pomalé dráždění: peříčko, nehty, dech na kůži.',
    'Láká mě oddalování vyvrcholení (edging), aby byl konec silnější.',
  ],
  roleplay: [
    'Baví mě představa hrát v posteli někoho jiného.',
    'Vzrušují mě kostýmy, uniformy nebo převleky.',
    'Lákalo by mě sehrát „cizí lidi“, kteří se právě potkali v baru.',
    'Rád/a bych si předem domluvil/a scénář a pak ho odehrál/a.',
  ],
  watch: [
    'Vzrušuje mě, když se na mě partner/ka dívá — jak se svlékám nebo dotýkám.',
    'Rád/a se dívám, jak se partner/ka dotýká sám/sama sebe.',
    'Líbí se mi sex před zrcadlem.',
    'Vzrušuje mě představa, že nás při tom někdo vidí (nebo že se díváme na jiné).',
  ],
  toys: [
    'Hračky (vibrátor, kroužek, kolík…) do společného sexu patří.',
    'Rád/a zkouším nové pomůcky a vychytávky.',
    'Lákala by mě hračka na dálkové ovládání — třeba i venku mezi lidmi.',
    'Lubrikanty, oleje a doplňky beru jako běžnou výbavu.',
  ],
  group: [
    'Láká mě představa sexu ve třech.',
    'Zajímala by mě návštěva swingers klubu, i kdybychom se jen dívali.',
    'Vzrušuje mě představa partnera/ky s někým dalším.',
    'Umím si představit otevřený vztah s jasnými pravidly.',
  ],
  verbal: [
    'Vzrušuje mě, když se při sexu mluví sprostě.',
    'Rád/a posílám nebo dostávám žhavé zprávy.',
    'Líbí se mi, když mi partner/ka popisuje, co se mnou udělá.',
    'Vzrušují mě pochvaly („hodná holka“, „hodný kluk“) nebo naopak drsnější slova.',
  ],
  adventure: [
    'Sex jinde než v posteli mě láká — kuchyň, sprcha, auto.',
    'Vzrušuje mě špetka rizika, že by nás mohl někdo přistihnout.',
    'Rád/a bych si na sex pronajal/a hotel, privátní wellness nebo chatu.',
    'Láká mě sex venku v přírodě, kde široko daleko nikdo není.',
  ],
  romance: [
    'Nejvíc si užívám pomalý sex s dlouhou předehrou.',
    'Oční kontakt, líbání a objímání jsou pro mě při sexu zásadní.',
    'Miluju dlouhé masáže a mazlení, které nikam nespěchá.',
    'Atmosféra — svíčky, hudba, čas jen pro nás — pro mě hodně znamená.',
  ],
};

export type KinkMode = 'full' | 'quick' | 'bdsm';

export const MODES: Record<KinkMode, { label: string; desc: string; minutes: number }> = {
  full: { label: 'Plný Kinkometr', desc: 'Všech 12 pohárů, 48 otázek', minutes: 5 },
  quick: { label: 'Rychlovka', desc: 'Všech 12 pohárů, 24 otázek', minutes: 2 },
  bdsm: { label: 'BDSM test', desc: 'Vedení, odevzdání, svazování, plácání, smysly', minutes: 2 },
};

export function isKinkMode(value: unknown): value is KinkMode {
  return value === 'full' || value === 'quick' || value === 'bdsm';
}

// Questions for a mode, interleaved across cups so one topic never comes four
// times in a row.
export function questionsFor(mode: KinkMode): KinkQuestion[] {
  const cups = CUPS.filter((c) => (mode === 'bdsm' ? c.bdsm : true));
  const perCup = mode === 'quick' ? 2 : 4;
  const out: KinkQuestion[] = [];
  for (let i = 0; i < perCup; i++) {
    for (const cup of cups) {
      out.push({ id: `${cup.key}_${i + 1}`, cup: cup.key, text: STATEMENTS[cup.key][i] });
    }
  }
  return out;
}

// Answer scale. Value 2 is the explicit "I don't know" — it half-fills the cup
// and is counted separately so the result can say "unexplored" instead of
// pretending to know.
export const ANSWER_OPTIONS: { value: number; label: string }[] = [
  { value: 4, label: 'Jo, tohle chci' },
  { value: 3, label: 'Láká mě to' },
  { value: 2, label: 'Nevím, nejsem si jistý/á' },
  { value: 1, label: 'Spíš ne' },
  { value: 0, label: 'Ne, to není pro mě' },
];

export const UNSURE_VALUE = 2;

export type CupResult = { fill: number; unsure: number; count: number };
export type CupResults = Partial<Record<CupKey, CupResult>>;

// Validates raw answers against the mode's question set and computes each cup.
// Returns null when an answer is missing or out of range.
export function scoreAnswers(mode: KinkMode, answers: Record<string, unknown>): { cups: CupResults; clean: Record<string, number> } | null {
  const cups: CupResults = {};
  const clean: Record<string, number> = {};
  for (const q of questionsFor(mode)) {
    const v = answers[q.id];
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > 4) return null;
    clean[q.id] = v;
    const cup = cups[q.cup] ?? { fill: 0, unsure: 0, count: 0 };
    cup.fill += v;
    cup.count += 1;
    if (v === UNSURE_VALUE) cup.unsure += 1;
    cups[q.cup] = cup;
  }
  for (const key of Object.keys(cups) as CupKey[]) {
    const cup = cups[key]!;
    cup.fill = Math.round((cup.fill / (cup.count * 4)) * 100);
  }
  return { cups, clean };
}

// A cup is "unexplored" when at least half of its answers were "I don't know".
export function isUnexplored(cup: CupResult): boolean {
  return cup.unsure * 2 >= cup.count;
}

export const FULL_THRESHOLD = 65;

export function fillLabel(cup: CupResult): string {
  if (isUnexplored(cup)) return 'Neprozkoumaný';
  if (cup.fill >= 85) return 'Přetéká';
  if (cup.fill >= FULL_THRESHOLD) return 'Skoro plný';
  if (cup.fill >= 40) return 'Napůl';
  if (cup.fill >= 15) return 'Na dně';
  return 'Prázdný';
}

// Cups present in a result, fullest first.
export function rankedCups(cups: CupResults): { cup: Cup; result: CupResult }[] {
  return CUPS.filter((c) => cups[c.key])
    .map((cup) => ({ cup, result: cups[cup.key]! }))
    .sort((a, b) => b.result.fill - a.result.fill);
}

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

export type CupTips = {
  // What to try when the cup is full.
  activities: string[];
  positions: string[];
  places: string[];
  // A gentle, low-stakes way to find out when the cup is unexplored.
  firstStep: string;
};

export const TIPS: Record<CupKey, CupTips> = {
  dominance: {
    activities: [
      'Večer podle tebe: předem řekni, že dnes vedeš, a rozhoduj o tempu, polohách i o tom, kdy bude konec.',
      'Pokyny místo otázek — „otoč se“, „podívej se na mě“, „ještě ne“. Krátké věty, klidný hlas.',
      'Hra na svolení: partner/ka se smí dotknout sebe nebo tebe, až když to dovolíš.',
    ],
    positions: [
      'Misionář s rukama partnera/ky přidrženýma nad hlavou.',
      'Zezadu vestoje u zdi nebo u stolu, s rukou na boku či zádech.',
    ],
    places: ['Křeslo nebo židle: ty sedíš, druhý přichází k tobě.', 'Hotelový pokoj — nové prostředí, kde se role nasazuje snáz.'],
    firstStep: 'Zkus si na deset minut vzít slovo: jen říkej, co chceš, a sleduj, co to s tebou dělá. Předem si domluvte stopku.',
  },
  submission: {
    activities: [
      'Večer bez rozhodování: partner/ka vybere všechno, ty jen plníš. Předem řekni, co je mimo hru.',
      'Úkol na den — zpráva s pokynem, který máš splnit, než se uvidíte.',
      'Služba s odměnou: masáž, svlékání, čekání v dohodnuté pozici… a pochvala na konci.',
    ],
    positions: [
      'Vkleče před partnerem/kou (polštář pod kolena).',
      'Na břiše s rukama za zády nebo nad hlavou, partner/ka nahoře.',
    ],
    places: ['Ložnice s přichystanou „scénou“ — deka, tlumené světlo, všechno po ruce.', 'Sprcha: nech se umýt a vést.'],
    firstStep: 'Řekni partnerovi/ce: „Dneska rozhoduj ty, já řeknu stop, kdyby něco.“ Stačí čtvrthodina, pak si o tom promluvte.',
  },
  bondage: {
    activities: [
      'Začněte šátkem nebo měkkými pouty na suchý zip — jde je rozepnout jednou rukou.',
      'Připoutání k čelu postele a pomalé dráždění, dokud svázaný/á neprosí.',
      'Kurz šibari pro páry nebo videonávod na základní „single column tie“.',
    ],
    positions: [
      'Na zádech, ruce svázané nad hlavou.',
      'Na boku „lžičky“ se zápěstími svázanými před tělem — pohodlné i na déle.',
    ],
    places: ['Postel s pevným čelem nebo popruhy pod matraci.', 'Pronajatý BDSM privát / playroom s vybavením, až budete chtít víc.'],
    firstStep: 'Zkus „svázání na čestné slovo“: ruce drž nad hlavou sám/sama, jako by byly svázané. Zjistíš, jestli tě bezmoc vzrušuje, bez jediného uzlu.',
  },
  impact: {
    activities: [
      'Rozehřátí rukou: střídej hlazení a plácnutí na zadek, sílu přidávej po troškách a ptej se na číslo 1–10.',
      'Vyzkoušejte rozdíl mezi „pleskavým“ (dlaň, plácačka) a „tupým“ dopadem (důtky s širokými prameny).',
      'Škrábání nehty po zádech a kousnutí do ramene v pravou chvíli.',
    ],
    positions: [
      'Přes kolena — klasika, kde má ten, kdo plácá, všechno pod kontrolou.',
      'Na čtyřech nebo v předklonu s oporou o postel.',
    ],
    places: ['Ložnice nebo gauč — kdekoli, kde se dá pohodlně opřít.', 'BDSM privát s lavicí, pokud vás to chytne.'],
    firstStep: 'Jedno plácnutí v zápalu a otázka „ještě?“. Miřte jen na zadek a stehna — nikdy na ledviny, páteř a klouby.',
  },
  sensation: {
    activities: [
      'Zavázané oči a tři různé doteky: peříčko, kostka ledu, teplá dlaň. Hádej, co přijde.',
      'Masážní svíčka (ne obyčejná!) — taje při nízké teplotě a mění se v teplý olej.',
      'Edging: třikrát těsně před vrchol a zpět, teprve počtvrté do cíle.',
    ],
    positions: [
      'Na zádech s rozpaženýma rukama — co nejvíc odhalené kůže.',
      'Vleže na břiše při masáži, která se postupně mění v něco víc.',
    ],
    places: ['Vana nebo sprcha — teplá a studená voda je hra s teplotou zadarmo.', 'Privátní wellness: sauna, vířivka a ochlazení.'],
    firstStep: 'Zavři oči (šátek není nutný) a nech se pět minut jen hladit různými věcmi. Nic víc od toho nečekejte.',
  },
  roleplay: {
    activities: [
      'Cizinci v baru: přijďte každý zvlášť, představte se jinými jmény a sbalte se znovu.',
      'Kostým nebo jen jeden rekvizit — brýle, kravata, uniforma — a hned je to někdo jiný.',
      'Napište si scénář po zprávách během dne a večer ho odehrajte.',
    ],
    positions: [
      'Na stole nebo pracovní desce — „šéf/ka a asistent/ka“ si o to říká.',
      'V křesle obkročmo — „pohovor“ nebo „soukromý tanec“.',
    ],
    places: ['Hotel — klíč od pokoje a jiné jméno v baru udělají půlku práce.', 'Auto na odlehlém místě jako kulisa „stopaře/ky“.'],
    firstStep: 'Začněte jen jménem: oslovte se večer jinak a chvíli mluvte jako někdo jiný. Kdyby to bylo k smíchu, zasmějte se — i to je výsledek.',
  },
  watch: {
    activities: [
      'Pomalé svlékání na hudbu, druhý jen sedí a nesmí se dotknout.',
      'Vzájemná masturbace: vedle sebe nebo naproti, oči na partnerovi/ce.',
      'Velké zrcadlo u postele — dívejte se na sebe jako na film.',
    ],
    positions: [
      'Obrácený jezdec / jezdkyně před zrcadlem.',
      'Zezadu vestoje čelem k zrcadlu.',
    ],
    places: ['Před zrcadlem v ložnici nebo v koupelně.', 'Swingers klub — dá se přijít jen se dívat nebo být vidět, bez výměny partnerů.'],
    firstStep: 'Nechte příště rozsvíceno a jeden z vás ať se chvíli jen dívá. Pokud vás láká publikum, klub pro páry je legální místo, kde to nikoho nepohorší.',
  },
  toys: {
    activities: [
      'Párový vibrátor nebo vibrační kroužek při sexu — nejjednodušší vstup.',
      'Společný nákup: každý vybere jednu hračku pro toho druhého.',
      'Hračka na dálkové ovládání přes aplikaci — ovladač dostane partner/ka.',
    ],
    positions: [
      'Lžičky — volné ruce a snadný přístup pro hračku.',
      'Jezdec / jezdkyně s vibračním kroužkem.',
    ],
    places: ['Ložnice s „krabicí radostí“ po ruce.', 'Večeře venku s hračkou na dálku — tajemství jen pro vás dva.'],
    firstStep: 'Začněte malým vibrátorem („bullet“) a dobrým lubrikantem na vodní bázi. Hodí se na cokoli a nikoho nevyděsí.',
  },
  group: {
    activities: [
      'Nejdřív fantazie: popište si při sexu, jak by trojka vypadala. Nic se nemusí stát.',
      'Návštěva swingers klubu v režimu „jen se díváme“ s jasnou dohodou předem.',
      'Sepište si pravidla — co ano, co ne, kdo má právo veta — dřív, než někoho oslovíte.',
    ],
    positions: [
      'Ve třech: jeden uprostřed mezi dvěma — „sendvič“ z polibků a doteků.',
      'Vedle sebe s druhým párem, každý se svým partnerem (soft swap).',
    ],
    places: ['Swingers nebo párový klub — bezpečné a diskrétní prostředí s pravidly.', 'Neutrální půda: hotel místo vaší ložnice.'],
    firstStep: 'Promluvte si o tom mimo postel a střízliví. Otázka „co by tě na tom lákalo a čeho se bojíš?“ řekne víc než jakákoli akce.',
  },
  verbal: {
    activities: [
      'Zprávy přes den: jedna věta o tom, co večer uděláš. Stupňujte to.',
      'Komentuj nahlas, co děláš a co cítíš — nejjednodušší dirty talk je popis.',
      'Domluvte si slova, která chcete slyšet, a která naopak nikdy.',
    ],
    positions: [
      'Lžičky — ústa přímo u ucha.',
      'Misionář zblízka, tváří v tvář.',
    ],
    places: ['Telefon nebo hlasovka, když jste od sebe.', 'Potmě — když se nevidíte, mluví se snáz.'],
    firstStep: 'Začni třemi větami: „Líbí se mi, když…“, „Chci, abys…“, „Nepřestávej.“ Sprostá slova přijdou sama, nebo taky ne.',
  },
  adventure: {
    activities: [
      'Mapa bytu: každý týden jiná místnost — sprcha, linka, gauč, chodba.',
      'Rychlovka před odchodem, když už máte být dávno pryč.',
      'Víkend jen kvůli sexu: chata, hotel nebo stan a žádný jiný program.',
    ],
    positions: [
      'Vestoje ve sprše, jedna noha na okraji vany.',
      'Na kuchyňské lince nebo na pračce — výška bývá akorát.',
    ],
    places: [
      'Auto na vlastním pozemku nebo na opravdu odlehlém místě.',
      'Privátní wellness, hodinový hotel, chata s krbem, stan mimo kemp.',
      'Odlehlá louka nebo les daleko od cest — deka s sebou.',
    ],
    firstStep: 'Začněte doma mimo ložnici. Venku platí jednoduché pravidlo: jen tam, kde vás nikdo neuvidí.',
  },
  romance: {
    activities: [
      'Večer bez cíle: hodina masáže a mazlení, při které se sex „nesmí“ stát.',
      'Synchronizovaný dech a oční kontakt — pět minut vsedě naproti sobě.',
      'Společná koupel, svíčky, playlist a telefon v jiné místnosti.',
    ],
    positions: [
      'Lotos: vsedě tváří v tvář, nohy kolem sebe.',
      'Lžičky nebo misionář s polštářem pod boky — pomalu a zblízka.',
    ],
    places: ['Ložnice proměněná svíčkami a čistým povlečením.', 'Chata s krbem, vana pro dva, deka pod hvězdami na vlastní zahradě.'],
    firstStep: 'Zpomalte na polovinu. Doslova — všechno, co děláte, zkuste udělat dvakrát pomaleji.',
  },
};

// "Když se vám líbí A, mohlo by se vám líbit i B." — neighbouring cups worth
// peeking into when a cup is full.
export const RELATED: Record<CupKey, CupKey[]> = {
  dominance: ['bondage', 'verbal', 'sensation'],
  submission: ['bondage', 'sensation', 'verbal'],
  bondage: ['sensation', 'dominance', 'submission'],
  impact: ['dominance', 'submission', 'sensation'],
  sensation: ['bondage', 'romance', 'toys'],
  roleplay: ['verbal', 'dominance', 'adventure'],
  watch: ['adventure', 'group', 'toys'],
  toys: ['sensation', 'watch', 'adventure'],
  group: ['watch', 'roleplay', 'verbal'],
  verbal: ['roleplay', 'dominance', 'submission'],
  adventure: ['watch', 'roleplay', 'toys'],
  romance: ['sensation', 'verbal', 'toys'],
};

export type DatingTip = { name: string; desc: string; cups: CupKey[] };

// Where to look for like-minded people. Matched against the fullest cups;
// entries with no cups listed fit everybody.
export const DATING: DatingTip[] = [
  { name: 'Feeld', desc: 'Aplikace pro páry i jednotlivce otevřená kinku, trojkám a nemonogamii. V profilu se dá rovnou vyplnit, co hledáte.', cups: ['group', 'dominance', 'submission', 'bondage', 'roleplay', 'watch'] },
  { name: 'FetLife', desc: 'Sociální síť kink a BDSM komunity — spíš diskuse, skupiny a kalendář akcí než klasická seznamka. Dobré místo, kde najít místní munch.', cups: ['dominance', 'submission', 'bondage', 'impact', 'sensation'] },
  { name: 'JOYclub', desc: 'Erotická komunita pro páry i singles: swingers, kluby, akce a seznamování podle preferencí.', cups: ['group', 'watch', 'adventure'] },
  { name: 'Amatéři.com', desc: 'Česká erotická komunita se seznamkou — hodně párů a lidí otevřených experimentům.', cups: ['group', 'watch', 'adventure', 'toys'] },
  { name: '3Fun', desc: 'Aplikace zaměřená na hledání třetího do páru a na setkání párů.', cups: ['group'] },
  { name: 'Pure', desc: 'Anonymní aplikace na nezávazná setkání — inzerát napíšete vlastními slovy a rovnou řeknete, o co jde.', cups: ['adventure', 'verbal', 'roleplay'] },
  { name: 'OkCupid', desc: 'Klasická seznamka s podrobnými otázkami včetně těch o sexu — dobře se na ní hledá někdo naladěný podobně.', cups: ['romance', 'verbal', 'sensation', 'toys'] },
  { name: 'Tinder, Bumble, Badoo', desc: 'Největší výběr lidí. O kinku se tu mluví až po seznámení, ale upřímná věta v profilu ušetří čas oběma.', cups: ['romance'] },
];

export const COMMUNITY_TIPS: string[] = [
  'Munch — neformální setkání kink komunity v běžné hospodě nebo kavárně. Žádné hraní, jen povídání; ideální první krok.',
  'Workshopy: vázání (šibari), impact play nebo komunikace pro páry. Naučíte se techniku i bezpečnost.',
  'Párové a swingers kluby mívají večery pro nováčky s prohlídkou a vysvětlením pravidel.',
];

export const SAFETY_RULES: { title: string; text: string }[] = [
  { title: 'Domluva předem', text: 'Řekněte si, co chcete zkusit, co je „možná“ a co je tvrdé ne. Mluvte o tom mimo postel a střízliví.' },
  { title: 'Stopka', text: 'Semafor funguje vždy: zelená = pokračuj, oranžová = zpomal, červená = okamžitě konec. Stopka se nikdy nevyčítá.' },
  { title: 'Svazování', text: 'Nikdy kolem krku, nikdy nenechávat svázaného o samotě. Nůžky po ruce, a když brní prsty, rozvázat.' },
  { title: 'Dech je tabu', text: 'Škrcení a omezování dechu bezpečně dělat nejde — vynechte je, i když je to v pornu běžné.' },
  { title: 'Aftercare', text: 'Po intenzivní hře deka, voda, objetí a pár slov. Druhý den se zeptejte, jak to dozvívá.' },
];

export const PLACES_LEGAL_NOTE =
  'Sex na místě, kde vás může někdo vidět, může být v Česku přestupek a v horším případě i trestný čin výtržnictví. Vybírejte místa, kde nikoho nepohoršíte — soukromí, pronajatý prostor nebo klub.';

export const DATING_SAFETY_NOTE =
  'S žádnou ze služeb nejsme spojeni a nabídka se mění — podmínky si ověřte. První schůzka vždy na veřejném místě, dejte někomu vědět, kde jste, a hranice si řekněte dřív, než se svléknete.';

// ---------------------------------------------------------------------------
// Result summaries
// ---------------------------------------------------------------------------

export type Recommendations = {
  top: { cup: Cup; result: CupResult; tips: CupTips }[];
  explore: { cup: Cup; result: CupResult; tips: CupTips }[];
  related: { from: Cup; to: Cup }[];
  dating: DatingTip[];
};

export function recommend(cups: CupResults): Recommendations {
  const ranked = rankedCups(cups);
  const explored = ranked.filter((r) => !isUnexplored(r.result));

  // Fullest cups that are at least half full (max 4). When none is, fall back
  // to the single fullest one — but only if it shows some interest; a clear
  // "no" to everything gets no recommendation at all.
  let top = explored.filter((r) => r.result.fill >= 50).slice(0, 4);
  if (top.length === 0 && explored.length > 0 && explored[0].result.fill >= 25) top = explored.slice(0, 1);

  const explore = ranked.filter((r) => isUnexplored(r.result)).slice(0, 4);

  // Neighbouring cups the person has not filled yet.
  const topKeys = new Set(top.map((t) => t.cup.key));
  const seen = new Set<CupKey>();
  const related: { from: Cup; to: Cup }[] = [];
  for (const t of top) {
    for (const key of RELATED[t.cup.key]) {
      const r = cups[key];
      if (topKeys.has(key) || seen.has(key)) continue;
      if (r && r.fill < 25 && !isUnexplored(r)) continue; // a clear "no" stays a no
      seen.add(key);
      related.push({ from: t.cup, to: CUP_BY_KEY[key] });
      break;
    }
  }

  const dating = DATING
    .map((d) => ({ d, hits: d.cups.filter((k) => topKeys.has(k)).length }))
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 4)
    .map((x) => x.d);

  return { top: top.map((t) => ({ ...t, tips: TIPS[t.cup.key] })), explore: explore.map((t) => ({ ...t, tips: TIPS[t.cup.key] })), related, dating };
}

export function fullCupCount(cups: CupResults): { full: number; total: number } {
  const list = rankedCups(cups);
  return { full: list.filter((r) => r.result.fill >= FULL_THRESHOLD && !isUnexplored(r.result)).length, total: list.length };
}

// --- Comparison of two profiles (a = the viewer, b = their partner) --------

export type CupComparison = {
  cup: Cup;
  a: CupResult;
  b: CupResult;
  kind: 'shared' | 'talk' | 'explore' | 'neutral' | 'skip';
};

export type Comparison = {
  rows: CupComparison[];
  // 0-100: how close the two sets of cups are.
  harmony: number;
  // Dominance / submission fit, when both cups were measured.
  dynamic: string | null;
};

export function compareProfiles(a: CupResults, b: CupResults): Comparison {
  const rows: CupComparison[] = [];
  let diffSum = 0;
  for (const cup of CUPS) {
    const ra = a[cup.key];
    const rb = b[cup.key];
    if (!ra || !rb) continue;
    const diff = Math.abs(ra.fill - rb.fill);
    diffSum += diff;
    let kind: CupComparison['kind'] = 'neutral';
    // "I don't know" is never read as a yes: if either side is unsure, the
    // cup is something to explore, not a shared interest.
    if (isUnexplored(ra) || isUnexplored(rb)) kind = 'explore';
    else if (ra.fill >= 60 && rb.fill >= 60) kind = 'shared';
    else if (diff >= 40) kind = 'talk';
    else if (ra.fill < 25 && rb.fill < 25) kind = 'skip';
    rows.push({ cup, a: ra, b: rb, kind });
  }
  const harmony = rows.length > 0 ? Math.round(100 - diffSum / rows.length) : 0;

  let dynamic: string | null = null;
  const [da, sa, db, sb] = [a.dominance, a.submission, b.dominance, b.submission];
  if (da && sa && db && sb) {
    // Only cups the person was actually sure about count towards the verdict.
    const sure = (r: CupResult) => (isUnexplored(r) ? 0 : r.fill);
    const [daF, saF, dbF, sbF] = [sure(da), sure(sa), sure(db), sure(sb)];
    const aLeads = daF >= 60 && sbF >= 60;
    const bLeads = dbF >= 60 && saF >= 60;
    if (aLeads && bLeads) dynamic = 'Oba umíte vést i se odevzdat — střídání rolí (switch) je pro vás jako dělané.';
    else if (aLeads) dynamic = 'Zapadáte do sebe: ty rád/a vedeš, partner/ka se rád/a odevzdá.';
    else if (bLeads) dynamic = 'Zapadáte do sebe: partner/ka rád/a vede, ty se rád/a odevzdáš.';
    else if (daF >= 60 && dbF >= 60) dynamic = 'Oba chcete vést. Zkuste se střídat po večerech — nebo o vedení hrát.';
    else if (saF >= 60 && sbF >= 60) dynamic = 'Oba se chcete odevzdat. Losujte, kdo dnes povede, nebo si pokyny napište předem.';
  }

  return { rows, harmony, dynamic };
}
