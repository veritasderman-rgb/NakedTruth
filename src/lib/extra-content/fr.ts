import type { ExtraContent } from './cs';

export const fr: ExtraContent = {
  ui: {
    // ---- E-mail: purchase confirmation ----
    mailReportSubject: "Confirmation d'achat : rapport détaillé du Kinkometr",
    mailReportHeading: "Merci, ton rapport est débloqué",
    mailReportCta: "Ouvrir le rapport",
    mailPairSubject: "Confirmation d'achat : rapport de couple du Kinkometr",
    mailPairHeading: "Merci, votre rapport de couple est débloqué",
    mailPairCta: "Ouvrir le rapport de couple",
    mailPremiumSubject: "Confirmation d'achat : packs de questions premium",
    mailPremiumHeading: "Merci, le premium est débloqué",
    mailPremiumCta: "Ouvrir NakedTruth",
    mailPurchaseBody: "Nous confirmons la conclusion d'un contrat de fourniture de contenu numérique : {product}, prix {price}, payé le {date}. Le contenu a été rendu accessible immédiatement après le paiement.",
    mailWaiver: "Avant de payer, tu as expressément accepté l'accès immédiat au contenu et reconnu perdre ainsi ton droit de rétractation de 14 jours (§ 1837 let. l) du Code civil tchèque).",
    mailKeepLink: "Le lien ci-dessous est privé : quiconque le possède voit ton résultat. Garde-le précieusement et ne l'envoie à personne.",
    mailStored: "Nous avons enregistré cette adresse e-mail avec ton résultat pour que tu puisses te faire renvoyer le lien à tout moment. Elle sera supprimée en même temps que ton résultat.",
    mailSeller: "Vendeur : {seller}",
    mailTerms: "Conditions générales : {url}",
    mailPurchaseFooter: "Cet e-mail confirme un achat sur le site NakedTruth. Nous ne t'enverrons pas de publicité.",

    // ---- E-mail: links to your results ----
    mailLinksSubject: "Tes liens NakedTruth",
    mailLinksHeading: "Voici tes liens",
    mailLinksBody: "Voici ce que nous avons enregistré pour cette adresse. Les liens sont privés : quiconque les possède voit le contenu.",
    mailLinkResult: "Résultat du Kinkometr du {date}",
    mailLinkReport: "Rapport détaillé du {date}",
    mailLinkQuiz: "Quiz de couple du {date}",
    mailLinksFooter: "Quelqu'un a demandé cet e-mail sur le site NakedTruth. Si ce n'est pas toi, ignore-le simplement.",

    // ---- Save the link by e-mail (result page) ----
    saveLinkTitle: "Ne perds pas ton résultat",
    saveLinkLead: "Ton résultat n'est accessible que par ce lien. Reçois-le par e-mail, et tu pourras te le faire renvoyer quand tu veux.",
    saveLinkConsent: "Nous enregistrons ton e-mail avec ce résultat uniquement pour pouvoir t'envoyer le lien. Il sera supprimé en même temps que le résultat.",
    saveLinkStored: "Un e-mail est enregistré pour ce résultat. Si tu perds le lien, demande-le sur la page « Lien perdu ».",
    emailPlaceholder: "toi@exemple.fr",
    saveLinkButton: "M'envoyer le lien",
    sending: "Envoi…",
    saveLinkSent: "Envoyé. Jette un œil à ta boîte de réception, et aux spams au cas où.",
    invalidEmail: "Saisis une adresse e-mail valide.",
    tooMany: "Nous avons déjà envoyé plusieurs e-mails à cette adresse aujourd'hui. Réessaie demain.",
    mailUnavailable: "L'envoi d'e-mails n'est pas disponible pour le moment. Enregistre le lien à la main, s'il te plaît.",
    mailFailed: "Impossible d'envoyer l'e-mail. Réessaie, s'il te plaît.",

    // ---- Lost link page ----
    recoverMetaTitle: "Lien perdu | NakedTruth",
    recoverLink: "Lien perdu",
    recoverTitle: "Tu as perdu ton lien ?",
    recoverLead: "Saisis l'e-mail que tu as enregistré avec ton résultat, ou indiqué lors de ton achat ou de ton quiz de couple. Nous t'enverrons tous tes liens.",
    recoverButton: "Envoyer les liens",
    recoverDone: "Si nous avons quelque chose pour cette adresse, l'e-mail est en route.",
    recoverNote: "Les résultats sans e-mail enregistré ne peuvent pas être retrouvés ainsi : nous ne savons pas à qui ils appartiennent.",

    // ---- Unfinished test ----
    resumeTitle: "Tu as un test en cours",
    resumeText: "{done} questions sur {total} déjà répondues. Les réponses sont enregistrées uniquement dans ce navigateur.",
    resumeContinue: "Continuer",
    resumeRestart: "Recommencer",

    // ---- Sharing a result ----
    shareButton: "Partager mes coupes",
    shareHint: "Seules tes trois coupes les plus pleines sont partagées, sans lien vers ton résultat et sans tes autres réponses.",
    shareCopied: "Lien copié",
    shareText: "Mes coupes les plus pleines au Kinkometr. Et les tiennes ?",
    shareMetaTitle: "Mes coupes au Kinkometr : {cups}",
    shareMetaDesc: "Le Kinkometr explore {n} domaines de ce qui t'attire au lit. Anonyme, gratuit et en quelques minutes.",
    shareKicker: "Les coupes les plus pleines de quelqu'un",
    shareHeading: "Et toi, quelles sont tes coupes ?",
    shareLead: "Le Kinkometr est un test anonyme : {n} coupes, quelques minutes, aucune inscription. Toi seul·e verras ton résultat.",
    shareCta: "Découvrir mes coupes",
    ogTitle: "Mes coupes les plus pleines",
    ogCta: "Et les tiennes ?",

    // ---- Couple report: teaser ----
    pairProductName: "NakedTruth — rapport de couple du Kinkometr",
    pairMetaTitle: "Analyse de couple | NakedTruth Kinkometr",
    pairTeaserTitle: "Un plan commun pour vous deux",
    pairTeaserLead: "La comparaison montre ce qui vous rapproche. Le rapport de couple en fait un plan : par quoi commencer, qui mène quoi et comment en parler ensemble.",
    pairItem1: "Des soirées à deux : une par coupe sur laquelle vous êtes d'accord, en commençant par la plus douce",
    pairItem2: "Qui donne et qui reçoit là où cela compte",
    pairItem3: "Des invitations : comment proposer ce qui n'attire que l'un de vous, et un premier pas sans pression",
    pairItem4: "Des phrases toutes prêtes pour ouvrir le sujet, et trois accords à poser d'avance",
    pairItem5: "Débloqué pour vous deux ; version imprimable",
    pairBuy: "Débloquer le rapport de couple pour {price}",
    pairOneTime: "Paiement unique par carte, sans abonnement. Un seul de vous paie, le rapport se débloque pour les deux.",
    pairOpen: "Ouvrir le rapport de couple",

    // ---- Couple report: page ----
    pairTitle: "Votre plan commun",
    pairThanks: "Merci pour votre soutien ! Le rapport est débloqué pour vous deux : ton ou ta partenaire l'ouvre depuis sa propre comparaison.",
    pairSummary: "{shared} en commun · {invite} invitations · {explore} à explorer",
    pairBack: "Retour à la comparaison",
    pairAgreeTitle: "Trois accords à poser d'avance",
    pairAgree1: "Le stop : un mot ou un geste qui arrête tout immédiatement, sans avoir à s'expliquer.",
    pairAgree2: "Ce qui est hors jeu aujourd'hui. Chacun dit au moins une chose.",
    pairAgree3: "Et après : dix minutes ensemble sans téléphone, et chacun dit une chose qui était bien.",
    pairEveningsTitle: "Soirées à deux",
    pairEveningsLead: "Avancez dans l'ordre, en commençant par le plus doux. Une soirée, une coupe, et quelques jours au moins entre deux soirées.",
    pairEveningsEmpty: "Vous n'avez pas encore de coupe sur laquelle vous êtes clairement d'accord tous les deux. Commencez par les invitations ci-dessous : c'est là que l'accord naît.",
    pairRolesLabel: "Qui mène quoi",
    pairSayLabel: "Comment ouvrir le sujet",
    pairEveningLabel: "Soirée",
    pairInvitesTitle: "Invitations",
    pairInvitesLead: "Ici, la coupe attire l'un de vous et l'autre hésite. Celui qui est attiré ouvre le sujet ; l'autre donne le tempo et peut dire non à tout moment.",
    pairYouOpen: "C'est toi qui ouvres",
    pairPartnerOpens: "C'est ton ou ta partenaire qui ouvre",
    pairFirstStepLabel: "Premier pas",
    pairExploreTitle: "Territoire inconnu à deux",
    pairExploreLead: "Ici, ni l'un ni l'autre n'êtes sûrs. Prenez le premier pas comme un essai, puis racontez-vous comment c'était.",
    pairHiddenNote: "Les coupes que l'un de vous a refusées ne figurent pas dans le plan et ne s'affichent nulle part.",

    // ---- Landing pages (shared) ----
    // ---- Free sample of the detailed report ----
    sampleKicker: 'Aperçu gratuit',
    sampleTitle: 'Voici à quoi ressemble ton rapport',
    sampleLead: 'Ta coupe la plus remplie est entièrement débloquée. Le rapport complet détaille de la même façon chaque coupe qui t’attire — {n} au total.',
    sampleLocked: 'Verrouillé',
    sampleMore: 'Ce qui t’attend encore dans le rapport complet',
    sampleLink: 'Voir un aperçu gratuit',

    // ---- VIP codes ----

    vipHave: 'J’ai un code VIP',

    vipPlaceholder: 'Code VIP',

    vipApply: 'Débloquer avec le code',

    vipInvalid: 'Ce code est invalide, expiré ou épuisé.',

    vipActiveTitle: 'L’accès VIP est actif',

    vipActiveLead: 'Le code {code} est enregistré dans ce navigateur pendant 30 jours. Il débloque sans paiement le rapport détaillé, le rapport de couple et les packs premium du quiz — il suffit de cliquer sur « Débloquer avec le code » à chaque offre.',

    vipInvalidTitle: 'Ce code VIP n’est pas valide',

    vipInvalidLead: 'Le code a expiré, est épuisé, ou le lien contient une faute de frappe. Contacte la personne qui te l’a envoyé.',


    landingFaqTitle: "Questions fréquentes",
    landingMeasures: "Ce que mesure le test",
    landingOther: "Autres tests",
  },
  landing: {
    bdsm: {
      metaTitle: "Test BDSM gratuit et anonyme | NakedTruth Kinkometr",
      metaDesc: "Test BDSM en 2 minutes : domination, soumission, bondage, fessée, contrôle et plus. Sans inscription, toi seul·e vois le résultat. Comparable avec ton ou ta partenaire.",
      h1: "Test BDSM : découvre ce qui t'attire vraiment",
      lead: "Neuf domaines du BDSM, deux minutes, aucune inscription. Au lieu d'une étiquette, tu obtiens des coupes : pour chaque domaine, tu vois à quel point elle est pleine et quoi en faire ensuite.",
      cta: "Lancer le test BDSM",
      points: ["Anonyme et gratuit", "« Je ne sais pas » compte aussi", "Comparaison avec ton ou ta partenaire uniquement sur ce que vous avez en commun"],
      sections: [
        {
          h: "Comment fonctionne le test BDSM",
          p: "Tu réponds à de courtes affirmations sur une échelle allant de « ce n'est pas pour moi » à « oui, j'en ai envie ». Tu peux dire « je ne sais pas » à tout moment : cette coupe sera marquée comme inexplorée et tu recevras un premier pas tout en douceur plutôt qu'un jugement. Si tu veux, tu poursuis avec un second tour, plus poussé, qui distingue si tu préfères donner ou recevoir.",
        },
        {
          h: "Pour les débutant·es comme pour les initié·es",
          p: "Pas besoin de connaître le vocabulaire ni d'avoir de l'expérience. Le test ne demande pas ce que tu as fait, mais ce qui t'attire. Pour chaque coupe bien remplie, tu reçois des idées concrètes d'activités et les règles d'un jeu en sécurité : le mot d'arrêt, le feu tricolore et les soins après le jeu.",
        },
        {
          h: "Une comparaison sans gêne",
          p: "Tu peux envoyer ton résultat à ton ou ta partenaire sous forme d'invitation. Vous ne verrez que ce que vous avez en commun. Ce que l'un de vous a refusé reste caché : personne ne saura à quoi l'autre a dit non.",
        },
      ],
      faq: [
        { q: "Le test BDSM est-il vraiment anonyme ?", a: "Oui. Nous ne demandons ni nom ni e-mail et nous ne stockons pas ton adresse IP. Ton résultat n'est accessible que par un lien privé aléatoire, et tu peux le supprimer quand tu veux." },
        { q: "Combien de temps dure le test ?", a: "Environ deux minutes pour le premier tour. Le second tour, plus approfondi, est facultatif et ajoute quelques minutes selon le nombre de domaines que tu choisis." },
        { q: "Et si je ne sais pas si quelque chose me plaît ?", a: "Choisis alors « je ne sais pas ». C'est une réponse à part entière : la coupe sera marquée comme inexplorée et nous te proposerons une façon discrète de t'en faire une idée." },
        { q: "Mon ou ma partenaire verra-t-il ou elle toutes mes réponses ?", a: "Non. La comparaison n'affiche que les domaines qui vous attirent tous les deux, et ceux où au moins l'un de vous hésite alors que l'autre a envie. Les domaines refusés restent cachés." },
      ],
    },
    kink: {
      metaTitle: "Test kink : 23 coupes de ce qui t'attire | NakedTruth",
      metaDesc: "Test kink gratuit et sans inscription. 23 domaines, de la tendresse au BDSM, des fantasmes aux jeux à plusieurs. Résultat en coupes, idées sur mesure et comparaison avec ton ou ta partenaire.",
      h1: "Test kink : à quel point tes coupes sont-elles pleines ?",
      lead: "Vingt-trois domaines : pouvoir et abandon, corps et sensations, fantasmes, autres personnes et tendresse. En cinq minutes, tu vois quelles coupes sont pleines, lesquelles sont à moitié vides et lesquelles tu n'as pas encore explorées.",
      cta: "Lancer le test kink",
      points: ["23 domaines, 5 minutes", "Sans inscription, gratuit", "Idées d'activités, de positions et de lieux"],
      sections: [
        {
          h: "Plus qu'une simple étiquette",
          p: "La plupart des tests te collent un seul type. Le Kinkometr montre toute la carte : chaque domaine est une coupe avec son propre niveau. Tu découvres ton thème principal, ce qui t'intrigue seulement et ce que tu ne sais pas encore.",
        },
        {
          h: "De la tendresse au BDSM",
          p: "Le test ne commence ni ne s'arrête au BDSM. Il explore aussi le romantisme, le tantra, le sexe oral, les jouets, les jeux de rôle, les mots crus, les matières, le voyeurisme ou le sexe dans des endroits inhabituels. Si tu veux juste un aperçu rapide, choisis la version courte de deux minutes.",
        },
        {
          h: "Que faire du résultat",
          p: "Pour chaque coupe bien remplie, tu reçois des activités, des positions et des lieux concrets. Pour les coupes inexplorées, un premier pas. Et si tu as un ou une partenaire, envoie-lui une invitation : la comparaison ne montre que ce que vous avez en commun.",
        },
      ],
      faq: [
        { q: "Qu'est-ce qu'un kink ?", a: "Un kink, c'est tout ce qui t'excite dans le sexe au-delà du « classique » : du bondage aux jeux de rôle, en passant par certaines matières. Avoir un kink est normal ; le test t'aide simplement à mettre des mots sur le tien." },
        { q: "Le test kink est-il gratuit ?", a: "Oui. Le test, le résultat, les recommandations et la comparaison avec ton ou ta partenaire sont gratuits. Seul le rapport détaillé, facultatif, est payant." },
        { q: "Dois-je m'inscrire ?", a: "Non. Le test est anonyme, sans compte et sans e-mail. Tu retrouves ton résultat sur un lien privé." },
        { q: "Le test convient-il aussi sans expérience ?", a: "Oui. Nous demandons ce qui t'attire, pas ce que tu as déjà essayé. La réponse « je ne sais pas » est toujours disponible." },
      ],
    },
    domsub: {
      metaTitle: "Test dominant ou soumis : dom, sub ou switch ? | NakedTruth",
      metaDesc: "Test dominant ou soumis gratuit. En 2 minutes, vois si tu as envie de mener, de t'abandonner ou des deux. Anonyme, sans inscription, avec comparaison de couple.",
      h1: "Test dominant ou soumis : dom, sub ou switch ?",
      lead: "Tu as envie de mener ou de t'abandonner ? Et si c'était les deux ? Le test mesure séparément la domination et la soumission, et avec elles le bondage, le contrôle, la fessée et les mots qui vont avec.",
      cta: "Découvrir qui je suis",
      points: ["Domination et soumission mesurées séparément", "2 minutes, anonyme", "À deux, vous voyez qui mène qui"],
      sections: [
        {
          h: "Dom, sub et switch",
          p: "Une personne dominante aime mener et décider, une personne soumise aime s'abandonner et faire confiance. Un switch aime les deux, selon l'humeur et le ou la partenaire. Comme le test mesure chaque côté séparément, il ne t'enferme pas de force dans une seule case.",
        },
        {
          h: "Pas seulement les rôles, mais tout ce qui va avec",
          p: "Le rôle seul ne suffit pas. Le test mesure donc aussi la façon dont le pouvoir s'exprime au lit : bondage, fessée, contrôle de l'orgasme, compliments et humiliation, côté sauvage. Pour ces domaines, le second tour distingue si tu préfères donner ou recevoir.",
        },
        {
          h: "Découvrez-le ensemble",
          p: "Envoie une invitation à ton ou ta partenaire et la comparaison vous dira comment vos rôles se rencontrent : l'un mène et l'autre s'abandonne, vous êtes tous les deux switch, ou vous avez tous les deux envie de mener. Avec, en prime, les coupes sur lesquelles vous êtes d'accord.",
        },
      ],
      faq: [
        { q: "Comment savoir si je suis dominant·e ou soumis·e ?", a: "À ce qui t'excite dans tes fantasmes, pas à ce que tu es dans la vie de tous les jours. Le test pose des questions sur des situations concrètes et évalue chaque côté séparément." },
        { q: "Qu'est-ce qu'un switch ?", a: "Une personne qui est attirée aussi bien par le fait de mener que de s'abandonner. C'est courant, et le test le montre quand tes deux coupes sont pleines." },
        { q: "Le test est-il anonyme ?", a: "Oui. Sans inscription, sans e-mail, avec un résultat accessible uniquement par un lien privé que tu peux supprimer quand tu veux." },
        { q: "Pouvons-nous faire le test en couple ?", a: "Oui. L'un de vous fait le test et envoie une invitation, l'autre fait le même. La comparaison montre votre dynamique et vos coupes communes ; les domaines refusés restent cachés." },
      ],
    },
  },
};
