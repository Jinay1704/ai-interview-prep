import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BrainCircuit, Mic, FileText, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/layout/Footer";

const features = [
  {
    icon: <BrainCircuit className="h-6 w-6 text-primary" />,
    title: "AI-Generated Questions",
    desc: "Paste any job description and Gemini AI generates tailored interview questions at your chosen difficulty.",
  },
  {
    icon: <FileText className="h-6 w-6 text-primary" />,
    title: "Resume Analysis",
    desc: "Upload your PDF resume and get an instant ATS score, keyword gaps and actionable suggestions.",
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-primary" />,
    title: "Detailed Feedback",
    desc: "Per-answer feedback plus an overall score, strengths, improvement areas and recommended resources.",
  },
];

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center space-y-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
            <BrainCircuit className="h-4 w-4" />
            Powered by Gemini AI
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Ace your next interview with{" "}
            <span className="text-primary">AI coaching</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload your resume, practise with an AI interviewer, and get actionable feedback — all in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isSignedIn ? (
              <Button size="lg" onClick={() => navigate("/jobs/new")}>
                Start Interview <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button size="lg" onClick={() => navigate("/login")}>
                Get started free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
            <Button size="lg" variant="outline" onClick={() => navigate(isSignedIn ? "/resume" : "/login")}>
              Analyse my resume
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 pb-24">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
