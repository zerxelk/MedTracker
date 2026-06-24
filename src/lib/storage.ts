import { Medication } from '@/types/medication';

const STORAGE_KEY = 'medapp:medications';

export function getMedications(): Medication[] {
    if (typeof window === 'undefined') return [];
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

/**
 * Toggle a dose: if it's logged, unlog it. If not, log it with current timestamp.
 */
export function toggleDose(medId: string, doseKey: string): Medication[] {
    const current = getMedications();
    const updated = current.map((m) => {
        if (m.id !== medId) return m;
        const doseLog = { ...(m.doseLog || {}) };
        if (doseLog[doseKey]) {
            delete doseLog[doseKey];
        } else {
            doseLog[doseKey] = new Date().toISOString();
        }
        return { ...m, doseLog };
    });
    saveMedications(updated);
    return updated;
}