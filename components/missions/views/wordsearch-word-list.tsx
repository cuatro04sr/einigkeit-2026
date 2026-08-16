import { cn } from "@/lib/utils";
import { WordEntry } from "@/constants/mission-8";

interface WordsearchWordListProps {
    words: WordEntry[];
    foundWordIds: Set<string>;
}

export function WordsearchWordList({ words, foundWordIds }: WordsearchWordListProps) {
    const sorted = [...words].sort((a, b) => a.displayOrder - b.displayOrder);
    return (
        <div className="flex flex-wrap gap-1.5">
            {sorted.map((w) => {
                const isFound = foundWordIds.has(w.id);
                return (
                    <span
                        key={w.id}
                        className={cn(
                            "px-2.5 py-1 rounded-full text-[0.65rem] sm:text-xs font-bold border transition-all duration-300",
                            isFound
                                ? "bg-emerald-100 border-emerald-400 text-emerald-700 line-through"
                                : "bg-white border-slate-200 text-slate-700",
                        )}
                    >
                        {w.word}
                    </span>
                );
            })}
        </div>
    );
}
