import type { SystemId } from '../systems/systems';

type Text = { en: string; id: string };

/** PRD 10.2. One record can cover several model parts (left and right, or a muscle's heads). */
export interface AnatomyRecord {
  id: string;
  systemId: SystemId;
  regionId: 'head' | 'neck' | 'thorax' | 'abdomen' | 'pelvis' | 'back' | 'upperLimb' | 'lowerLimb' | 'wholeBody';
  /** Dataset names of the model parts. Checked against the manifest by tests/unit/content.test.ts. */
  meshNames: string[];
  name: { en: string; id: string; latin?: string };
  description: Text;
  location: Text;
  function: Text;
  synonyms: { en: string[]; id: string[] };
  relatedStructures: string[];
  referenceIds: string[];
  /** Where the 3D model differs from the structure described. */
  modelNote?: Text;
  reviewStatus: 'draft' | 'reviewed' | 'approved';
}

const both = (name: string) => [`left ${name}`, `right ${name}`];
/** "long head of biceps brachii" -> "long head of left biceps brachii" and the right one. */
const bothParts = (prefix: string, muscle: string) => [`${prefix} of left ${muscle}`, `${prefix} of right ${muscle}`];
const ordinals = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];

const draft = { reviewStatus: 'draft' as const };

/**
 * All descriptions are original wording, based on the cited OpenStax section,
 * which was read on the reference's access date. Everything stays `draft` until a
 * qualified anatomy educator has reviewed it (PRD 15, rule 8).
 *
 * Latin names follow standard anatomical terminology. They and the Indonesian
 * translations are not taken from the cited reference, so they need the same review.
 */
export const RECORDS: AnatomyRecord[] = [
  // ---------------------------------------------------------------- skin
  {
    id: 'skin', systemId: 'integumentary', regionId: 'wholeBody', meshNames: ['skin'],
    name: { en: 'Skin', id: 'Kulit', latin: 'Cutis' },
    description: {
      en: 'The skin and its accessory structures make up the integumentary system. It has three layers: the outer epidermis, the dermis, and the deeper hypodermis.',
      id: 'Kulit dan struktur pelengkapnya membentuk sistem integumen. Kulit memiliki tiga lapisan: epidermis di luar, dermis, dan hipodermis di bagian lebih dalam.',
    },
    location: { en: 'It covers the outside of the body.', id: 'Menutupi bagian luar tubuh.' },
    function: {
      en: 'It helps block microbes, limits water loss and guards deeper layers against abrasion. Melanin shields living cells from ultraviolet radiation, and the hypodermis anchors, insulates and cushions.',
      id: 'Kulit membantu menghalangi mikroba, mengurangi kehilangan air, dan melindungi lapisan dalam dari gesekan. Melanin melindungi sel hidup dari sinar ultraviolet, sedangkan hipodermis berfungsi sebagai penahan, penyekat panas, dan bantalan.',
    },
    synonyms: { en: ['integument', 'cutis'], id: ['integumen'] }, relatedStructures: [], referenceIds: ['os-skin'], ...draft,
  },

  // ---------------------------------------------------------------- skull and axial skeleton
  {
    id: 'frontal-bone', systemId: 'skeletal', regionId: 'head', meshNames: ['frontal bone'],
    name: { en: 'Frontal bone', id: 'Tulang frontal', latin: 'Os frontale' },
    description: {
      en: 'A single bone of the skull that forms the forehead and the brow ridges.',
      id: 'Satu tulang tengkorak yang membentuk dahi dan lengkung alis.',
    },
    location: {
      en: 'At the front of the skull. It forms the upper margin of each eye socket and extends backward into the cranial cavity.',
      id: 'Di bagian depan tengkorak. Tulang ini membentuk tepi atas setiap rongga mata dan memanjang ke belakang ke dalam rongga kranial.',
    },
    function: {
      en: 'It is part of the skull that protects the brain. Inside the skull it forms the roof of each orbit and the floor of the anterior cranial cavity.',
      id: 'Tulang ini bagian dari tengkorak yang melindungi otak. Di dalam tengkorak, tulang ini membentuk atap setiap rongga mata dan dasar rongga kranial anterior.',
    },
    synonyms: { en: ['forehead bone'], id: ['tulang dahi'] }, relatedStructures: ['mandible', 'brain'], referenceIds: ['os-skull'], ...draft,
  },
  {
    id: 'mandible', systemId: 'skeletal', regionId: 'head', meshNames: ['mandible'],
    name: { en: 'Mandible', id: 'Mandibula', latin: 'Mandibula' },
    description: {
      en: 'The lower jaw, and the only moveable bone of the skull.',
      id: 'Rahang bawah, dan satu-satunya tulang tengkorak yang dapat bergerak.',
    },
    location: {
      en: 'It forms the lower part of the face and joins the skull at the temporomandibular joint.',
      id: 'Membentuk bagian bawah wajah dan bersendi dengan tengkorak pada sendi temporomandibular.',
    },
    function: {
      en: 'Its joint with the skull lets the mouth open and close. It anchors the lower teeth and gives attachment to a biting muscle.',
      id: 'Sendinya dengan tengkorak memungkinkan mulut membuka dan menutup. Tulang ini menjadi tempat tertanamnya gigi bawah dan tempat melekatnya otot untuk menggigit.',
    },
    synonyms: { en: ['lower jaw', 'jawbone'], id: ['rahang bawah', 'tulang rahang'] }, relatedStructures: ['frontal-bone'], referenceIds: ['os-skull'], ...draft,
  },
  {
    id: 'sternum', systemId: 'skeletal', regionId: 'thorax', meshNames: ['manubrium', 'body of sternum', 'xiphoid process'],
    name: { en: 'Sternum', id: 'Sternum', latin: 'Sternum' },
    description: {
      en: 'The breastbone. It has three parts: the wider manubrium at the top, the elongated body, and the small xiphoid process at the lower tip.',
      id: 'Tulang dada. Terdiri atas tiga bagian: manubrium yang lebih lebar di atas, korpus yang memanjang, dan prosesus xifoideus yang kecil di ujung bawah.',
    },
    location: { en: 'At the front of the chest, in the midline of the thoracic cage.', id: 'Di bagian depan dada, pada garis tengah rongga dada.' },
    function: {
      en: 'It is part of the thoracic cage, which protects the heart and lungs. The second rib attaches where the manubrium meets the body, and ribs 3 to 7 attach to the body.',
      id: 'Sternum bagian dari rangka dada yang melindungi jantung dan paru-paru. Rusuk kedua melekat di pertemuan manubrium dan korpus, sedangkan rusuk 3 sampai 7 melekat pada korpus.',
    },
    synonyms: { en: ['breastbone', 'breast bone'], id: ['tulang dada'] }, relatedStructures: ['ribs', 'clavicle', 'heart'], referenceIds: ['os-thoracic'], ...draft,
  },
  {
    id: 'ribs', systemId: 'skeletal', regionId: 'thorax', meshNames: ordinals.flatMap((o) => both(`${o} rib`)),
    name: { en: 'Ribs', id: 'Tulang rusuk', latin: 'Costae' },
    description: {
      en: 'Twelve pairs of ribs form the thoracic cage together with their costal cartilages and the sternum. Ribs 1 to 7 are true ribs, and ribs 8 to 12 are false ribs. Ribs 11 and 12 are also called floating ribs.',
      id: 'Dua belas pasang tulang rusuk membentuk rangka dada bersama tulang rawan kosta dan sternum. Rusuk 1 sampai 7 adalah rusuk sejati, dan rusuk 8 sampai 12 adalah rusuk palsu. Rusuk 11 dan 12 juga disebut rusuk melayang.',
    },
    location: {
      en: 'Around the chest. At the back they attach to the twelve thoracic vertebrae.',
      id: 'Mengelilingi dada. Di belakang, tulang rusuk melekat pada dua belas vertebra torakal.',
    },
    function: { en: 'The cage they form mainly protects the heart and lungs.', id: 'Rangka yang dibentuknya terutama melindungi jantung dan paru-paru.' },
    synonyms: { en: ['rib', 'rib cage', 'costa'], id: ['rusuk', 'iga', 'tulang iga'] }, relatedStructures: ['sternum', 'heart', 'lungs', 'intercostal-muscles'], referenceIds: ['os-thoracic'], ...draft,
  },
  {
    id: 'sacrum', systemId: 'skeletal', regionId: 'pelvis', meshNames: ['sacrum'],
    name: { en: 'Sacrum', id: 'Sakrum', latin: 'Os sacrum' },
    description: {
      en: 'A triangular bone formed from five fused vertebrae. Its fusion begins after age 20 and is not complete until middle age.',
      id: 'Tulang berbentuk segitiga yang terbentuk dari lima vertebra yang menyatu. Penyatuannya dimulai setelah usia 20 tahun dan baru selesai pada usia paruh baya.',
    },
    location: {
      en: 'At the base of the vertebral column, between the two hip bones.',
      id: 'Di dasar tulang belakang, di antara dua tulang panggul.',
    },
    function: {
      en: 'It bears weight at its broad upper base and forms the immobile sacroiliac joints with the hip bones.',
      id: 'Sakrum menahan beban pada dasarnya yang lebar di bagian atas dan membentuk sendi sakroiliaka yang tidak bergerak dengan tulang panggul.',
    },
    synonyms: { en: [], id: ['tulang kelangkang'] }, relatedStructures: ['hip-bone'], referenceIds: ['os-vertebral'], ...draft,
  },

  // ---------------------------------------------------------------- shoulder and arm bones
  {
    id: 'clavicle', systemId: 'skeletal', regionId: 'upperLimb', meshNames: both('clavicle'),
    name: { en: 'Clavicle', id: 'Klavikula', latin: 'Clavicula' },
    description: { en: 'An S-shaped bone on the front of the shoulder.', id: 'Tulang berbentuk huruf S di bagian depan bahu.' },
    location: {
      en: 'Its inner end joins the sternum, and its outer end meets the scapula just above the shoulder joint.',
      id: 'Ujung dalamnya bersendi dengan sternum, dan ujung luarnya bertemu skapula tepat di atas sendi bahu.',
    },
    function: {
      en: 'It braces the scapula outward to give the arm a wide range of movement, passes forces from the arm to the sternum, and shields nerves and vessels running between the trunk and arm.',
      id: 'Klavikula menahan skapula ke arah luar agar lengan punya rentang gerak yang luas, meneruskan gaya dari lengan ke sternum, dan melindungi saraf serta pembuluh darah di antara badan dan lengan.',
    },
    synonyms: { en: ['collarbone', 'collar bone'], id: ['tulang selangka'] }, relatedStructures: ['scapula', 'sternum'], referenceIds: ['os-pectoral'], ...draft,
  },
  {
    id: 'scapula', systemId: 'skeletal', regionId: 'upperLimb', meshNames: both('scapula'),
    name: { en: 'Scapula', id: 'Skapula', latin: 'Scapula' },
    description: {
      en: 'A flat, triangular bone. It has no direct connection to the ribs and is held in place by surrounding muscles.',
      id: 'Tulang pipih berbentuk segitiga. Tulang ini tidak terhubung langsung dengan tulang rusuk dan ditahan oleh otot-otot di sekitarnya.',
    },
    location: { en: 'On the back of the shoulder.', id: 'Di bagian belakang bahu.' },
    function: {
      en: 'It connects with the humerus to form the shoulder joint and links the arm to the body. Muscles that move the shoulder and arm attach to it.',
      id: 'Skapula bersendi dengan humerus membentuk sendi bahu dan menghubungkan lengan ke tubuh. Otot-otot penggerak bahu dan lengan melekat padanya.',
    },
    synonyms: { en: ['shoulder blade'], id: ['tulang belikat'] }, relatedStructures: ['clavicle', 'humerus', 'deltoid'], referenceIds: ['os-pectoral'], ...draft,
  },
  {
    id: 'humerus', systemId: 'skeletal', regionId: 'upperLimb', meshNames: both('humerus'),
    name: { en: 'Humerus', id: 'Humerus', latin: 'Humerus' },
    description: { en: 'The single bone of the upper arm.', id: 'Satu-satunya tulang pada lengan atas.' },
    location: { en: 'In the upper arm, between the shoulder and the elbow.', id: 'Di lengan atas, di antara bahu dan siku.' },
    function: {
      en: 'Its head forms the shoulder joint with the scapula, and its lower end forms the elbow joint with the ulna and radius.',
      id: 'Kepalanya membentuk sendi bahu bersama skapula, dan ujung bawahnya membentuk sendi siku bersama ulna dan radius.',
    },
    synonyms: { en: ['upper arm bone'], id: ['tulang lengan atas'] }, relatedStructures: ['scapula', 'radius', 'ulna', 'biceps-brachii'], referenceIds: ['os-upper-limb'], ...draft,
  },
  {
    id: 'radius', systemId: 'skeletal', regionId: 'upperLimb', meshNames: both('radius'),
    name: { en: 'Radius', id: 'Radius', latin: 'Radius' },
    description: { en: 'The lateral bone of the forearm.', id: 'Tulang lateral pada lengan bawah.' },
    location: { en: 'In the forearm, on the thumb side.', id: 'Di lengan bawah, pada sisi ibu jari.' },
    function: {
      en: 'At the elbow it articulates with the humerus and ulna. At its lower end it articulates with the carpal bones to form the wrist joint.',
      id: 'Di siku, radius bersendi dengan humerus dan ulna. Di ujung bawahnya, radius bersendi dengan tulang karpal membentuk sendi pergelangan tangan.',
    },
    synonyms: { en: [], id: ['tulang pengumpil'] }, relatedStructures: ['ulna', 'humerus'], referenceIds: ['os-upper-limb'], ...draft,
  },
  {
    id: 'ulna', systemId: 'skeletal', regionId: 'upperLimb', meshNames: both('ulna'),
    name: { en: 'Ulna', id: 'Ulna', latin: 'Ulna' },
    description: { en: 'The medial bone of the forearm.', id: 'Tulang medial pada lengan bawah.' },
    location: { en: 'In the forearm, on the little-finger side.', id: 'Di lengan bawah, pada sisi jari kelingking.' },
    function: {
      en: 'At the elbow it articulates with the humerus and radius. Its lower end articulates with the radius but not with the carpal bones.',
      id: 'Di siku, ulna bersendi dengan humerus dan radius. Ujung bawahnya bersendi dengan radius, tetapi tidak dengan tulang karpal.',
    },
    synonyms: { en: [], id: ['tulang hasta'] }, relatedStructures: ['radius', 'humerus'], referenceIds: ['os-upper-limb'], ...draft,
  },

  // ---------------------------------------------------------------- hip and leg bones
  {
    id: 'hip-bone', systemId: 'skeletal', regionId: 'pelvis', meshNames: both('hip bone'),
    name: { en: 'Hip bone', id: 'Tulang panggul', latin: 'Os coxae' },
    description: {
      en: 'Each hip bone has three regions that fuse in the late teens: the ilium, the ischium and the pubis.',
      id: 'Setiap tulang panggul memiliki tiga bagian yang menyatu pada akhir usia belasan: ilium, iskium, dan pubis.',
    },
    location: {
      en: 'In the pelvis. The ilium joins the sacrum at the back, and the two pubic bones meet at the front.',
      id: 'Di panggul. Ilium bersendi dengan sakrum di belakang, dan kedua tulang pubis bertemu di depan.',
    },
    function: {
      en: 'It attaches the lower limb to the axial skeleton and transfers body weight from the spine to the leg bearing weight. The ischium supports the body when sitting.',
      id: 'Tulang ini melekatkan tungkai ke rangka aksial dan meneruskan berat badan dari tulang belakang ke tungkai yang menumpu. Iskium menopang tubuh saat duduk.',
    },
    synonyms: { en: ['coxal bone', 'pelvic bone', 'innominate bone'], id: ['tulang pinggul', 'os koksa'] }, relatedStructures: ['sacrum', 'femur'], referenceIds: ['os-pelvis'], ...draft,
  },
  {
    id: 'femur', systemId: 'skeletal', regionId: 'lowerLimb', meshNames: both('femur'),
    name: { en: 'Femur', id: 'Femur', latin: 'Femur' },
    description: { en: 'The single bone of the thigh, and the longest and strongest bone of the body.', id: 'Satu-satunya tulang pada paha, sekaligus tulang terpanjang dan terkuat di tubuh.' },
    location: { en: 'In the thigh, from the hip to the knee.', id: 'Di paha, dari pinggul sampai lutut.' },
    function: {
      en: 'Its head joins the hip bone to form the hip joint, and its lower end meets the tibia at the knee joint.',
      id: 'Kepalanya bersendi dengan tulang panggul membentuk sendi pinggul, dan ujung bawahnya bertemu tibia pada sendi lutut.',
    },
    synonyms: { en: ['thigh bone'], id: ['tulang paha'] }, relatedStructures: ['hip-bone', 'patella', 'tibia'], referenceIds: ['os-lower-limb'], ...draft,
  },
  {
    id: 'patella', systemId: 'skeletal', regionId: 'lowerLimb', meshNames: both('patella'),
    name: { en: 'Patella', id: 'Patela', latin: 'Patella' },
    description: { en: 'The kneecap. It articulates only with the femur.', id: 'Tempurung lutut. Tulang ini hanya bersendi dengan femur.' },
    location: { en: 'At the front of the knee, within the tendon of the quadriceps femoris.', id: 'Di bagian depan lutut, di dalam tendon otot kuadriseps femoris.' },
    function: {
      en: 'It protects the tendon from rubbing against the femur and lifts it away from the knee joint, which improves the muscle\'s leverage.',
      id: 'Patela melindungi tendon dari gesekan dengan femur dan mengangkatnya menjauh dari sendi lutut, sehingga daya ungkit otot meningkat.',
    },
    synonyms: { en: ['kneecap', 'knee cap'], id: ['tempurung lutut'] }, relatedStructures: ['femur', 'tibia', 'rectus-femoris'], referenceIds: ['os-lower-limb'], ...draft,
  },
  {
    id: 'tibia', systemId: 'skeletal', regionId: 'lowerLimb', meshNames: both('tibia'),
    name: { en: 'Tibia', id: 'Tibia', latin: 'Tibia' },
    description: { en: 'The larger bone of the lower leg, and the second-longest bone in the body.', id: 'Tulang yang lebih besar pada tungkai bawah, sekaligus tulang terpanjang kedua di tubuh.' },
    location: { en: 'On the inner (medial) side of the lower leg.', id: 'Di sisi dalam (medial) tungkai bawah.' },
    function: { en: 'It is the primary load-bearing bone of the lower leg.', id: 'Tibia adalah tulang penumpu beban utama pada tungkai bawah.' },
    synonyms: { en: ['shin bone', 'shinbone'], id: ['tulang kering'] }, relatedStructures: ['fibula', 'femur'], referenceIds: ['os-lower-limb'], ...draft,
  },
  {
    id: 'fibula', systemId: 'skeletal', regionId: 'lowerLimb', meshNames: both('fibula'),
    name: { en: 'Fibula', id: 'Fibula', latin: 'Fibula' },
    description: { en: 'The slender bone of the lower leg.', id: 'Tulang yang ramping pada tungkai bawah.' },
    location: { en: 'On the outer (lateral) side of the lower leg.', id: 'Di sisi luar (lateral) tungkai bawah.' },
    function: { en: 'It does not bear weight and mainly serves as an attachment point for muscles.', id: 'Fibula tidak menahan beban dan terutama berperan sebagai tempat melekatnya otot.' },
    synonyms: { en: ['calf bone'], id: ['tulang betis'] }, relatedStructures: ['tibia'], referenceIds: ['os-lower-limb'], ...draft,
  },

  // ---------------------------------------------------------------- muscles of the trunk
  {
    id: 'diaphragm', systemId: 'muscular', regionId: 'thorax', meshNames: ['diaphragm'],
    name: { en: 'Diaphragm', id: 'Diafragma', latin: 'Diaphragma' },
    description: { en: 'A dome-shaped muscular sheet that divides the chest from the abdomen.', id: 'Lembaran otot berbentuk kubah yang memisahkan dada dari perut.' },
    location: { en: 'Between the thoracic cavity and the abdominal cavity, beneath the lungs.', id: 'Di antara rongga dada dan rongga perut, di bawah paru-paru.' },
    function: { en: 'Its contraction and relaxation change the volume of the thoracic cavity, which drives breathing.', id: 'Kontraksi dan relaksasinya mengubah volume rongga dada, yang menggerakkan pernapasan.' },
    synonyms: { en: ['thoracic diaphragm'], id: ['sekat rongga badan'] }, relatedStructures: ['lungs', 'liver', 'intercostal-muscles'], referenceIds: ['os-axial-muscles', 'os-lungs'], ...draft,
  },
  {
    id: 'intercostal-muscles', systemId: 'muscular', regionId: 'thorax',
    meshNames: ['external intercostal muscle', 'internal intercostal muscle', 'innermost intercostal muscle'],
    name: { en: 'Intercostal muscles', id: 'Otot interkostal', latin: 'Musculi intercostales' },
    description: { en: 'Three sets of muscles that span each space between the ribs.', id: 'Tiga kelompok otot yang membentang di setiap ruang antar tulang rusuk.' },
    location: { en: 'Between the ribs.', id: 'Di antara tulang rusuk.' },
    function: {
      en: 'They change the dimensions of the rib cage. The external intercostals raise it to aid inhalation, and the internal intercostals draw the ribs together to aid exhalation.',
      id: 'Otot ini mengubah ukuran rangka dada. Interkostal eksternal mengangkatnya untuk membantu menarik napas, dan interkostal internal merapatkan tulang rusuk untuk membantu mengembuskan napas.',
    },
    synonyms: { en: ['intercostals'], id: ['otot sela iga', 'otot antar rusuk'] }, relatedStructures: ['ribs', 'diaphragm'], referenceIds: ['os-axial-muscles'], ...draft,
  },
  {
    id: 'external-oblique', systemId: 'muscular', regionId: 'abdomen', meshNames: both('external oblique'),
    name: { en: 'External oblique', id: 'Otot oblikus eksternus', latin: 'Musculus obliquus externus abdominis' },
    description: { en: 'The most superficial of the three flat muscles on the side of the abdomen.', id: 'Otot paling superfisial dari tiga otot pipih di sisi perut.' },
    location: { en: 'On the side of the abdominal wall.', id: 'Di sisi dinding perut.' },
    function: { en: 'It enables twisting at the waist and bending to the side.', id: 'Otot ini memungkinkan badan berputar di pinggang dan menekuk ke samping.' },
    synonyms: { en: ['oblique'], id: ['otot miring luar perut'] }, relatedStructures: [], referenceIds: ['os-axial-muscles'], ...draft,
  },

  // ---------------------------------------------------------------- muscles of the shoulder and arm
  {
    id: 'trapezius', systemId: 'muscular', regionId: 'back',
    meshNames: [...bothParts('descending part', 'trapezius'), ...bothParts('transverse part', 'trapezius'), ...bothParts('ascending part', 'trapezius')],
    name: { en: 'Trapezius', id: 'Otot trapezius', latin: 'Musculus trapezius' },
    description: { en: 'A muscle of the upper back that runs from the skull and vertebral column to the shoulder.', id: 'Otot di punggung atas yang membentang dari tengkorak dan tulang belakang sampai ke bahu.' },
    location: { en: 'On the back of the thorax. It attaches to the skull and vertebral column and to the scapula and clavicle.', id: 'Di bagian belakang dada. Otot ini melekat pada tengkorak dan tulang belakang, serta pada skapula dan klavikula.' },
    function: { en: 'It elevates the shoulders, pulls the shoulder blades together and tilts the head backward.', id: 'Otot ini mengangkat bahu, menarik kedua tulang belikat saling mendekat, dan menengadahkan kepala.' },
    synonyms: { en: ['traps'], id: [] }, relatedStructures: ['scapula', 'clavicle'], referenceIds: ['os-upper-muscles'], ...draft,
  },
  {
    id: 'deltoid', systemId: 'muscular', regionId: 'upperLimb',
    meshNames: [...bothParts('clavicular part', 'deltoid'), ...bothParts('acromial part', 'deltoid'), ...bothParts('spinal part', 'deltoid')],
    name: { en: 'Deltoid', id: 'Otot deltoid', latin: 'Musculus deltoideus' },
    description: { en: 'The muscle that forms the rounded contour of the shoulder.', id: 'Otot yang membentuk lengkung bulat pada bahu.' },
    location: { en: 'Over the shoulder. It arises from the clavicle and scapula.', id: 'Di atas bahu. Otot ini berasal dari klavikula dan skapula.' },
    function: { en: 'It is the main muscle that lifts the arm away from the body, and it assists with flexion, extension and rotation of the arm.', id: 'Otot ini adalah otot utama yang mengangkat lengan menjauhi tubuh, serta membantu fleksi, ekstensi, dan rotasi lengan.' },
    synonyms: { en: ['delts'], id: ['otot bahu'] }, relatedStructures: ['scapula', 'clavicle', 'humerus'], referenceIds: ['os-upper-muscles'], ...draft,
  },
  {
    id: 'pectoralis-major', systemId: 'muscular', regionId: 'thorax',
    meshNames: [...bothParts('clavicular part', 'pectoralis major'), ...bothParts('sternocostal part', 'pectoralis major'), ...bothParts('abdominal part', 'pectoralis major')],
    name: { en: 'Pectoralis major', id: 'Otot pektoralis mayor', latin: 'Musculus pectoralis major' },
    description: { en: 'A large muscle that covers much of the upper front of the chest.', id: 'Otot besar yang menutupi sebagian besar dada bagian atas.' },
    location: { en: 'On the upper front of the chest. It arises from the clavicle, sternum and rib cartilages.', id: 'Di bagian atas dada depan. Otot ini berasal dari klavikula, sternum, dan tulang rawan rusuk.' },
    function: { en: 'It brings the elbows together and raises them, as in an uppercut.', id: 'Otot ini merapatkan dan mengangkat kedua siku, seperti saat melayangkan pukulan ke atas.' },
    synonyms: { en: ['pecs', 'chest muscle'], id: ['otot dada'] }, relatedStructures: ['sternum', 'clavicle'], referenceIds: ['os-upper-muscles'], ...draft,
  },
  {
    id: 'biceps-brachii', systemId: 'muscular', regionId: 'upperLimb',
    meshNames: [...bothParts('long head', 'biceps brachii'), ...bothParts('short head', 'biceps brachii')],
    name: { en: 'Biceps brachii', id: 'Otot biseps brakii', latin: 'Musculus biceps brachii' },
    description: { en: 'A muscle with two heads in the front compartment of the arm.', id: 'Otot berkepala dua di kompartemen depan lengan atas.' },
    location: { en: 'On the front of the upper arm. Both heads arise from the scapula.', id: 'Di bagian depan lengan atas. Kedua kepalanya berasal dari skapula.' },
    function: { en: 'It flexes and supinates the forearm, as in a biceps curl, and assists in flexing the arm at the shoulder.', id: 'Otot ini menekuk dan memutar lengan bawah ke arah telapak menghadap atas, seperti gerakan biceps curl, serta membantu menekuk lengan di bahu.' },
    synonyms: { en: ['biceps'], id: ['biseps', 'otot lengan atas depan'] }, relatedStructures: ['triceps-brachii', 'humerus', 'scapula'], referenceIds: ['os-upper-muscles'], ...draft,
  },
  {
    id: 'triceps-brachii', systemId: 'muscular', regionId: 'upperLimb',
    meshNames: [...bothParts('long head', 'triceps brachii'), ...bothParts('lateral head', 'triceps brachii'), ...bothParts('medial head', 'triceps brachii')],
    name: { en: 'Triceps brachii', id: 'Otot triseps brakii', latin: 'Musculus triceps brachii' },
    description: { en: 'A muscle with three heads on the back of the arm.', id: 'Otot berkepala tiga di bagian belakang lengan atas.' },
    location: { en: 'On the back of the upper arm. It arises from the scapula and the back of the humerus.', id: 'Di bagian belakang lengan atas. Otot ini berasal dari skapula dan bagian belakang humerus.' },
    function: { en: 'It extends the forearm, as in a punch.', id: 'Otot ini meluruskan lengan bawah, seperti saat meninju.' },
    synonyms: { en: ['triceps'], id: ['triseps'] }, relatedStructures: ['biceps-brachii', 'humerus', 'scapula'], referenceIds: ['os-upper-muscles'], ...draft,
  },

  // ---------------------------------------------------------------- muscles of the hip and leg
  {
    id: 'gluteus-maximus', systemId: 'muscular', regionId: 'lowerLimb', meshNames: both('gluteus maximus'),
    name: { en: 'Gluteus maximus', id: 'Otot gluteus maksimus', latin: 'Musculus gluteus maximus' },
    description: { en: 'The largest of the gluteal muscles, lying near the surface.', id: 'Otot gluteal terbesar, terletak dekat permukaan.' },
    location: { en: 'In the buttock. It arises from the ilium, sacrum and coccyx.', id: 'Di bokong. Otot ini berasal dari ilium, sakrum, dan koksigis.' },
    function: { en: 'It lowers the knee and swings the thigh backward, as when preparing to kick a ball.', id: 'Otot ini menurunkan lutut dan mengayunkan paha ke belakang, seperti saat bersiap menendang bola.' },
    synonyms: { en: ['glutes', 'buttock muscle'], id: ['otot bokong'] }, relatedStructures: ['hip-bone', 'sacrum', 'femur'], referenceIds: ['os-lower-muscles'], ...draft,
  },
  {
    id: 'sartorius', systemId: 'muscular', regionId: 'lowerLimb', meshNames: both('sartorius'),
    name: { en: 'Sartorius', id: 'Otot sartorius', latin: 'Musculus sartorius' },
    description: { en: 'A band-like muscle that crosses the thigh from the hip to the inner side of the upper tibia.', id: 'Otot berbentuk pita yang melintasi paha dari pinggul ke sisi dalam tibia bagian atas.' },
    location: { en: 'Across the front of the thigh.', id: 'Melintang di bagian depan paha.' },
    function: { en: 'It flexes the knee and hip and rotates the thigh outward, which lets you sit cross-legged.', id: 'Otot ini menekuk lutut dan pinggul serta memutar paha ke arah luar, sehingga kamu bisa duduk bersila.' },
    synonyms: { en: ["tailor's muscle"], id: [] }, relatedStructures: ['femur', 'tibia', 'hip-bone'], referenceIds: ['os-lower-muscles'], ...draft,
  },
  {
    id: 'rectus-femoris', systemId: 'muscular', regionId: 'lowerLimb', meshNames: both('rectus femoris'),
    name: { en: 'Rectus femoris', id: 'Otot rektus femoris', latin: 'Musculus rectus femoris' },
    description: { en: 'One of the four quadriceps muscles at the front of the thigh.', id: 'Salah satu dari empat otot kuadriseps di bagian depan paha.' },
    location: { en: 'On the front of the thigh. It shares a tendon that attaches to the patella.', id: 'Di bagian depan paha. Otot ini berbagi tendon yang melekat pada patela.' },
    function: { en: 'It swings the lower leg forward, as in kicking, and helps raise the knee.', id: 'Otot ini mengayunkan tungkai bawah ke depan, seperti saat menendang, dan membantu mengangkat lutut.' },
    synonyms: { en: ['quadriceps', 'quads'], id: ['kuadriseps', 'otot paha depan'] }, relatedStructures: ['patella', 'femur', 'biceps-femoris'], referenceIds: ['os-lower-muscles'], ...draft,
  },
  {
    id: 'biceps-femoris', systemId: 'muscular', regionId: 'lowerLimb',
    meshNames: [...bothParts('long head', 'biceps femoris'), ...bothParts('short head', 'biceps femoris')],
    name: { en: 'Biceps femoris', id: 'Otot biseps femoris', latin: 'Musculus biceps femoris' },
    description: { en: 'One of the three hamstring muscles at the back of the thigh.', id: 'Salah satu dari tiga otot hamstring di bagian belakang paha.' },
    location: { en: 'On the back of the thigh. It arises from the ischium and the femur.', id: 'Di bagian belakang paha. Otot ini berasal dari iskium dan femur.' },
    function: { en: 'It moves the lower leg back toward the buttocks and moves the thigh down and back. The hamstring group flexes the knee.', id: 'Otot ini menarik tungkai bawah ke arah bokong dan menggerakkan paha ke bawah dan ke belakang. Kelompok hamstring menekuk lutut.' },
    synonyms: { en: ['hamstring', 'hamstrings'], id: ['hamstring', 'otot paha belakang'] }, relatedStructures: ['rectus-femoris', 'femur'], referenceIds: ['os-lower-muscles'], ...draft,
  },
  {
    id: 'gastrocnemius', systemId: 'muscular', regionId: 'lowerLimb',
    meshNames: [...bothParts('medial head', 'gastrocnemius'), ...bothParts('lateral head', 'gastrocnemius')],
    name: { en: 'Gastrocnemius', id: 'Otot gastroknemius', latin: 'Musculus gastrocnemius' },
    description: { en: 'The most superficial and visible muscle of the calf. It has two heads and inserts into the Achilles tendon.', id: 'Otot betis yang paling superfisial dan terlihat. Otot ini berkepala dua dan berinsersi pada tendon Achilles.' },
    location: { en: 'At the back of the lower leg. It arises from the lower end of the femur.', id: 'Di bagian belakang tungkai bawah. Otot ini berasal dari ujung bawah femur.' },
    function: { en: 'It lowers the foot toward the ground, as in jumping, and helps bend the knee.', id: 'Otot ini menurunkan telapak kaki ke arah tanah, seperti saat melompat, dan membantu menekuk lutut.' },
    synonyms: { en: ['calf muscle', 'calf'], id: ['otot betis'] }, relatedStructures: ['femur', 'tibia', 'tibialis-anterior'], referenceIds: ['os-lower-muscles'], ...draft,
  },
  {
    id: 'tibialis-anterior', systemId: 'muscular', regionId: 'lowerLimb', meshNames: both('tibialis anterior'),
    name: { en: 'Tibialis anterior', id: 'Otot tibialis anterior', latin: 'Musculus tibialis anterior' },
    description: { en: 'A long, thick muscle in the front compartment of the lower leg.', id: 'Otot panjang dan tebal di kompartemen depan tungkai bawah.' },
    location: { en: 'On the outer side of the tibia, at the front of the lower leg.', id: 'Di sisi luar tibia, pada bagian depan tungkai bawah.' },
    function: { en: 'It raises the sole of the foot off the ground and bends the inner foot upward, which helps with balance.', id: 'Otot ini mengangkat telapak kaki dari tanah dan menekuk sisi dalam kaki ke atas, sehingga membantu keseimbangan.' },
    synonyms: { en: ['shin muscle'], id: ['otot tulang kering'] }, relatedStructures: ['tibia', 'gastrocnemius'], referenceIds: ['os-lower-muscles'], ...draft,
  },

  // ---------------------------------------------------------------- nervous system
  {
    id: 'brain', systemId: 'nervous', regionId: 'head', meshNames: ['brain'],
    name: { en: 'Brain', id: 'Otak', latin: 'Encephalon' },
    description: {
      en: 'The adult brain has four major regions: the cerebrum, diencephalon, brain stem and cerebellum.',
      id: 'Otak dewasa memiliki empat bagian utama: serebrum, diensefalon, batang otak, dan serebelum.',
    },
    location: { en: 'Inside the cranial cavity of the skull.', id: 'Di dalam rongga kranial tengkorak.' },
    function: {
      en: 'Conscious experience comes from its neural activity. The cerebrum supports memory, emotion and consciousness, and the cerebellum helps keep movement coordinated.',
      id: 'Pengalaman sadar berasal dari aktivitas sarafnya. Serebrum mendukung ingatan, emosi, dan kesadaran, sedangkan serebelum membantu menjaga koordinasi gerakan.',
    },
    synonyms: { en: ['cerebrum', 'encephalon'], id: ['serebrum', 'ensefalon'] }, relatedStructures: ['spinal-cord', 'frontal-bone'], referenceIds: ['os-cns'], ...draft,
  },
  {
    id: 'spinal-cord', systemId: 'nervous', regionId: 'back', meshNames: ['spinal cord'],
    name: { en: 'Spinal cord', id: 'Sumsum tulang belakang', latin: 'Medulla spinalis' },
    description: {
      en: 'A single structure divided into cervical, thoracic, lumbar and sacral regions. It does not extend the full length of the vertebral column.',
      id: 'Satu struktur yang terbagi menjadi bagian servikal, torakal, lumbal, dan sakral. Struktur ini tidak memanjang sepanjang tulang belakang.',
    },
    location: { en: 'It runs through the vertebral column, beginning just below the brain stem.', id: 'Berjalan di dalam tulang belakang, dimulai tepat di bawah batang otak.' },
    function: {
      en: 'Ascending tracts carry sensory information up to the brain, and descending tracts carry motor commands down from it.',
      id: 'Jaras asendens membawa informasi sensorik naik ke otak, dan jaras desendens membawa perintah motorik turun dari otak.',
    },
    synonyms: { en: ['medulla spinalis'], id: ['medula spinalis'] }, relatedStructures: ['brain'], referenceIds: ['os-cns', 'os-vertebral'], ...draft,
  },

  // ---------------------------------------------------------------- heart and lungs
  {
    id: 'heart', systemId: 'cardiovascular', regionId: 'thorax', meshNames: ['heart'],
    name: { en: 'Heart', id: 'Jantung', latin: 'Cor' },
    description: {
      en: 'A muscular organ with four chambers: two atria that receive blood and two ventricles, the main pumping chambers. Its wall has three layers: epicardium, myocardium and endocardium.',
      id: 'Organ berotot dengan empat ruang: dua atrium yang menerima darah dan dua ventrikel sebagai ruang pompa utama. Dindingnya memiliki tiga lapisan: epikardium, miokardium, dan endokardium.',
    },
    location: {
      en: 'In the mediastinum of the thoracic cavity, between the two lungs. Its apex points to the left.',
      id: 'Di mediastinum rongga dada, di antara kedua paru-paru. Puncaknya mengarah ke kiri.',
    },
    function: {
      en: 'The right ventricle pumps deoxygenated blood to the lungs (the pulmonary circuit). The left ventricle pumps oxygenated blood into the aorta to supply the body (the systemic circuit).',
      id: 'Ventrikel kanan memompa darah miskin oksigen ke paru-paru (sirkulasi pulmonal). Ventrikel kiri memompa darah kaya oksigen ke aorta untuk memasok seluruh tubuh (sirkulasi sistemik).',
    },
    synonyms: { en: ['cor', 'cardiac'], id: ['kardia'] }, relatedStructures: ['lungs', 'sternum', 'ribs'], referenceIds: ['os-heart'], ...draft,
  },
  {
    id: 'lungs', systemId: 'respiratory', regionId: 'thorax', meshNames: ['right lung', 'left lung'],
    name: { en: 'Lungs', id: 'Paru-paru', latin: 'Pulmones' },
    description: {
      en: 'Paired, pyramid-shaped organs. The right lung has three lobes and the left has two. The left lung is narrower and has a cardiac notch, an indentation that makes room for the heart.',
      id: 'Organ berpasangan berbentuk piramida. Paru-paru kanan memiliki tiga lobus dan yang kiri dua. Paru-paru kiri lebih sempit dan memiliki takik jantung, yaitu lekukan yang memberi ruang bagi jantung.',
    },
    location: {
      en: 'In the chest, connected to the trachea by the right and left bronchi. Their lower surface rests on the diaphragm.',
      id: 'Di dalam dada, terhubung dengan trakea melalui bronkus kanan dan kiri. Permukaan bawahnya bertumpu pada diafragma.',
    },
    function: {
      en: 'They exchange oxygen and carbon dioxide with the air across a very large surface of about 70 square meters.',
      id: 'Paru-paru menukar oksigen dan karbon dioksida dengan udara melalui permukaan yang sangat luas, sekitar 70 meter persegi.',
    },
    synonyms: { en: ['lung', 'pulmonary'], id: ['paru', 'pulmo'] }, relatedStructures: ['trachea', 'heart', 'diaphragm'], referenceIds: ['os-lungs'],
    modelNote: {
      en: 'In this model the lungs appear as branching airways and blood vessels, because the source dataset has no mesh for the outer surface of the lungs.',
      id: 'Di model ini, paru-paru tampak sebagai cabang saluran napas dan pembuluh darah, karena dataset sumber tidak memiliki mesh untuk permukaan luar paru-paru.',
    },
    ...draft,
  },
  {
    id: 'trachea', systemId: 'respiratory', regionId: 'neck', meshNames: ['trachea'],
    name: { en: 'Trachea', id: 'Trakea', latin: 'Trachea' },
    description: {
      en: 'A tube made of about 16 to 20 stacked, C-shaped pieces of cartilage, closed at the back by a flexible membrane.',
      id: 'Saluran yang tersusun dari sekitar 16 sampai 20 keping tulang rawan berbentuk huruf C, dan ditutup di belakang oleh selaput lentur.',
    },
    location: {
      en: 'It runs from the larynx toward the lungs, with the esophagus behind it, and splits into the right and left primary bronchi.',
      id: 'Berjalan dari laring menuju paru-paru, dengan esofagus di belakangnya, lalu bercabang menjadi bronkus primer kanan dan kiri.',
    },
    function: {
      en: 'It carries air toward the lungs. The cartilage keeps the airway from collapsing, and the membrane lets it stretch slightly during breathing.',
      id: 'Trakea menyalurkan udara menuju paru-paru. Tulang rawannya mencegah saluran napas menutup, dan selaputnya memungkinkan saluran sedikit meregang saat bernapas.',
    },
    synonyms: { en: ['windpipe'], id: ['batang tenggorok'] }, relatedStructures: ['lungs', 'esophagus'], referenceIds: ['os-respiratory'], ...draft,
  },

  // ---------------------------------------------------------------- digestive system
  {
    id: 'esophagus', systemId: 'digestive', regionId: 'thorax', meshNames: ['esophagus'],
    name: { en: 'Esophagus', id: 'Esofagus', latin: 'Oesophagus' },
    description: { en: 'A muscular tube about 25 cm long that stays collapsed when you are not swallowing.', id: 'Saluran berotot sepanjang sekitar 25 cm yang tetap menutup saat tidak sedang menelan.' },
    location: {
      en: 'Behind the trachea, through the mediastinum. It passes through the diaphragm to enter the abdomen.',
      id: 'Di belakang trakea, melalui mediastinum. Saluran ini menembus diafragma untuk masuk ke perut.',
    },
    function: {
      en: 'It links the pharynx to the stomach. Waves of peristalsis push food down, and a lower sphincter keeps stomach contents from flowing back up.',
      id: 'Esofagus menghubungkan faring dengan lambung. Gelombang peristaltik mendorong makanan turun, dan sfingter bawah mencegah isi lambung naik kembali.',
    },
    synonyms: { en: ['oesophagus', 'gullet', 'food pipe'], id: ['kerongkongan'] }, relatedStructures: ['stomach', 'trachea', 'diaphragm'], referenceIds: ['os-esophagus'], ...draft,
  },
  {
    id: 'stomach', systemId: 'digestive', regionId: 'abdomen', meshNames: ['stomach'],
    name: { en: 'Stomach', id: 'Lambung', latin: 'Gaster' },
    description: { en: 'A temporary holding chamber for food that can expand to hold about 4 liters of food and fluid.', id: 'Ruang penampung makanan sementara yang dapat mengembang hingga menampung sekitar 4 liter makanan dan cairan.' },
    location: { en: 'In the abdomen, between the esophagus and the duodenum, the first section of the small intestine.', id: 'Di perut, di antara esofagus dan duodenum, yaitu bagian pertama usus halus.' },
    function: {
      en: 'It mixes food with gastric juice to form chyme, starts protein digestion with acid and pepsin, and releases food into the small intestine in small amounts. Little absorption happens here.',
      id: 'Lambung mencampur makanan dengan getah lambung menjadi kimus, memulai pencernaan protein dengan asam dan pepsin, dan melepaskan makanan ke usus halus sedikit demi sedikit. Penyerapan yang terjadi di sini hanya sedikit.',
    },
    synonyms: { en: ['gaster', 'gastric'], id: ['gaster'] }, relatedStructures: ['esophagus', 'small-intestine', 'pancreas'], referenceIds: ['os-stomach'], ...draft,
  },
  {
    id: 'liver', systemId: 'digestive', regionId: 'abdomen', meshNames: ['liver'],
    name: { en: 'Liver', id: 'Hati', latin: 'Hepar' },
    description: { en: 'An accessory organ of digestion that makes bile.', id: 'Organ pelengkap pencernaan yang menghasilkan empedu.' },
    location: { en: 'Below the diaphragm in the upper right abdomen, shielded by the ribs.', id: 'Di bawah diafragma pada perut kanan atas, terlindung oleh tulang rusuk.' },
    function: { en: 'It sends bile to the duodenum and also plays roles in metabolism and regulation.', id: 'Hati mengirim empedu ke duodenum dan juga berperan dalam metabolisme dan pengaturan tubuh.' },
    synonyms: { en: ['hepar', 'hepatic'], id: ['hepar', 'lever'] }, relatedStructures: ['gallbladder', 'diaphragm', 'small-intestine'], referenceIds: ['os-accessory'], ...draft,
  },
  {
    id: 'gallbladder', systemId: 'digestive', regionId: 'abdomen', meshNames: ['gallbladder'],
    name: { en: 'Gallbladder', id: 'Kandung empedu', latin: 'Vesica biliaris' },
    description: { en: 'A small accessory organ that stores bile.', id: 'Organ pelengkap kecil yang menyimpan empedu.' },
    location: { en: 'In a shallow depression on the underside of the right lobe of the liver.', id: 'Pada cekungan dangkal di sisi bawah lobus kanan hati.' },
    function: { en: 'It stores and concentrates bile, and releases it through the bile duct when digestion needs it.', id: 'Organ ini menyimpan dan memekatkan empedu, lalu melepaskannya melalui saluran empedu saat dibutuhkan untuk pencernaan.' },
    synonyms: { en: ['gall bladder'], id: ['empedu', 'pundi empedu'] }, relatedStructures: ['liver'], referenceIds: ['os-accessory'], ...draft,
  },
  {
    id: 'pancreas', systemId: 'digestive', regionId: 'abdomen', meshNames: ['pancreas'],
    name: { en: 'Pancreas', id: 'Pankreas', latin: 'Pancreas' },
    description: { en: 'A gland with both exocrine and endocrine parts.', id: 'Kelenjar yang memiliki bagian eksokrin dan endokrin.' },
    location: { en: 'Crosswise behind the stomach. Its head fits into the C-shaped bend of the duodenum.', id: 'Melintang di belakang lambung. Kepalanya masuk ke dalam lengkungan duodenum yang berbentuk huruf C.' },
    function: {
      en: 'It makes enzyme-rich juice that drains into the duodenum, and its islet cells release hormones, including insulin and glucagon, into the bloodstream.',
      id: 'Pankreas menghasilkan cairan kaya enzim yang mengalir ke duodenum, dan sel-sel pulaunya melepaskan hormon, termasuk insulin dan glukagon, ke aliran darah.',
    },
    synonyms: { en: ['pancreatic'], id: [] }, relatedStructures: ['stomach', 'small-intestine'], referenceIds: ['os-accessory'], ...draft,
  },
  {
    id: 'small-intestine', systemId: 'digestive', regionId: 'abdomen', meshNames: ['small intestine'],
    name: { en: 'Small intestine', id: 'Usus halus', latin: 'Intestinum tenue' },
    description: { en: 'It has three parts: the duodenum, jejunum and ileum. It is about 3 meters long in a living person.', id: 'Terdiri atas tiga bagian: duodenum, jejunum, dan ileum. Panjangnya sekitar 3 meter pada orang hidup.' },
    location: { en: 'In the abdomen, between the stomach and the large intestine, which surrounds it on three sides.', id: 'Di perut, di antara lambung dan usus besar, yang mengelilinginya pada tiga sisi.' },
    function: { en: 'Most digestion happens here, along with nearly all absorption.', id: 'Sebagian besar pencernaan terjadi di sini, begitu pula hampir semua penyerapan.' },
    synonyms: { en: ['small bowel', 'duodenum', 'jejunum', 'ileum'], id: ['duodenum', 'jejunum', 'ileum'] }, relatedStructures: ['stomach', 'large-intestine', 'pancreas'], referenceIds: ['os-intestines'], ...draft,
  },
  {
    id: 'large-intestine', systemId: 'digestive', regionId: 'abdomen', meshNames: ['large intestine'],
    name: { en: 'Large intestine', id: 'Usus besar', latin: 'Intestinum crassum' },
    description: { en: 'The final section of the digestive tract. Its parts are the cecum, colon, rectum and anal canal.', id: 'Bagian akhir saluran cerna. Bagian-bagiannya adalah sekum, kolon, rektum, dan kanal anus.' },
    location: { en: 'In the abdomen and pelvis, surrounding the small intestine on three sides.', id: 'Di perut dan panggul, mengelilingi usus halus pada tiga sisi.' },
    function: { en: 'It completes the absorption of water and nutrients, synthesizes certain vitamins, and forms and eliminates feces.', id: 'Usus besar menyelesaikan penyerapan air dan nutrisi, membuat vitamin tertentu, serta membentuk dan mengeluarkan feses.' },
    synonyms: { en: ['large bowel', 'colon', 'rectum', 'cecum'], id: ['kolon', 'rektum', 'sekum'] }, relatedStructures: ['small-intestine'], referenceIds: ['os-intestines'], ...draft,
  },

  // ---------------------------------------------------------------- urinary system
  {
    id: 'kidneys', systemId: 'urinary', regionId: 'abdomen', meshNames: ['right kidney', 'left kidney'],
    name: { en: 'Kidneys', id: 'Ginjal', latin: 'Renes' },
    description: { en: 'Paired organs whose functional units, the nephrons, cleanse the blood and balance its contents.', id: 'Organ berpasangan yang unit fungsionalnya, nefron, membersihkan darah dan menyeimbangkan isinya.' },
    location: {
      en: 'On either side of the spine, behind the peritoneum. The left kidney sits at about T12 to L3, and the right sits lower because the liver displaces it.',
      id: 'Di kedua sisi tulang belakang, di belakang peritoneum. Ginjal kiri berada kira-kira setinggi T12 sampai L3, dan ginjal kanan lebih rendah karena terdesak hati.',
    },
    function: {
      en: 'They filter blood, reclaim most water and solutes, and collect the remainder as urine, which drains into the ureter.',
      id: 'Ginjal menyaring darah, menyerap kembali sebagian besar air dan zat terlarut, lalu mengumpulkan sisanya sebagai urine yang mengalir ke ureter.',
    },
    synonyms: { en: ['kidney', 'renal'], id: ['ren', 'buah pinggang'] }, relatedStructures: ['ureters', 'urinary-bladder', 'liver'], referenceIds: ['os-kidney'], ...draft,
  },
  {
    id: 'ureters', systemId: 'urinary', regionId: 'abdomen', meshNames: ['right ureter', 'left ureter'],
    name: { en: 'Ureters', id: 'Ureter', latin: 'Ureteres' },
    description: { en: 'Paired tubes that link each kidney to the urinary bladder.', id: 'Saluran berpasangan yang menghubungkan setiap ginjal dengan kandung kemih.' },
    location: { en: 'From the renal pelvis of each kidney down to the urinary bladder.', id: 'Dari pelvis renalis setiap ginjal turun ke kandung kemih.' },
    function: {
      en: 'They move urine by peristaltic waves rather than simple drainage. Their angled path through the bladder wall stops urine from flowing back.',
      id: 'Ureter mengalirkan urine dengan gelombang peristaltik, bukan sekadar mengalir turun. Jalurnya yang miring menembus dinding kandung kemih mencegah urine mengalir balik.',
    },
    synonyms: { en: ['ureter'], id: [] }, relatedStructures: ['kidneys', 'urinary-bladder'], referenceIds: ['os-urine-transport'], ...draft,
  },
  {
    id: 'urinary-bladder', systemId: 'urinary', regionId: 'pelvis', meshNames: ['urinary bladder'],
    name: { en: 'Urinary bladder', id: 'Kandung kemih', latin: 'Vesica urinaria' },
    description: { en: 'An organ that collects urine from both ureters.', id: 'Organ yang menampung urine dari kedua ureter.' },
    location: { en: 'In the pelvis, behind the pubic bone and in front of the rectum.', id: 'Di panggul, di belakang tulang pubis dan di depan rektum.' },
    function: { en: 'It stores urine until excretion.', id: 'Organ ini menyimpan urine sampai dikeluarkan.' },
    synonyms: { en: ['bladder'], id: ['vesika urinaria', 'kantung kemih'] }, relatedStructures: ['ureters', 'kidneys'], referenceIds: ['os-urine-transport'], ...draft,
  },
];
