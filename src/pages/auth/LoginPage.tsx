import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import { signIn, useSession } from "@/store/authStore";
import { useShops } from "@/store/shopsStore";
import { dashboardPathForProfile } from "@/lib/dashboardPath";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

export function LoginPage() {
  const { t } = useTranslation();
  usePageTitle(t("auth.loginTitle"));
  const navigate = useNavigate();
  const { session, profile, initializing } = useSession();
  const shops = useShops();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initializing || !session || !profile) return;
    navigate(dashboardPathForProfile(profile, shops), { replace: true });
  }, [initializing, session, profile, shops, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const err = await signIn(email, password);
    setSubmitting(false);
    if (err) setError(err);
  }

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-maroon-100 text-maroon-700">
          <Lock className="h-5 w-5" />
        </span>
        <h1 className="mt-4 font-display text-xl font-semibold text-ink-900">
          {t("auth.loginTitle")}
        </h1>
        <p className="mt-1 text-sm text-ink-700/60">{t("auth.loginSubtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <Label required>{t("auth.emailLabel")}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <Label required>{t("auth.passwordLabel")}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? t("admin.saving") : t("auth.loginButton")}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-700/60">
          {t("auth.noAccount")}{" "}
          <Link to="/register" className="font-medium text-maroon-700 hover:underline">
            {t("auth.registerLink")}
          </Link>
        </p>
      </Card>
    </Container>
  );
}
