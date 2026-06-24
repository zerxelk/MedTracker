import { Medication } from '@/types/medication';

export interface DetectedInteraction {
    withMed: Medication;
    matchedTerm: string;
    excerpt: string;
}

export interface SameIngredientWarning {
    ingredient: string;
    medications: Medication[];
}

const STOPWORDS = new Set([
    'sodium', 'hydrochloride', 'hcl', 'citrate', 'sulfate', 'phosphate',
    'tablet', 'tablets', 'capsule', 'capsules', 'oral', 'extra', 'strength',
    'extended', 'release', 'pediatric', 'maximum', 'rapid', 'acting',
    'powder', 'solution', 'syrup', 'topical', 'injection', 'cream',
    'ointment', 'gel', 'spray', 'drops', 'chewable', 'coated',
]);

function getCandidateTerms(med: Medication): string[] {
    const sources = [
        med.fdaData?.brandName,
        med.fdaData?.genericName,
        med.name,
    ].filter((s): s is string => !!s);

    const terms = new Set<string>();

    for (const source of sources) {
        const lower = source.toLowerCase().trim();
        if (lower.length > 3) terms.add(lower);

        const words = lower.split(/\s+/);
        if (words.length > 1) {
            for (const word of words) {
                if (word.length > 4 && !STOPWORDS.has(word)) {
                    terms.add(word);
                }
            }
        }
    }

    return Array.from(terms);
}

export function detectInteractions(
    targetMed: Medication,
    allMeds: Medication[]
): DetectedInteraction[] {
    const warnings = targetMed.fdaData?.warnings;
    if (!warnings) return [];

    const others = allMeds.filter((m) => m.id !== targetMed.id);
    const results: DetectedInteraction[] = [];

    for (const other of others) {
        const terms = getCandidateTerms(other);

        for (const term of terms) {
            const regex = new RegExp(`\\b${escapeRegex(term)}\\b`, 'i');
            const match = regex.exec(warnings);

            if (match) {
                const excerpt = extractSentence(warnings, match.index);
                results.push({
                    withMed: other,
                    matchedTerm: term,
                    excerpt,
                });
                break;
            }
        }
    }

    return results;
}

/**
 * Detect medications that share the same active ingredient.
 * Catches "double-dosing" — a common cause of acetaminophen overdose.
 * For example, taking Tylenol AND a cold medicine both containing acetaminophen.
 *
 * Returns one warning per ingredient group, listing all meds that share it.
 */
export function detectSameIngredientWarnings(
    allMeds: Medication[]
): SameIngredientWarning[] {
    const groups = new Map<string, Medication[]>();

    for (const med of allMeds) {
        const ingredient = med.fdaData?.genericName?.toLowerCase().trim();
        if (!ingredient) continue;

        // Normalize: strip pharmacological suffixes for grouping
        const normalized = normalizeIngredient(ingredient);
        if (!normalized) continue;

        const existing = groups.get(normalized) || [];
        existing.push(med);
        groups.set(normalized, existing);
    }

    // Only return groups with 2+ medications
    const warnings: SameIngredientWarning[] = [];
    for (const [ingredient, meds] of groups.entries()) {
        if (meds.length >= 2) {
            warnings.push({ ingredient, medications: meds });
        }
    }

    return warnings;
}

/**
 * Normalize an ingredient name for comparison.
 * "Acetaminophen" -> "acetaminophen"
 * "Warfarin Sodium" -> "warfarin" (strips salt suffix)
 * "Ibuprofen" -> "ibuprofen"
 */
function normalizeIngredient(ingredient: string): string {
    const words = ingredient
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 0 && !STOPWORDS.has(w));

    if (words.length === 0) return '';
    // For multi-word generics, use the first significant word
    // (e.g. "warfarin sodium" -> "warfarin")
    return words[0];
}

function extractSentence(text: string, index: number): string {
    const before = text.lastIndexOf('.', index);
    const after = text.indexOf('.', index);

    const start = before === -1 ? Math.max(0, index - 60) : before + 1;
    const end = after === -1 ? Math.min(text.length, index + 80) : after + 1;

    return text.slice(start, end).trim();
}

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}