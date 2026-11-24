export interface CatalogExercise {
  exerciseId: string;
  name: string;
  primaryBodyPart: string | null;
  primaryEquipment: string | null;
  primaryMuscle: string | null;
  bodyParts: string[];
  equipments: string[];
  targetMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  imageFileName: string | null;
  hasImage: boolean;
}

export interface SaveCatalogExerciseRequest {
  exerciseId?: string;
  name: string;
  primaryBodyPart: string | null;
  primaryEquipment: string | null;
  primaryMuscle: string | null;
  bodyParts: string[];
  equipments: string[];
  targetMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
}

export interface UploadImageResponse {
  exerciseId: string;
  fileName: string;
  fileSizeBytes: number;
}

export const CANONICAL_EQUIPMENTS = [
  'assisted',
  'band',
  'barbell',
  'body weight',
  'cable',
  'dumbbell',
  'ez barbell',
  'kettlebell',
  'leverage machine',
  'medicine ball',
  'sled machine',
  'smith machine',
] as const;

export const CANONICAL_BODY_PARTS = [
  'back',
  'cardio',
  'chest',
  'lower arms',
  'lower legs',
  'shoulders',
  'upper arms',
  'upper legs',
  'waist',
] as const;

export const CANONICAL_MUSCLES = [
  'abs',
  'biceps',
  'calves',
  'cardiovascular system',
  'core',
  'delts',
  'forearms',
  'glutes',
  'hamstrings',
  'hip flexors',
  'lats',
  'lower back',
  'obliques',
  'pectorals',
  'quads',
  'shoulders',
  'traps',
  'triceps',
  'upper back',
] as const;

export const MUSCLE_TRANSLATIONS_PL: Record<string, string> = {
  abductors: 'odwodziciele uda',
  abs: 'mięśnie brzucha',
  adductors: 'przywodziciele uda',
  back: 'plecy',
  biceps: 'biceps / dwugłowe ramienia',
  calves: 'łydki',
  'cardiovascular system': 'układ krążenia / kardio',
  chest: 'klatka piersiowa',
  core: 'mięśnie głębokie tułowia',
  delts: 'barki / naramienne',
  forearms: 'przedramiona',
  glutes: 'pośladki',
  hamstrings: 'dwugłowe uda',
  'hip flexors': 'zginacze bioder',
  lats: 'najszerszy grzbietu',
  'levator scapulae': 'dźwigacz łopatki',
  'lower back': 'dolna część pleców',
  neck: 'szyja',
  obliques: 'skośne brzucha',
  pectorals: 'klatka piersiowa',
  quads: 'czworogłowe uda',
  rhomboids: 'mięśnie równoległoboczne',
  'serratus anterior': 'zębaty przedni',
  shins: 'piszczele',
  shoulders: 'barki',
  spine: 'prostowniki grzbietu',
  traps: 'kaptury / czworoboczny',
  triceps: 'triceps / trójgłowe ramienia',
  'upper back': 'górna część pleców',
};

export function formatMuscleLabel(muscle: string): string {
  const trimmed = muscle.trim();
  const translation = MUSCLE_TRANSLATIONS_PL[trimmed.toLowerCase()];
  return translation ? `${trimmed} (${translation})` : trimmed;
}
