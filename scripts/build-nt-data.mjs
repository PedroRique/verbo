import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CACHE = process.env.BIBLE_CACHE || "/tmp/bible-src";
const OUT_DIR = path.join(ROOT, "data", "nt");
const MACULA_DIR = path.join(CACHE, "macula");
const BLIVRE_PATH = path.join(CACHE, "BLIVRE.json");

const BOOKS = [
  { slug: "mateus", name: "Mateus", abbrev: "Mt", macula: "01-matthew.xml", code: "MAT" },
  { slug: "marcos", name: "Marcos", abbrev: "Mc", macula: "02-mark.xml", code: "MRK" },
  { slug: "lucas", name: "Lucas", abbrev: "Lc", macula: "03-luke.xml", code: "LUK" },
  { slug: "joao", name: "João", abbrev: "Jo", macula: "04-john.xml", code: "JHN" },
  { slug: "atos", name: "Atos", abbrev: "At", macula: "05-acts.xml", code: "ACT" },
  { slug: "romanos", name: "Romanos", abbrev: "Rm", macula: "06-romans.xml", code: "ROM" },
  { slug: "1corintios", name: "1 Coríntios", abbrev: "1Co", macula: "07-1corinthians.xml", code: "1CO" },
  { slug: "2corintios", name: "2 Coríntios", abbrev: "2Co", macula: "08-2corinthians.xml", code: "2CO" },
  { slug: "galatas", name: "Gálatas", abbrev: "Gl", macula: "09-galatians.xml", code: "GAL" },
  { slug: "efesios", name: "Efésios", abbrev: "Ef", macula: "10-ephesians.xml", code: "EPH" },
  { slug: "filipenses", name: "Filipenses", abbrev: "Fp", macula: "11-philippians.xml", code: "PHP" },
  { slug: "colossenses", name: "Colossenses", abbrev: "Cl", macula: "12-colossians.xml", code: "COL" },
  { slug: "1tessalonicenses", name: "1 Tessalonicenses", abbrev: "1Ts", macula: "13-1thessalonians.xml", code: "1TH" },
  { slug: "2tessalonicenses", name: "2 Tessalonicenses", abbrev: "2Ts", macula: "14-2thessalonians.xml", code: "2TH" },
  { slug: "1timoteo", name: "1 Timóteo", abbrev: "1Tm", macula: "15-1timothy.xml", code: "1TI" },
  { slug: "2timoteo", name: "2 Timóteo", abbrev: "2Tm", macula: "16-2timothy.xml", code: "2TI" },
  { slug: "tito", name: "Tito", abbrev: "Tt", macula: "17-titus.xml", code: "TIT" },
  { slug: "filemom", name: "Filemom", abbrev: "Fm", macula: "18-philemon.xml", code: "PHM" },
  { slug: "hebreus", name: "Hebreus", abbrev: "Hb", macula: "19-hebrews.xml", code: "HEB" },
  { slug: "tiago", name: "Tiago", abbrev: "Tg", macula: "20-james.xml", code: "JAS" },
  { slug: "1pedro", name: "1 Pedro", abbrev: "1Pe", macula: "21-1peter.xml", code: "1PE" },
  { slug: "2pedro", name: "2 Pedro", abbrev: "2Pe", macula: "22-2peter.xml", code: "2PE" },
  { slug: "1joao", name: "1 João", abbrev: "1Jo", macula: "23-1john.xml", code: "1JN" },
  { slug: "2joao", name: "2 João", abbrev: "2Jo", macula: "24-2john.xml", code: "2JN" },
  { slug: "3joao", name: "3 João", abbrev: "3Jo", macula: "25-3john.xml", code: "3JN" },
  { slug: "judas", name: "Judas", abbrev: "Jd", macula: "26-jude.xml", code: "JUD" },
  { slug: "apocalipse", name: "Apocalipse", abbrev: "Ap", macula: "27-revelation.xml", code: "REV" },
];

const MACULA_BASE =
  "https://raw.githubusercontent.com/Clear-Bible/macula-greek/main/SBLGNT/lowfat/";
const BLIVRE_URL =
  "https://github.com/damarals/biblias/releases/latest/download/BLIVRE.json";

const CLASS_PT = {
  noun: "substantivo",
  verb: "verbo",
  adj: "adjetivo",
  adjective: "adjetivo",
  det: "artigo",
  determiner: "artigo",
  conj: "conjunção",
  conjunction: "conjunção",
  prep: "preposição",
  preposition: "preposição",
  pron: "pronome",
  pronoun: "pronome",
  adv: "advérbio",
  adverb: "advérbio",
  ptcl: "partícula",
  particle: "partícula",
  intj: "interjeição",
  interjection: "interjeição",
  num: "numeral",
  numeral: "numeral",
};

const TENSE_PT = {
  aorist: "aoristo",
  present: "presente",
  imperfect: "imperfeito",
  future: "futuro",
  perfect: "perfeito",
  pluperfect: "mais-que-perfeito",
};

const VOICE_PT = {
  active: "ativa",
  middle: "média",
  passive: "passiva",
  middlepassive: "médio-passiva",
};

const MOOD_PT = {
  indicative: "indicativo",
  imperative: "imperativo",
  subjunctive: "subjuntivo",
  optative: "optativo",
  infinitive: "infinitivo",
  participle: "particípio",
};

const PERSON_PT = {
  first: "1ª pessoa",
  second: "2ª pessoa",
  third: "3ª pessoa",
  "1": "1ª pessoa",
  "2": "2ª pessoa",
  "3": "3ª pessoa",
};

const NUMBER_PT = {
  singular: "singular",
  plural: "plural",
  dual: "dual",
};

const GENDER_PT = {
  masculine: "masculino",
  feminine: "feminino",
  neuter: "neutro",
};

const CASE_PT = {
  nominative: "nominativo",
  genitive: "genitivo",
  dative: "dativo",
  accusative: "acusativo",
  vocative: "vocativo",
};

const SKIP_CLASS = new Set(["det", "conj", "prep", "ptcl", "intj", "particle", "conjunction", "preposition", "determiner"]);
const SKIP_LEMMA = new Set([
  "ὁ", "καί", "δέ", "εἰς", "ἐν", "ἐκ", "ἀπό", "αὐτός", "οὗτος", "ὅς", "τίς",
  "εἰμί", "τε", "γάρ", "ἀλλά", "μέν", "οὐ", "μή", "οὖν", "ὡς", "ἵνα", "ὅτι",
  "εἰ", "ἀλλά", "διά", "κατά", "μετά", "περί", "πρός", "ὑπό", "ἐπί", "σύν",
]);

const THEO_LEMMA = new Set([
  "θεός", "ἰησοῦς", "χριστός", "πίστις", "πιστεύω", "χάρις", "ἀγάπη", "ἀγαπάω",
  "πνεῦμα", "κύριος", "σωτηρία", "σῴζω", "δικαιοσύνη", "δικαιόω", "εὐαγγέλιον",
  "λόγος", "ζωή", "φῶς", "ἀλήθεια", "μετάνοια", "σταυρός", "ἀνάστασις", "δόξα",
  "ἐκκλησία", "διαθήκη", "αἷμα", "ἁμαρτία", "ἔλεος", "εἰρήνη", "ἐλπίς", "υἱός",
]);

const LEMMA_PT = {
  ὁ: "o / a / os / as",
  καί: "e",
  δέ: "e / mas",
  ἐν: "em",
  εἰς: "para / em",
  ἐκ: "de / desde",
  ἀπό: "de",
  διά: "por / através",
  κατά: "segundo / contra",
  μετά: "com / depois",
  περί: "acerca de",
  πρός: "para / junto de",
  ἐπί: "sobre",
  ὑπό: "por / debaixo",
  σύν: "com",
  γάρ: "porque / pois",
  ἀλλά: "mas",
  οὖν: "portanto",
  ὅτι: "que / porque",
  ἵνα: "para que",
  εἰ: "se",
  ὡς: "como",
  οὐ: "não",
  μή: "não",
  αὐτός: "ele / mesmo",
  οὗτος: "este",
  ἐκεῖνος: "aquele",
  ὅς: "o qual",
  τίς: "quem / o que",
  εἰμί: "ser / estar",
  ἐγώ: "eu",
  σύ: "tu",
  ἡμεῖς: "nós",
  ὑμεῖς: "vós",
  θεός: "Deus",
  ἰησοῦς: "Jesus",
  χριστός: "Cristo",
  κύριος: "Senhor",
  πνεῦμα: "Espírito",
  λόγος: "palavra / Verbo",
  ζωή: "vida",
  φῶς: "luz",
  ἀλήθεια: "verdade",
  πίστις: "fé",
  πιστεύω: "crer",
  χάρις: "graça",
  ἀγάπη: "amor",
  ἀγαπάω: "amar",
  σωτηρία: "salvação",
  σῴζω: "salvar",
  δικαιοσύνη: "justiça",
  δικαιόω: "justificar",
  εὐαγγέλιον: "evangelho",
  ἁμαρτία: "pecado",
  ἁμαρτωλός: "pecador",
  μετάνοια: "arrependimento",
  μετανοέω: "arrepender-se",
  σταυρός: "cruz",
  σταυρόω: "crucificar",
  ἀνάστασις: "ressurreição",
  ἀνίστημι: "levantar / ressuscitar",
  δόξα: "glória",
  δοξάζω: "glorificar",
  ἐκκλησία: "igreja / assembleia",
  διαθήκη: "aliança",
  αἷμα: "sangue",
  ἔλεος: "misericórdia",
  εἰρήνη: "paz",
  ἐλπίς: "esperança",
  υἱός: "filho",
  πατήρ: "pai",
  μήτηρ: "mãe",
  ἄνθρωπος: "homem / ser humano",
  κόσμος: "mundo",
  οὐρανός: "céu",
  γῆ: "terra",
  βασιλεία: "reino",
  βασιλεύς: "rei",
  προφήτης: "profeta",
  ἀπόστολος: "apóstolo",
  μαθητής: "discípulo",
  νόμος: "lei",
  χάρισμα: "dom",
  προσευχή: "oração",
  προσεύχομαι: "orar",
  καρδία: "coração",
  ψυχῆ: "alma",
  ψυχή: "alma",
  σάρξ: "carne",
  σῶμα: "corpo",
  θάνατος: "morte",
  ἀποθνῄσκω: "morrer",
  ζάω: "viver",
  ἔρχομαι: "vir",
  λέγω: "dizer",
  λαλέω: "falar",
  ἀκούω: "ouvir",
  ὁράω: "ver",
  βλέπω: "ver / olhar",
  γινώσκω: "conhecer",
  οἶδα: "saber",
  δίδωμι: "dar",
  λαμβάνω: "receber / tomar",
  ποιέω: "fazer",
  ἔχω: "ter",
  θέλω: "querer",
  δύναμαι: "poder / ser capaz",
  δύναμις: "poder",
  ἐξουσία: "autoridade",
  ἄγγελος: "anjo / mensageiro",
  διάβολος: "diabo",
  σατανᾶς: "Satanás",
  οὐρανός: "céu",
  ἅγιος: "santo",
  ἁγιάζω: "santificar",
  καλός: "bom / belo",
  ἀγαθός: "bom",
  πονηρός: "mau / maligno",
  δίκαιος: "justo",
  πιστός: "fiel",
  καινός: "novo",
  αἰώνιος: "eterno",
  πρῶτος: "primeiro",
  ἔσχατος: "último",
  μέγας: "grande",
  μικρός: "pequeno",
  πᾶς: "todo",
  πολύς: "muito",
  εἷς: "um",
  δύο: "dois",
  τρεῖς: "três",
  ἡμέρα: "dia",
  νύξ: "noite",
  ὥρα: "hora",
  χρόνος: "tempo",
  καιρός: "tempo / ocasião",
  ὄνομα: "nome",
  σημεῖον: "sinal",
  ἔργον: "obra",
  ὁδός: "caminho",
  θύρα: "porta",
  ἄρτος: "pão",
  ὕδωρ: "água",
  οἶνος: "vinho",
  ἰχθύς: "peixe",
  δένδρον: "árvore",
  σπέρμα: "semente",
  καρπός: "fruto",
  ποιμήν: "pastor",
  πρόβατον: "ovelha",
  λύκος: "lobo",
  ναός: "templo",
  ἱερόν: "templo / santuário",
  θυσία: "sacrifício",
  ἱερεύς: "sacerdote",
  ἀρχιερεύς: "sumo sacerdote",
  γραμματεύς: "escriba",
  φαρισαῖος: "fariseu",
  ἔθνος: "nação / gentios",
  λαός: "povo",
  Ἰσραήλ: "Israel",
  ἰσραήλ: "Israel",
  Ἰουδαῖος: "judeu",
  ἰουδαῖος: "judeu",
  γυνή: "mulher / esposa",
  ἀνήρ: "homem / marido",
  παιδίον: "criança",
  ἀδελφός: "irmão",
  φίλος: "amigo",
  δοῦλος: "servo / escravo",
  κύριος: "Senhor",
  διδάσκαλος: "mestre",
  διδάσκω: "ensinar",
  μαρτυρία: "testemunho",
  μαρτυρέω: "testemunhar",
  μάρτυς: "testemunha",
  κρίσις: "juízo",
  κρίνω: "julgar",
  ὀργή: "ira",
  φόβος: "temor",
  χαρά: "alegria",
  χαίρω: "alegrar-se",
  παρακαλέω: "consolar / exortar",
  παράκλητος: "Consolador / Advogado",
  ὑπομονή: "perseverança",
  πειρασμός: "provação / tentação",
  πειράζω: "provar / tentar",
  σοφία: "sabedoria",
  μωρία: "loucura",
  γνώσις: "conhecimento",
  ἀποκάλυψις: "revelação",
  μυστήριον: "mistério",
  εἰκών: "imagem",
  πρωτότοκος: "primogênito",
  κτίσις: "criação",
  κτίζω: "criar",
  ἀρχή: "princípio / origem",
  τέλος: "fim / propósito",
  πληρόω: "cumprir / encher",
  πλήρωμα: "plenitude",
  μένω: "permanecer",
  ἀκολουθέω: "seguir",
  πέμπω: "enviar",
  ἀποστέλλω: "enviar",
  γεννάω: "gerar / nascer",
  βαπτίζω: "batizar",
  βάπτισμα: "batismo",
  ἐσθίω: "comer",
  πίνω: "beber",
  περιπατέω: "andar",
  ἀνίστημι: "levantar",
  ἐγείρω: "despertar / ressuscitar",
  καθίζω: "assentar",
  θεωρέω: "contemplar",
  φοβέω: "temer",
  φεύγω: "fugir",
  ζητέω: "buscar",
  εὑρίσκω: "encontrar",
  καλέω: "chamar",
  ἐκλέγομαι: "escolher",
  ἀφίημι: "perdoar / deixar",
  ἄφεσις: "perdão",
  ὁμολογέω: "confessar",
  κηρύσσω: "proclamar",
  εὐαγγελίζω: "evangelizar",
  θεραπεύω: "curar",
  ἰάομαι: "sarar",
  δαιμόνιον: "demônio",
  θαῦμα: "maravilha",
  δόξα: "glória",
  τιμή: "honra",
  πλοῦτος: "riqueza",
  πτωχός: "pobre",
  μακάριος: "bem-aventurado",
  ταπεινός: "humilde",
  ὑπερήφανος: "soberbo",
  ὑποτάσσω: "sujeitar-se",
  ὑπακούω: "obedecer",
  ἐντολή: "mandamento",
  θέλημα: "vontade",
  βούλομαι: "desejar",
  χάρις: "graça",
  δωρεά: "dom / dádiva",
  λύτρον: "resgate",
  ἀπολύτρωσις: "redenção",
  καταλλαγή: "reconciliação",
  καταλλάσσω: "reconciliar",
  ἱλασμός: "propiciação",
  ἱλαστήριον: "propiciatório",
  παράπτωμα: "ofensa / transgresão",
  ἀνομία: "iniquidade",
  δικαίωμα: "preceito / ato justo",
  ἁγιασμός: "santificação",
  κληρονόμος: "herdeiro",
  κληρονομία: "herança",
  ἐπαγγελία: "promessa",
  σπέρμα: "semente / descendência",
  ἀβραάμ: "Abraão",
  δαυίδ: "Davi",
  μωϋσῆς: "Moisés",
  πέτρος: "Pedro",
  παῦλος: "Paulo",
  ἰωάννης: "João",
  μαρία: "Maria",
  ἰωσήφ: "José",
  πιλᾶτος: "Pilatos",
  ἰερουσαλήμ: "Jerusalém",
  γαλιλαία: "Galileia",
  ναζαρέτ: "Nazaré",
  βηθλέεμ: "Belém",
};

const EN_PT = {
  god: "Deus",
  jesus: "Jesus",
  christ: "Cristo",
  lord: "Senhor",
  spirit: "Espírito",
  holy: "santo",
  love: "amor",
  faith: "fé",
  grace: "graça",
  truth: "verdade",
  life: "vida",
  light: "luz",
  word: "palavra",
  world: "mundo",
  man: "homem",
  men: "homens",
  son: "filho",
  father: "pai",
  mother: "mãe",
  heaven: "céu",
  earth: "terra",
  king: "rei",
  kingdom: "reino",
  people: "povo",
  law: "lei",
  sin: "pecado",
  sinner: "pecador",
  save: "salvar",
  salvation: "salvação",
  savior: "salvador",
  saviour: "salvador",
  death: "morte",
  die: "morrer",
  live: "viver",
  come: "vir",
  go: "ir",
  say: "dizer",
  said: "disse",
  speak: "falar",
  hear: "ouvir",
  see: "ver",
  know: "conhecer",
  give: "dar",
  take: "tomar",
  make: "fazer",
  do: "fazer",
  have: "ter",
  be: "ser",
  was: "era",
  were: "eram",
  is: "é",
  are: "são",
  not: "não",
  and: "e",
  but: "mas",
  or: "ou",
  if: "se",
  because: "porque",
  therefore: "portanto",
  for: "pois / para",
  from: "de",
  to: "a / para",
  in: "em",
  on: "sobre",
  with: "com",
  by: "por",
  through: "através de",
  according: "segundo",
  into: "para dentro de",
  out: "fora",
  of: "de",
  the: "o/a",
  a: "um/a",
  this: "este",
  that: "aquele / que",
  these: "estes",
  those: "aqueles",
  who: "quem",
  which: "o qual",
  what: "o que",
  all: "todo",
  every: "cada",
  many: "muitos",
  much: "muito",
  one: "um",
  two: "dois",
  three: "três",
  first: "primeiro",
  last: "último",
  great: "grande",
  small: "pequeno",
  good: "bom",
  evil: "mau",
  righteous: "justo",
  peace: "paz",
  hope: "esperança",
  joy: "alegria",
  glory: "glória",
  power: "poder",
  authority: "autoridade",
  church: "igreja",
  gospel: "evangelho",
  apostle: "apóstolo",
  disciple: "discípulo",
  prophet: "profeta",
  prayer: "oração",
  pray: "orar",
  heart: "coração",
  soul: "alma",
  body: "corpo",
  flesh: "carne",
  blood: "sangue",
  cross: "cruz",
  resurrection: "ressurreição",
  angel: "anjo",
  devil: "diabo",
  name: "nome",
  day: "dia",
  night: "noite",
  time: "tempo",
  hour: "hora",
  water: "água",
  bread: "pão",
  wine: "vinho",
  fruit: "fruto",
  seed: "semente",
  way: "caminho",
  door: "porta",
  house: "casa",
  city: "cidade",
  temple: "templo",
  priest: "sacerdote",
  sacrifice: "sacrifício",
  lamb: "cordeiro",
  shepherd: "pastor",
  sheep: "ovelha",
  work: "obra",
  sign: "sinal",
  judgment: "juízo",
  wrath: "ira",
  mercy: "misericórdia",
  forgive: "perdoar",
  forgiveness: "perdão",
  believe: "crer",
  call: "chamar",
  send: "enviar",
  follow: "seguir",
  remain: "permanecer",
  teach: "ensinar",
  preach: "pregar",
  heal: "curar",
  raise: "levantar",
  sit: "assentar",
  walk: "andar",
  eat: "comer",
  drink: "beber",
  fear: "temor",
  seek: "buscar",
  find: "encontrar",
  ask: "pedir",
  answer: "responder",
  write: "escrever",
  book: "livro",
  beginning: "princípio",
  end: "fim",
  creation: "criação",
  image: "imagem",
  mystery: "mistério",
  promise: "promessa",
  inheritance: "herança",
  redemption: "redenção",
  reconciliation: "reconciliação",
  justification: "justificação",
  sanctification: "santificação",
  commandment: "mandamento",
  will: "vontade",
  wisdom: "sabedoria",
  knowledge: "conhecimento",
  witness: "testemunho",
  testimony: "testemunho",
  blessed: "bem-aventurado",
  poor: "pobre",
  rich: "rico",
  humble: "humilde",
  eternal: "eterno",
  new: "novo",
  old: "velho",
  true: "verdadeiro",
  faithful: "fiel",
  holy: "santo",
  wicked: "ímpio",
  dead: "morto",
  living: "vivo",
  now: "agora",
  then: "então",
  again: "de novo",
  also: "também",
  even: "até",
  still: "ainda",
  already: "já",
  never: "nunca",
  always: "sempre",
  together: "juntos",
  himself: "ele mesmo",
  themselves: "eles mesmos",
  you: "você / vós",
  we: "nós",
  i: "eu",
  he: "ele",
  she: "ela",
  it: "isso",
  they: "eles",
  him: "o / lhe",
  her: "a / lhe",
  them: "os / lhes",
  us: "nos",
  me: "me",
  my: "meu",
  your: "teu / vosso",
  his: "dele",
  our: "nosso",
  their: "deles",
};

const CURATED = {
  "João 1:1":
    "João não começa na manhã de Natal. O Verbo já era — eterno, pessoal, Deus. A salvação não começa em nós: começa no Filho que nunca teve início.",
  "João 1:14":
    "O eterno se fez carne e tabernaculou entre nós. Graça e verdade não são ideias: têm rosto, nome e história em Jesus Cristo.",
  "João 3:16":
    "O amor do Pai não é um sentimento vago. Ele entrega o Filho para que pecadores creiam e recebam vida — não por mérito, mas por dom.",
  "João 3:3":
    "Ninguém entra no reino se reinventando. É preciso nascer do alto: obra do Espírito, não decisão moralista.",
  "João 10:11":
    "O Bom Pastor não contrata um substituto. Ele dá a própria vida. Essa é a substituição penal com cheiro de campo e sangue.",
  "João 14:6":
    "Jesus não aponta um caminho. Ele é o caminho, a verdade e a vida. Fora dele não há atalho piedoso até o Pai.",
  "João 19:30":
    "Tetelestai: está consumado. A obra da redenção não ficou pela metade. Nada falta para o pecador que se abriga neste grito.",
  "João 20:28":
    "A confissão da igreja é a de Tomé: meu Senhor e meu Deus. Fé reformada não reduz Cristo a mestre; adora o Deus encarnado.",
  "Mateus 1:21":
    "O nome Jesus já é evangelho: ele salvará o seu povo dos pecados deles. Não de Roma, não da tristeza — do pecado.",
  "Mateus 5:3":
    "Bem-aventurados os pobres de espírito: o reino começa na falência confessada. Só quem não tem nada leva tudo em Cristo.",
  "Mateus 6:9":
    "Pai nosso: a oração cristã começa em filiação, não em técnica. Quem está em Cristo fala com o Pai que está nos céus.",
  "Mateus 11:28":
    "O jugo da lei condena; o jugo de Cristo descansa. Ele chama cansados — e ele mesmo é o descanso.",
  "Mateus 16:16":
    "A igreja se edifica nesta confissão: Jesus é o Cristo, o Filho do Deus vivo. Não em marketing, mas em revelação do Pai.",
  "Mateus 28:18":
    "Toda autoridade no céu e na terra é dele. A missão da igreja não é um hobby: é ordem do Rei já entronizado.",
  "Marcos 10:45":
    "O Filho do Homem não veio para ser servido. Veio para servir e dar a vida em resgate. Aqui está o coração da cruz.",
  "Lucas 9:23":
    "Seguir Cristo não é um upgrade de autoestima. É negar a si, tomar a cruz e andar atrás dele — cada dia.",
  "Lucas 15:7":
    "Há festa no céu por um pecador que se arrepende. A graça não é fria: o Pai corre, abraça e restaura.",
  "Lucas 24:6":
    "Ele não está aqui: ressuscitou. Sem a ressurreição, a cruz seria derrota. Com ela, a morte perdeu o último argumento.",
  "Atos 2:38":
    "Arrependei-vos, e cada um seja batizado. O evangelho apóstolico chama à conversão pública, unida a Cristo e ao seu povo.",
  "Atos 4:12":
    "Não há outro nome debaixo do céu. O pluralismo religioso quebra nesta pedra: só Jesus salva.",
  "Atos 16:31":
    "Crê no Senhor Jesus, e serás salvo. A fé não é salto no escuro: é confiança no Cristo que basta.",
  "Romanos 1:16":
    "Paulo não se envergonha do evangelho porque ele é poder de Deus. A mensagem da cruz não é conselho: é eficácia divina.",
  "Romanos 3:23":
    "Todos pecaram. Não há classe espiritual de elite. A reforma começa quando a boca se fecha diante da glória de Deus.",
  "Romanos 3:24":
    "Justificados gratuitamente, por sua graça. A justiça que Deus exige, Deus fornece — em Cristo, mediante a fé.",
  "Romanos 5:1":
    "Justificados pela fé, temos paz com Deus. Paz aqui não é clima interno: é fim de hostilidade no tribunal do céu.",
  "Romanos 5:8":
    "Deus prova o seu amor: Cristo morre por nós sendo nós ainda pecadores. Graça não espera o melhor momento do pecador.",
  "Romanos 8:1":
    "Nenhuma condenação há para os que estão em Cristo. O veredito já foi lido. A segurança do crente não é presunção: é sangue.",
  "Romanos 8:28":
    "Todas as coisas cooperam para o bem daqueles que amam a Deus. Não o bem que inventamos — o bem de sermos conformados ao Filho.",
  "Romanos 8:38":
    "Nada pode separar-nos do amor de Deus em Cristo. A perseverança dos santos descansa no abraço que não se solta.",
  "Romanos 10:9":
    "Confessar com a boca e crer no coração: Jesus é Senhor, e Deus o ressuscitou. Fé e confissão andam juntas.",
  "Romanos 12:1":
    "Pela misericórdia de Deus, apresentai vossos corpos. A ética cristã é resposta de culto, não escada para merecer favor.",
  "1 Coríntios 1:18":
    "A palavra da cruz é loucura para os que se perdem e poder para os que se salvam. Deus derruba o orgulho pela fraqueza de Cristo.",
  "1 Coríntios 13:13":
    "Fé, esperança e amor: a tríade da vida cristã. O maior é o amor, porque ele permanece quando a fé virar vista.",
  "1 Coríntios 15:3":
    "O evangelho em uma frase: Cristo morreu pelos nossos pecados, segundo as Escrituras. Substituição, cumprimento, história.",
  "1 Coríntios 15:4":
    "Foi sepultado e ressuscitou ao terceiro dia. A tumba vazia não é metáfora: é o primeiro fruto da nova criação.",
  "2 Coríntios 5:17":
    "Se alguém está em Cristo, nova criatura é. Conversão não é retoque: é recriação.",
  "2 Coríntios 5:21":
    "Aquele que não conheceu pecado, Deus o fez pecado por nós. Troca maravilhosa: a nossa culpa, a justiça dele.",
  "Gálatas 2:16":
    "O homem não é justificado por obras da lei, mas pela fé em Jesus Cristo. Sola fide não é slogan: é o nervo de Gálatas.",
  "Gálatas 2:20":
    "Fui crucificado com Cristo. Já não sou eu quem vive. A união com Cristo mata o eu soberano e faz viver o Filho.",
  "Gálatas 5:22":
    "O fruto do Espírito não se fabrica com esforço religioso. Amor, alegria, paz brotam de quem o Espírito habita.",
  "Efésios 1:4":
    "Ele nos elegeu nele antes da fundação do mundo. A salvação começa no decreto eterno do Pai, não na nossa iniciativa.",
  "Efésios 2:1":
    "Estáveis mortos em vossos delitos. Graça não reanima um doente: ressuscita um cadáver.",
  "Efésios 2:8":
    "Pela graça sois salvos, por meio da fé; e isto não vem de vós. Até a fé é dom. Sola gratia de ponta a ponta.",
  "Efésios 4:4":
    "Há um só corpo, um só Espírito, uma só esperança. A unidade da igreja é teológica antes de ser institucional.",
  "Filipenses 1:6":
    "Aquele que começou a boa obra há de completá-la. A salvação é do Senhor no primeiro e no último dia.",
  "Filipenses 2:6":
    "Sendo em forma de Deus, não julgou como usurpação o ser igual a Deus. A kenosis não diminui a deidade: revela o servo eterno.",
  "Filipenses 4:4":
    "Regozijai-vos sempre no Senhor. A alegria cristã não depende do humor: depende de quem reina.",
  "Colossenses 1:15":
    "Ele é a imagem do Deus invisível, o primogênito de toda a criação. Cristo não é criatura: é o Filho por quem tudo subsiste.",
  "Colossenses 3:1":
    "Se fostes ressuscitados com Cristo, buscai as coisas do alto. Ética celestial para quem já está escondido nele.",
  "1 Tessalonicenses 5:16":
    "Regozijai-vos sempre, orai sem cessar, dai graças em tudo. A vida reformada é liturgia cotidiana, não só culto de domingo.",
  "2 Tessalonicenses 2:13":
    "Deus vos escolheu desde o princípio para a salvação, pela santificação do Espírito e fé na verdade. Eleição com fruto santo.",
  "1 Timóteo 1:15":
    "Cristo Jesus veio ao mundo para salvar os pecadores, dos quais eu sou o principal. O evangelho cabe no peito de um fariseu quebrantado.",
  "1 Timóteo 2:5":
    "Há um só Deus e um só Mediador. Nem Maria, nem santos, nem padre: só o homem Cristo Jesus.",
  "2 Timóteo 3:16":
    "Toda a Escritura é inspirada por Deus. Sola Scriptura não despreza a igreja: coloca a Bíblia acima de todo púlpito.",
  "Tito 3:5":
    "Não por obras de justiça que houvéssemos feito, mas segundo a sua misericórdia. O lavar regenerador é do Espírito.",
  "Hebreus 1:3":
    "Ele é o resplendor da glória e a expressão exata do ser de Deus. Depois de nos falar no Filho, o Pai não tem outro recado.",
  "Hebreus 4:12":
    "A palavra de Deus é viva e eficaz. Ela não pede licença para julgar intenções: corta até a junta e o tutano.",
  "Hebreus 4:14":
    "Temos um grande sumo sacerdote que penetrou os céus. A intercessão de Cristo é o chão da nossa ousadia.",
  "Hebreus 11:1":
    "A fé é o firme fundamento das coisas que se esperam. Não é otimismo: é confiança na promessa do Deus que não mente.",
  "Hebreus 12:2":
    "Olhando para Jesus, autor e consumador da fé. A corrida cristã não se ganha olhando para os próprios joelhos.",
  "Tiago 1:2":
    "Tende por motivo de grande gozo o passardes por várias provações. A fé reformada não foge da fornalha: nela é purificada.",
  "Tiago 2:17":
    "A fé sem obras é morta. Não contradiz Paulo: expõe a fé fingida. A justificação é pela fé; a fé que justifica nunca vem só.",
  "1 Pedro 1:3":
    "Segundo a sua grande misericórdia, nos regenerou para uma viva esperança, pela ressurreição de Jesus Cristo.",
  "1 Pedro 2:9":
    "Sois geração eleita, sacerdócio real. Cada crente é sacerdote — não para inventar culto, mas para anunciar as virtudes daquele que vos chamou.",
  "1 Pedro 3:15":
    "Santificai a Cristo como Senhor em vossos corações, e estai preparados para responder. Apologética começa de joelhos.",
  "2 Pedro 1:21":
    "Homens falaram da parte de Deus, movidos pelo Espírito Santo. A inspiração não apaga o autor humano: governa a palavra.",
  "1 João 1:9":
    "Se confessarmos os nossos pecados, ele é fiel e justo para nos perdoar. A confissão não compra perdão: recebe o que o sangue já garantiu.",
  "1 João 4:10":
    "Nisto consiste o amor: não em que nós tenhamos amado a Deus, mas em que ele nos amou e enviou seu Filho como propiciação.",
  "Judas 1:24":
    "Àquele que é poderoso para vos guardar de tropeçar. A segurança final do santo está nas mãos do Deus que apresenta, não nas nossas.",
  "Apocalipse 1:8":
    "Eu sou o Alfa e o Ômega. A história não é um acidente: começa e termina no Senhor Deus, o que é, o que era e o que há de vir.",
  "Apocalipse 5:9":
    "Tu és digno porque foste morto e com o teu sangue compraste para Deus gente de toda tribo. A missão existe porque a cruz já comprou um povo.",
  "Apocalipse 21:4":
    "Deus limpará de seus olhos toda lágrima. A esperança cristã não é escape etéreo: é nova criação, corpo, cidade e Deus no meio.",
  "Apocalipse 22:20":
    "Certamente cedo venho. Amém. Vem, Senhor Jesus. A última oração da Bíblia é a primeira urgência da igreja.",
};

function stripPunct(s) {
  return String(s || "")
    .replace(/^[\p{P}\p{S}]+/gu, "")
    .replace(/[\p{P}\p{S}]+$/gu, "")
    .trim();
}

function normLemma(s) {
  return (s || "").normalize("NFC").toLowerCase();
}

function attrMap(raw) {
  const out = {};
  for (const m of raw.matchAll(/([:\w-]+)="([^"]*)"/g)) {
    out[m[1]] = m[2];
  }
  return out;
}

function translateEnglish(en) {
  if (!en) return "";
  const cleaned = en.replace(/[\[\]]/g, "").trim();
  if (!cleaned) return "";
  const words = cleaned.split(/\s+/);
  const translated = words.map((w) => {
    const key = w.toLowerCase().replace(/[.,:;!?]/g, "");
    return EN_PT[key] || w;
  });
  return translated.join(" ");
}

function glossFor(lemma, english, gloss) {
  const key = normLemma(lemma);
  if (LEMMA_PT[key]) return LEMMA_PT[key];
  const fromEn = translateEnglish(english || gloss || "");
  return fromEn || lemma;
}

function posPt(cls) {
  return CLASS_PT[cls] || cls || "palavra";
}

function morphPt(a) {
  const parts = [];
  if (a.tense && TENSE_PT[a.tense]) parts.push(TENSE_PT[a.tense]);
  if (a.voice && VOICE_PT[a.voice]) parts.push(`voz ${VOICE_PT[a.voice]}`);
  if (a.mood && MOOD_PT[a.mood]) parts.push(MOOD_PT[a.mood]);
  if (a.person && PERSON_PT[a.person]) parts.push(PERSON_PT[a.person]);
  if (a.number && NUMBER_PT[a.number]) parts.push(NUMBER_PT[a.number]);
  if (a.gender && GENDER_PT[a.gender]) parts.push(GENDER_PT[a.gender]);
  if (a.case && CASE_PT[a.case]) parts.push(CASE_PT[a.case]);
  return parts.join(", ");
}

function strongsOf(value) {
  if (!value) return "";
  const n = String(value).replace(/[^0-9]/g, "");
  if (!n) return "";
  return `G${Number(n)}`;
}

function parseRef(ref) {
  const m = String(ref).match(/^(\S+)\s+(\d+):(\d+)/);
  if (!m) return null;
  return { code: m[1], chapter: Number(m[2]), verse: Number(m[3]) };
}

function wordScore(word) {
  const lemma = normLemma(word.lemma);
  if (SKIP_LEMMA.has(lemma) || SKIP_CLASS.has(word.cls)) return 0;
  let score = 1;
  if (word.cls === "verb") score += 5;
  else if (word.cls === "noun") score += 4;
  else if (word.cls === "adj" || word.cls === "adjective") score += 3;
  else if (word.cls === "adv") score += 2;
  if (THEO_LEMMA.has(lemma)) score += 8;
  if ((word.gloss || "").length > 3) score += 1;
  return score;
}

function pickFeatured(words) {
  let best = null;
  let bestScore = 0;
  for (const w of words) {
    const s = wordScore(w);
    if (s > bestScore) {
      best = w;
      bestScore = s;
    }
  }
  return best || words.find((w) => !SKIP_CLASS.has(w.cls)) || words[0] || null;
}

function publicWord(w) {
  if (!w) return null;
  return {
    surface: w.surface,
    lemma: w.lemma,
    pos: w.pos,
    morph: w.morph,
    gloss: w.gloss,
    strongs: w.strongs,
  };
}

async function download(url, dest) {
  if (existsSync(dest)) return;
  await mkdir(path.dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao baixar ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
}

function parseMacula(xml) {
  const verses = new Map();
  for (const m of xml.matchAll(/<w\b([^>]*)>([^<]*)<\/w>/g)) {
    const a = attrMap(m[1]);
    const parsed = parseRef(a.ref || "");
    if (!parsed) continue;
    const surface = stripPunct(a.unicode || m[2] || "");
    if (!surface || !a.lemma) continue;
    let gloss = glossFor(a.lemma, a.english, a.gloss);
    if (!gloss || gloss === "-" || gloss === "—") {
      gloss = a.class === "det" || a.class === "determiner" ? "o / a" : a.lemma;
    }
    const word = {
      surface,
      lemma: a.lemma,
      cls: a.class || "",
      pos: posPt(a.class || ""),
      morph: morphPt(a),
      gloss,
      strongs: strongsOf(a.strong),
    };
    const key = `${parsed.chapter}:${parsed.verse}`;
    if (!verses.has(key)) verses.set(key, []);
    verses.get(key).push(word);
  }
  return verses;
}

function generatedReflection(verse, featured) {
  const g = featured?.gloss || "o sentido original";
  const s = featured?.surface || "";
  const lemma = featured?.lemma || "";
  return `A palavra grega ${s} (${lemma}) traz o sentido de “${g}”. Lida na linha da Reforma, o texto não nos aponta primeiro para o nosso esforço, mas para Cristo e para a graça de Deus nesta passagem.`;
}

function dataAlreadyBuilt() {
  if (!existsSync(path.join(ROOT, "data", "books.json"))) return false;
  if (!existsSync(path.join(ROOT, "data", "reels.json"))) return false;
  return BOOKS.every((book) => existsSync(path.join(OUT_DIR, `${book.slug}.json`)));
}

async function main() {
  if (process.env.SKIP_NT_BUILD === "1" || dataAlreadyBuilt()) {
    console.log("NT já está em data/; pulando download e geração.");
    return;
  }

  await mkdir(MACULA_DIR, { recursive: true });
  await mkdir(OUT_DIR, { recursive: true });
  console.log("Baixando Bíblia Livre e MACULA (se ainda não estiverem no cache)...");
  await download(BLIVRE_URL, BLIVRE_PATH);
  for (const book of BOOKS) {
    await download(MACULA_BASE + book.macula, path.join(MACULA_DIR, book.macula));
  }

  const blivre = JSON.parse(await readFile(BLIVRE_PATH, "utf8"));
  const byAbbrev = new Map(blivre.map((b) => [b.abbrev, b]));

  const index = [];
  const allForReels = [];

  for (const book of BOOKS) {
    const ptBook = byAbbrev.get(book.abbrev);
    if (!ptBook) throw new Error(`Livro ${book.abbrev} ausente na Bíblia Livre`);
    const xml = await readFile(path.join(MACULA_DIR, book.macula), "utf8");
    const greek = parseMacula(xml);
    const chapters = ptBook.chapters.map((verses, i) => {
      const n = i + 1;
      return {
        n,
        verses: verses.map((pt, j) => {
          const vn = j + 1;
          const words = (greek.get(`${n}:${vn}`) || []).map((w) => ({
            surface: w.surface,
            lemma: w.lemma,
            pos: w.pos,
            morph: w.morph,
            gloss: w.gloss,
            strongs: w.strongs,
            cls: w.cls,
          }));
          return {
            n: vn,
            pt: String(pt).trim(),
            words,
          };
        }),
      };
    });

    const outBook = {
      slug: book.slug,
      name: book.name,
      abbrev: book.abbrev,
      chapters: chapters.map((ch) => ({
        n: ch.n,
        verses: ch.verses.map((v) => ({
          n: v.n,
          pt: v.pt,
          words: v.words.map((w) => ({
            surface: w.surface,
            lemma: w.lemma,
            pos: w.pos,
            morph: w.morph,
            gloss: w.gloss,
            strongs: w.strongs,
          })),
        })),
      })),
    };

    const file = path.join(OUT_DIR, `${book.slug}.json`);
    await writeFile(file, JSON.stringify(outBook));
    index.push({
      slug: book.slug,
      name: book.name,
      abbrev: book.abbrev,
      chapters: chapters.length,
    });

    for (const ch of chapters) {
      for (const v of ch.verses) {
        const featured = pickFeatured(v.words);
        allForReels.push({
          book: book.slug,
          name: book.name,
          chapter: ch.n,
          verse: v.n,
          ref: `${book.name} ${ch.n}:${v.n}`,
          pt: v.pt,
          featured: publicWord(featured),
          words: v.words.map(publicWord),
          score: featured ? wordScore(featured) + Math.min(v.pt.length / 80, 3) : 0,
        });
      }
    }
    console.log(`OK ${book.name} (${chapters.length} caps)`);
  }

  const used = new Set();
  const reels = [];

  for (const [ref, reflection] of Object.entries(CURATED)) {
    const row = allForReels.find((r) => r.ref === ref);
    if (!row || !row.featured) {
      console.warn("Curado sem correspondência:", ref);
      continue;
    }
    used.add(row.ref);
    reels.push({
      id: `${row.book}-${row.chapter}-${row.verse}`,
      ref: row.ref,
      book: row.book,
      chapter: row.chapter,
      verse: row.verse,
      pt: row.pt,
      featured: row.featured,
      words: row.words,
      reflection,
      curated: true,
    });
  }

  const extras = allForReels
    .filter((r) => !used.has(r.ref) && r.featured && r.pt.length > 40)
    .sort((a, b) => b.score - a.score);

  const perBook = new Map();
  for (const row of extras) {
    const n = perBook.get(row.book) || 0;
    if (n >= 2) continue;
    perBook.set(row.book, n + 1);
    reels.push({
      id: `${row.book}-${row.chapter}-${row.verse}`,
      ref: row.ref,
      book: row.book,
      chapter: row.chapter,
      verse: row.verse,
      pt: row.pt,
      featured: row.featured,
      words: row.words,
      reflection: generatedReflection(row, row.featured),
      curated: false,
    });
  }

  await writeFile(path.join(ROOT, "data", "books.json"), JSON.stringify(index, null, 2));
  await writeFile(path.join(ROOT, "data", "reels.json"), JSON.stringify(reels));
  console.log(`Livros: ${index.length}`);
  console.log(`Reels: ${reels.length} (${reels.filter((r) => r.curated).length} curatoriais)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
