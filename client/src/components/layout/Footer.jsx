import { BrainCircuit } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t py-8 mt-auto">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-4 w-4" />
          <span>AI Mock Interview</span>
        </div>
        <p>© {new Date().getFullYear()} — Built with Gemini AI &amp; Hume AI</p>
      </div>
    </footer>
  );
}
