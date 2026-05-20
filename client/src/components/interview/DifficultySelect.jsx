import { DIFFICULTY_OPTIONS } from "@/utils/constants";
import { cn } from "@/utils/helpers";

export default function DifficultySelect({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {DIFFICULTY_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-lg border p-4 text-left transition-all hover:border-primary",
            value === opt.value
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "border-border bg-background"
          )}
        >
          <p className="font-medium text-sm">{opt.label}</p>
          <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
        </button>
      ))}
    </div>
  );
}
