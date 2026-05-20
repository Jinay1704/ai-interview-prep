import { useState } from "react";
import { resumeService } from "@/services/resume.service";
import { toast } from "sonner";

export const useResume = () => {
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [result, setResult] = useState(null);

  const analyse = async (file, jobId) => {
    setIsAnalysing(true);
    setResult(null);
    try {
      const data = await resumeService.analyse(file, jobId);
      setResult(data);
      toast.success("Resume analysed successfully");
      return data;
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsAnalysing(false);
    }
  };

  return { analyse, isAnalysing, result, setResult };
};
