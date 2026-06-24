'use client';

import { Medication } from '@/types/medication';
import {
    FREQUENCY_LABELS,
    FREQUENCY_DOSES_PER_DAY,
    generateDoseSlots,
    computeAdherence,
    groupSlotsByDay,
    daysRemaining,
    todayKey,
} from '@/lib/schedule';
import { CalendarDays, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScheduleTrackerProps {
    medication: Medication;
    onToggleDose: (medId: string, doseKey: string) => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dayLabel(dateKey: string): string {
    const date = new Date(dateKey + 'T00:00:00');
    return DAY_LABELS[date.getDay()];
}

function dayNumber(dateKey: string): string {
    return dateKey.slice(-2);
}

export function ScheduleTracker({ medication, onToggleDose }: ScheduleTrackerProps) {
    if (!medication.schedule) return null;
    const { schedule } = medication;

    if (schedule.frequency === 'as_needed') {
        return (
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4">
                <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="h-4 w-4 text-stone-600 dark:text-stone-400" />
                    <h3 className="font-medium text-sm text-stone-900 dark:text-stone-50">Schedule</h3>
                </div>
                <p className="text-sm text-stone-700 dark:text-stone-300">
                    {FREQUENCY_LABELS[schedule.frequency]}
                    {schedule.instructions && ` — ${schedule.instructions}`}
                </p>
            </div>
        );
    }

    const slots = generateDoseSlots(schedule, medication.doseLog || {});
    const adherence = computeAdherence(slots);
    const grouped = groupSlotsByDay(slots);
    const dates = Object.keys(grouped).sort();
    const dosesPerDay = FREQUENCY_DOSES_PER_DAY[schedule.frequency];
    const remaining = daysRemaining(schedule);
    const today = todayKey();

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 space-y-4"
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <CalendarDays className="h-4 w-4 text-stone-600 dark:text-stone-400" />
                        <h3 className="font-medium text-sm text-stone-900 dark:text-stone-50">Schedule</h3>
                    </div>
                    <p className="text-sm text-stone-700 dark:text-stone-300">
                        {FREQUENCY_LABELS[schedule.frequency]}
                        {schedule.instructions && ` · ${schedule.instructions}`}
                    </p>
                    {remaining !== null && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                            {remaining > 0
                                ? `${remaining} day${remaining === 1 ? '' : 's'} remaining`
                                : 'Course complete'}
                        </p>
                    )}
                </div>

                <div className="shrink-0 rounded-lg bg-stone-100 dark:bg-stone-800 px-3 py-2 text-right">
                    <p className="text-lg font-semibold text-stone-900 dark:text-stone-50 leading-none tracking-tight">
                        {adherence.percent}%
                    </p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 leading-none uppercase tracking-wide">
                        {adherence.taken} of {adherence.expected} taken
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto -mx-2 px-2">
                <div className="inline-flex gap-1.5 min-w-full">
                    {dates.map((dateKey) => {
                        const daySlots = grouped[dateKey];
                        const isToday = dateKey === today;
                        return (
                            <div
                                key={dateKey}
                                className={`flex flex-col items-center gap-1.5 rounded-lg p-2 ${
                                    isToday ? 'bg-stone-50 dark:bg-stone-800/50 ring-1 ring-stone-200 dark:ring-stone-700' : ''
                                }`}
                            >
                                <div className="text-center">
                                    <p className="text-[10px] uppercase tracking-wide text-stone-500 dark:text-stone-400 leading-none">
                                        {dayLabel(dateKey)}
                                    </p>
                                    <p
                                        className={`text-sm font-medium leading-none mt-1 ${
                                            isToday ? 'text-stone-900 dark:text-stone-50' : 'text-stone-600 dark:text-stone-400'
                                        }`}
                                    >
                                        {dayNumber(dateKey)}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1 mt-1">
                                    {daySlots.map((slot) => (
                                        <DoseButton
                                            key={slot.key}
                                            status={slot.status}
                                            onClick={() => onToggleDose(medication.id, slot.key)}
                                            ariaLabel={`Dose ${slot.slotIndex + 1} of ${dosesPerDay} on ${dateKey}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-2 w-2 text-white" strokeWidth={3} />
                    </div>
                    Taken
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center">
                        <X className="h-2 w-2 text-stone-500 dark:text-stone-400" strokeWidth={3} />
                    </div>
                    Missed
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900" />
                    Upcoming
                </div>
            </div>
        </motion.div>
    );
}

interface DoseButtonProps {
    status: 'taken' | 'missed' | 'upcoming' | 'today';
    onClick: () => void;
    ariaLabel: string;
}

function DoseButton({ status, onClick, ariaLabel }: DoseButtonProps) {
    const disabled = status === 'upcoming';

    let className = 'w-6 h-6 rounded-full flex items-center justify-center transition-all ';
    let content: React.ReactNode = null;

    switch (status) {
        case 'taken':
            className += 'bg-green-500 hover:bg-green-600 text-white';
            content = <Check className="h-3.5 w-3.5" strokeWidth={3} />;
            break;
        case 'missed':
            className += 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300';
            content = <X className="h-3 w-3" strokeWidth={2.5} />;
            break;
        case 'today':
            className += 'border-2 border-stone-400 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800';
            break;
        case 'upcoming':
            className += 'border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-300 dark:text-stone-700 cursor-not-allowed';
            break;
    }

    return (
        <button
            type="button"
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            className={className}
            aria-label={ariaLabel}
        >
            {content}
        </button>
    );
}