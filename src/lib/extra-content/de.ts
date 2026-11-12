import type { ExtraContent } from './cs';

export const de: ExtraContent = {
  ui: {
    // ---- E-mail: purchase confirmation ----
    mailReportSubject: 'Kaufbestätigung: ausführliche Kinkometr-Auswertung',
    mailReportHeading: 'Danke, deine Auswertung ist freigeschaltet',
    mailReportCta: 'Auswertung öffnen',
    mailPairSubject: 'Kaufbestätigung: Paar-Auswertung des Kinkometrs',
    mailPairHeading: 'Danke, eure Paar-Auswertung ist freigeschaltet',
    mailPairCta: 'Paar-Auswertung öffnen',
    mailPremiumSubject: 'Kaufbestätigung: Premium-Fragenpakete',
    mailPremiumHeading: 'Danke, Premium ist freigeschaltet',
    mailPremiumCta: 'NakedTruth öffnen',
    mailPurchaseBody: 'Wir bestätigen den Abschluss des Vertrags über die Lieferung digitaler Inhalte: {product}, Preis {price}, bezahlt am {date}. Der Inhalt wurde direkt nach der Zahlung freigeschaltet.',
    mailWaiver: 'Vor der Zahlung hast du ausdrücklich zugestimmt, dass der Inhalt sofort freigeschaltet wird, und zur Kenntnis genommen, dass damit dein 14-tägiges Widerrufsrecht erlischt (§ 1837 Buchst. l des tschechischen Bürgerlichen Gesetzbuchs).',
    mailKeepLink: 'Der Link unten ist privat: Wer ihn hat, sieht dein Ergebnis. Speichere ihn und schick ihn niemandem.',
    mailStored: 'Wir haben diese E-Mail-Adresse bei deinem Ergebnis gespeichert, damit du dir den Link jederzeit erneut zusenden lassen kannst. Sie wird zusammen mit dem Ergebnis gelöscht.',
    mailSeller: 'Verkäufer: {seller}',
    mailTerms: 'Allgemeine Geschäftsbedingungen: {url}',
    mailPurchaseFooter: 'Diese E-Mail ist die Kaufbestätigung für deinen Kauf auf NakedTruth. Werbung schicken wir dir nicht.',

    // ---- E-mail: links to your results ----
    mailLinksSubject: 'Deine Links zu NakedTruth',
    mailLinksHeading: 'Hier sind deine Links',
    mailLinksBody: 'Zu dieser Adresse haben wir Folgendes gespeichert. Die Links sind privat: Wer sie hat, sieht den Inhalt.',
    mailLinkResult: 'Kinkometr-Ergebnis vom {date}',
    mailLinkReport: 'Ausführliche Auswertung vom {date}',
    mailLinkQuiz: 'Paar-Quiz vom {date}',
    mailLinksFooter: 'Jemand hat diese E-Mail auf NakedTruth angefordert. Warst du das nicht, kannst du sie einfach ignorieren.',

    // ---- Save the link by e-mail (result page) ----
    saveLinkTitle: 'Verlier dein Ergebnis nicht',
    saveLinkLead: 'Dein Ergebnis ist nur über diesen Link erreichbar. Lass ihn dir per E-Mail schicken – und später jederzeit noch einmal.',
    saveLinkConsent: 'Wir speichern die E-Mail-Adresse bei diesem Ergebnis nur, um dir den Link zu schicken. Sie wird zusammen mit dem Ergebnis gelöscht.',
    saveLinkStored: 'Die E-Mail-Adresse ist bei diesem Ergebnis gespeichert. Einen verlorenen Link kannst du dir auf der Seite „Link verloren“ erneut schicken lassen.',
    emailPlaceholder: 'du@beispiel.de',
    saveLinkButton: 'Link an mich senden',
    sending: 'Wird gesendet …',
    saveLinkSent: 'Gesendet. Schau in dein Postfach, notfalls auch in den Spam-Ordner.',
    invalidEmail: 'Gib bitte eine gültige E-Mail-Adresse ein.',
    tooMany: 'Wir haben an diese Adresse heute schon mehrere E-Mails geschickt. Versuch es morgen noch einmal.',
    mailUnavailable: 'Der E-Mail-Versand ist gerade nicht verfügbar. Speichere den Link bitte selbst.',
    mailFailed: 'Die E-Mail konnte nicht gesendet werden. Bitte versuche es noch einmal.',

    // ---- Lost link page ----
    recoverMetaTitle: 'Link verloren | NakedTruth',
    recoverLink: 'Link verloren',
    recoverTitle: 'Link verloren?',
    recoverLead: 'Gib die E-Mail-Adresse ein, die du bei deinem Ergebnis, beim Kauf oder im Paar-Quiz angegeben hast. Wir schicken dir alle deine Links dorthin.',
    recoverButton: 'Links senden',
    recoverDone: 'Falls wir zu dieser Adresse etwas gespeichert haben, ist die E-Mail unterwegs.',
    recoverNote: 'Ergebnisse ohne gespeicherte E-Mail-Adresse lassen sich so nicht wiederherstellen – wir wissen ja nicht, wem sie gehören.',

    // ---- Unfinished test ----
    resumeTitle: 'Du hast einen Test angefangen',
    resumeText: '{done} von {total} Fragen beantwortet. Die Antworten sind nur in diesem Browser gespeichert.',
    resumeContinue: 'Weitermachen',
    resumeRestart: 'Neu beginnen',

    // ---- Sharing a result ----
    shareButton: 'Meine Kelche teilen',
    shareHint: 'Geteilt werden nur deine drei vollsten Kelche – ohne Link zu deinem Ergebnis und ohne deine übrigen Antworten.',
    shareCopied: 'Link kopiert',
    shareText: 'Meine vollsten Kelche im Kinkometr. Und deine?',
    shareMetaTitle: 'Meine Kelche im Kinkometr: {cups}',
    shareMetaDesc: 'Das Kinkometr misst {n} Bereiche dessen, was dich im Bett reizt. Anonym, kostenlos und in wenigen Minuten.',
    shareKicker: 'Die vollsten Kelche von jemandem',
    shareHeading: 'Und wie voll sind deine Kelche?',
    shareLead: 'Das Kinkometr ist ein anonymer Test: {n} Kelche, ein paar Minuten, keine Registrierung. Das Ergebnis siehst nur du.',
    shareCta: 'Meine Kelche herausfinden',
    ogTitle: 'Meine vollsten Kelche',
    ogCta: 'Und deine?',

    // ---- Couple report: teaser ----
    pairProductName: 'NakedTruth – Paar-Auswertung des Kinkometrs',
    pairMetaTitle: 'Paar-Auswertung | NakedTruth Kinkometr',
    pairTeaserTitle: 'Ein gemeinsamer Plan für euch zwei',
    pairTeaserLead: 'Der Vergleich zeigt, worin ihr euch einig seid. Die Paar-Auswertung macht daraus einen Plan: womit ihr anfangt, wer was führt und wie ihr darüber sprecht.',
    pairItem1: 'Gemeinsame Abende – einer für jeden Kelch, bei dem ihr euch einig seid, vom sanftesten an',
    pairItem2: 'Wer gibt und wer empfängt, dort, wo es darauf ankommt',
    pairItem3: 'Einladungen: wie du anbietest, was nur einen von euch reizt, und ein erster Schritt ohne Druck',
    pairItem4: 'Fertige Sätze, mit denen ihr das Thema eröffnet, und drei Absprachen vorab',
    pairItem5: 'Wird für euch beide freigeschaltet; Druckversion',
    pairBuy: 'Paar-Auswertung freischalten für {price}',
    pairOneTime: 'Einmalzahlung per Karte, ohne Abo. Einer zahlt, die Auswertung wird für euch beide freigeschaltet.',
    pairOpen: 'Paar-Auswertung öffnen',

    // ---- Couple report: page ----
    pairTitle: 'Euer gemeinsamer Plan',
    pairThanks: 'Danke für eure Unterstützung! Die Auswertung ist für euch beide freigeschaltet – dein Gegenüber öffnet sie über den eigenen Vergleich.',
    pairSummary: '{shared} gemeinsam · {invite} Einladungen · {explore} zu erkunden',
    pairBack: 'Zurück zum Vergleich',
    pairAgreeTitle: 'Drei Absprachen vorab',
    pairAgree1: 'Stopp: ein Wort oder eine Geste, bei der sofort Schluss ist – ohne Erklärung.',
    pairAgree2: 'Was heute tabu ist. Jeder nennt mindestens eine Sache.',
    pairAgree3: 'Danach: zehn Minuten zusammen ohne Handy, und jeder sagt eine Sache, die schön war.',
    pairEveningsTitle: 'Gemeinsame Abende',
    pairEveningsLead: 'Geht der Reihe nach vor, vom sanftesten an. Ein Abend, ein Kelch, zwischen den Abenden mindestens ein paar Tage Pause.',
    pairEveningsEmpty: 'Bisher habt ihr keinen Kelch, bei dem ihr euch beide klar einig seid. Fangt mit den Einladungen weiter unten an – dort entsteht Einigkeit.',
    pairRolesLabel: 'Wer was führt',
    pairSayLabel: 'Wie ihr es eröffnet',
    pairEveningLabel: 'Abend',
    pairInvitesTitle: 'Einladungen',
    pairInvitesLead: 'Hier reizt der Kelch einen von euch, und das Gegenüber ist unsicher. Wen es reizt, der eröffnet das Thema; der andere bestimmt das Tempo und kann jederzeit Nein sagen.',
    pairYouOpen: 'Du eröffnest',
    pairPartnerOpens: 'Dein Gegenüber eröffnet',
    pairFirstStepLabel: 'Erster Schritt',
    pairExploreTitle: 'Gemeinsames Neuland',
    pairExploreLead: 'Hier seid ihr beide unsicher. Seht den ersten Schritt als Versuch – und erzählt euch danach, wie es war.',
    pairHiddenNote: 'Kelche, die einer von euch abgelehnt hat, sind nicht im Plan und werden nirgends angezeigt.',

    // ---- Landing pages (shared) ----
    // ---- Free sample of the detailed report ----
    sampleKicker: 'Kostenlose Vorschau',
    sampleTitle: 'So sieht deine Auswertung aus',
    sampleLead: 'Dein vollster Kelch ist komplett freigeschaltet. Die vollständige Auswertung behandelt jeden Kelch, der dich reizt, genauso ausführlich — insgesamt {n}.',
    sampleLocked: 'Gesperrt',
    sampleMore: 'Das wartet außerdem in der vollständigen Auswertung',
    sampleLink: 'Kostenlose Vorschau ansehen',

    // ---- VIP codes ----

    vipHave: 'Ich habe einen VIP-Code',

    vipPlaceholder: 'VIP-Code',

    vipApply: 'Mit Code freischalten',

    vipInvalid: 'Der Code ist ungültig, abgelaufen oder aufgebraucht.',

    vipActiveTitle: 'VIP-Zugang ist aktiv',

    vipActiveLead: 'Der Code {code} ist 30 Tage lang in diesem Browser gespeichert. Damit schaltest du die ausführliche Auswertung, die Paar-Auswertung und die Premium-Pakete des Quiz ohne Bezahlung frei — klicke bei jedem Angebot einfach auf „Mit Code freischalten“.',

    vipInvalidTitle: 'Dieser VIP-Code ist nicht gültig',

    vipInvalidLead: 'Der Code ist abgelaufen, aufgebraucht oder im Link steckt ein Tippfehler. Melde dich bei der Person, die ihn dir geschickt hat.',


    landingFaqTitle: 'Häufige Fragen',
    landingMeasures: 'Was der Test misst',
    landingOther: 'Weitere Tests',
  },
  landing: {
    bdsm: {
      metaTitle: 'BDSM-Test kostenlos & anonym | NakedTruth Kinkometr',
      metaDesc: 'BDSM-Test in 2 Minuten: Dominanz, Hingabe, Fesseln, Klapse, Kontrolle und mehr. Ohne Registrierung, das Ergebnis siehst nur du. Vergleich mit Partner möglich.',
      h1: 'BDSM-Test: Finde heraus, was dich wirklich reizt',
      lead: 'Neun BDSM-Bereiche, zwei Minuten, keine Registrierung. Statt eines Etiketts bekommst du Kelche – bei jedem siehst du, wie voll er ist und was du damit anfangen kannst.',
      cta: 'BDSM-Test starten',
      points: ['Anonym und kostenlos', 'Die Antwort „Weiß nicht“ zählt mit', 'Vergleich mit deinem Gegenüber nur dort, wo ihr euch einig seid'],
      sections: [
        {
          h: 'So funktioniert der BDSM-Test',
          p: 'Du antwortest auf kurze Aussagen auf einer Skala von „Das ist nichts für mich“ bis „Ja, das will ich“. Jederzeit kannst du „Weiß nicht“ wählen – dann wird der Kelch als unerforscht markiert, und du bekommst statt einer Bewertung einen sanften ersten Schritt. Wer mag, geht in eine zweite, schärfere Runde, die zeigt, ob du lieber gibst oder empfängst.',
        },
        {
          h: 'Für Einsteiger und Erfahrene',
          p: 'Du musst keine Begriffe kennen und keine Erfahrung haben. Der Test fragt nicht, was du schon getan hast, sondern was dich reizt. Zu jedem vollen Kelch bekommst du konkrete Tipps für Aktivitäten und die Regeln für sicheres Spielen: Safeword, Ampel und Aftercare.',
        },
        {
          h: 'Vergleichen ohne peinliche Momente',
          p: 'Du kannst dein Ergebnis als Einladung an dein Gegenüber schicken. Ihr seht nur das, worin ihr euch einig seid. Was einer von euch abgelehnt hat, bleibt verborgen – niemand erfährt, wozu der andere Nein gesagt hat.',
        },
      ],
      faq: [
        { q: 'Ist der BDSM-Test wirklich anonym?', a: 'Ja. Wir verlangen weder Namen noch E-Mail-Adresse und speichern keine IP-Adresse. Dein Ergebnis ist nur über einen zufälligen, privaten Link erreichbar, und du kannst es jederzeit löschen.' },
        { q: 'Wie lange dauert der Test?', a: 'Die erste Runde etwa zwei Minuten. Die zweite, tiefere Runde ist freiwillig und dauert ein paar Minuten länger, je nachdem, wie viele Bereiche du auswählst.' },
        { q: 'Was, wenn ich nicht weiß, ob mir etwas gefällt?', a: 'Dann wähle „Weiß nicht“. Das ist eine vollwertige Antwort: Der Kelch wird als unerforscht markiert, und wir empfehlen dir einen unaufdringlichen Weg, es herauszufinden.' },
        { q: 'Sieht mein Gegenüber alle meine Antworten?', a: 'Nein. Im Vergleich erscheinen nur Bereiche, die euch beide reizen, und solche, bei denen mindestens einer unsicher ist und der andere Lust darauf hat. Abgelehnte Bereiche bleiben verborgen.' },
      ],
    },
    kink: {
      metaTitle: 'Kink-Test: 23 Kelche voller Vorlieben | NakedTruth',
      metaDesc: 'Kink-Test kostenlos und ohne Registrierung. 23 Bereiche von Zärtlichkeit bis BDSM, Fantasien und Spiele zu mehreren. Ergebnis als Kelche, Tipps und Partnervergleich.',
      h1: 'Kink-Test: Wie voll sind deine Kelche?',
      lead: 'Dreiundzwanzig Bereiche – Macht und Hingabe, Körper und Sinne, Fantasie, andere Menschen und Zärtlichkeit. In fünf Minuten siehst du, welche Kelche voll sind, welche halb leer und welche du noch nicht erforscht hast.',
      cta: 'Kink-Test starten',
      points: ['23 Bereiche, 5 Minuten', 'Ohne Registrierung, kostenlos', 'Tipps zu Aktivitäten, Stellungen und Orten'],
      sections: [
        {
          h: 'Mehr als nur ein Etikett',
          p: 'Die meisten Tests teilen dir einen einzigen Typ zu. Das Kinkometr zeigt die ganze Landkarte: Jeder Bereich ist ein Kelch mit eigenem Füllstand. Du erfährst, was dein Hauptthema ist, was dich nur interessiert und wo du noch nichts weißt.',
        },
        {
          h: 'Von Zärtlichkeit bis BDSM',
          p: 'Der Test beginnt nicht bei BDSM und hört auch nicht dort auf. Er misst auch Romantik, Tantra, Oralsex, Toys, Rollenspiele, Dirty Talk, Materialien, Voyeurismus oder Sex an ungewöhnlichen Orten. Wer nur einen schnellen Überblick will, wählt die Kurzversion in zwei Minuten.',
        },
        {
          h: 'Was du mit dem Ergebnis anfängst',
          p: 'Zu jedem vollen Kelch bekommst du konkrete Aktivitäten, Stellungen und Orte. Zu den unerforschten einen ersten Schritt. Und wenn du jemanden an deiner Seite hast, schick eine Einladung: Der Vergleich zeigt nur das, worin ihr euch einig seid.',
        },
      ],
      faq: [
        { q: 'Was ist ein Kink?', a: 'Ein Kink ist alles, was dich beim Sex über das „Übliche“ hinaus erregt – vom Fesseln über Rollenspiele bis zu bestimmten Materialien. Einen Kink zu haben ist normal; der Test hilft dir nur, deinen zu benennen.' },
        { q: 'Ist der Kink-Test kostenlos?', a: 'Ja. Test, Ergebnis, Empfehlungen und Partnervergleich sind kostenlos. Kostenpflichtig ist nur die freiwillige ausführliche Auswertung.' },
        { q: 'Muss ich mich registrieren?', a: 'Nein. Der Test ist anonym, ohne Konto und ohne E-Mail-Adresse. Dein Ergebnis findest du unter einem privaten Link.' },
        { q: 'Ist der Test auch ohne Erfahrung geeignet?', a: 'Ja. Wir fragen, was dich reizt, nicht, was du schon ausprobiert hast. Die Antwort „Weiß nicht“ steht dir immer zur Verfügung.' },
      ],
    },
    domsub: {
      metaTitle: 'Dom-Sub-Test: dominant oder devot? | NakedTruth',
      metaDesc: 'Dom-Sub-Test kostenlos: In 2 Minuten findest du heraus, ob es dich zum Führen, zur Hingabe oder zu beidem zieht. Anonym, ohne Registrierung, mit Partnervergleich.',
      h1: 'Dom-Sub-Test: dominant, devot oder Switch?',
      lead: 'Zieht es dich zum Führen oder zur Hingabe? Und was, wenn beides? Der Test misst Dominanz und Hingabe getrennt – und dazu Fesseln, Kontrolle, Klapse und die Worte, die dazugehören.',
      cta: 'Herausfinden, was ich bin',
      points: ['Dominanz und Hingabe getrennt gemessen', '2 Minuten, anonym', 'Zu zweit seht ihr, wer wen führt'],
      sections: [
        {
          h: 'Dom, Sub und Switch',
          p: 'Dominante Menschen genießen es, zu führen und zu entscheiden, devote die Hingabe und das Vertrauen. Ein Switch mag beides, je nach Stimmung und Gegenüber. Weil der Test beide Seiten getrennt misst, steckt er dich nicht zwanghaft in nur eine Schublade.',
        },
        {
          h: 'Nicht nur Rollen, sondern auch das, was dazugehört',
          p: 'Die Rolle allein reicht nicht. Deshalb misst der Test auch, wie sich Macht im Bett zeigt: Fesseln, Klapse, Kontrolle über den Höhepunkt, Lob und Demütigung, Wildheit. Bei diesen Bereichen zeigt die zweite Runde, ob du lieber gibst oder empfängst.',
        },
        {
          h: 'Findet es gemeinsam heraus',
          p: 'Schick deinem Gegenüber eine Einladung, und der Vergleich zeigt euch, wie eure Rollen zusammenpassen: einer führt und der andere gibt sich hin, ihr seid beide Switch, oder ihr wollt beide führen. Dazu die Kelche, bei denen ihr euch einig seid.',
        },
      ],
      faq: [
        { q: 'Woran erkenne ich, ob ich dominant oder devot bin?', a: 'An dem, was dich in deiner Fantasie erregt – nicht daran, wie du im Alltag bist. Der Test fragt nach konkreten Situationen und bewertet beide Seiten getrennt.' },
        { q: 'Was ist ein Switch?', a: 'Ein Mensch, den sowohl das Führen als auch die Hingabe reizt. Das ist verbreitet – und der Test zeigt es dir, wenn beide Kelche bei dir voll sind.' },
        { q: 'Ist der Test anonym?', a: 'Ja. Ohne Registrierung, ohne E-Mail-Adresse, das Ergebnis nur unter einem privaten Link, den du jederzeit löschen kannst.' },
        { q: 'Können wir den Test als Paar machen?', a: 'Ja. Einer füllt den Test aus und schickt eine Einladung, der andere füllt denselben Test aus. Der Vergleich zeigt eure Dynamik und die gemeinsamen Kelche; abgelehnte Bereiche bleiben verborgen.' },
      ],
    },
  },
};
