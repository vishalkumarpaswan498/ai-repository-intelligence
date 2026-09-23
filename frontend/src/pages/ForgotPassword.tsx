import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const data = await api(
        "/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify({
            email,
          }),
        }
      );

      localStorage.setItem(
        "resetEmail",
        email
      );

      navigate("/reset-password");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="text-3xl font-bold text-white"
          >
            Repo<span className="text-blue-500">Intel</span>
          </Link>

          <p className="mt-2 text-sm text-slate-400">
            AI-Powered Repository Intelligence
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white">
            Forgot password?
          </h1>

          <p className="mt-2 text-slate-400">
            Enter your email address and we'll send
            you a verification OTP.
          </p>

          <form
            onSubmit={handleForgotPassword}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email Address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Sending OTP..."
                : "Send OTP"}
            </button>
          </form>

          {message && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {message}
            </div>
          )}

          <p className="mt-6 text-center text-sm text-slate-400">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;