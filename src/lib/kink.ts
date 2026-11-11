// Kinkometr — solo test. Every area of interest is a "cup" (pohár) that fills
// up according to the answers. Pure data + scoring, shared by the test UI, the
// server action and the result / comparison pages.
//
// Two rounds: a short, mild first round over every cup, then an optional
// "deeper" round — sharper statements plus give / receive direction — only for
// the cups the person chose to explore further.

export type GroupKey = 'power' | 'body' | 'fantasy' | 'people' | 'tender';

export const GROUPS: { key: GroupKey; label: string; desc: string }[] = [
  { key: 'power', label: 'Moc & role', desc: 'Kdo vede, kdo se odevzdává a jak moc' },
  { key: 'body', label: 'Tělo & smysly', desc: 'Co a jak tělo cítí' },
  { key: 'fantasy', label: 'Fantazie & styl', desc: 'Příběhy, slova, materiály, fetiše' },
  { key: 'people', label: 'Lidé & místa', desc: 'Publikum, další lidé, jiná prostředí' },
  { key: 'tender', label: 'Něha & spojení', desc: 'Pomalu, zblízka, s citem' },
];

export type CupKey =
  | 'dominance' | 'submission' | 'bondage' | 'impact' | 'control' | 'praise' | 'primal'
  | 'sensation' | 'anal' | 'oral' | 'toys' | 'edge'
  | 'roleplay' | 'verbal' | 'materials' | 'feet' | 'gender'
  | 'watch' | 'group' | 'sharing' | 'adventure'
  | 'romance' | 'tantra';

export type Cup = {
  key: CupKey;
  group: GroupKey;
  label: string;
  // Short "who you are" tag used when this is somebody's fullest cup.
  persona: string;
  desc: string;
  color: string;
  // Part of the BDSM-only test.
  bdsm: boolean;
  // Cups where it matters which side you are on. The first two deeper
  // statements then measure "give" and "receive".
  dir?: { give: string; receive: string };
};

export const CUPS: Cup[] = [
  // --- Moc & role
  { key: 'dominance', group: 'power', label: 'Vedení', persona: 'Dirigent', desc: 'Dominance — určovat tempo, pravidla a směr', color: '#ff3d6e', bdsm: true },
  { key: 'submission', group: 'power', label: 'Odevzdání', persona: 'Odevzdaná duše', desc: 'Submise — nechat se vést a pustit kontrolu', color: '#b05cff', bdsm: true },
  { key: 'bondage', group: 'power', label: 'Svazování', persona: 'Uzlař', desc: 'Pouta, šátky, provazy a sladká bezmoc', color: '#ff7a1a', bdsm: true, dir: { give: 'svazovat', receive: 'být svázán/a' } },
  { key: 'impact', group: 'power', label: 'Plácání & bolest', persona: 'Hledač intenzity', desc: 'Výprask, kousnutí a slast na hraně bolesti', color: '#ff2ea6', bdsm: true, dir: { give: 'dávat', receive: 'dostávat' } },
  { key: 'control', group: 'power', label: 'Kontrola rozkoše', persona: 'Strážce vrcholu', desc: 'Oddalování, odpírání a orgasmus na povel', color: '#ff9e3d', bdsm: true, dir: { give: 'řídit', receive: 'nechat se řídit' } },
  { key: 'praise', group: 'power', label: 'Chvála & ponížení', persona: 'Hráč se slovy moci', desc: '„Hodná holka“, „hodný kluk“ — i pravý opak', color: '#e04bff', bdsm: true, dir: { give: 'říkat to', receive: 'slyšet to' } },
  { key: 'primal', group: 'power', label: 'Lov & zápas', persona: 'Šelma', desc: 'Živočišnost, přetlačování, hra na kořist', color: '#ff5c3d', bdsm: true },
  // --- Tělo & smysly
  { key: 'sensation', group: 'body', label: 'Smyslové hry', persona: 'Smyslový labužník', desc: 'Zavázané oči, led, olej, peříčko, napětí', color: '#00d5ff', bdsm: true, dir: { give: 'dráždit', receive: 'být drážděn/a' } },
  { key: 'edge', group: 'body', label: 'Na hraně', persona: 'Průzkumník hran', desc: 'Vosk, svorky, elektro, hra na doktora', color: '#7dd3ff', bdsm: true },
  { key: 'anal', group: 'body', label: 'Anální hra', persona: 'Objevitel zadních vrátek', desc: 'Od prstu a kolíku po pegging', color: '#5aa0ff', bdsm: false, dir: { give: 'pronikat', receive: 'přijímat' } },
  { key: 'oral', group: 'body', label: 'Orál', persona: 'Gurmán', desc: 'Ústy dávat i dostávat', color: '#35c9f0', bdsm: false, dir: { give: 'dávat', receive: 'dostávat' } },
  { key: 'toys', group: 'body', label: 'Hračky', persona: 'Sběratel hraček', desc: 'Vibrátory, kroužky, kolíky a jiné vychytávky', color: '#35f0a0', bdsm: false },
  // --- Fantazie & styl
  { key: 'roleplay', group: 'fantasy', label: 'Role & scénáře', persona: 'Herec', desc: 'Převleky, cizinci v baru, domluvené příběhy', color: '#ffd400', bdsm: false },
  { key: 'verbal', group: 'fantasy', label: 'Slova', persona: 'Šeptal', desc: 'Dirty talk, zprávy a vyprávěné fantazie', color: '#c8ff2e', bdsm: false },
  { key: 'materials', group: 'fantasy', label: 'Materiály & prádlo', persona: 'Estét', desc: 'Krajka, punčochy, latex, kůže', color: '#ffb02e', bdsm: false },
  { key: 'feet', group: 'fantasy', label: 'Nohy & tělo', persona: 'Ctitel', desc: 'Chodidla, boty a uctívání jedné části těla', color: '#f5e050', bdsm: false },
  { key: 'gender', group: 'fantasy', label: 'Hra s genderem', persona: 'Proměnlivec', desc: 'Prohozené role, převlek, proměna', color: '#a8f02e', bdsm: false },
  // --- Lidé & místa
  { key: 'watch', group: 'people', label: 'Dívat se & předvádět', persona: 'Divák i hvězda', desc: 'Voyeurismus a exhibicionismus', color: '#3d8bff', bdsm: false, dir: { give: 'dívat se', receive: 'být viděn/a' } },
  { key: 'group', group: 'people', label: 'Víc lidí', persona: 'Objevitel', desc: 'Trojka, swingers, otevřenost', color: '#ff5c5c', bdsm: false },
  { key: 'sharing', group: 'people', label: 'Sdílení partnera', persona: 'Štědrá duše', desc: 'Partner/ka s někým dalším — a ty u toho', color: '#ff8a8a', bdsm: false, dir: { give: 'dívat se', receive: 'být sdílen/a' } },
  { key: 'adventure', group: 'people', label: 'Místa & dobrodružství', persona: 'Dobrodruh', desc: 'Sex mimo postel a špetka rizika', color: '#2effd5', bdsm: false },
  // --- Něha & spojení
  { key: 'romance', group: 'tender', label: 'Něha & smyslnost', persona: 'Romantik', desc: 'Pomalu, zblízka, s dlouhou předehrou', color: '#ff9ecb', bdsm: false },
  { key: 'tantra', group: 'tender', label: 'Pomalý sex & tantra', persona: 'Tichá voda', desc: 'Dotek, dech a cesta místo cíle', color: '#ffc4a3', bdsm: false },
];

export const CUP_BY_KEY: Record<CupKey, Cup> = Object.fromEntries(CUPS.map((c) => [c.key, c])) as Record<CupKey, Cup>;

// base: two mild statements (round one). deep: three sharper ones (round two);
// for cups with `dir`, deep[0] is the "give" side and deep[1] the "receive" side.
type Statements = { base: [string, string]; deep: [string, string, string] };

const STATEMENTS: Record<CupKey, Statements> = {
  dominance: {
    base: ['Vzrušuje mě, když v posteli určuju, co se bude dít.', 'Baví mě dávat pokyny a sledovat, jak je druhý plní.'],
    deep: [
      'Chci mít pravidla a rituály i mimo postel — oslovení, úkoly, svolení.',
      'Vzrušuje mě druhého za neposlušnost „potrestat“ a za snahu odměnit.',
      'Lákal by mě obojek, vodítko nebo jiný symbol toho, že mi druhý patří.',
    ],
  },
  submission: {
    base: ['Vzrušuje mě, když se můžu úplně odevzdat a nechat se vést.', 'Líbí se mi, když mi partner/ka říká, co mám udělat.'],
    deep: [
      'Chtěl/a bych plnit pravidla a úkoly i mimo postel.',
      'Vzrušuje mě sloužit — obsluhovat, klečet, čekat na pokyn.',
      'Baví mě schválně zlobit a provokovat, aby mě druhý musel zkrotit.',
    ],
  },
  bondage: {
    base: ['Láká mě hra s pouty, šátkem nebo provazem — ať už svazuju, nebo jsem svázán/a.', 'Vzrušuje mě bezmoc — moje, nebo partnera/ky.'],
    deep: [
      'Chci svazovat a mít druhého bezmocného před sebou.',
      'Chci být svázán/a a nemoct se bránit.',
      'Láká mě vázání celého těla provazem (šibari) nebo delší znehybnění.',
    ],
  },
  impact: {
    base: ['Plácnutí přes zadek k sexu patří.', 'Kousání, škrábání nebo tahání za vlasy mě vzrušuje.'],
    deep: [
      'Chci dávat výprask — rukou, plácačkou, důtkami.',
      'Chci dostat výprask, který cítím ještě druhý den.',
      'Bolest mě vzrušuje sama o sobě, nejen jako koření.',
    ],
  },
  control: {
    base: ['Láká mě oddalování vyvrcholení, aby byl konec silnější.', 'Vzrušuje mě, když o orgasmu rozhoduje ten druhý — nebo já o jeho.'],
    deep: [
      'Chci rozhodovat, kdy a jestli druhý smí vyvrcholit.',
      'Chci o vyvrcholení prosit a nechat rozhodnutí na druhém.',
      'Láká mě dlouhé odpírání — dny bez orgasmu, případně pás cudnosti.',
    ],
  },
  praise: {
    base: ['Vzrušuje mě pochvala typu „hodná holka“ / „hodný kluk“ — slyšet ji, nebo říkat.', 'Vzrušují mě při sexu i drsnější, shazující slova.'],
    deep: [
      'Baví mě druhého při hře slovně shazovat nebo ztrapňovat.',
      'Vzrušuje mě, když mě druhý při hře ponižuje.',
      'Láká mě ponížení i činy — klečet, prosit, plnit trapné úkoly.',
    ],
  },
  primal: {
    base: ['Vzrušuje mě divoký, živočišný sex — přetlačování, vrčení, kousání.', 'Láká mě hra na honěnou: jeden utíká, druhý loví.'],
    deep: [
      'Vzrušuje mě hraný odpor — „bránit se“ nebo přemáhat — po jasné domluvě předem.',
      'Chci se o to, kdo bude nahoře, opravdu poprat.',
      'Láká mě předem domluvené „přepadení“, které přijde, když to nečekám.',
    ],
  },
  sensation: {
    base: ['Líbilo by se mi zavázat oči — sobě, nebo partnerovi/ce.', 'Láká mě hra s teplotou a doteky: led, teplý olej, peříčko, nehty.'],
    deep: [
      'Chci druhého dlouho dráždit a sledovat, jak se svíjí.',
      'Chci být drážděn/a tak dlouho, až to skoro nejde vydržet.',
      'Láká mě vypnout víc smyslů naráz — oči, uši, pohyb.',
    ],
  },
  edge: {
    base: ['Láká mě vosk, svorky nebo jiné ostřejší dráždění.', 'Zajímá mě hra na doktora a „vyšetření“.'],
    deep: [
      'Chci zkusit elektrostimulaci (e-stim).',
      'Lákají mě svorky na bradavkách nebo jiných citlivých místech.',
      'Vzrušuje mě „klinická“ atmosféra — rukavice, nástroje, lehátko.',
    ],
  },
  anal: {
    base: ['Anální hrátky (prst, jazyk, malá hračka) mě lákají.', 'Anální sex je pro mě vítaná součást repertoáru.'],
    deep: [
      'Chci být ten/ta, kdo proniká — třeba i s připínacím penisem (pegging).',
      'Chci být ten/ta, do koho se proniká.',
      'Lákají mě kolíky nošené delší dobu nebo postupné zvětšování.',
    ],
  },
  oral: {
    base: ['Orální sex patří k tomu, co mám na sexu nejradši.', 'Orál si užiju i jako hlavní chod, ne jen jako předehru.'],
    deep: [
      'Vzrušuje mě dělat to druhému dlouho a důkladně.',
      'Vzrušuje mě nechat se dlouho rozmazlovat.',
      'Láká mě sezení na obličeji nebo hluboký orál.',
    ],
  },
  toys: {
    base: ['Hračky (vibrátor, kroužek, kolík…) do společného sexu patří.', 'Rád/a zkouším nové pomůcky a vychytávky.'],
    deep: [
      'Lákala by mě hračka na dálkové ovládání — třeba i venku mezi lidmi.',
      'Chci zkusit větší výbavu: sex stroj, houpačku, polohovací nábytek.',
      'Láká mě použít hračky na partnerovi/ce a jen se dívat.',
    ],
  },
  roleplay: {
    base: ['Baví mě představa hrát v posteli někoho jiného.', 'Vzrušují mě kostýmy, uniformy nebo převleky.'],
    deep: [
      'Chci si předem napsat scénář a odehrát ho se vším všudy.',
      'Láká mě pet play — hrát si na zvířátko, nebo na jeho majitele.',
      'Lákala by mě hra, která trvá celý den nebo víkend.',
    ],
  },
  verbal: {
    base: ['Vzrušuje mě, když se při sexu mluví sprostě.', 'Rád/a posílám nebo dostávám žhavé zprávy.'],
    deep: [
      'Chci slyšet do detailu, co se mnou partner/ka udělá.',
      'Vzrušuje mě sex po telefonu nebo hlasové zprávy.',
      'Rád/a si nahlas vyprávíme fantazie — i ty, které nikdy neuděláme.',
    ],
  },
  materials: {
    base: ['Krajkové prádlo, punčochy nebo podvazky mě spolehlivě vzruší.', 'Přitahuje mě latex, kůže nebo lak.'],
    deep: [
      'Chci sex, při kterém oblečení zůstane na těle.',
      'Vzrušuje mě samotný materiál — jeho vůně, lesk, zvuk, dotek.',
      'Láká mě celý oblek, korzet nebo vysoké kozačky jako hlavní bod programu.',
    ],
  },
  feet: {
    base: ['Vzrušují mě nohy, chodidla nebo boty.', 'Mám slabost pro jednu konkrétní část těla (ruce, krk, zadek, podpaží…).'],
    deep: [
      'Chci nohy líbat, masírovat, uctívat — nebo to nechat dělat sobě.',
      'Vzrušuje mě vůně a chuť partnerova těla.',
      'Láká mě „uctívání těla“: dlouho se věnovat jediné části, ničemu jinému.',
    ],
  },
  gender: {
    base: ['Láká mě prohodit si v posteli zaběhnuté role.', 'Vzrušuje mě obléct si (nebo vidět na partnerovi/ce) věci, které „patří“ druhému pohlaví.'],
    deep: [
      'Chci zkusit líčení, paruku, kompletní proměnu.',
      'Vzrušuje mě být při sexu vnímán/a jinak, než jak mě svět vidí běžně.',
      'Láká mě, aby mou proměnu vedl/a partner/ka.',
    ],
  },
  watch: {
    base: ['Vzrušuje mě dívat se — na partnera/ku, na jiné, na nás v zrcadle.', 'Vzrušuje mě, když se někdo dívá na mě.'],
    deep: [
      'Chci se dívat na jiné lidi při sexu (klub, párty).',
      'Chci, aby se na nás při sexu někdo díval.',
      'Láká mě natáčet se nebo fotit — jen pro nás dva.',
    ],
  },
  group: {
    base: ['Láká mě představa sexu ve třech.', 'Zajímala by mě návštěva swingers klubu, i kdybychom se jen dívali.'],
    deep: [
      'Chci zkusit výměnu partnerů s jiným párem.',
      'Láká mě sex ve větší skupině.',
      'Umím si představit otevřený vztah s jasnými pravidly.',
    ],
  },
  sharing: {
    base: ['Vzrušuje mě představa partnera/ky s někým dalším.', 'Vzrušuje mě představa, že já jsem s někým dalším a partner/ka o tom ví.'],
    deep: [
      'Chci se dívat, jak si partnera/ku užívá někdo jiný.',
      'Chci být s někým dalším, zatímco se partner/ka dívá.',
      'Vzrušuje mě o tom pak do detailu vyprávět — nebo to slyšet.',
    ],
  },
  adventure: {
    base: ['Sex jinde než v posteli mě láká — kuchyň, sprcha, auto.', 'Vzrušuje mě špetka rizika, že by nás mohl někdo přistihnout.'],
    deep: [
      'Chci sex venku v přírodě, kde široko daleko nikdo není.',
      'Láká mě rychlovka tam, kde se to „nedělá“ — a kde nás nikdo neuvidí.',
      'Rád/a bych si na sex pronajal/a hotel, privátní wellness nebo chatu.',
    ],
  },
  romance: {
    base: ['Nejvíc si užívám pomalý sex s dlouhou předehrou.', 'Oční kontakt, líbání a objímání jsou pro mě při sexu zásadní.'],
    deep: [
      'Miluju dlouhé masáže a mazlení, které nikam nespěchá.',
      'Atmosféra — svíčky, hudba, čas jen pro nás — pro mě hodně znamená.',
      'Sex je pro mě hlavně o citu; bez něj mě to netáhne.',
    ],
  },
  tantra: {
    base: ['Láká mě sex, který nemá za cíl orgasmus.', 'Zajímá mě vědomý dotek, společný dech, tantra.'],
    deep: [
      'Chci zkusit hodinu dotyků bez pronikání.',
      'Láká mě tantrická masáž — dát i dostat.',
      'Zajímá mě prodlužovat vzrušení a prožívat ho celým tělem.',
    ],
  },
};

export type KinkMode = 'full' | 'quick' | 'bdsm';

export const MODES: Record<KinkMode, { label: string; desc: string; minutes: number }> = {
  full: { label: 'Plný Kinkometr', desc: `Všech ${CUPS.length} pohárů, 2 otázky na každý`, minutes: 5 },
  quick: { label: 'Rychlovka', desc: `Všech ${CUPS.length} pohárů, 1 otázka na každý`, minutes: 2 },
  bdsm: { label: 'BDSM test', desc: 'Moc, svazování, bolest, kontrola, smysly', minutes: 2 },
};

export function isKinkMode(value: unknown): value is KinkMode {
  return value === 'full' || value === 'quick' || value === 'bdsm';
}

export type KinkQuestion = { id: string; cup: CupKey; text: string };

export function cupsFor(mode: KinkMode): Cup[] {
  return CUPS.filter((c) => (mode === 'bdsm' ? c.bdsm : true));
}

// Round one, interleaved across cups so one topic never comes twice in a row.
export function questionsFor(mode: KinkMode): KinkQuestion[] {
  const cups = cupsFor(mode);
  const perCup = mode === 'quick' ? 1 : 2;
  const out: KinkQuestion[] = [];
  for (let i = 0; i < perCup; i++) {
    for (const cup of cups) {
      out.push({ id: `${cup.key}_b${i + 1}`, cup: cup.key, text: STATEMENTS[cup.key].base[i] });
    }
  }
  return out;
}

// Round two: the three deeper statements of each chosen cup, cup by cup.
export function deepQuestionsFor(cupKeys: CupKey[]): KinkQuestion[] {
  return cupKeys.flatMap((key) =>
    STATEMENTS[key].deep.map((text, i) => ({ id: `${key}_d${i + 1}`, cup: key, text }))
  );
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

export type CupResult = {
  // Round one: 0-100 interest, how many "I don't know", how many answers.
  fill: number;
  unsure: number;
  count: number;
  // Round two (only when the person went deeper): 0-100 depth and, for
  // directional cups, the raw 0-4 answers for each side.
  depth?: number;
  give?: number;
  receive?: number;
};
export type CupResults = Partial<Record<CupKey, CupResult>>;

function isAnswer(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 4;
}

// Validates raw answers and computes each cup. Round one must be complete for
// the mode; round two is optional but all-or-nothing per cup. Returns null when
// something is missing or out of range.
export function scoreAnswers(mode: KinkMode, answers: Record<string, unknown>): { cups: CupResults; clean: Record<string, number> } | null {
  const cups: CupResults = {};
  const clean: Record<string, number> = {};

  for (const q of questionsFor(mode)) {
    const v = answers[q.id];
    if (!isAnswer(v)) return null;
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

    const deep = deepQuestionsFor([key]).map((q) => ({ q, v: answers[q.id] }));
    if (deep.every((d) => d.v === undefined)) continue;
    if (!deep.every((d) => isAnswer(d.v))) return null;
    const values = deep.map((d) => d.v as number);
    deep.forEach((d) => { clean[d.q.id] = d.v as number; });
    if (CUP_BY_KEY[key].dir) {
      // Being into only one side is not "less deep": the stronger side counts.
      cup.give = values[0];
      cup.receive = values[1];
      cup.depth = Math.round(((Math.max(values[0], values[1]) + values[2]) / 8) * 100);
    } else {
      cup.depth = Math.round((values.reduce((a, b) => a + b, 0) / (values.length * 4)) * 100);
    }
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

export function depthLabel(depth: number): string {
  if (depth >= 75) return 'naplno';
  if (depth >= 45) return 'do hloubky';
  if (depth >= 20) return 'spíš zlehka';
  return 'jen na povrchu';
}

export type Side = 'give' | 'receive' | 'both' | null;

// Which side of a directional cup the person leans to ("láká mě" or more).
export function sideOf(cup: CupResult): Side {
  if (cup.give === undefined || cup.receive === undefined) return null;
  const g = cup.give >= 3;
  const r = cup.receive >= 3;
  if (g && r) return 'both';
  if (g) return 'give';
  if (r) return 'receive';
  return null;
}

export function sideLabel(cup: Cup, result: CupResult): string | null {
  const side = sideOf(result);
  if (!cup.dir || !side) return null;
  if (side === 'both') return `${cup.dir.give} i ${cup.dir.receive}`;
  return side === 'give' ? cup.dir.give : cup.dir.receive;
}

// Cups worth offering for round two: clear interest in round one.
export function deepCandidates(cups: CupResults): CupKey[] {
  return rankedCups(cups)
    .filter((r) => r.result.fill >= 50 && !isUnexplored(r.result))
    .map((r) => r.cup.key);
}

// Cups present in a result, fullest first.
export function rankedCups(cups: CupResults): { cup: Cup; result: CupResult }[] {
  return CUPS.filter((c) => cups[c.key])
    .map((cup) => ({ cup, result: cups[cup.key]! }))
    .sort((a, b) => b.result.fill - a.result.fill);
}

export type GroupSummary = { key: GroupKey; label: string; desc: string; avg: number; full: number; cups: { cup: Cup; result: CupResult }[] };

// Cups by group, in the fixed group order, with the group's average fill.
export function groupSummaries(cups: CupResults): GroupSummary[] {
  return GROUPS.map((g) => {
    const list = CUPS.filter((c) => c.group === g.key && cups[c.key]).map((cup) => ({ cup, result: cups[cup.key]! }));
    const avg = list.length > 0 ? Math.round(list.reduce((s, r) => s + r.result.fill, 0) / list.length) : 0;
    const full = list.filter((r) => r.result.fill >= FULL_THRESHOLD && !isUnexplored(r.result)).length;
    return { ...g, avg, full, cups: list };
  }).filter((g) => g.cups.length > 0);
}

// ---------------------------------------------------------------------------
// Context (asked once at the start, never scored)
// ---------------------------------------------------------------------------

export type KinkContext = { single?: boolean; lowDesire?: boolean };

export function cleanContext(raw: unknown): KinkContext {
  const r = (raw ?? {}) as Record<string, unknown>;
  return { single: r.single === true, lowDesire: r.lowDesire === true };
}

export const MISSING_MAX = 300;

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

export type CupTips = {
  // What to try when the cup is full. Lists may be empty where they add nothing.
  activities: string[];
  positions: string[];
  places: string[];
  // Something sharper, shown only to people who went deeper and scored high.
  deeper?: string;
  // A gentle, low-stakes way to find out when the cup is unexplored.
  firstStep: string;
};

export const TIPS: Record<CupKey, CupTips> = {
  dominance: {
    activities: [
      'Večer podle tebe: předem řekni, že dnes vedeš, a rozhoduj o tempu, polohách i o tom, kdy bude konec.',
      'Pokyny místo otázek — „otoč se“, „podívej se na mě“, „ještě ne“. Krátké věty, klidný hlas.',
      'Hra na svolení: druhý se smí dotknout sebe nebo tebe, až když to dovolíš.',
    ],
    positions: ['Misionář s rukama druhého přidrženýma nad hlavou.', 'Zezadu vestoje u zdi nebo u stolu, s rukou na boku či zádech.'],
    places: ['Křeslo nebo židle: ty sedíš, druhý přichází k tobě.', 'Hotelový pokoj — v novém prostředí se role nasazuje snáz.'],
    deeper: 'Sepište si malou „smlouvu“ na týden: tři pravidla, jeden rituál na dobré ráno a jeden úkol denně. Po týdnu ji společně vyhodnoťte.',
    firstStep: 'Zkus si na deset minut vzít slovo: jen říkej, co chceš, a sleduj, co to s tebou dělá. Předem si domluvte stopku.',
  },
  submission: {
    activities: [
      'Večer bez rozhodování: druhý vybere všechno, ty jen plníš. Předem řekni, co je mimo hru.',
      'Úkol na den — zpráva s pokynem, který máš splnit, než se uvidíte.',
      'Služba s odměnou: masáž, svlékání, čekání v dohodnuté pozici… a pochvala na konci.',
    ],
    positions: ['Vkleče před druhým (polštář pod kolena).', 'Na břiše s rukama za zády nebo nad hlavou, druhý nahoře.'],
    places: ['Ložnice s přichystanou „scénou“ — deka, tlumené světlo, všechno po ruce.', 'Sprcha: nech se umýt a vést.'],
    deeper: 'Domluvte si pozici, ve které čekáš, když druhý přijde domů. Pět minut ticha v ní udělá víc než hodina hry.',
    firstStep: 'Řekni: „Dneska rozhoduj ty, já řeknu stop, kdyby něco.“ Stačí čtvrthodina, pak si o tom promluvte.',
  },
  bondage: {
    activities: [
      'Začněte šátkem nebo měkkými pouty na suchý zip — jdou rozepnout jednou rukou.',
      'Připoutání k čelu postele a pomalé dráždění, dokud svázaný/á neprosí.',
      'Kurz šibari pro páry nebo videonávod na základní „single column tie“.',
    ],
    positions: ['Na zádech, ruce svázané nad hlavou.', 'Na boku se zápěstími svázanými před tělem — pohodlné i na déle.'],
    places: ['Postel s pevným čelem nebo popruhy pod matraci.', 'Pronajatý BDSM privát s vybavením, až budete chtít víc.'],
    deeper: 'Hrudní postroj z provazu („chest harness“) drží, krásně vypadá a nikde neškrtí — dobrý druhý krok po zápěstích.',
    firstStep: 'Zkus „svázání na čestné slovo“: ruce drž nad hlavou sám/sama, jako by byly svázané. Zjistíš, jestli tě bezmoc vzrušuje, bez jediného uzlu.',
  },
  impact: {
    activities: [
      'Rozehřátí rukou: střídej hlazení a plácnutí na zadek, sílu přidávej po troškách a ptej se na číslo 1–10.',
      'Vyzkoušejte rozdíl mezi „pleskavým“ (dlaň, plácačka) a „tupým“ dopadem (důtky s širokými prameny).',
      'Škrábání nehty po zádech a kousnutí do ramene v pravou chvíli.',
    ],
    positions: ['Přes kolena — ten, kdo plácá, má všechno pod kontrolou.', 'Na čtyřech nebo v předklonu s oporou o postel.'],
    places: ['Ložnice nebo gauč — kdekoli, kde se dá pohodlně opřít.', 'BDSM privát s lavicí, pokud vás to chytne.'],
    deeper: 'Počítaný výprask: předem řekněte číslo, příjemce počítá nahlas a za každou ránu poděkuje. Rytmus dělá víc než síla.',
    firstStep: 'Jedno plácnutí v zápalu a otázka „ještě?“. Miřte jen na zadek a stehna — nikdy na ledviny, páteř a klouby.',
  },
  control: {
    activities: [
      'Edging: třikrát těsně před vrchol a zpět, teprve počtvrté do cíle.',
      'Orgasmus na povel: druhý odpočítává od deseti a ty smíš až na nulu.',
      '„Dnes ne“: celý večer hry bez vyvrcholení, odměna až zítra.',
    ],
    positions: ['Na zádech s rukama podél těla — ruce druhého mají plnou kontrolu.'],
    places: [],
    deeper: 'Týden „na klíč“: o každém vyvrcholení rozhoduje druhý, klidně po zprávách. Domluvte předem, kdy to končí.',
    firstStep: 'Při příštím sexu si těsně před vrcholem řekněte „stop“ a půl minuty jen dýchejte. Jednou. Pak pokračujte.',
  },
  praise: {
    activities: [
      'Pochvala nahlas: „přesně takhle“, „jsi úžasná/ý“, „hodná holka / hodný kluk“. Sledujte, co udělá s tělem.',
      'Sepište si každý tři slova, která chcete slyšet, a tři, která nikdy.',
      'Drsnější slovník jen ve hře: domluvte si slovo, kterým začíná a končí.',
    ],
    positions: [],
    places: [],
    deeper: 'Ponížení funguje jen s pojistkou: po hře vždy řekněte nahlas pravý opak toho, co zaznělo. Bez toho to bolí i druhý den.',
    firstStep: 'Začněte chválou — je bezpečná a rychle ukáže, jestli slova fungují. Drsnější polohu zkoušejte až po rozhovoru o tom, co je přes čáru.',
  },
  primal: {
    activities: [
      'Zápas na posteli: kdo koho přetlačí na lopatky, ten vede.',
      'Honěná po bytě se zhasnutými světly — chycená kořist se „vzdává“.',
      'Sex bez slov: jen vrčení, dech, kousání a ruce.',
    ],
    positions: ['Na zemi na dece — víc místa, nic se nerozbije.', 'Zezadu s pevným držením za boky nebo ramena.'],
    places: ['Obývák s odsunutým nábytkem.', 'Chata nebo zahrada, kde můžete být hlasití.'],
    deeper: 'Hraný odpor chce nejpřísnější pravidla ze všeho: stopka, která není „ne“ ani „dost“, a signál rukou pro případ, že nejde mluvit.',
    firstStep: 'Zkuste se chvíli jen přetlačovat a lechtat. Jestli vás rozproudí fyzická síla, poznáte to do minuty.',
  },
  sensation: {
    activities: [
      'Zavázané oči a tři různé doteky: peříčko, kostka ledu, teplá dlaň. Hádej, co přijde.',
      'Masážní svíčka (ne obyčejná!) — taje při nízké teplotě a mění se v teplý olej.',
      'Deset minut jen konečky prstů po celém těle, nic dalšího.',
    ],
    positions: ['Na zádech s rozpaženýma rukama — co nejvíc odhalené kůže.', 'Na břiše při masáži, která se postupně mění v něco víc.'],
    places: ['Vana nebo sprcha — teplá a studená voda je hra s teplotou zadarmo.', 'Privátní wellness: sauna, vířivka a ochlazení.'],
    deeper: 'Šátek přes oči plus sluchátka s hudbou: když zmizí dva smysly, každý dotek je dvakrát silnější. Ruku nechte volnou na signál.',
    firstStep: 'Zavři oči (šátek není nutný) a nech se pět minut jen hladit různými věcmi. Nic víc od toho nečekejte.',
  },
  edge: {
    activities: [
      'Vosk z masážní svíčky kapaný z výšky — čím výš, tím je chladnější.',
      'Nastavitelné svorky na bradavky: nejdřív minutu, nejvíc bolí sundání.',
      '„Prohlídka“: jeden leží a nesmí se hýbat, druhý ho důkladně a pomalu vyšetřuje.',
    ],
    positions: [],
    places: ['Postel přikrytá starým prostěradlem nebo ručníkem.', 'Studio s vyšetřovacím lehátkem, pokud vás chytne hra na doktora.'],
    deeper: 'Elektro jen přístrojem určeným pro e-stim a jen od pasu dolů — nikdy přes hrudník. Začínejte na nejnižším stupni.',
    firstStep: 'Kostka ledu a hned po ní teplá dlaň. Jestli vás baví kontrast, je vosk logický další krok.',
  },
  anal: {
    activities: [
      'Hodně lubrikantu a jen prst zvenku při orálu nebo masáži — bez pronikání.',
      'Malý kolík s rozšířenou základnou během běžného sexu.',
      'Pomalu a vždy řídí ten, kdo přijímá: on/a určuje tempo i hloubku.',
    ],
    positions: ['Na boku „lžičky“ — nejuvolněnější poloha pro začátek.', 'Přijímající nahoře, aby měl/a kontrolu nad hloubkou.'],
    places: ['Sprcha na úvod — čistota uklidní hlavu.'],
    deeper: 'Pegging: začněte menším připínacím penisem, než si myslíte, a první večer věnujte jen zvykání, ne výkonu.',
    firstStep: 'Jen dotek zvenku a hodně lubrikantu. Pravidlo zní: žádná bolest. Když to bolí, je to moc rychle nebo moc naráz.',
  },
  oral: {
    activities: [
      'Orál jako celý program: dvacet minut jen pro jednoho, bez „oplácení“.',
      'Řekni nahlas, co je ti příjemné — „pomaleji“, „přesně tam“, „nepřestávej“.',
      'Přidejte ruce, hračku nebo polštář pod boky.',
    ],
    positions: ['69 na boku — pohodlné pro oba.', 'Přijímající na kraji postele, druhý vkleče na polštáři.'],
    places: ['Křeslo nebo kraj gauče.', 'Sprcha.'],
    deeper: 'Sezení na obličeji: opora o čelo postele, váha na kolenou a domluvený signál poklepáním, když je potřeba vzduch.',
    firstStep: 'Zeptejte se navzájem na jednu věc, kterou byste při orálu chtěli jinak. Odpověď bývá překvapivě konkrétní.',
  },
  toys: {
    activities: [
      'Párový vibrátor nebo vibrační kroužek při sexu — nejjednodušší vstup.',
      'Společný nákup: každý vybere jednu hračku pro toho druhého.',
      'Hračka na dálkové ovládání přes aplikaci — ovladač dostane druhý.',
    ],
    positions: ['Lžičky — volné ruce a snadný přístup pro hračku.', 'Jeden nahoře obkročmo s vibračním kroužkem.'],
    places: ['Ložnice s „krabicí radostí“ po ruce.', 'Večeře venku s hračkou na dálku — tajemství jen pro vás dva.'],
    deeper: 'Polohovací klín nebo houpačka do dveří otevřou úhly, které bez opory nevydržíte déle než minutu.',
    firstStep: 'Začněte malým vibrátorem („bullet“) a dobrým lubrikantem na vodní bázi. Hodí se na cokoli a nikoho nevyděsí.',
  },
  roleplay: {
    activities: [
      'Cizinci v baru: přijďte každý zvlášť, představte se jinými jmény a sbalte se znovu.',
      'Kostým nebo jen jedna rekvizita — brýle, kravata, uniforma — a hned je to někdo jiný.',
      'Napište si scénář po zprávách během dne a večer ho odehrajte.',
    ],
    positions: ['Na stole nebo pracovní desce — kancelářský scénář si o to říká.', 'V křesle obkročmo — „pohovor“ nebo „soukromý tanec“.'],
    places: ['Hotel — klíč od pokoje a jiné jméno v baru udělají půlku práce.', 'Auto na odlehlém místě jako kulisa pro „stopaře“.'],
    deeper: 'Pet play začíná maličkostí: uši, obojek, miska s vodou a pravidlo „zvířátka nemluví“. Stačí deset minut.',
    firstStep: 'Začněte jen jménem: oslovte se večer jinak a chvíli mluvte jako někdo jiný. Kdyby to bylo k smíchu, zasmějte se — i to je výsledek.',
  },
  verbal: {
    activities: [
      'Zprávy přes den: jedna věta o tom, co večer uděláš. Stupňujte to.',
      'Komentuj nahlas, co děláš a co cítíš — nejjednodušší dirty talk je popis.',
      'Vyprávějte si fantazii na střídačku, každý jednu větu.',
    ],
    positions: ['Lžičky — ústa přímo u ucha.', 'Tváří v tvář zblízka.'],
    places: ['Telefon nebo hlasovka, když jste od sebe.', 'Potmě — když se nevidíte, mluví se snáz.'],
    firstStep: 'Začni třemi větami: „Líbí se mi, když…“, „Chci, abys…“, „Nepřestávej.“ Sprostá slova přijdou sama, nebo taky ne.',
  },
  materials: {
    activities: [
      'Večer, kdy se prádlo nesundává — jen odhrnuje.',
      'Kupte si navzájem jeden kousek: prádlo, punčochy, kožený náramek.',
      'Pomalé oblékání místo svlékání: dívat se, jak se druhý strojí.',
    ],
    positions: ['Vestoje před zrcadlem — ať je co vidět.'],
    places: ['Hotel nebo večeře venku: mít to na sobě pod běžným oblečením.'],
    deeper: 'Latex chce pudr nebo lubrikant na oblékání a lesk na povrch. Na zkoušku stačí rukavice nebo punčochy, celý oblek až potom.',
    firstStep: 'Řekněte si, co na tom druhém rádi vidíte a čeho se rádi dotýkáte. Jeden kousek stačí.',
  },
  feet: {
    activities: [
      'Masáž chodidel teplým olejem, která nekončí u kotníků.',
      'Líbání a hlazení jedné části těla po deset minut — jen té jedné.',
      'Boty nebo punčochy nechat na nohou.',
    ],
    positions: ['Jeden sedí v křesle, druhý u jeho nohou.'],
    places: ['Vana — umytá a prohřátá chodidla jsou nejlepší začátek.'],
    firstStep: 'Nabídni masáž nohou a sleduj, co to dělá s tebou i s druhým. Je to nejnenápadnější vstup do celé oblasti.',
  },
  gender: {
    activities: [
      'Prohoďte si na večer role: kdo obvykle vede, je veden; kdo obvykle svléká, je svlékán.',
      'Půjčte si navzájem jeden kus oblečení nebo prádla.',
      'Společné líčení nebo oblékání jako předehra.',
    ],
    positions: [],
    places: ['Doma za zavřenými dveřmi — tady je soukromí důležitější než kulisy.'],
    deeper: 'Kompletní proměna chce čas a klid: vyhraďte si celý večer a začněte tím, co je nejméně děsivé — třeba punčochami nebo košilí.',
    firstStep: 'Zeptejte se: „Co bys chtěl/a jednou zkusit z role, kterou obvykle mám já?“ Odpověď nemusí vést k ničemu dalšímu.',
  },
  watch: {
    activities: [
      'Pomalé svlékání na hudbu, druhý jen sedí a nesmí se dotknout.',
      'Vzájemná masturbace: vedle sebe nebo naproti, oči na druhém.',
      'Velké zrcadlo u postele — dívejte se na sebe jako na film.',
    ],
    positions: ['Jeden nahoře zády k druhému, oba čelem k zrcadlu.', 'Zezadu vestoje čelem k zrcadlu.'],
    places: ['Před zrcadlem v ložnici nebo v koupelně.', 'Párový klub — dá se přijít jen se dívat nebo být vidět, bez výměny partnerů.'],
    deeper: 'Video jen pro vás: natáčejte na jeden telefon, bez obličejů, a domluvte předem, kdo ho má a kdy se maže.',
    firstStep: 'Nechte příště rozsvíceno a jeden z vás ať se chvíli jen dívá. Pokud vás láká publikum, klub pro páry je místo, kde to nikoho nepohorší.',
  },
  group: {
    activities: [
      'Nejdřív fantazie: popište si při sexu, jak by trojka vypadala. Nic se nemusí stát.',
      'Návštěva swingers klubu v režimu „jen se díváme“ s jasnou dohodou předem.',
      'Sepište si pravidla — co ano, co ne, kdo má právo veta — dřív, než někoho oslovíte.',
    ],
    positions: ['Ve třech: jeden uprostřed mezi dvěma.', 'Vedle sebe s druhým párem, každý se svým partnerem (soft swap).'],
    places: ['Swingers nebo párový klub — bezpečné a diskrétní prostředí s pravidly.', 'Neutrální půda: hotel místo vaší ložnice.'],
    firstStep: 'Promluvte si o tom mimo postel a střízliví. Otázka „co by tě na tom lákalo a čeho se bojíš?“ řekne víc než jakákoli akce.',
  },
  sharing: {
    activities: [
      'Začněte vyprávěním: popište si při sexu, jak by to vypadalo. Fantazie je sama o sobě hra.',
      'Flirt na dohled: jeden z vás koketuje v baru, druhý se dívá od vedlejšího stolu.',
      'Pravidla předem: kdo, kde, co ano, co ne — a slovo, kterým to kdokoli kdykoli zastaví.',
    ],
    positions: [],
    places: ['Párový klub s pravidly a obsluhou je bezpečnější než náhodné seznámení.'],
    deeper: 'Druhý den si udělejte čas jen pro sebe. Žárlivost často přijde až potom a potřebuje stejnou péči jako hra samotná.',
    firstStep: 'Zeptejte se navzájem, co vás na té představě vzrušuje: dívat se, být viděn/a, nebo ta žárlivost samotná? Odpovědi se liší víc, než čekáte.',
  },
  adventure: {
    activities: [
      'Mapa bytu: každý týden jiná místnost — sprcha, linka, gauč, chodba.',
      'Rychlovka před odchodem, když už máte být dávno pryč.',
      'Víkend jen kvůli sexu: chata, hotel nebo stan a žádný jiný program.',
    ],
    positions: ['Vestoje ve sprše, jedna noha na okraji vany.', 'Na kuchyňské lince nebo na pračce — výška bývá akorát.'],
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
      'Pět minut vsedě naproti sobě: oční kontakt a společný dech.',
      'Společná koupel, svíčky, playlist a telefon v jiné místnosti.',
    ],
    positions: ['Lotos: vsedě tváří v tvář, nohy kolem sebe.', 'Lžičky nebo misionář s polštářem pod boky — pomalu a zblízka.'],
    places: ['Ložnice proměněná svíčkami a čistým povlečením.', 'Chata s krbem, vana pro dva, deka pod hvězdami na vlastní zahradě.'],
    firstStep: 'Zpomalte na polovinu. Doslova — všechno, co děláte, zkuste udělat dvakrát pomaleji.',
  },
  tantra: {
    activities: [
      'Hodina dotyků bez pronikání a bez cíle. Orgasmus není zakázaný, jen o něj nejde.',
      'Společný dech: jeden vydechuje, druhý nadechuje, čela u sebe.',
      'Masáž celého těla, při které se střídáte: půl hodiny jen dáváš, půl hodiny jen bereš.',
    ],
    positions: ['Yab-yum: jeden sedí se zkříženýma nohama, druhý mu sedí v klíně tváří v tvář.'],
    places: ['Teplá místnost, deka na zemi, tlumené světlo.', 'Kurz tantrické masáže pro páry.'],
    firstStep: 'Položte si navzájem ruku na hrudník a tři minuty jen dýchejte. Jestli je to příjemné, a ne trapné, máte odpověď.',
  },
};

// "Když se ti líbí A, zkus i B." — neighbouring cups worth peeking into.
export const RELATED: Record<CupKey, CupKey[]> = {
  dominance: ['control', 'bondage', 'praise'],
  submission: ['control', 'bondage', 'praise'],
  bondage: ['sensation', 'control', 'edge'],
  impact: ['edge', 'primal', 'praise'],
  control: ['sensation', 'toys', 'dominance'],
  praise: ['verbal', 'submission', 'dominance'],
  primal: ['impact', 'adventure', 'bondage'],
  sensation: ['edge', 'tantra', 'bondage'],
  edge: ['sensation', 'impact', 'roleplay'],
  anal: ['toys', 'oral', 'control'],
  oral: ['sensation', 'anal', 'feet'],
  toys: ['control', 'anal', 'watch'],
  roleplay: ['verbal', 'materials', 'gender'],
  verbal: ['praise', 'roleplay', 'watch'],
  materials: ['roleplay', 'feet', 'watch'],
  feet: ['materials', 'oral', 'submission'],
  gender: ['roleplay', 'materials', 'anal'],
  watch: ['sharing', 'group', 'adventure'],
  group: ['sharing', 'watch', 'roleplay'],
  sharing: ['watch', 'group', 'verbal'],
  adventure: ['watch', 'primal', 'roleplay'],
  romance: ['tantra', 'sensation', 'oral'],
  tantra: ['romance', 'sensation', 'control'],
};

export type DatingTip = { name: string; desc: string; cups: CupKey[] };

// Where to look for like-minded people, matched against the fullest cups.
export const DATING: DatingTip[] = [
  { name: 'Feeld', desc: 'Aplikace pro páry i jednotlivce otevřená kinku, trojkám a nemonogamii. V profilu se dá rovnou vyplnit, co hledáte.', cups: ['group', 'sharing', 'dominance', 'submission', 'bondage', 'roleplay', 'watch', 'gender'] },
  { name: 'FetLife', desc: 'Sociální síť kink a BDSM komunity — spíš diskuse, skupiny a kalendář akcí než klasická seznamka. Dobré místo, kde najít místní munch.', cups: ['dominance', 'submission', 'bondage', 'impact', 'control', 'praise', 'primal', 'edge', 'sensation', 'materials', 'feet'] },
  { name: 'JOYclub', desc: 'Erotická komunita pro páry i singles: swingers, kluby, akce a seznamování podle preferencí.', cups: ['group', 'sharing', 'watch', 'adventure'] },
  { name: 'Amatéři.com', desc: 'Česká erotická komunita se seznamkou — hodně párů a lidí otevřených experimentům.', cups: ['group', 'sharing', 'watch', 'adventure', 'toys'] },
  { name: '3Fun', desc: 'Aplikace zaměřená na hledání třetího do páru a na setkání párů.', cups: ['group', 'sharing'] },
  { name: 'Pure', desc: 'Anonymní aplikace na nezávazná setkání — inzerát napíšete vlastními slovy a rovnou řeknete, o co jde.', cups: ['adventure', 'verbal', 'roleplay', 'primal'] },
  { name: 'OkCupid', desc: 'Klasická seznamka s podrobnými otázkami včetně těch o sexu — dobře se na ní hledá někdo naladěný podobně.', cups: ['romance', 'tantra', 'verbal', 'sensation', 'toys', 'oral'] },
  { name: 'Tinder, Bumble, Badoo', desc: 'Největší výběr lidí. O kinku se tu mluví až po seznámení, ale upřímná věta v profilu ušetří čas oběma.', cups: ['romance', 'tantra'] },
];

export const COMMUNITY_TIPS: string[] = [
  'Munch — neformální setkání kink komunity v běžné hospodě nebo kavárně. Žádné hraní, jen povídání; ideální první krok.',
  'Workshopy: vázání (šibari), impact play, tantra nebo komunikace pro páry. Naučíte se techniku i bezpečnost.',
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

type Scored = { cup: Cup; result: CupResult; tips: CupTips };

export type Recommendations = {
  top: Scored[];
  explore: Scored[];
  related: { from: Cup; to: Cup }[];
  dating: DatingTip[];
};

export function recommend(cups: CupResults): Recommendations {
  const ranked = rankedCups(cups);
  const explored = ranked.filter((r) => !isUnexplored(r.result));

  // Fullest cups that are at least half full (max 5). When none is, fall back
  // to the single fullest one — but only if it shows some interest; a clear
  // "no" to everything gets no recommendation at all.
  let top = explored.filter((r) => r.result.fill >= 50).slice(0, 5);
  if (top.length === 0 && explored.length > 0 && explored[0].result.fill >= 25) top = explored.slice(0, 1);

  const explore = ranked.filter((r) => isUnexplored(r.result)).slice(0, 5);

  // Neighbouring cups the person has not filled yet.
  const topKeys = new Set(top.map((t) => t.cup.key));
  const seen = new Set<CupKey>();
  const related: { from: Cup; to: Cup }[] = [];
  for (const t of top) {
    for (const key of RELATED[t.cup.key]) {
      const r = cups[key];
      if (!r || topKeys.has(key) || seen.has(key)) continue;
      if (r.fill < 25 && !isUnexplored(r)) continue; // a clear "no" stays a no
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

  const withTips = (r: { cup: Cup; result: CupResult }) => ({ ...r, tips: TIPS[r.cup.key] });
  return { top: top.map(withTips), explore: explore.map(withTips), related, dating };
}

export function fullCupCount(cups: CupResults): { full: number; unexplored: number; total: number } {
  const list = rankedCups(cups);
  return {
    full: list.filter((r) => r.result.fill >= FULL_THRESHOLD && !isUnexplored(r.result)).length,
    unexplored: list.filter((r) => isUnexplored(r.result)).length,
    total: list.length,
  };
}

// --- Comparison of two profiles (a = the viewer, b = their partner) --------
//
// Privacy rule: a cup is shown only when BOTH people are at least a "maybe".
// If either one is a "no", the cup stays hidden — only the number of hidden
// cups is reported, never who said no — so nobody is exposed for wanting
// something the other does not.

export type Stance = 'yes' | 'maybe' | 'no';

export function stanceOf(cup: CupResult): Stance {
  if (isUnexplored(cup)) return 'maybe';
  if (cup.fill >= 60) return 'yes';
  if (cup.fill >= 35) return 'maybe';
  return 'no';
}

export type CupComparison = {
  cup: Cup;
  a: CupResult;
  b: CupResult;
  // shared = both yes; invite = one yes, one maybe; explore = both maybe.
  kind: 'shared' | 'invite' | 'explore';
  // How the two fit on a directional cup, when both went deeper.
  fit: string | null;
};

export type Comparison = {
  rows: CupComparison[];
  // Cups compared but not shown because at least one person is a "no".
  hidden: number;
  // 0-100: how close the two sets of cups are overall.
  harmony: number;
  // Dominance / submission fit, when it is a positive one.
  dynamic: string | null;
};

function directionFit(cup: Cup, a: CupResult, b: CupResult): string | null {
  if (!cup.dir) return null;
  const [sa, sb] = [sideOf(a), sideOf(b)];
  if (!sa || !sb) return null;
  const { give, receive } = cup.dir;
  if (sa === 'both' && sb === 'both') return `Oba rádi obojí (${give} i ${receive}) — střídejte se.`;
  if (sa === 'give' && sb === 'receive') return `Zapadáte do sebe: ty — ${give}, partner/ka — ${receive}.`;
  if (sa === 'receive' && sb === 'give') return `Zapadáte do sebe: partner/ka — ${give}, ty — ${receive}.`;
  if (sa === 'both' || sb === 'both') return 'Jeden z vás zvládne obě strany, takže si sednete.';
  if (sa === sb) return `Oba chcete totéž (${sa === 'give' ? give : receive}). Střídejte se, nebo si druhou stranu zkuste navzájem dopřát.`;
  return null;
}

export function compareProfiles(a: CupResults, b: CupResults): Comparison {
  const rows: CupComparison[] = [];
  let hidden = 0;
  let diffSum = 0;
  let compared = 0;

  for (const cup of CUPS) {
    const ra = a[cup.key];
    const rb = b[cup.key];
    if (!ra || !rb) continue;
    compared += 1;
    diffSum += Math.abs(ra.fill - rb.fill);

    const [sa, sb] = [stanceOf(ra), stanceOf(rb)];
    if (sa === 'no' || sb === 'no') {
      hidden += 1;
      continue;
    }
    const kind = sa === 'yes' && sb === 'yes' ? 'shared' : sa === 'maybe' && sb === 'maybe' ? 'explore' : 'invite';
    rows.push({ cup, a: ra, b: rb, kind, fit: kind === 'shared' ? directionFit(cup, ra, rb) : null });
  }

  const harmony = compared > 0 ? Math.round(100 - diffSum / compared) : 0;

  // Only positive fits are reported, and only from cups each person was sure of.
  let dynamic: string | null = null;
  const yes = (r?: CupResult) => !!r && stanceOf(r) === 'yes';
  const [da, sa2, db, sb2] = [yes(a.dominance), yes(a.submission), yes(b.dominance), yes(b.submission)];
  if (da && sb2 && db && sa2) dynamic = 'Oba umíte vést i se odevzdat — střídání rolí (switch) je pro vás jako dělané.';
  else if (da && sb2) dynamic = 'Zapadáte do sebe: ty rád/a vedeš, partner/ka se rád/a odevzdá.';
  else if (db && sa2) dynamic = 'Zapadáte do sebe: partner/ka rád/a vede, ty se rád/a odevzdáš.';
  else if (da && db) dynamic = 'Oba chcete vést. Zkuste se střídat po večerech — nebo o vedení hrát.';
  else if (sa2 && sb2) dynamic = 'Oba se chcete odevzdat. Losujte, kdo dnes povede, nebo si pokyny napište předem.';

  return { rows, hidden, harmony, dynamic };
}
