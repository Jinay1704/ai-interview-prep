import { useState, useCallback } from "react";
import { interviewService } from "@/services/interview.service";
import { toast } from "sonner";

/**
 * Manages the state machine for a live interview session.
 * Tracks current question index, answers, and submission.
 */
export const useInterview = (interview) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [results, setResults] = useState(null);

  const currentQuestion = interview?.questions?.[currentIndex];
  const isLast = currentIndex === (interview?.questions?.length ?? 0) - 1;

  const submitAnswer = useCallback(
    async ({ transcript, humeEmotions }) => {
      if (!currentQuestion) return;
      setIsSubmitting(true);
      try {
        const feedback = await interviewService.submitAnswer(interview._id, {
          questionId: currentQuestion._id,
          transcript,
          humeEmotions,
        });
        setAnswers((prev) => [...prev, { ...feedback, transcript }]);
        toast.success("Answer submitted");
        return feedback;
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentQuestion, interview]
  );

  const nextQuestion = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, (interview?.questions?.length ?? 1) - 1));
  }, [interview]);

  const completeInterview = useCallback(async () => {
    setIsCompleting(true);
    try {
      const data = await interviewService.complete(interview._id);
      setResults(data);
      return data;
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsCompleting(false);
    }
  }, [interview]);

  return {
    currentIndex,
    currentQuestion,
    answers,
    isLast,
    isSubmitting,
    isCompleting,
    results,
    submitAnswer,
    nextQuestion,
    completeInterview,
  };
};
