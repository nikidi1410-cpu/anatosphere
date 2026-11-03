/**
 * Body systems available in the viewer. Adding a system here (plus its name in
 * src/locales) is all the viewer needs: visibility filters by each structure's
 * `systemId` from the asset manifest.
 */
export const SYSTEM_IDS = ['skeletal', 'muscular', 'nervous', 'cardiovascular', 'respiratory', 'digestive', 'urinary', 'lymphatic', 'integumentary'] as const;

export type SystemId = (typeof SYSTEM_IDS)[number];
