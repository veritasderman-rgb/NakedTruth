import type { ExtraContent } from './cs';

export const es: ExtraContent = {
  ui: {
    // ---- E-mail: purchase confirmation ----
    mailReportSubject: 'Confirmación de compra: informe detallado del Kinkometr',
    mailReportHeading: 'Gracias, tu informe está desbloqueado',
    mailReportCta: 'Abrir el informe',
    mailPairSubject: 'Confirmación de compra: análisis de pareja del Kinkometr',
    mailPairHeading: 'Gracias, el análisis de pareja está desbloqueado',
    mailPairCta: 'Abrir el análisis de pareja',
    mailPremiumSubject: 'Confirmación de compra: paquetes premium de preguntas',
    mailPremiumHeading: 'Gracias, el premium está desbloqueado',
    mailPremiumCta: 'Abrir NakedTruth',
    mailPurchaseBody: 'Confirmamos la celebración del contrato de suministro de contenido digital: {product}, precio {price}, pagado el {date}. El contenido se activó inmediatamente después del pago.',
    mailWaiver: 'Antes de pagar aceptaste expresamente el acceso inmediato al contenido y quedaste informado de que con ello pierdes el derecho de desistimiento de 14 días (§ 1837 letra l) del Código Civil checo).',
    mailKeepLink: 'El enlace de abajo es privado: quien lo tenga puede ver tu resultado. Guárdalo y no se lo envíes a nadie.',
    mailStored: 'Hemos guardado esta dirección de e-mail junto a tu resultado para que puedas pedir el enlace de nuevo cuando quieras. Se borrará junto con el resultado.',
    mailSeller: 'Vendedor: {seller}',
    mailTerms: 'Condiciones generales: {url}',
    mailPurchaseFooter: 'Este e-mail es la confirmación de una compra en NakedTruth. No te enviaremos publicidad.',

    // ---- E-mail: links to your results ----
    mailLinksSubject: 'Tus enlaces de NakedTruth',
    mailLinksHeading: 'Aquí tienes tus enlaces',
    mailLinksBody: 'Con esta dirección tenemos guardado lo siguiente. Los enlaces son privados: quien los tenga puede ver el contenido.',
    mailLinkResult: 'Resultado del Kinkometr del {date}',
    mailLinkReport: 'Informe detallado del {date}',
    mailLinkQuiz: 'Quiz de pareja del {date}',
    mailLinksFooter: 'Alguien ha pedido este e-mail en NakedTruth. Si no has sido tú, simplemente ignóralo.',

    // ---- Save the link by e-mail (result page) ----
    saveLinkTitle: 'No pierdas tu resultado',
    saveLinkLead: 'Tu resultado solo está disponible a través de este enlace. Pídelo por e-mail, y cuando quieras podrás pedirlo de nuevo.',
    saveLinkConsent: 'Guardaremos tu e-mail junto a este resultado solo para poder enviarte el enlace. Se borrará junto con el resultado.',
    saveLinkStored: 'Tu e-mail está guardado con este resultado. Si pierdes el enlace, pídelo en la página «Enlace perdido».',
    emailPlaceholder: 'tu@ejemplo.es',
    saveLinkButton: 'Enviarme el enlace',
    sending: 'Enviando…',
    saveLinkSent: 'Enviado. Mira en tu bandeja de entrada y, por si acaso, en el spam.',
    invalidEmail: 'Introduce una dirección de e-mail válida.',
    tooMany: 'Hoy ya hemos enviado varios e-mails a esta dirección. Inténtalo mañana.',
    mailUnavailable: 'Ahora mismo no se pueden enviar e-mails. Guarda el enlace a mano, por favor.',
    mailFailed: 'No se ha podido enviar el e-mail. Inténtalo de nuevo, por favor.',

    // ---- Lost link page ----
    recoverMetaTitle: 'Enlace perdido | NakedTruth',
    recoverLink: 'Enlace perdido',
    recoverTitle: '¿Has perdido el enlace?',
    recoverLead: 'Introduce el e-mail que guardaste con tu resultado, o que indicaste al comprar o en el quiz de pareja. Te enviaremos todos tus enlaces.',
    recoverButton: 'Enviar los enlaces',
    recoverDone: 'Si tenemos algo guardado con esta dirección, el e-mail ya va de camino.',
    recoverNote: 'Los resultados sin e-mail guardado no se pueden recuperar así: no sabemos a quién pertenecen.',

    // ---- Unfinished test ----
    resumeTitle: 'Tienes un test a medias',
    resumeText: 'Has respondido {done} de {total} preguntas. Las respuestas solo se guardan en este navegador.',
    resumeContinue: 'Continuar',
    resumeRestart: 'Empezar de nuevo',

    // ---- Sharing a result ----
    shareButton: 'Compartir mis copas',
    shareHint: 'Solo se comparten tus tres copas más llenas, sin enlace a tu resultado ni al resto de tus respuestas.',
    shareCopied: 'Enlace copiado',
    shareText: 'Mis copas más llenas en el Kinkometr. ¿Y las tuyas?',
    shareMetaTitle: 'Mis copas en el Kinkometr: {cups}',
    shareMetaDesc: 'El Kinkometr mide {n} áreas de lo que te atrae en la cama. De forma anónima, gratis y en pocos minutos.',
    shareKicker: 'Las copas más llenas de alguien',
    shareHeading: '¿Y cómo tienes tú las copas?',
    shareLead: 'El Kinkometr es un test anónimo: {n} copas, unos minutos, sin registro. El resultado solo lo verás tú.',
    shareCta: 'Descubrir mis copas',
    ogTitle: 'Mis copas más llenas',
    ogCta: '¿Y las tuyas?',

    // ---- Couple report: teaser ----
    pairProductName: 'NakedTruth — análisis de pareja del Kinkometr',
    pairMetaTitle: 'Análisis de pareja | NakedTruth Kinkometr',
    pairTeaserTitle: 'Un plan para los dos',
    pairTeaserLead: 'La comparación muestra en qué coincidís. El análisis de pareja lo convierte en un plan: por dónde empezar, quién lleva cada cosa y cómo hablarlo juntos.',
    pairItem1: 'Noches compartidas: una por cada copa en la que coincidís, empezando por la más suave',
    pairItem2: 'Quién da y quién recibe donde importa',
    pairItem3: 'Invitaciones: cómo proponer lo que solo atrae a uno de los dos, y un primer paso sin presión',
    pairItem4: 'Frases listas para abrir el tema y tres acuerdos previos',
    pairItem5: 'Se desbloquea para los dos; versión para imprimir',
    pairBuy: 'Desbloquear el análisis de pareja por {price}',
    pairOneTime: 'Pago único con tarjeta, sin suscripción. Paga uno y el análisis se desbloquea para los dos.',
    pairOpen: 'Abrir el análisis de pareja',

    // ---- Couple report: page ----
    pairTitle: 'Vuestro plan común',
    pairThanks: '¡Gracias por tu apoyo! El análisis está desbloqueado para los dos: tu pareja lo abrirá desde su comparación.',
    pairSummary: '{shared} en común · {invite} invitaciones · {explore} por explorar',
    pairBack: 'Volver a la comparación',
    pairAgreeTitle: 'Tres acuerdos previos',
    pairAgree1: 'Stop: una palabra o un gesto que lo detiene todo al instante, sin dar explicaciones.',
    pairAgree2: 'Qué queda fuera hoy. Cada uno dice al menos una cosa.',
    pairAgree3: 'Y después: diez minutos juntos sin móvil, y cada uno dice una cosa que estuvo bien.',
    pairEveningsTitle: 'Noches compartidas',
    pairEveningsLead: 'Id por orden, de lo más suave a lo más intenso. Una noche, una copa, y unos días de margen entre noche y noche.',
    pairEveningsEmpty: 'Todavía no tenéis ninguna copa en la que los dos coincidáis con claridad. Empezad por las invitaciones de abajo: ahí nace la coincidencia.',
    pairRolesLabel: 'Quién lleva cada cosa',
    pairSayLabel: 'Cómo abrir el tema',
    pairEveningLabel: 'Noche',
    pairInvitesTitle: 'Invitaciones',
    pairInvitesLead: 'Aquí la copa atrae a uno de los dos y el otro no lo tiene claro. Quien se siente atraído abre el tema; el otro marca el ritmo y puede decir que no en cualquier momento.',
    pairYouOpen: 'Abres tú',
    pairPartnerOpens: 'Abre tu pareja',
    pairFirstStepLabel: 'Primer paso',
    pairExploreTitle: 'Territorio por descubrir juntos',
    pairExploreLead: 'Aquí ninguno de los dos lo tiene claro. Tomad el primer paso como un experimento, y después contaos qué tal fue.',
    pairHiddenNote: 'Las copas que uno de los dos ha rechazado no aparecen en el plan ni se muestran en ningún sitio.',

    // ---- Landing pages (shared) ----
    // ---- Free sample of the detailed report ----
    sampleKicker: 'Muestra gratis',
    sampleTitle: 'Así es tu informe',
    sampleLead: 'Tu copa más llena está desbloqueada por completo. El informe completo analiza con el mismo detalle cada copa que te atrae: {n} en total.',
    sampleLocked: 'Bloqueado',
    sampleMore: 'Lo que te espera además en el informe completo',
    sampleLink: 'Ver una muestra gratis',

    landingFaqTitle: 'Preguntas frecuentes',
    landingMeasures: 'Qué mide el test',
    landingOther: 'Más tests',
  },
  landing: {
    bdsm: {
      metaTitle: 'Test BDSM gratis y anónimo | NakedTruth Kinkometr',
      metaDesc: 'Test BDSM de 2 minutos: dominación, sumisión, ataduras, azotes, control y más. Sin registro, el resultado solo lo ves tú. Puedes compararlo con tu pareja.',
      h1: 'Test BDSM: descubre qué te atrae de verdad',
      lead: 'Nueve áreas del BDSM, dos minutos, sin registro. En lugar de una etiqueta, recibes copas: en cada área ves cuánto se llena y qué hacer a partir de ahí.',
      cta: 'Empezar el test BDSM',
      points: ['Anónimo y gratis', 'La respuesta «no lo sé» cuenta', 'Comparación con tu pareja solo donde coincidís'],
      sections: [
        {
          h: 'Cómo funciona el test BDSM',
          p: 'Respondes a afirmaciones breves en una escala que va de «no es para mí» a «sí, lo quiero». Cuando quieras puedes decir «no lo sé»: esa copa se marca como sin explorar y, en vez de una valoración, recibes un primer paso suave. Si te apetece, sigues con una segunda ronda más intensa que distingue si prefieres dar o recibir.',
        },
        {
          h: 'Para principiantes y para expertos',
          p: 'No hace falta conocer ningún término ni tener experiencia. El test no pregunta qué has hecho, sino qué te atrae. Para cada copa llena recibes ideas concretas de actividades y las reglas del juego seguro: la palabra de seguridad, el semáforo y los cuidados posteriores.',
        },
        {
          h: 'Comparar sin momentos incómodos',
          p: 'Puedes enviarle tu resultado a tu pareja como invitación. Solo veréis aquello en lo que coincidís. Lo que uno de los dos rechazó queda oculto: nadie sabe a qué dijo que no la otra persona.',
        },
      ],
      faq: [
        { q: '¿El test BDSM es realmente anónimo?', a: 'Sí. No pedimos nombre ni e-mail y no guardamos la dirección IP. El resultado solo es accesible mediante un enlace privado aleatorio y puedes borrarlo cuando quieras.' },
        { q: '¿Cuánto dura el test?', a: 'La primera ronda, unos dos minutos. La segunda, más profunda, es voluntaria y suma unos minutos según cuántas áreas elijas.' },
        { q: '¿Y si no sé si algo me gusta?', a: 'Entonces elige «no lo sé». Es una respuesta de pleno derecho: la copa se marca como sin explorar y te sugerimos una forma discreta de averiguarlo.' },
        { q: '¿Verá mi pareja todas mis respuestas?', a: 'No. En la comparación solo aparecen las áreas que atraen a los dos y aquellas en las que al menos uno no está seguro y el otro sí quiere. Las áreas rechazadas permanecen ocultas.' },
      ],
    },
    kink: {
      metaTitle: 'Test de kinks: 23 copas de lo que te atrae | NakedTruth',
      metaDesc: 'Test kink gratis y sin registro. 23 áreas, de la ternura al BDSM, fantasías y juegos con más personas. Resultado en copas, ideas a tu medida y comparación con tu pareja.',
      h1: 'Test kink: ¿cómo tienes las copas?',
      lead: 'Veintitrés áreas: poder y entrega, cuerpo y sentidos, fantasía, otras personas y ternura. En cinco minutos verás qué copas tienes llenas, cuáles a medias y cuáles aún sin explorar.',
      cta: 'Empezar el test kink',
      points: ['23 áreas, 5 minutos', 'Sin registro, gratis', 'Ideas de actividades, posturas y lugares'],
      sections: [
        {
          h: 'Más que una etiqueta',
          p: 'La mayoría de los tests te asignan un único tipo. El Kinkometr te enseña el mapa completo: cada área es una copa con su propio nivel. Descubrirás cuál es tu tema principal, qué te despierta curiosidad y dónde todavía no lo sabes.',
        },
        {
          h: 'De la ternura al BDSM',
          p: 'El test ni empieza ni termina en el BDSM. También mide romanticismo, tantra, sexo oral, juguetes, juegos de rol, palabras subidas de tono, materiales, voyeurismo o sexo en lugares poco habituales. Si solo quieres una visión rápida, elige la versión corta de dos minutos.',
        },
        {
          h: 'Qué hacer con el resultado',
          p: 'Para cada copa llena recibes actividades, posturas y lugares concretos. Para las que están sin explorar, un primer paso. Y si tienes pareja, envíale una invitación: la comparación mostrará solo aquello en lo que coincidís.',
        },
      ],
      faq: [
        { q: '¿Qué es un kink?', a: 'Un kink es cualquier cosa que te excita en el sexo más allá de lo «convencional»: desde las ataduras o los juegos de rol hasta materiales concretos. Tener un kink es normal; el test solo te ayuda a ponerle nombre al tuyo.' },
        { q: '¿El test kink es gratis?', a: 'Sí. El test, el resultado, las recomendaciones y la comparación con tu pareja son gratis. Lo único de pago es el informe detallado, que es voluntario.' },
        { q: '¿Tengo que registrarme?', a: 'No. El test es anónimo, sin cuenta y sin e-mail. Tu resultado está en un enlace privado.' },
        { q: '¿Sirve también para quien no tiene experiencia?', a: 'Sí. Preguntamos por lo que te atrae, no por lo que has probado. La respuesta «no lo sé» siempre está disponible.' },
      ],
    },
    domsub: {
      metaTitle: 'Test dominante o sumiso: ¿dom, sub o switch? | NakedTruth',
      metaDesc: 'Test dominante o sumiso gratis. En 2 minutos sabrás si te atrae llevar las riendas, entregarte o ambas cosas. Anónimo, sin registro y con comparación con tu pareja.',
      h1: 'Test dominante o sumiso: ¿dom, sub o switch?',
      lead: '¿Te atrae llevar las riendas o entregarte? ¿Y si las dos cosas? El test mide por separado la dominación y la sumisión, y con ellas las ataduras, el control, los azotes y las palabras que los acompañan.',
      cta: 'Descubrir qué soy',
      points: ['Dominación y sumisión medidas por separado', '2 minutos, anónimo', 'En pareja descubrís quién lleva a quién'],
      sections: [
        {
          h: 'Dom, sub y switch',
          p: 'A una persona dominante le gusta llevar la iniciativa y decidir; a una sumisa, entregarse y confiar. Un switch disfruta de ambas cosas, según el momento y la pareja. Como el test mide cada lado por separado, no te encasilla a la fuerza en uno solo.',
        },
        {
          h: 'No solo el rol, también lo que lo acompaña',
          p: 'El rol por sí solo no basta. Por eso el test mide también cómo se expresa el poder en la cama: ataduras, azotes, control del orgasmo, elogios y humillación, salvajismo. En estas áreas, la segunda ronda distingue si prefieres dar o recibir.',
        },
        {
          h: 'Descubridlo juntos',
          p: 'Envíale una invitación a tu pareja y la comparación os dirá cómo encajan vuestros roles: uno lleva las riendas y el otro se entrega, los dos sois switch o los dos queréis llevar las riendas. Y además, las copas en las que coincidís.',
        },
      ],
      faq: [
        { q: '¿Cómo sé si soy dominante o sumiso?', a: 'Por lo que te excita en la imaginación, no por cómo eres en tu vida diaria. El test pregunta por situaciones concretas y valora cada lado por separado.' },
        { q: '¿Qué es un switch?', a: 'Una persona a la que le atrae tanto llevar las riendas como entregarse. Es algo habitual, y el test lo mostrará si tienes llenas las dos copas.' },
        { q: '¿El test es anónimo?', a: 'Sí. Sin registro, sin e-mail, y el resultado solo está en un enlace privado que puedes borrar cuando quieras.' },
        { q: '¿Podemos hacer el test en pareja?', a: 'Sí. Uno hace el test y envía la invitación, el otro hace el mismo. La comparación muestra vuestra dinámica y las copas en común; las áreas rechazadas quedan ocultas.' },
      ],
    },
  },
};
