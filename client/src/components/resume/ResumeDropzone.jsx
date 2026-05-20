import { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/utils/helpers";
import { Button } from "@/components/ui/button";

export default function ResumeDropzone({ onFileSelect }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (f) => {
      if (!f) return;
      if (f.type !== "application/pdf") {
        alert("Please upload a PDF file only.");
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        alert("File must be under 5 MB.");
        return;
      }
      setFile(f);
      onFileSelect(f);
    },
    [onFileSelect]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = e.dataTransfer.files[0];
      handleFile(dropped);
    },
    [handleFile]
  );

  const removeFile = () => {
    setFile(null);
    onFileSelect(null);
  };

  return (
    <div className="space-y-3">
      {file ? (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB · PDF
              </p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={removeFile}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 cursor-pointer transition-colors",
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          <Upload className={cn("h-10 w-10", dragOver ? "text-primary" : "text-muted-foreground")} />
          <div className="text-center">
            <p className="text-sm font-medium">Drop your resume here</p>
            <p className="text-xs text-muted-foreground mt-1">PDF only · max 5 MB</p>
          </div>
          <input
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </label>
      )}
    </div>
  );
}
