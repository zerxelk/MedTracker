// src/lib/interactions.ts
import { Medication } from '@/types/medication';

export interface DetectedInteraction {
    withMed: Medication;
    matchedTerm: string;
    excerpt: string;
}

// Common pharmacology suffixes / form words that aren't useful for matching
const STOPWORDS = new Set([
    'sodium', 'hydrochloride', 'hcl', 'citrate', 'sulfate', 'phosphate',
    'tablet', 'tablets', 'capsule', 'capsules', 'oral', 'extra', 'strength',
    'extended', 'release', 'pediatric', 'maximum', 'rapid', 'acting',
    'powder', 'solution', 'syrup', 'topical', 'injection', 'cream',
    'ointment', 'gel', 'spray', 'drops', 'chewable', 'coated',
]);

/**
 * Build a list of search terms for a given med:
 * - the full brand name, generic name, and user-given name
 * - plus each individual significant word from those names
 *   (e.g. "Warfarin Sodium" also matches just "warfarin")
 */
function getCandidateTerms(med: Medication): string[] {
    const sources = [
        med.fdaData?.brandName,
        med.fdaData?.genericName,
        med.name,
    ].filter((s): s is string => !!s);

    const terms = new Set<string>();

    for (const source of sources) {
        const lower = source.toLowerCase().trim();

        // Add the full term if it's meaningful
        if (lower.length > 3) terms.add(lower);

        // Also add each significant word from multi-word names
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
                break; // one match per other-med
            }
        }
    }

    return results;
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