import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserPlus } from "lucide-react";
import { signUp, useSession } from "@/store/authStore";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

export function RegisterPage() {
  const { t } = useTranslation();
  usePageTitle(t("auth.registerTitle"));
  const navigate = useNavigate();
  const { session, profile, initializing } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initializing || !session || !profile) return;
    navigate(profile.shopId ? "/" : "/add-shop", { replace: true });
  }, [initializing, session, profile, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    setSubmitting(true);
    setError(null);
    const err = await signUp(email, password);
    setSubmitting(false);
    if (err) setError(err);
  }

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-maroon-100 text-maroon-700">
          <UserPlus className="h-5 w-5" />
        </span>
        <h1 className="mt-4 font-display text-xl font-semibold text-ink-900">
          {t("auth.registerTitle")}
        </h1>
        <p className="mt-1 text-sm text-ink-700/60">{t("auth.registerSubtitle")}</p>

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
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <div>
            <Label required>{t("auth.confirmPasswordLabel")}</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? t("admin.saving") : t("auth.registerButton")}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-700/60">
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="font-medium text-maroon-700 hover:underline">
            {t("auth.loginLink")}
          </Link>
        </p>
      </Card>
    </Container>
  );
}
