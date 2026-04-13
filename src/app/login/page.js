"use client";

import { useState, useEffect, useRef, useId } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";

const MAX_USERNAME_LEN = 254;

export default function Login() {
  const formId = useId();
  const usernameId = `${formId}-username`;
  const passwordId = `${formId}-password`;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const passwordRef = useRef(null);

  const trimmedUsername = username.trim();

  const canSubmit =
    trimmedUsername.length > 0 &&
    password.length > 0 &&
    trimmedUsername.length <= MAX_USERNAME_LEN &&
    password.length <= 128;

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      router.replace("/");
    }
  }, [status, session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!trimmedUsername || !password) {
      setError("Enter your username and password.");
      return;
    }
    if (trimmedUsername.length > MAX_USERNAME_LEN || password.length > 128) {
      setError("Username or password is too long.");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        username: trimmedUsername,
        password,
        callbackUrl: "/",
      });

      if (res?.ok) {
        router.push("/");
        return;
      }

      setError(
        "Sign-in failed. Check your username and password, then try again."
      );
      setPassword("");
      passwordRef.current?.focus();
    } catch {
      setError(
        "Could not reach the server. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-100 px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200/80 via-slate-100 to-slate-100"
        aria-hidden
      />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20 ring-1 ring-white/10">
            <ShieldCheck className="h-8 w-8 text-sky-400" aria-hidden />
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Onyx workspace — use your admin username and password.
            </p>
          </div>

          <p className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-center text-xs text-slate-600">
            Sessions expire after{" "}
            <span className="font-semibold text-slate-800">2 hours</span> for
            security. Use a strong, unique password.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
            noValidate
            autoComplete="on"
          >
            <div>
              <label
                htmlFor={usernameId}
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Username <span className="text-red-600">*</span>
              </label>
              <input
                id={usernameId}
                name="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                maxLength={MAX_USERNAME_LEN}
                placeholder="e.g. onyxdrycleaners"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-describedby={error ? `${formId}-error` : undefined}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:ring-offset-0"
              />
            </div>

            <div>
              <label
                htmlFor={passwordId}
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  id={passwordId}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  maxLength={128}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(error)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-11 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !canSubmit}
              title={
                !canSubmit
                  ? "Enter username and password (max lengths apply)"
                  : undefined
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>

            <div
              id={`${formId}-error`}
              role="alert"
              aria-live="polite"
              className="min-h-[1.25rem]"
            >
              {error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-800">
                  {error}
                </p>
              ) : null}
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Only sign in from devices you trust. Never share your password.
        </p>
      </div>
    </div>
  );
}
