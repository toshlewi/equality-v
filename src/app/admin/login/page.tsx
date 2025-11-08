"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password. Please try again.",
  AccessDenied: "Access denied. Please contact an administrator if you believe this is a mistake.",
  AccountDisabled: "Your account has been disabled. Please reach out to an administrator.",
};

function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = useMemo(() => params?.get("callbackUrl") ?? "/admin", [params]);
  const queryError = params?.get("error");

  useEffect(() => {
    if (queryError) {
      setError(ERROR_MESSAGES[queryError] ?? "Unable to sign in. Please try again.");
    } else {
      setError(null);
    }
  }, [queryError]);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (response?.error) {
      setError(ERROR_MESSAGES[response.error] ?? "Invalid email or password. Please try again.");
      return;
    }

    router.replace(response?.url ?? callbackUrl);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-brand-teal">
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f9d60' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
          }}
        />
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to main site
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl p-6">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-brand-yellow">
              <svg className="w-6 h-6 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-white/70">Enter your credentials to access the admin dashboard</p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-100 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold">Login Failed</h3>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-white/90 text-sm font-medium">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@equalityvanguard.org"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 rounded-md transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-white/90 text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 rounded-md transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-yellow text-brand-teal font-medium py-2.5 rounded-md transition-all duration-200 transform hover:scale-[1.02] hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin mr-2" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="text-center">
              <Link
                href="/admin/forgot-password"
                className="text-white/70 hover:text-white transition-colors text-sm"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="text-center text-xs text-white/50 rounded-lg p-3 bg-brand-yellow/10">
              <svg className="w-4 h-4 inline mr-1 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              This is a secure admin area. All activities are logged and monitored.
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-white/50 text-sm">
          <p>Equality Vanguard Admin Portal</p>
          <p className="text-xs mt-1">© 2024 All rights reserved</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-brand-teal">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}