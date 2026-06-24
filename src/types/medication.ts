export type ScheduleFrequency = 'once' | 'twice' | 'three_times' | 'four_times' | 'as_needed';

export interface MedicationSchedule {
    frequency: ScheduleFrequency;
    durationDays?: number; // undefined = ongoing
    startDate: string;     // ISO date string (YYYY-MM-DD)
    instructions?: string; // e.g. "after meals", "with water"
}

export interface DoseLog {
    // Key: "YYYY-MM-DD:slotIndex" → ISO timestamp when taken
    // slotIndex is 0..n-1 within a day (0 = first dose, 1 = second, etc.)
    [doseKey: string]: string;
}

export interface Medication {
    id: string;
    name: string;
    dosage?: string;
    notes?: string;
    addedAt: string;
    fdaData?: FDADrugInfo;
    schedule?: MedicationSchedule;
    doseLog?: DoseLog;
}

export interface FDADrugInfo {
    brandName?: string;
    genericName?: string;
    manufacturer?: string;
    purpose?: string;
    indications?: string;
    warnings?: string;
    sideEffects?: string;
    dosageInfo?: string;
}