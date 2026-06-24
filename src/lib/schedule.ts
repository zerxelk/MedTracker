import { ScheduleFrequency, MedicationSchedule, DoseLog } from '@/types/medication';

export const FREQUENCY_LABELS: Record<ScheduleFrequency, string> = {
    once: 'Once daily',
    twice: 'Twice daily',
    three_times: 'Three times daily',
    four_times: 'Four times daily',
    as_needed: 'As needed',
};

export const FREQUENCY_DOSES_PER_DAY: Record<ScheduleFrequency, number> = {
    once: 1,
    twice: 2,
    three_times: 3,
    four_times: 4,
    as_needed: 0, // no scheduled slots
};

export interface DoseSlot {
    date: string;       // YYYY-MM-DD
    slotIndex: number;  // 0..dosesPerDay-1
    key: string;        // "YYYY-MM-DD:slotIndex"
    status: 'taken' | 'missed' | 'upcoming' | 'today';
    takenAt?: string;   // ISO timestamp if taken
}

/** Format a Date as YYYY-MM-DD in local time */
export function toDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function todayKey(): string {
    return toDateKey(new Date());
}

/** Build the dose key used in DoseLog */
export function doseKey(dateKey: string, slotIndex: number): string {
    return `${dateKey}:${slotIndex}`;
}

/**
 * Generate all dose slots for the schedule's full duration.
 * For ongoing schedules, returns slots up through today + the rest of the current week.
 */
export function generateDoseSlots(
    schedule: MedicationSchedule,
    doseLog: DoseLog = {}
): DoseSlot[] {
    const dosesPerDay = FREQUENCY_DOSES_PER_DAY[schedule.frequency];
    if (dosesPerDay === 0) return []; // "as_needed" has no schedule grid

    const todayStr = todayKey();
    const startDate = new Date(schedule.startDate + 'T00:00:00');
    const today = new Date(todayStr + 'T00:00:00');

    // Determine how many days to render
    let totalDays = schedule.durationDays ?? 7;
    if (!schedule.durationDays) {
        // Ongoing: show at least 7 days, more if more time has passed
        const elapsed = Math.floor(
            (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        totalDays = Math.max(7, elapsed + 1);
    }

    const slots: DoseSlot[] = [];

    for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + dayOffset);
        const dateKey = toDateKey(date);

        for (let slotIndex = 0; slotIndex < dosesPerDay; slotIndex++) {
            const key = doseKey(dateKey, slotIndex);
            const takenAt = doseLog[key];

            let status: DoseSlot['status'];
            if (takenAt) {
                status = 'taken';
            } else if (dateKey === todayStr) {
                status = 'today';
            } else if (date < today) {
                status = 'missed';
            } else {
                status = 'upcoming';
            }

            slots.push({ date: dateKey, slotIndex, key, status, takenAt });
        }
    }

    return slots;
}

/**
 * Compute adherence stats: how many doses taken vs how many should have been taken by now.
 * Upcoming doses don't count against you.
 */
export function computeAdherence(slots: DoseSlot[]): {
    taken: number;
    expected: number;
    percent: number;
} {
    // Doses are "expected" if they're in the past (or today, in past slots)
    const expectedSlots = slots.filter(
        (s) => s.status === 'taken' || s.status === 'missed' || s.status === 'today'
    );
    // For "today" slots, only count them as expected once they've been logged
    const expected = expectedSlots.filter(
        (s) => s.status !== 'today' || s.takenAt
    ).length;
    const taken = slots.filter((s) => s.status === 'taken').length;

    // Avoid divide-by-zero
    const percent = expected === 0 ? 0 : Math.round((taken / expected) * 100);

    return { taken, expected, percent };
}

/**
 * Group slots by date for display in a grid.
 */
export function groupSlotsByDay(slots: DoseSlot[]): Record<string, DoseSlot[]> {
    const grouped: Record<string, DoseSlot[]> = {};
    for (const slot of slots) {
        if (!grouped[slot.date]) grouped[slot.date] = [];
        grouped[slot.date].push(slot);
    }
    return grouped;
}

/**
 * Days remaining for a fixed-duration schedule. Returns null for ongoing.
 */
export function daysRemaining(schedule: MedicationSchedule): number | null {
    if (!schedule.durationDays) return null;
    const start = new Date(schedule.startDate + 'T00:00:00');
    const end = new Date(start);
    end.setDate(end.getDate() + schedule.durationDays);
    const today = new Date();
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
}