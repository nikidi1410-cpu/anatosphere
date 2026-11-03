export interface Tour {
  id: string;
  /** Translation keys live under tours.<id> in src/locales. */
  steps: { recordId: string }[];
}

/**
 * The introductory learning experience: where the main organs of the trunk sit.
 * The text shown at each step comes from the record itself, so tours use the same
 * content and references as the information panel.
 */
export const INTRO_TOUR: Tour = {
  id: 'intro',
  steps: [
    { recordId: 'ribs' },
    { recordId: 'heart' },
    { recordId: 'lungs' },
    { recordId: 'diaphragm' },
    { recordId: 'liver' },
    { recordId: 'stomach' },
    { recordId: 'kidneys' },
  ],
};
