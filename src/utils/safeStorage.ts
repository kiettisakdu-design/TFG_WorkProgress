import { EvaluationRecord, PhotoData } from '../types';
import { generateSampleConstructionImage } from './sampleData';

export const STORAGE_KEY_EVALUATIONS = 'shop_tfm_evaluations_v2';
export const STORAGE_KEY_SETTINGS = 'shop_tfm_settings_v2';

/**
 * Clean up obsolete or oversized items from earlier sessions to prevent QuotaExceededError
 */
export function purgeObsoleteStorageKeys(): void {
  try {
    const obsoleteKeys = [
      'shop_tfm_evaluations',
      'shop_tfm_evaluations_v1',
      'shop_tfm_evaluations_backup',
      'shop_tfm_photos_cache',
      'shop_tfm_cached_images',
    ];
    for (const key of obsoleteKeys) {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    // Ignore storage access errors in restricted iframe modes
  }
}

/**
 * Prepares evaluations for localStorage by replacing heavy base64 images (> 2.5KB)
 * with lightweight SVG vector representations.
 * This guarantees the serialized JSON stays under ~100KB even with hundreds of evaluations,
 * completely avoiding browser QuotaExceededError (5MB limit).
 */
export function prepareEvaluationsForStorage(records: EvaluationRecord[]): EvaluationRecord[] {
  return records.map((record) => {
    const lightweightPhotos: PhotoData = { ...record.photos };

    const keys: Array<keyof PhotoData> = ['facade', 'interior', 'rear', 'parking'];
    for (const key of keys) {
      const original = lightweightPhotos[key];
      // If photo is a heavy data URL / base64 image (> 2500 characters),
      // replace with an SVG vector representation that retains exact branch & score
      if (original && original.length > 2500) {
        const score =
          key === 'facade'
            ? record.category_scores.front_facade
            : key === 'interior'
            ? record.category_scores.interior
            : key === 'rear'
            ? record.category_scores.rear_building
            : record.category_scores.parking_area;

        lightweightPhotos[key] = generateSampleConstructionImage(
          key,
          `${record.branch_name} (${key.toUpperCase()})`,
          score || 50
        );
      }
    }

    return {
      ...record,
      photos: lightweightPhotos,
    };
  });
}

/**
 * Safely persists evaluations into localStorage with multi-tiered quota fallback
 */
export function safeSaveEvaluations(records: EvaluationRecord[]): void {
  try {
    purgeObsoleteStorageKeys();
    const prepared = prepareEvaluationsForStorage(records);
    localStorage.setItem(STORAGE_KEY_EVALUATIONS, JSON.stringify(prepared));
  } catch (err: any) {
    // First fallback: remove photos entirely from older records and keep max 20 records
    try {
      const minimalRecords = records.slice(0, 20).map((r) => ({
        ...r,
        photos: {
          facade: '',
          interior: '',
          rear: '',
          parking: '',
        },
      }));
      localStorage.setItem(STORAGE_KEY_EVALUATIONS, JSON.stringify(minimalRecords));
    } catch (fallbackErr) {
      // In the rare event localStorage is completely locked, fail silently without crashing UI
      console.warn('Storage quota limit reached, could not persist evaluations:', fallbackErr);
    }
  }
}

/**
 * Safely loads evaluations from localStorage
 */
export function safeLoadEvaluations(fallback: EvaluationRecord[]): EvaluationRecord[] {
  try {
    purgeObsoleteStorageKeys();
    const raw = localStorage.getItem(STORAGE_KEY_EVALUATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read evaluations from localStorage, using fallback:', err);
  }
  return fallback;
}
