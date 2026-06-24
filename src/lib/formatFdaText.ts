// src/lib/formatFdaText.ts

/**
 * The FDA returns label text as one giant blob with no paragraph breaks.
 * This splits on known section markers to make it readable.
 */
const SECTION_MARKERS = [
    'Liver warning',
    'Allergy alert:',
    'Allergy alert',
    'Stomach bleeding warning',
    'Heart attack and stroke warning',
    'Do not use',
    'Ask a doctor before use',
    'Ask a doctor or pharmacist before use',
    'When using this product',
    'Stop use and ask a doctor',
    'Stop use',
    'If pregnant or breast-feeding',
    'Keep out of reach of children',
    'Overdose warning',
    'In case of overdose',
    'Other information',
    'Directions',
    'Uses',
    'Active ingredient',
    'Inactive ingredients',
    'Purpose',
    'Warnings',
];

// Prefixes the FDA likes to repeat at the start of their own sections.
// We strip these so we don't show "Warnings Warnings..." or "Purpose Purpose...".
const REDUNDANT_PREFIXES = [
    'Warnings',
    'Purpose',
    'Uses',
    'Directions',
    'Indications',
    'Indications and usage',
];

export function formatFdaText(text: string | undefined): string[] {
    if (!text) return [];

    // Strip redundant leading section label (e.g. "Warnings Warnings Liver warning..." → "Liver warning...")
    let cleaned = text.trim();
    for (const prefix of REDUNDANT_PREFIXES) {
        const regex = new RegExp(`^${escapeRegex(prefix)}\\s+`, 'i');
        if (regex.test(cleaned)) {
            cleaned = cleaned.replace(regex, '');
            break;
        }
    }

    // Build a regex that matches any section marker as a word boundary.
    // Positive lookahead so the marker stays at the start of the next paragraph.
    const pattern = new RegExp(
        `(?=\\b(?:${SECTION_MARKERS.map(escapeRegex).join('|')})\\b)`,
        'g'
    );

    const parts = cleaned
        .split(pattern)
        .map((p) => p.trim())
        .filter(Boolean);

    // If splitting produced nothing useful, fall back to cleaned text
    return parts.length > 1 ? parts : [cleaned];
}

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}