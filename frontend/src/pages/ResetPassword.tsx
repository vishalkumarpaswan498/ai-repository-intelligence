import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

function ResetPassword() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const email = localStorage.getItem(
    "resetEmail"
  );

  const handleResetPassword = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!email) {
      setMessage(
        "Email not found. Please request a new OTP."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setMessage(
        "Password must be at least 6 characters"
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = await api(
        "/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify({
            email,
            otp,
            password,
          }),
        }
      );

      setMessage(
        data.message ||
          "Password reset successfully"
      );

      localStorage.removeItem("resetEmail");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Password reset failed"
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
            Repo<span className="text-blue-500">
              Intel
            </span>
          </Link>

          <p className="mt-2 text-sm text-slate-400">
            AI-Powered Repository Intelligence
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

          <h1 className="text-3xl font-bold text-white">
            Reset password
          </h1>

          <p className="mt-2 text-slate-400">
            Enter the OTP sent to your email and
            choose a new password.
          </p>

          {email && (
            <p className="mt-2 text-sm text-blue-400">
              {email}
            </p>
          )}

          <form
            onSubmit={handleResetPassword}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                maxLength={6}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-center text-xl tracking-[0.5em] text-white outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                New Password
              </label>

              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                minLength={6}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                minLength={6}
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
                ? "Resetting password..."
                : "Reset Password"}
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

export default ResetPassword;