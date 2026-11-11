// Who runs the service. Shown in the terms and the privacy policy.
//
// FILL IN before taking payments: a seller must identify itself to consumers.
// While any value is still a placeholder, the legal pages show a visible
// warning and OPERATOR_COMPLETE is false.
export const OPERATOR = {
  // Full name of the person or company.
  name: '[DOPLNIT: jméno a příjmení / název firmy]',
  // Company / trade licence number (IČO).
  id: '[DOPLNIT: IČO]',
  // Registered address.
  address: '[DOPLNIT: sídlo]',
  // Contact e-mail for customers, complaints and privacy requests.
  email: '[DOPLNIT: e-mail]',
  // Register entry, e.g. "zapsán v živnostenském rejstříku".
  register: 'zapsán v živnostenském rejstříku',
  // VAT status as it should appear in the terms.
  vat: 'není plátcem DPH',
};

export const OPERATOR_COMPLETE = !Object.values(OPERATOR).some((v) => v.includes('[DOPLNIT'));

// Date the legal texts were last changed (shown on both pages).
export const LEGAL_UPDATED = '2026-11-11';
