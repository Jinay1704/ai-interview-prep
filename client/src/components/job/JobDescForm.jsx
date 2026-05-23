import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  description: z
    .string()
    .min(10, "Please enter at least 10 characters")
    .max(1000, "Description too long"),
});

export default function JobDescForm({ onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({ resolver: zodResolver(schema) });

  const value = watch("description") ?? "";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Job Description</Label>
        <Textarea
          id="description"
          placeholder="Paste the full job description here — we'll extract the role, required skills, and generate tailored questions…"
          className="min-h-[220px] resize-none"
          {...register("description")}
        />
        <div className="flex items-center justify-between">
          {errors.description ? (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Minimum 10 characters
            </p>
          )}
          <span className="text-xs text-muted-foreground">{value.length} / 1000</span>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analysing job description…
          </>
        ) : (
          "Generate Interview →"
        )}
      </Button>
    </form>
  );
}
