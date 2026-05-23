import { useState } from "react";
import { Check, X, Zap, Shield, Crown, Sparkles, CreditCard, Lock } from "lucide-react";
import { cn } from "@/utils/helpers";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    icon: Zap,
    color: "#6b7280",
    bg: "from-gray-100 to-gray-50",
    ring: "border-gray-200",
    badge: null,
    limits: { interviews: 1, questions: 5, resumes: 10, voice: false, priority: false },
    features: [
      { text: "1 interview total", ok: true },
      { text: "5 questions per interview", ok: true },
      { text: "10 resume analyses", ok: true },
      { text: "Voice interview mode", ok: false },
      { text: "Priority support", ok: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    icon: Shield,
    color: "#2563eb",
    bg: "from-blue-50 to-blue-50/30",
    ring: "border-blue-400",
    badge: "Most Popular",
    limits: { interviews: 10, questions: 1000, resumes: -1, voice: true, priority: false },
    features: [
      { text: "10 interviews / month", ok: true },
      { text: "1,000 questions", ok: true },
      { text: "Unlimited resume analyses", ok: true },
      { text: "Voice interview mode", ok: true },
      { text: "Priority support", ok: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 49,
    icon: Crown,
    color: "#7c3aed",
    bg: "from-violet-50 to-violet-50/30",
    ring: "border-violet-400",
    badge: "Best Value",
    limits: { interviews: 500, questions: -1, resumes: -1, voice: true, priority: true },
    features: [
      { text: "500 interviews", ok: true },
      { text: "Unlimited questions", ok: true },
      { text: "Unlimited resume analyses", ok: true },
      { text: "Voice interview mode", ok: true },
      { text: "24/7 priority support", ok: true },
    ],
  },
];

// ── Minimal input component ───────────────────────────────────────────────────
function Field({ label, id, ...props }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        {...props}
      />
    </div>
  );
}

// ── Single plan card ──────────────────────────────────────────────────────────
function PlanCard({ plan, isActive, isCurrent, onClick }) {
  const Icon = plan.icon;
  return (
    <div
      onClick={() => !isCurrent && onClick(plan.id)}
      className={cn(
        "relative flex flex-col rounded-2xl border-2 p-5 transition-all duration-200",
        `bg-gradient-to-b ${plan.bg}`,
        isCurrent
          ? "opacity-60 cursor-default border-muted"
          : isActive
          ? cn("cursor-pointer shadow-md scale-[1.02]", plan.ring)
          : "cursor-pointer border-border hover:border-muted-foreground/40"
      )}
    >
      {plan.badge && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-bold text-white whitespace-nowrap"
          style={{ background: plan.color }}
        >
          {plan.badge}
        </span>
      )}

      {/* Icon + name */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: plan.color + "1a" }}>
          <Icon className="h-4.5 w-4.5" style={{ color: plan.color }} size={18} />
        </div>
        <div>
          <p className="font-bold text-sm text-foreground">{plan.name}</p>
          {isCurrent && <p className="text-[10px] text-muted-foreground leading-tight">Current</p>}
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        {plan.price === 0 ? (
          <p className="text-2xl font-black text-foreground">Free</p>
        ) : (
          <p className="text-2xl font-black text-foreground">
            ${plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-2 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className={cn(
              "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
              f.ok ? "bg-green-100" : "bg-muted"
            )}>
              {f.ok
                ? <Check size={10} className="text-green-600" />
                : <X size={10} className="text-muted-foreground" />}
            </span>
            <span className={f.ok ? "text-foreground" : "text-muted-foreground line-through decoration-muted-foreground/40"}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      {/* Select indicator */}
      {!isCurrent && (
        <div className={cn(
          "mt-4 w-full py-2 rounded-lg text-xs font-semibold text-center transition-colors",
          isActive
            ? "text-white"
            : "bg-muted text-muted-foreground"
        )}
          style={isActive ? { background: plan.color } : {}}
        >
          {isActive ? "✓ Selected" : plan.price === 0 ? "Free forever" : `Choose ${plan.name}`}
        </div>
      )}
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function PricingModal({ isOpen, onClose, currentPlan = "free", onUpgrade }) {
  const [step, setStep]               = useState("plans");   // plans | pay | success
  const [chosenId, setChosenId]       = useState(null);
  const [card, setCard]               = useState({ name: "", number: "", expiry: "", cvc: "" });
  const [errors, setErrors]           = useState({});
  const [processing, setProcessing]   = useState(false);

  if (!isOpen) return null;

  const chosen = PLANS.find((p) => p.id === chosenId);

  const reset = () => {
    setStep("plans");
    setChosenId(null);
    setCard({ name: "", number: "", expiry: "", cvc: "" });
    setErrors({});
    setProcessing(false);
  };

  const handleClose = () => { reset(); onClose(); };

  // ── validation (accepts ANY dummy values as long as fields are filled) ──────
  const validate = () => {
    const e = {};
    if (!card.name.trim())   e.name   = "Name is required";
    if (card.number.replace(/\s/g, "").length < 8) e.number = "Enter a valid card number";
    if (!card.expiry.trim()) e.expiry = "Expiry is required";
    if (card.cvc.length < 3) e.cvc   = "CVC must be at least 3 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const formatCardNumber = (v) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setProcessing(true);
    // Simulate processing delay — no real payment
    await new Promise((r) => setTimeout(r, 1600));
    setProcessing(false);
    setStep("success");
    if (onUpgrade) onUpgrade(chosenId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal box */}
      <div className="relative w-full max-w-3xl bg-background rounded-3xl shadow-2xl border border-border overflow-hidden max-h-[92vh] flex flex-col">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="px-7 py-6 border-b border-border flex items-center justify-between shrink-0">
          <div>
            {step === "plans" && (
              <>
                <div className="flex items-center gap-1.5 text-primary text-xs font-semibold mb-1">
                  <Sparkles size={12} /> Pricing Plans
                </div>
                <h2 className="text-xl font-black text-foreground">Choose your plan</h2>
                <p className="text-muted-foreground text-sm">Unlock more features by upgrading</p>
              </>
            )}
            {step === "pay" && (
              <>
                <h2 className="text-xl font-black text-foreground">Payment details</h2>
                <p className="text-muted-foreground text-sm">
                  Upgrading to <span className="font-semibold" style={{ color: chosen?.color }}>{chosen?.name}</span> — ${chosen?.price}/mo
                </p>
              </>
            )}
            {step === "success" && (
              <h2 className="text-xl font-black text-foreground">You're upgraded! 🎉</h2>
            )}
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 p-7">

          {/* STEP 1 — Plan selection */}
          {step === "plans" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PLANS.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isActive={chosenId === plan.id}
                    isCurrent={plan.id === currentPlan}
                    onClick={setChosenId}
                  />
                ))}
              </div>

              {chosenId && chosenId !== currentPlan && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setStep(chosen.price === 0 ? "success" : "pay")}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                    style={{ background: chosen.color }}
                  >
                    Continue with {chosen.name} →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 — Payment form */}
          {step === "pay" && chosen && (
            <div className="max-w-sm mx-auto space-y-5">
              {/* Plan recap */}
              <div className={cn("rounded-2xl border-2 p-4 bg-gradient-to-b", chosen.bg, chosen.ring)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: chosen.color + "1a" }}>
                      <chosen.icon size={16} style={{ color: chosen.color }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">{chosen.name} Plan</p>
                      <p className="text-[11px] text-muted-foreground">Billed monthly · cancel anytime</p>
                    </div>
                  </div>
                  <p className="text-xl font-black text-foreground">${chosen.price}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                </div>
              </div>

              {/* Demo notice */}
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5">
                <p className="text-xs font-semibold text-amber-800">Demo mode — no real charge</p>
                <p className="text-[11px] text-amber-700 mt-0.5">Enter any dummy card details to upgrade.</p>
              </div>

              {/* Card form */}
              <div className="space-y-3">
                <Field
                  label="Cardholder name"
                  id="card-name"
                  placeholder="Your Name"
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                  autoComplete="cc-name"
                />
                {errors.name && <p className="text-xs text-destructive -mt-1">{errors.name}</p>}

                <div>
                  <Field
                    label="Card number"
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    maxLength={19}
                  />
                  {errors.number && <p className="text-xs text-destructive mt-1">{errors.number}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Field
                      label="Expiry (MM/YY)"
                      id="card-expiry"
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      maxLength={5}
                    />
                    {errors.expiry && <p className="text-xs text-destructive mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <Field
                      label="CVC"
                      id="card-cvc"
                      placeholder="123"
                      value={card.cvc}
                      onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      maxLength={4}
                    />
                    {errors.cvc && <p className="text-xs text-destructive mt-1">{errors.cvc}</p>}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setStep("plans")}
                  className="flex-1 py-2.5 rounded-xl border border-input text-sm font-medium hover:bg-muted transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handlePay}
                  disabled={processing}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-70 disabled:cursor-wait"
                  style={{ background: chosen.color }}
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Processing…
                    </>
                  ) : (
                    <>
                      <Lock size={13} />
                      Pay ${chosen.price}/mo
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                <CreditCard size={12} /> Secured · Demo environment
              </p>
            </div>
          )}

          {/* STEP 3 — Success */}
          {step === "success" && chosen && (
            <div className="text-center max-w-xs mx-auto py-4 space-y-5">
              <div
                className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                style={{ background: chosen.color + "1a" }}
              >
                <Check size={40} style={{ color: chosen.color }} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground">Welcome to {chosen.name}!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {chosen.price === 0
                    ? "You're on the free plan."
                    : "Your plan is now active. All features are unlocked."}
                </p>
              </div>

              <div className="bg-muted/40 rounded-xl p-4 text-left space-y-2">
                {chosen.features.filter((f) => f.ok).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check size={13} className="text-green-600 shrink-0" />
                    <span className="text-foreground">{f.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
                style={{ background: chosen.color }}
              >
                Start using {chosen.name} →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}