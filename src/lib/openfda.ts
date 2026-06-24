import { FDADrugInfo } from '@/types/medication';

const BASE_URL = 'https://api.fda.gov/drug/label.json';

interface FDALabelResult {
    openfda?: {
        brand_name?: string[];
        generic_name?: string[];
        manufacturer_name?: string[];
    };
    purpose?: string[];
    indications_and_usage?: string[];
    warnings?: string[];
    adverse_reactions?: string[];
    dosage_and_administration?: string[];
}

/*  Search openFDA for drugs matching a name.
    Returns up to 5 matching results. */
export async function searchDrugs(query: string): Promise<FDADrugInfo[]> {
    if (!query.trim()) return [];

    const searchQuery = encodeURIComponent(
        `openfda.brand_name:"${query}" openfda.generic_name:"${query}"`
    );
    const url = `${BASE_URL}?search=${searchQuery}&limit=5`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            // openFDA returns 404 if no results — that's normal, not an error
            if (res.status === 404) return [];
            throw new Error(`FDA API error: ${res.status}`);
        }

        const data = await res.json();
        return (data.results || []).map(formatDrugInfo);
    } catch (err) {
        console.error('FDA search failed:', err);
        return [];
    }
}

function formatDrugInfo(result: FDALabelResult): FDADrugInfo {
    return {
        brandName: result.openfda?.brand_name?.[0],
        genericName: result.openfda?.generic_name?.[0],
        manufacturer: result.openfda?.manufacturer_name?.[0],
        purpose: result.purpose?.[0],
        indications: result.indications_and_usage?.[0],
        warnings: result.warnings?.[0],
        sideEffects: result.adverse_reactions?.[0],
        dosageInfo: result.dosage_and_administration?.[0],
    };
}