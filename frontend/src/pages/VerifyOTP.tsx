import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";

function VerifyOTP() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const email = localStorage.getItem(
    "verificationEmail"
  );

  const handleVerifyOTP = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!email) {
      setMessage(
        "Email not found. Please register again."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = await api("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );
      }

      localStorage.removeItem(
        "verificationEmail"
      );

      navigate("/dashboard");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "OTP verification failed"
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
            Verify your email
          </h1>

          <p className="mt-2 text-slate-400">
            Enter the OTP sent to your email address.
          </p>

          {email && (
            <p className="mt-2 text-sm text-blue-400">
              {email}
            </p>
          )}

          <form
            onSubmit={handleVerifyOTP}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Verification OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value)
                }
                maxLength={6}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-center text-xl tracking-[0.5em] text-white outline-none transition focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Verifying..."
                : "Verify Email"}
            </button>
          </form>

          {message && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {message}
            </div>
          )}

          <p className="mt-6 text-center text-sm text-slate-400">
            Wrong email?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              Register again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;