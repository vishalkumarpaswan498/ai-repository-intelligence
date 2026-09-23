import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Bell,
  Shield,
  Save,
  LoaderCircle,
  CheckCircle2,
  CircleAlert,
  KeyRound,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

type UserData = {
  name: string;
  email: string;
  preferences: {
    analysisNotifications: boolean;
    systemNotifications: boolean;
  };
};

function Settings() {
  const navigate = useNavigate();

  const [user, setUser] =
    useState<UserData>({
      name: "",
      email: "",
      preferences: {
        analysisNotifications: true,
        systemNotifications: true,
      },
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);

        const data = await api("/users/profile");

        setUser({
          name: data.user?.name || "",
          email: data.user?.email || "",
          preferences: {
            analysisNotifications: data.user?.preferences?.analysisNotifications ?? true,
            systemNotifications: data.user?.preferences?.systemNotifications ?? true,
          },
        });
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

const handleSave = async (
  event: React.FormEvent
) => {
  event.preventDefault();

  try {
    setSaving(true);
    setMessage("");
    setError("");

    const data = await api("/users/profile", {
      method: "PUT",
      body: JSON.stringify({
        name: user.name,
        preferences: user.preferences,
      }),
    });

    setUser({
      name: data.user?.name || user.name,
      email: data.user?.email || user.email,
      preferences: {
        analysisNotifications: data.user?.preferences?.analysisNotifications ?? true,
        systemNotifications: data.user?.preferences?.systemNotifications ?? true,
      },
    });
    

    setMessage(
      data.message || "Profile updated successfully"
    );
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Failed to save settings"
    );
  } finally {
    setSaving(false);
  }
};

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center gap-3 text-slate-400">

        <LoaderCircle
          size={26}
          className="animate-spin"
        />

        Loading settings...

      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-950 p-6 text-white">

      <div className="mx-auto max-w-5xl">

        {/* Header */}

        <section className="mb-10">

          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-blue-400">
            ACCOUNT SETTINGS
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            Settings
          </h1>

          <p className="mt-3 text-slate-400">
            Manage your account, preferences,
            and security settings.
          </p>

        </section>


        {/* Success Message */}

        {message && (

          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">

            <CheckCircle2 size={20} />

            {message}

          </div>

        )}


        {/* Error Message */}

        {error && (

          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">

            <CircleAlert size={20} />

            {error}

          </div>

        )}


        <form
          onSubmit={handleSave}
          className="space-y-6"
        >

          {/* Profile */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-start gap-4">

              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">

                <User size={24} />

              </div>

              <div>

                <h2 className="text-xl font-semibold">
                  Profile
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Update your personal account
                  information.
                </p>

              </div>

            </div>


            <div className="mt-8 grid gap-5 md:grid-cols-2">

              {/* Name */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Full Name
                </label>

                <input
                  type="text"
                  value={user.name}
                  onChange={(event) =>
                    setUser({
                      ...user,
                      name: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                />

              </div>


              {/* Email */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-950 py-3 pl-11 pr-4 text-sm text-slate-500 outline-none"
                  />

                </div>

              </div>

            </div>

          </section>


          {/* Preferences */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-start gap-4">

              <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">

                <Bell size={24} />

              </div>

              <div>

                <h2 className="text-xl font-semibold">
                  Preferences
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Configure your application preferences.
                </p>

              </div>

            </div>


            <div className="mt-8 divide-y divide-slate-800">

              <div className="flex items-center justify-between py-5">

                <div>

                  <h3 className="font-medium">
                    Analysis Notifications
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Get notified when repository
                    analyses are completed.
                  </p>

                </div>

                <input
  type="checkbox"
  checked={user.preferences.analysisNotifications}
  onChange={(event) =>
    setUser({
      ...user,
      preferences: {
        ...user.preferences,
        analysisNotifications: event.target.checked,
      },
    })
  }
  className="h-5 w-5 accent-blue-600"
/>

              </div>


              <div className="flex items-center justify-between py-5">

                <div>

                  <h3 className="font-medium">
                    System Notifications
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Receive important system updates.
                  </p>

                </div>

               <input
  type="checkbox"
  checked={user.preferences.systemNotifications}
  onChange={(event) =>
    setUser({
      ...user,
      preferences: {
        ...user.preferences,
        systemNotifications: event.target.checked,
      },
    })
  }
  className="h-5 w-5 accent-blue-600"
/>

              </div>

            </div>

          </section>


          {/* Security */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-start gap-4">

              <div className="rounded-xl bg-green-500/10 p-3 text-green-400">

                <Shield size={24} />

              </div>

              <div>

                <h2 className="text-xl font-semibold">
                  Security
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Manage your account security.
                </p>

              </div>

            </div>


            <div className="mt-8">

              <button
                type="button"
                onClick={() =>
                  navigate("/change-password")
                }
                className="flex items-center gap-3 rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:text-white"
              >

                <KeyRound size={18} />

                Change Password

              </button>

            </div>

          </section>


          {/* Save */}

          <div className="flex justify-end">

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {saving ? (

                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />

              ) : (

                <Save size={18} />

              )}

              {saving
                ? "Saving..."
                : "Save Changes"}

            </button>

          </div>

        </form>


        {/* Logout */}

        <section className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

            <div>

              <h2 className="font-semibold text-red-300">
                Sign out
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Sign out from your AI Repository
                Intelligence account.
              </p>

            </div>


            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-500/40 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
            >

              <LogOut size={18} />

              Logout

            </button>

          </div>

        </section>

      </div>

    </div>
  );
}

export default Settings;