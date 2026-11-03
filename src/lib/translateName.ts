/**
 * Rule-based Indonesian names for the dataset's English structure names.
 *
 * Muscle names stay in their Latin form with the word "otot" in front, which is
 * how Indonesian anatomy texts commonly write them. Bone and organ names use the
 * standard Indonesian medical term. An unknown name is returned unchanged with
 * `complete: false`, never guessed.
 *
 * These names are a draft like the rest of the content: they follow fixed rules
 * and have not yet been checked by an Indonesian anatomy educator.
 */
export interface Translation {
  text: string;
  complete: boolean;
}

const ORDINALS: Record<string, string> = {
  first: 'pertama', second: 'kedua', third: 'ketiga', fourth: 'keempat', fifth: 'kelima', sixth: 'keenam',
  seventh: 'ketujuh', eighth: 'kedelapan', ninth: 'kesembilan', tenth: 'kesepuluh', eleventh: 'kesebelas', twelfth: 'kedua belas',
};
const ORD = Object.keys(ORDINALS).join('|');

const DIRECT: Record<string, string> = {
  // organs
  skin: 'kulit', brain: 'otak', 'spinal cord': 'sumsum tulang belakang', heart: 'jantung', trachea: 'trakea', lung: 'paru-paru',
  esophagus: 'esofagus', stomach: 'lambung', liver: 'hati', spleen: 'limpa', gallbladder: 'kandung empedu', pancreas: 'pankreas',
  'small intestine': 'usus halus', 'large intestine': 'usus besar', kidney: 'ginjal', ureter: 'ureter', 'urinary bladder': 'kandung kemih',
  diaphragm: 'diafragma',
  // skull
  'frontal bone': 'tulang frontal', 'occipital bone': 'tulang oksipital', 'parietal bone': 'tulang parietal', 'temporal bone': 'tulang temporal',
  'sphenoid bone': 'tulang sfenoid', ethmoid: 'tulang etmoid', mandible: 'mandibula', maxilla: 'maksila', 'nasal bone': 'tulang hidung',
  'lacrimal bone': 'tulang lakrimal', 'palatine bone': 'tulang palatina', 'zygomatic bone': 'tulang zigomatik', vomer: 'vomer',
  'inferior nasal concha': 'konka nasal inferior', 'hyoid bone': 'tulang hioid',
  // trunk
  atlas: 'atlas', axis: 'aksis', sacrum: 'sakrum', coccyx: 'koksigis', manubrium: 'manubrium sterni', 'body of sternum': 'korpus sterni',
  'xiphoid process': 'prosesus xifoideus', 'intervertebral disk': 'diskus intervertebralis',
  // limbs
  clavicle: 'klavikula', scapula: 'skapula', humerus: 'humerus', radius: 'radius', ulna: 'ulna', 'hip bone': 'tulang panggul', femur: 'femur',
  patella: 'patela', tibia: 'tibia', fibula: 'fibula',
  // carpals and tarsals
  scaphoid: 'skafoid', lunate: 'lunatum', triquetral: 'trikuetrum', pisiform: 'pisiformis', trapezium: 'trapezium', trapezoid: 'trapezoid',
  capitate: 'kapitatum', hamate: 'hamatum', talus: 'talus', calcaneus: 'kalkaneus', 'navicular bone of foot': 'tulang navikular kaki',
  'cuboid bone': 'tulang kuboid', 'medial cuneiform bone': 'tulang kuneiformis medial', 'intermediate cuneiform bone': 'tulang kuneiformis intermedia',
  'lateral cuneiform bone': 'tulang kuneiformis lateral',
};

const DIGITS: Record<string, string> = {
  'big toe': 'ibu jari kaki', 'second toe': 'jari kaki kedua', 'third toe': 'jari kaki ketiga', 'fourth toe': 'jari kaki keempat', 'little toe': 'kelingking kaki',
  thumb: 'ibu jari tangan', 'index finger': 'jari telunjuk', 'middle finger': 'jari tengah', 'ring finger': 'jari manis', 'little finger': 'jari kelingking',
};
const PHALANX: Record<string, string> = { distal: 'distal', middle: 'tengah', proximal: 'proksimal' };

const SPINE: Record<string, string> = { cervical: 'servikal', thoracic: 'torakal', lumbar: 'lumbal' };

// Muscles whose dataset name is an English phrase rather than the Latin form.
const MUSCLE_ENGLISH: Record<string, string> = {
  'external oblique': 'oblikus eksternus', 'inferior oblique': 'oblikus inferior', 'superior oblique': 'oblikus superior',
  'inferior rectus': 'rektus inferior', 'superior rectus': 'rektus superior', 'lateral rectus': 'rektus lateral', 'medial rectus': 'rektus medial',
  'external anal sphincter': 'sfingter ani eksternus', 'thoracic rotator': 'rotator torakal',
  'lateral lumbar intertransversarius': 'intertransversarius lumbal lateral', 'medial lumbar intertransversarius': 'intertransversarius lumbal medial',
  'uvular muscle': 'uvula', 'infraspinatus muscle': 'infraspinatus', 'cervical rotator': 'rotator servikal', 'lumbar rotator': 'rotator lumbal',
  'inferior pharyngeal constrictor': 'konstriktor faring inferior', 'middle pharyngeal constrictor': 'konstriktor faring tengah',
  'superior pharyngeal constrictor': 'konstriktor faring superior', 'rhomboid major': 'rhomboid mayor', 'rhomboid minor': 'rhomboid minor',
};

// Stems of Latin muscle names, kept as written in the dataset.
const MUSCLE_STEM = /^(abductor|adductor|anconeus|articularis|aryepiglotticus|arytenoid|biceps|brachialis|brachioradialis|buccinator|coccygeus|coracobrachialis|cremaster|crico|cricothyroid|deltoid|depressor|digastric|dorsal|extensor|fibularis|flexor|gastrocnemius|gemellus|genioglossus|geniohyoid|gluteus|gracilis|hyoglossus|iliacus|iliococcygeus|iliocostalis|inferior|intercostal|external intercostal|internal intercostal|innermost intercostal|interspinalis|intertransversarius|lateral crico|levator|longissimus|longus|lumbrical|multifidus|mylohyoid|nasalis|oblique arytenoid|obliquus|obturator|omohyoid|opponens|orbicularis|palatoglossus|palatopharyngeus|palmar|palmaris|pectineus|pectoralis|peroneus|piriformis|plantar|plantaris|platysma|popliteus|posterior crico|procerus|pronator|psoas|pterygoid|pubococcygeus|puborectalis|quadratus|quadriceps|rectus|rhomboid|risorius|salpingopharyngeus|sartorius|scalenus|semimembranosus|semispinalis|semitendinosus|serratus|soleus|sphincter|spinalis|splenius|sternocleidomastoid|sternohyoid|sternothyroid|stylohyoid|styloglossus|stylopharyngeus|subclavius|subcostal|subscapularis|supinator|supraspinatus|tensor|teres|thyro|thyrohyoid|tibialis|transverse arytenoid|transversus|trapezius|triceps|vastus|vocalis|zygomaticus)/;

const HEADS: Record<string, string> = {
  long: 'kepala panjang', short: 'kepala pendek', medial: 'kepala medial', lateral: 'kepala lateral', humeral: 'kepala humeral',
  ulnar: 'kepala ulnar', oblique: 'kepala oblik', transverse: 'kepala transversal', superficial: 'kepala superfisial', deep: 'kepala dalam',
};
const PARTS: Record<string, string> = {
  clavicular: 'bagian klavikular', acromial: 'bagian akromial', spinal: 'bagian spinal', sternocostal: 'bagian sternokostal', abdominal: 'bagian abdominal',
  ascending: 'bagian menaik', transverse: 'bagian transversal', descending: 'bagian menurun', oblique: 'bagian oblik', straight: 'bagian lurus',
  'inferior oblique': 'bagian oblik inferior', 'superior oblique': 'bagian oblik superior', 'vertical intermediate': 'bagian vertikal intermedia',
};

function muscle(base: string): string | null {
  if (MUSCLE_ENGLISH[base]) return `otot ${MUSCLE_ENGLISH[base]}`;
  const set = base.match(/^set of (lumbricals|palmar interossei|dorsal interossei|levatores costarum longi|levatores costarum breves)(?: of (hand))?$/);
  if (set) return `kumpulan otot ${set[1]}${set[2] ? ' tangan' : ''}`;
  const ofHand = base.match(/^(.+) of (hand|foot)$/);
  if (ofHand) {
    const inner = muscle(ofHand[1]);
    return inner ? `${inner} ${ofHand[2] === 'hand' ? 'tangan' : 'kaki'}` : null;
  }
  const lumbrical = base.match(new RegExp(`^(${ORD}) (lumbrical|plantar interosseous|dorsal interosseous|palmar interosseous)$`));
  if (lumbrical) return `otot ${lumbrical[2]} ${ORDINALS[lumbrical[1]]}`;
  return MUSCLE_STEM.test(base) ? `otot ${base}` : null;
}

function translateBase(base: string): string | null {
  if (DIRECT[base]) return DIRECT[base];

  let m = base.match(new RegExp(`^(${ORD}) rib$`));
  if (m) return `tulang rusuk ${ORDINALS[m[1]]}`;
  m = base.match(new RegExp(`^(${ORD}) costal cartilage$`));
  if (m) return `tulang rawan kosta ${ORDINALS[m[1]]}`;
  m = base.match(new RegExp(`^(${ORD}) (cervical|thoracic|lumbar) vertebra$`));
  if (m) return `vertebra ${SPINE[m[2]]} ${ORDINALS[m[1]]}`;
  m = base.match(new RegExp(`^(${ORD}) (metacarpal|metatarsal) bone$`));
  if (m) return `tulang ${m[2] === 'metacarpal' ? 'metakarpal' : 'metatarsal'} ${ORDINALS[m[1]]}`;
  m = base.match(/^(distal|middle|proximal) phalanx of (.+)$/);
  if (m && DIGITS[m[2]]) return `falang ${PHALANX[m[1]]} ${DIGITS[m[2]]}`;
  m = base.match(/^intervertebral disk of (.+)$/);
  if (m) {
    const inner = translateBase(m[1]);
    return inner ? `diskus intervertebralis ${inner}` : null;
  }
  m = base.match(/^sesamoid bone of (hand|foot)$/);
  if (m) return `tulang sesamoid ${m[1] === 'hand' ? 'tangan' : 'kaki'}`;

  m = base.match(/^(long|short|medial|lateral|humeral|ulnar|oblique|transverse|superficial|deep) head of (.+)$/);
  if (m) {
    const inner = muscle(m[2]);
    return inner ? `${HEADS[m[1]]} ${inner}` : null;
  }
  m = base.match(/^(.+?) part of (.+)$/);
  if (m && PARTS[m[1]]) {
    const inner = muscle(m[2]);
    return inner ? `${PARTS[m[1]]} ${inner}` : null;
  }
  return muscle(base);
}

export function translateName(english: string): Translation {
  const lower = english.trim().toLowerCase();
  const side = lower.match(/\b(left|right)\b/)?.[1];
  const base = lower.replace(/\b(left|right)\b ?/, '').replace(/\s+/g, ' ').trim();
  const text = translateBase(base);
  if (!text) return { text: english, complete: false };
  const withSide = side ? `${text} ${side === 'left' ? 'kiri' : 'kanan'}` : text;
  return { text: withSide.charAt(0).toUpperCase() + withSide.slice(1), complete: true };
}
