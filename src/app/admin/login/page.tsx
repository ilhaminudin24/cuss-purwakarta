"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

// Create a separate component for the login form
function LoginForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Debug logs
  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
  }, [session, status]);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      console.log("User is authenticated, redirecting to /admin");
      router.push('/admin');
      router.refresh();
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      console.log("Attempting sign in...");
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl
      });

      console.log("Sign in result:", result);

      if (result?.error) {
        if (result.error === "Invalid credentials") {
          setError("Email atau password salah. Silakan coba lagi.");
        } else if (result.error === "Missing credentials") {
          setError("Mohon isi email dan password.");
        } else {
          setError("Gagal masuk. " + result.error);
        }
        return;
      }

      if (result?.ok) {
        console.log("Login successful, redirecting...");
        // Try multiple redirection methods
        window.location.href = '/admin';
        // Fallback redirections
        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 100);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetMessage(null);
    setResetLoading(true);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, newPassword: resetPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetMessage("Password reset successful! You can now log in.");
        setResetEmail("");
        setResetPassword("");
      } else {
        setResetMessage(data.error || "Failed to reset password.");
      }
    } catch {
      setResetMessage("Failed to reset password. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="CUSS Purwakarta"
              width={150}
              height={150}
              className="mx-auto"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sedang Masuk...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </div>
        </form>
        <div className="text-center mt-2">
          <button
            className="text-indigo-600 hover:underline text-sm"
            onClick={() => setShowReset((v) => !v)}
            type="button"
          >
            {showReset ? "Back to Login" : "Forgot Password?"}
          </button>
        </div>
        {showReset && (
          <form className="mt-4 space-y-4" onSubmit={handleReset}>
            <div>
              <input
                type="email"
                placeholder="Enter your admin email"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Enter new password"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={resetLoading}
              className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetLoading ? "Resetting..." : "Reset Password"}
            </button>
            {resetMessage && (
              <div className={`text-center text-sm ${resetMessage.includes("success") ? "text-green-600" : "text-red-500"}`}>
                {resetMessage}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
} 