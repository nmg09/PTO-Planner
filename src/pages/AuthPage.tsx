import { FormEvent, useState } from "react";
import { CalendarCheck2, KeyRound, Mail } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Inputs";
import { useAuth } from "../state/AuthContext";

export const AuthPage = () => {
  const { configured, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    const result =
      mode === "signin" ? await signIn(email, password) : await signUp(email, password);

    setBusy(false);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    if (mode === "signup") {
      setMessage("Account created. Check your email for confirmation if required by Supabase.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <div className="mb-4 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-sky-500 to-sky-600 text-white">
            <CalendarCheck2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Leave Harmony</h1>
          <p className="text-center text-sm text-slate-500">
            Sign in to access your planner.
          </p>
        </div>

        {!configured && (
          <p className="mb-3 rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Supabase is not configured. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
          </p>
        )}

        <div className="mb-3 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={mode === "signin" ? "primary" : "secondary"}
            onClick={() => setMode("signin")}
          >
            Sign in
          </Button>
          <Button
            type="button"
            variant={mode === "signup" ? "primary" : "secondary"}
            onClick={() => setMode("signup")}
          >
            Sign up
          </Button>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <label className="space-y-1 text-xs">
            Email
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </label>

          <label className="space-y-1 text-xs">
            Password
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                type="password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </div>
          </label>

          {message && (
            <p className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-700">{message}</p>
          )}

          <Button type="submit" className="w-full" disabled={busy || !configured}>
            {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>
      </Card>
    </div>
  );
};
