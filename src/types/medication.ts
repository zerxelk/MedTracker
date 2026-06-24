export interface Medication {
    id: string;              // unique id (we generate with crypto.randomUUID())
    name: string;            // brand or generic name
    dosage?: string;         // e.g. "500mg" — user-entered
    notes?: string;          // user's personal notes
    addedAt: string;         // ISO date string
    fdaData?: FDADrugInfo;   // cached info from openFDA
}

export interface FDADrugInfo {
    brandName?: string;
    genericName?: string;
    manufacturer?: string;
    purpose?: string;        // what it's for
    indications?: string;    // when to use it
    warnings?: string;
    sideEffects?: string;
    dosageInfo?: string;
}