import { Medication } from '@/types/medication';

const STORAGE_KEY = 'medapp:medications';

export function getMedications(): Medication[] {
    if (typeof window === 'undefined') return []; // SSR safety
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveMedications(meds: Medication[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meds));
}

export function addMedication(med: Medication): Medication[] {
    const current = getMedications();
    const updated = [med, ...current];
    saveMedications(updated);
    return updated;
}

export function removeMedication(id: string): Medication[] {
    const current = getMedications();
    const updated = current.filter((m) => m.id !== id);
    saveMedications(updated);
    return updated;
}