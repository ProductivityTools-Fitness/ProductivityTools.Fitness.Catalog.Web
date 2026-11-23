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
  'delts',
  'forearms',
  'glutes',
  'hamstrings',
  'lats',
  'obliques',
  'pectorals',
  'quads',
  'traps',
  'triceps',
  'upper back',
] as const;
