"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeftIcon, LockClosedIcon, CheckCircledIcon, ExclamationTriangleIcon, EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Invalid or missing reset token");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      checks: {
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
      }
    };
  };

  const passwordValidation = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordValidation.isValid) {
      setError("Password does not meet security requirements");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>
        
        <div className="relative w-full max-w-md">
          <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircledIcon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Password Reset Successfully</CardTitle>
              <CardDescription className="text-white/70">
                Your password has been updated. You can now log in with your new password.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert className="bg-green-500/20 border-green-500/50 text-green-100">
                <CheckCircledIcon className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Redirecting you to the login page in a few seconds...
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => router.push('/admin/login')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2.5"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>
      
      <div className="relative w-full max-w-md">
        <div className="mb-6">
          <Link 
            href="/admin/login" 
            className="inline-flex items-center text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to login
          </Link>
        </div>

        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <LockClosedIcon className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Set New Password</CardTitle>
            <CardDescription className="text-white/70">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-500/20 border-red-500/50 text-red-100">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400 focus:ring-purple-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeClosedIcon className="w-4 h-4" /> : <EyeOpenIcon className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {password && (
                  <div className="text-xs text-white/70 space-y-1">
                    <div className={`flex items-center ${passwordValidation.checks.minLength ? 'text-green-400' : 'text-red-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${passwordValidation.checks.minLength ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      At least 8 characters
                    </div>
                    <div className={`flex items-center ${passwordValidation.checks.hasUpperCase ? 'text-green-400' : 'text-red-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${passwordValidation.checks.hasUpperCase ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      One uppercase letter
                    </div>
                    <div className={`flex items-center ${passwordValidation.checks.hasLowerCase ? 'text-green-400' : 'text-red-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${passwordValidation.checks.hasLowerCase ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      One lowercase letter
                    </div>
                    <div className={`flex items-center ${passwordValidation.checks.hasNumbers ? 'text-green-400' : 'text-red-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${passwordValidation.checks.hasNumbers ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      One number
                    </div>
                    <div className={`flex items-center ${passwordValidation.checks.hasSpecialChar ? 'text-green-400' : 'text-red-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${passwordValidation.checks.hasSpecialChar ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      One special character
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/90">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400 focus:ring-purple-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                  >
                    {showConfirmPassword ? <EyeClosedIcon className="w-4 h-4" /> : <EyeOpenIcon className="w-4 h-4" />}
                  </button>
                </div>
                
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-400">Passwords do not match</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2.5 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                disabled={loading || !passwordValidation.isValid || password !== confirmPassword}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Updating password...
                  </div>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
