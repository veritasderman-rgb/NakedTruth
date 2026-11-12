import type { ExtraContent } from './cs';

export const en: ExtraContent = {
  ui: {
    // ---- E-mail: purchase confirmation ----
    mailReportSubject: 'Purchase confirmation: Kinkometr detailed report',
    mailReportHeading: 'Thank you, your report is unlocked',
    mailReportCta: 'Open the report',
    mailPairSubject: 'Purchase confirmation: Kinkometr couple report',
    mailPairHeading: 'Thank you, your couple report is unlocked',
    mailPairCta: 'Open the couple report',
    mailPremiumSubject: 'Purchase confirmation: premium question packs',
    mailPremiumHeading: 'Thank you, premium is unlocked',
    mailPremiumCta: 'Open NakedTruth',
    mailPurchaseBody: 'We confirm the conclusion of a contract for the supply of digital content: {product}, price {price}, paid on {date}. The content was made available immediately after payment.',
    mailWaiver: 'Before paying, you expressly agreed to the content being made available immediately and acknowledged that this means you lose the right to withdraw from the contract within 14 days (Section 1837(l) of the Czech Civil Code).',
    mailKeepLink: 'The link below is private: anyone who has it can see your result. Save it and don\'t send it to anyone.',
    mailStored: 'We\'ve stored this e-mail address with your result so you can have the link sent to you again whenever you need it. It is deleted together with the result.',
    mailSeller: 'Seller: {seller}',
    mailTerms: 'Terms and conditions: {url}',
    mailPurchaseFooter: 'This e-mail is a purchase confirmation from the NakedTruth website. We won\'t send you advertising.',

    // ---- E-mail: links to your results ----
    mailLinksSubject: 'Your NakedTruth links',
    mailLinksHeading: 'Here are your links',
    mailLinksBody: 'This is what we have stored for this address. The links are private: anyone who has them can see the content.',
    mailLinkResult: 'Kinkometr result from {date}',
    mailLinkReport: 'Detailed report from {date}',
    mailLinkQuiz: 'Couples quiz from {date}',
    mailLinksFooter: 'Someone requested this e-mail on the NakedTruth website. If it wasn\'t you, just ignore it.',

    // ---- Save the link by e-mail (result page) ----
    saveLinkTitle: "Don't lose your result",
    saveLinkLead: "Your result is only available through this link. Have it sent to you by e-mail, and you can get it again whenever you like.",
    saveLinkConsent: "We store your e-mail with this result only so we can send you the link. It is deleted together with the result.",
    saveLinkStored: "Your e-mail is stored with this result. If you lose the link, you can have it sent again on the “Lost link” page.",
    emailPlaceholder: 'you@example.com',
    saveLinkButton: 'Send me the link',
    sending: 'Sending…',
    saveLinkSent: 'Sent. Check your inbox, and your spam folder just in case.',
    invalidEmail: 'Please enter a valid e-mail address.',
    tooMany: "We've already sent several e-mails to this address today. Try again tomorrow.",
    mailUnavailable: "Sending e-mails isn't available right now. Please save the link manually.",
    mailFailed: "We couldn't send the e-mail. Please try again.",

    // ---- Lost link page ----
    recoverMetaTitle: 'Lost link | NakedTruth',
    recoverLink: 'Lost link',
    recoverTitle: 'Lost your link?',
    recoverLead: "Enter the e-mail you saved with your result, or used when you bought something or took the couples quiz. We'll send all your links to it.",
    recoverButton: 'Send the links',
    recoverDone: "If we have anything stored for this address, the e-mail is on its way.",
    recoverNote: "Results without a stored e-mail can't be recovered this way, because we don't know who they belong to.",

    // ---- Unfinished test ----
    resumeTitle: 'You have a test in progress',
    resumeText: "You've answered {done} of {total} questions. Your answers are saved only in this browser.",
    resumeContinue: 'Continue',
    resumeRestart: 'Start over',

    // ---- Sharing a result ----
    shareButton: 'Share my cups',
    shareHint: 'Only your three fullest cups are shared, with no link to your result and none of your other answers.',
    shareCopied: 'Link copied',
    shareText: 'My fullest cups in Kinkometr. What are yours?',
    shareMetaTitle: 'My Kinkometr cups: {cups}',
    shareMetaDesc: 'Kinkometr measures {n} areas of what turns you on in bed. Anonymous, free and done in a few minutes.',
    shareKicker: "Someone's fullest cups",
    shareHeading: 'And what are your cups?',
    shareLead: 'Kinkometr is an anonymous test: {n} cups, a few minutes, no sign-up. Only you will see your result.',
    shareCta: 'Find out my cups',
    ogTitle: 'My fullest cups',
    ogCta: 'What are yours?',

    // ---- Couple report: teaser ----
    pairProductName: 'NakedTruth — Kinkometr couple report',
    pairMetaTitle: 'Couple report | NakedTruth Kinkometr',
    pairTeaserTitle: 'A shared plan for the two of you',
    pairTeaserLead: 'The comparison shows what you agree on. The couple report turns that into a plan: where to start, who leads what and how to talk about it together.',
    pairItem1: 'Evenings together: one for every cup you agree on, starting with the gentlest',
    pairItem2: 'Who gives and who receives, where it matters',
    pairItem3: 'Invitations: how to offer what only one of you is drawn to, and a first step with no pressure',
    pairItem4: 'Ready-made sentences to open the topic, and three agreements to make beforehand',
    pairItem5: 'Unlocks for both of you; printable version',
    pairBuy: 'Unlock the couple report for {price}',
    pairOneTime: 'One-time card payment, no subscription. One of you pays, and the report unlocks for both.',
    pairOpen: 'Open the couple report',

    // ---- Couple report: page ----
    pairTitle: 'Your shared plan',
    pairThanks: "Thanks for your support! The report is unlocked for both of you. Your partner can open it from their own comparison.",
    pairSummary: '{shared} shared · {invite} invitations · {explore} to explore',
    pairBack: 'Back to the comparison',
    pairAgreeTitle: 'Three agreements beforehand',
    pairAgree1: 'Safe word: a word or gesture that ends everything immediately, no explanations needed.',
    pairAgree2: "What's off the table today. Each of you names at least one thing.",
    pairAgree3: 'Aftercare: ten minutes together without phones, and each of you says one thing that was good.',
    pairEveningsTitle: 'Evenings together',
    pairEveningsLead: 'Take them in order, from the gentlest. One evening, one cup, and at least a few days between evenings.',
    pairEveningsEmpty: "You don't have a cup yet that you both clearly agree on. Start with the invitations below, because that's where agreement begins.",
    pairRolesLabel: 'Who leads what',
    pairSayLabel: 'How to open it',
    pairEveningLabel: 'Evening',
    pairInvitesTitle: 'Invitations',
    pairInvitesLead: "Here the cup appeals to one of you while the other isn't sure. Whoever is drawn to it opens the topic; the other sets the pace and can say no at any time.",
    pairYouOpen: 'You open',
    pairPartnerOpens: 'Your partner opens',
    pairFirstStepLabel: 'First step',
    pairExploreTitle: 'Unexplored together',
    pairExploreLead: "Neither of you is sure here. Treat the first step as an experiment, then talk about how it felt.",
    pairHiddenNote: "Cups that either of you turned down aren't in the plan and won't be shown anywhere.",

    // ---- Landing pages (shared) ----
    // ---- Free sample of the detailed report ----
    sampleKicker: 'Free sample',
    sampleTitle: 'This is what your report looks like',
    sampleLead: 'Your fullest cup is unlocked in full. The complete report covers every cup that appeals to you in the same detail — {n} in total.',
    sampleLocked: 'Locked',
    sampleMore: 'Also waiting in the full report',
    sampleLink: 'See a free sample',

    landingFaqTitle: 'Frequently asked questions',
    landingMeasures: 'What the test measures',
    landingOther: 'More tests',
  },
  landing: {
    bdsm: {
      metaTitle: 'BDSM Test: Free and Anonymous | NakedTruth Kinkometr',
      metaDesc: 'A 2-minute BDSM test: dominance, submission, bondage, spanking, control and more. No sign-up, and only you see your result. Compare it with your partner.',
      h1: 'BDSM test: find out what really turns you on',
      lead: "Nine BDSM areas, two minutes, no sign-up. Instead of a label, you get cups: for each area you see how full it is and what to do next.",
      cta: 'Start the BDSM test',
      points: ['Anonymous and free', 'An “I don\'t know” answer counts', 'Partner comparison shows only what you agree on'],
      sections: [
        {
          h: 'How the BDSM test works',
          p: "You respond to short statements on a scale from “not for me” to “yes, I want that”. You can say “I don't know” at any time. That cup is marked as unexplored, and instead of a verdict you get a gentle first step. If you want more, you can continue with a second, more intense round that tells whether you prefer to give or to receive.",
        },
        {
          h: 'For beginners and the experienced',
          p: "You don't need to know any terms or have any experience. The test doesn't ask what you've done, but what draws you in. For every full cup you get concrete activity ideas and the rules of safe play: a safe word, a traffic light and aftercare.",
        },
        {
          h: 'Comparing without the awkward moments',
          p: "You can send your result to your partner as an invitation. You'll see only what you agree on. Anything either of you turned down stays hidden, so nobody finds out what the other said no to.",
        },
      ],
      faq: [
        { q: 'Is the BDSM test really anonymous?', a: "Yes. We don't ask for a name or e-mail, and we don't store your IP address. Your result is available only through a random private link, and you can delete it at any time." },
        { q: 'How long does the test take?', a: 'The first round takes about two minutes. The second, deeper round is optional and adds a few minutes depending on how many areas you choose.' },
        { q: "What if I don't know whether I like something?", a: "Then choose “I don't know”. It's a full answer: the cup is marked as unexplored and we suggest a low-key way to find out." },
        { q: 'Will my partner see all my answers?', a: "No. The comparison shows only the areas that appeal to both of you, and those where at least one of you is unsure and the other is keen. Areas you turned down stay hidden." },
      ],
    },
    kink: {
      metaTitle: 'Kink Test: 23 Cups of What Turns You On | NakedTruth',
      metaDesc: 'Free kink test with no sign-up. 23 areas from tenderness to BDSM, fantasy and group play. Results as cups, tips tailored to you and a partner comparison.',
      h1: 'Kink test: how full are your cups?',
      lead: "Twenty-three areas: power and surrender, body and senses, fantasy, other people and tenderness. In five minutes you'll see which cups are full, which are half empty and which you haven't explored yet.",
      cta: 'Start the kink test',
      points: ['23 areas, 5 minutes', 'No sign-up, free', 'Tips on activities, positions and places'],
      sections: [
        {
          h: 'More than a single label',
          p: 'Most tests give you one type. Kinkometr shows the whole map: every area is a cup with its own level. You find out what your main theme is, what only interests you and where you don\'t know yet.',
        },
        {
          h: 'From tenderness to BDSM',
          p: "The test neither starts nor ends with BDSM. It also measures romance, tantra, oral, toys, role play, dirty talk, materials, voyeurism and sex in unusual places. If you only want a quick overview, choose the short two-minute version.",
        },
        {
          h: 'What to do with your result',
          p: "For every full cup you get concrete activities, positions and places. For the unexplored ones, a first step. And if you have a partner, send them an invitation: the comparison shows only what you agree on.",
        },
      ],
      faq: [
        { q: 'What is a kink?', a: "A kink is anything that turns you on in sex beyond the “usual”, from bondage to role play to specific materials. Having a kink is normal; the test just helps you put a name to yours." },
        { q: 'Is the kink test free?', a: 'Yes. The test, your result, the recommendations and the partner comparison are all free. Only the optional detailed report is paid.' },
        { q: 'Do I have to register?', a: 'No. The test is anonymous, with no account and no e-mail. You find your result on a private link.' },
        { q: 'Is the test suitable for people with no experience?', a: "Yes. We ask what draws you in, not what you've tried. The “I don't know” answer is always available." },
      ],
    },
    domsub: {
      metaTitle: 'Dom Sub Test: Dominant, Submissive or Switch? | NakedTruth',
      metaDesc: 'Free dominant or submissive test. In 2 minutes find out whether you want to lead, surrender or both. Anonymous, no sign-up, with partner comparison.',
      h1: 'Dominant or submissive test: dom, sub or switch?',
      lead: "Are you drawn to leading or to surrendering? And what if it's both? The test measures dominance and submission separately, along with bondage, control, spanking and the words that go with them.",
      cta: 'Find out what I am',
      points: ['Dominance and submission measured separately', '2 minutes, anonymous', 'Together you find out who leads whom'],
      sections: [
        {
          h: 'Dom, sub and switch',
          p: "A dominant person enjoys leading and making decisions, a submissive one enjoys surrender and trust. A switch likes both, depending on mood and partner. Because the test measures each side separately, it won't force you into just one box.",
        },
        {
          h: 'Not just roles, but what comes with them',
          p: "A role alone isn't enough. So the test also measures how power shows up in bed: bondage, spanking, control over orgasm, praise and humiliation, wildness. For these areas, the second round tells whether you prefer to give or to receive.",
        },
        {
          h: 'Find out together',
          p: "Send your partner an invitation and the comparison will show how your roles meet: one leads and the other surrenders, you're both switches, or you both want to lead. Plus the cups you agree on.",
        },
      ],
      faq: [
        { q: 'How do I know whether I am dominant or submissive?', a: "By what turns you on in your fantasies, not by what you're like in everyday life. The test asks about specific situations and scores each side separately." },
        { q: 'What is a switch?', a: "Someone who is drawn to both leading and surrendering. It's common, and the test will show it when both your cups are full." },
        { q: 'Is the test anonymous?', a: 'Yes. No sign-up, no e-mail, and your result lives only on a private link that you can delete at any time.' },
        { q: 'Can we take the test as a couple?', a: 'Yes. One of you takes the test and sends an invitation, and the other takes the same one. The comparison shows your dynamic and your shared cups; areas either of you turned down stay hidden.' },
      ],
    },
  },
};
