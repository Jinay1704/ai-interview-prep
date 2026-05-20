import { createContext, useContext, useState } from "react";

const InterviewContext = createContext(null);

export const InterviewProvider = ({ children }) => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");

  return (
    <InterviewContext.Provider
      value={{ selectedJob, setSelectedJob, selectedDifficulty, setSelectedDifficulty }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterviewContext = () => {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error("useInterviewContext must be used inside InterviewProvider");
  return ctx;
};
