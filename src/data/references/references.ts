export interface Reference {
  id: string;
  /** Section title as it appears in the source. */
  title: string;
  author: string;
  work: string;
  publisher: string;
  url: string;
  accessed: string;
  license: string;
}

const book = {
  author: 'J. Gordon Betts et al.',
  work: 'Anatomy and Physiology 2e',
  publisher: 'OpenStax, Rice University',
  accessed: '2026-11-03',
  license: 'Creative Commons Attribution-NonCommercial-ShareAlike, as stated on the page. AnatoSphere text is original wording, not copied.',
};

const section = (id: string, title: string, slug: string): Reference => ({
  id,
  title,
  url: `https://openstax.org/books/anatomy-and-physiology-2e/pages/${slug}`,
  ...book,
});

/**
 * Every entry below was opened on the access date, and the facts in the records
 * that cite it were checked against that page.
 */
export const REFERENCES: Reference[] = [
  section('os-skin', '5.1 Layers of the Skin', '5-1-layers-of-the-skin'),
  section('os-skull', '7.2 The Skull', '7-2-the-skull'),
  section('os-vertebral', '7.3 The Vertebral Column', '7-3-the-vertebral-column'),
  section('os-thoracic', '7.4 The Thoracic Cage', '7-4-the-thoracic-cage'),
  section('os-pectoral', '8.1 The Pectoral Girdle', '8-1-the-pectoral-girdle'),
  section('os-upper-limb', '8.2 Bones of the Upper Limb', '8-2-bones-of-the-upper-limb'),
  section('os-pelvis', '8.3 The Pelvic Girdle and Pelvis', '8-3-the-pelvic-girdle-and-pelvis'),
  section('os-lower-limb', '8.4 Bones of the Lower Limb', '8-4-bones-of-the-lower-limb'),
  section('os-axial-muscles', '11.4 Axial Muscles of the Abdominal Wall, and Thorax', '11-4-axial-muscles-of-the-abdominal-wall-and-thorax'),
  section('os-upper-muscles', '11.5 Muscles of the Pectoral Girdle and Upper Limbs', '11-5-muscles-of-the-pectoral-girdle-and-upper-limbs'),
  section('os-lower-muscles', '11.6 Appendicular Muscles of the Pelvic Girdle and Lower Limbs', '11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs'),
  section('os-cns', '13.2 The Central Nervous System', '13-2-the-central-nervous-system'),
  section('os-heart', '19.1 Heart Anatomy', '19-1-heart-anatomy'),
  section('os-respiratory', '22.1 Organs and Structures of the Respiratory System', '22-1-organs-and-structures-of-the-respiratory-system'),
  section('os-lungs', '22.2 The Lungs', '22-2-the-lungs'),
  section('os-esophagus', '23.3 The Mouth, Pharynx, and Esophagus', '23-3-the-mouth-pharynx-and-esophagus'),
  section('os-stomach', '23.4 The Stomach', '23-4-the-stomach'),
  section('os-intestines', '23.5 The Small and Large Intestines', '23-5-the-small-and-large-intestines'),
  section('os-accessory', '23.6 Accessory Organs in Digestion: The Liver, Pancreas, and Gallbladder', '23-6-accessory-organs-in-digestion-the-liver-pancreas-and-gallbladder'),
  section('os-urine-transport', '25.2 Gross Anatomy of Urine Transport', '25-2-gross-anatomy-of-urine-transport'),
  section('os-kidney', '25.3 Gross Anatomy of the Kidney', '25-3-gross-anatomy-of-the-kidney'),
];

export const REFERENCE_BY_ID = new Map(REFERENCES.map((r) => [r.id, r]));
