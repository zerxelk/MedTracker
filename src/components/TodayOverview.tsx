'use client';

import { Medication } from '@/types/medication';
import {
    todayKey,
    generateDoseSlots,
    FREQUENCY_DOSES_PER_DAY,
} from '@/lib/schedule';
import { Check, Pill, Sunrise } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TodayOverviewProps {
    medications: Medication[];
    onToggleDose: (medId: string, doseKey: string) => void;
    onViewMed: (med: Medication) => void;
}

interface TodayDose {
    medication: Medication;
    slotIndex: number;
    doseKey: string;
    taken: boolean;
}

export function TodayOverview({
                                  medications,
                                  onToggleDose,
                                  onViewMed,
                              }: TodayOverviewProps) {
    const today = todayKey();

    const todayDoses: TodayDose[] = [];
    for (const med of medications) {
        if (!med.schedule) continue;
        if (med.schedule.frequency === 'as_needed') continue;

        const slots = generateDoseSlots(med.schedule, med.doseLog || {});
        const todaySlots = slots.filter((s) => s.date === today);

        for (const slot of todaySlots) {
            todayDoses.push({
                medication: med,
                slotIndex: slot.slotIndex,
                doseKey: slot.key,
                taken: slot.status === 'taken',
            });
        }
    }

    if (todayDoses.length === 0) {
        return null;
    }

    const takenCount = todayDoses.filter((d) => d.taken).length;
    const allDone = takenCount === todayDoses.length;

    return (
        <div>
            <div className="mb-6 flex items-baseline justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50 tracking-tight">
                        Today
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        {allDone
                            ? `All ${todayDoses.length} dose${todayDoses.length === 1 ? '' : 's'} taken `
                            : `${takenCount} of ${todayDoses.length} dose${todayDoses.length === 1 ? '' : 's'} taken`}
                        {allDone && '✨'}
                    </p>
                </div>
                <span className="text-xs text-stone-500 dark:text-stone-400">
          {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
          })}
        </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AnimatePresence mode="popLayout">
                    {todayDoses.map((dose, i) => (
                        <DoseRow
                            key={`${dose.medication.id}:${dose.doseKey}`}
                            dose={dose}
                            index={i}
                            onToggle={() => onToggleDose(dose.medication.id, dose.doseKey)}
                            onView={() => onViewMed(dose.medication)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

interface DoseRowProps {
    dose: TodayDose;
    index: number;
    onToggle: () => void;
    onView: () => void;
}

function DoseRow({ dose, index, onToggle, onView }: DoseRowProps) {
    const { medication, slotIndex, taken } = dose;
    const totalSlots = medication.schedule
        ? FREQUENCY_DOSES_PER_DAY[medication.schedule.frequency]
        : 1;
    const displayName =
        medication.fdaData?.brandName ||
        medication.fdaData?.genericName ||
        medication.name;

    const doseLabel =
        totalSlots > 1 ? `Dose ${slotIndex + 1} of ${totalSlots}` : 'Today';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                taken
                    ? 'bg-green-50/60 dark:bg-green-950/20 border-green-200/60 dark:border-green-900/40'
                    : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
            }`}
            onClick={onView}
        >
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
                className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    taken
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'border-2 border-stone-300 dark:border-stone-700 hover:border-stone-900 dark:hover:border-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
                aria-label={taken ? 'Mark as not taken' : 'Mark as taken'}
            >
                {taken ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                    <Pill className="h-4 w-4 text-stone-500 dark:text-stone-400" />
                )}
            </button>

            <div className="min-w-0 flex-1">
                <p
                    className={`text-sm font-medium capitalize truncate ${
                        taken
                            ? 'text-stone-600 dark:text-stone-400 line-through decoration-stone-400/60 dark:decoration-stone-500/60'
                            : 'text-stone-900 dark:text-stone-50'
                    }`}
                >
                    {displayName.toLowerCase()}
                </p>
                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {medication.dosage && <span>{medication.dosage}</span>}
                    {medication.dosage && <span>·</span>}
                    <span className="flex items-center gap-1">
            <Sunrise className="h-3 w-3" />
                        {doseLabel}
          </span>
                </div>
            </div>
        </motion.div>
    );
}