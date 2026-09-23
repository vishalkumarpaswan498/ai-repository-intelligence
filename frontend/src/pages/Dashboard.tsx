import { useEffect, useState } from "react";
import {
  Database,
  BarChart3,
  CheckCircle2,
  LoaderCircle,
  CircleAlert,
  Activity,
  HeartPulse,
  Clock3,
  ArrowRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

type DashboardData = {
  totalRepositories: number;
  totalAnalyses: number;
  completedAnalyses: number;
  pendingAnalyses: number;
  analyzingAnalyses: number;
  failedAnalyses: number;
  averageHealthScore: number;

  recentAnalyses: {
    _id: string;

    repository?: {
      _id: string;
      name: string;
      githubUrl?: string;
    };

    status:
      | "pending"
      | "analyzing"
      | "completed"
      | "failed";

    healthScore?: number;

    riskLevel?:
      | "low"
      | "medium"
      | "high"
      | "critical";

    createdAt?: string;
    completedAt?: string;
  }[];
};

function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await api(
          "/dashboard/summary"
        );

        setDashboard(data.dashboard);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-slate-400">

        <LoaderCircle
          size={28}
          className="mr-3 animate-spin"
        />

        Loading dashboard...

      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">

        <CircleAlert
          size={42}
          className="mb-4 text-red-400"
        />

        <h2 className="text-2xl font-bold text-white">
          Dashboard Error
        </h2>

        <p className="mt-3 text-slate-400">
          {error}
        </p>

        <button
          onClick={() =>
            window.location.reload()
          }
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Try Again
        </button>

      </div>
    );
  }

  const stats = [
    {
      title: "Total Repositories",
      value: dashboard?.totalRepositories ?? 0,
      icon: <Database size={24} />,
      description:
        "Repositories connected to your account.",
    },

    {
      title: "Total Analyses",
      value: dashboard?.totalAnalyses ?? 0,
      icon: <BarChart3 size={24} />,
      description:
        "Repository analyses created so far.",
    },

    {
      title: "Completed",
      value: dashboard?.completedAnalyses ?? 0,
      icon: <CheckCircle2 size={24} />,
      description:
        "Successfully completed analyses.",
    },

    {
  title: "Active Analyses",
  value:
    (dashboard?.analyzingAnalyses ?? 0) +
    (dashboard?.pendingAnalyses ?? 0),
  icon: <LoaderCircle size={24} />,
  description:
    "Analyses currently waiting or running.",
},
  ];

  const healthScore =
    dashboard?.averageHealthScore ?? 0;

  return (
    <div className="min-h-full bg-slate-950 p-6 text-white">

      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <section className="mb-10">

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

            <div>

              <p className="mb-3 text-xs font-bold tracking-[0.2em] text-blue-400">
                AI REPOSITORY INTELLIGENCE
              </p>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Dashboard Overview
              </h1>

              <p className="mt-3 max-w-2xl text-slate-400">
                Monitor your repositories, AI-powered
                analysis activity, repository health,
                and software intelligence insights.
              </p>

            </div>


            <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-4">

              <div className="rounded-lg bg-green-500/10 p-2 text-green-400">
                <Activity size={20} />
              </div>

              <div>

                <p className="text-xs text-green-400">
                  SYSTEM STATUS
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  All Systems Operational
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* Stats Grid */}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          {stats.map((stat) => (

            <div
              key={stat.title}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-blue-500/40"
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-slate-400">
                    {stat.title}
                  </p>

                  <p className="mt-3 text-4xl font-bold">
                    {stat.value}
                  </p>

                </div>


                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">

                  {stat.icon}

                </div>

              </div>


              <p className="mt-5 text-sm leading-6 text-slate-500">
                {stat.description}
              </p>

            </div>

          ))}

        </section>


        {/* Health + Status */}

        <section className="mt-6 grid gap-6 lg:grid-cols-2">


          {/* Health Score */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-bold tracking-[0.2em] text-blue-400">
                  REPOSITORY HEALTH
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Average Health Score
                </h2>

              </div>


              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">

                <HeartPulse size={24} />

              </div>

            </div>


            <div className="mt-10 flex items-end gap-2">

              <span className="text-6xl font-bold">
                {healthScore}
              </span>

              <span className="mb-2 text-lg text-slate-500">
                /100
              </span>

            </div>


            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800">

              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-700"
                style={{
                  width: `${Math.min(
                    Math.max(healthScore, 0),
                    100
                  )}%`,
                }}
              />

            </div>


            <p className="mt-5 text-sm text-slate-400">

              {healthScore >= 80
                ? "Excellent repository health across your projects."
                : healthScore >= 60
                  ? "Your repositories are in good condition but may need improvements."
                  : healthScore > 0
                    ? "Some repositories may require attention and code improvements."
                    : "Complete repository analyses to generate health insights."}

            </p>

          </div>


          {/* Analysis Status */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-bold tracking-[0.2em] text-blue-400">
                  ANALYSIS ACTIVITY
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Analysis Status
                </h2>

              </div>


              <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">

                <Activity size={24} />

              </div>

            </div>


            <div className="mt-8 space-y-5">

              <StatusRow
                label="Completed"
                value={
                  dashboard?.completedAnalyses ?? 0
                }
                color="bg-green-500"
              />

              <StatusRow
                label="Pending"
                value={
                  dashboard?.pendingAnalyses ?? 0
                }
                color="bg-yellow-500"
              />

              <StatusRow
                label="Analyzing"
                value={
                  dashboard?.analyzingAnalyses ?? 0
                }
                color="bg-blue-500"
              />

              <StatusRow
                label="Failed"
                value={
                  dashboard?.failedAnalyses ?? 0
                }
                color="bg-red-500"
              />

            </div>

          </div>

        </section>

        {/* Recent Analyses */}

<section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

    <div>
      <p className="text-xs font-bold tracking-[0.2em] text-blue-400">
        RECENT ACTIVITY
      </p>

      <h2 className="mt-2 text-2xl font-bold">
        Recent Analyses
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        Your latest repository analysis activity.
      </p>
    </div>

    <button
      onClick={() => navigate("/analyses")}
      className="flex items-center gap-2 text-sm font-medium text-blue-400 transition hover:text-blue-300"
    >
      View All
      <ArrowRight size={17} />
    </button>

  </div>


  {(dashboard?.recentAnalyses?.length ?? 0) === 0 ? (

    <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center">

      <Clock3
        size={28}
        className="mx-auto text-slate-500"
      />

      <p className="mt-3 text-sm text-slate-400">
        No recent analyses available.
      </p>

    </div>

  ) : (

    <div className="mt-6 space-y-3">

      {dashboard?.recentAnalyses.map(
        (analysis) => (

          <div
            key={analysis._id}
            className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-blue-500/40 md:flex-row md:items-center md:justify-between"
          >

            <div className="flex items-center gap-4">

              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <BarChart3 size={20} />
              </div>

              <div>

                <h3 className="font-semibold text-white">
                  {analysis.repository?.name ||
                    "Unknown Repository"}
                </h3>

                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">

                  <span>
                    Health:{" "}
                    {analysis.healthScore ?? 0}/100
                  </span>

                  {analysis.createdAt && (
                    <span>
                      {new Date(
                        analysis.createdAt
                      ).toLocaleString()}
                    </span>
                  )}

                </div>

              </div>

            </div>


            <div className="flex flex-wrap items-center gap-3">

              {/* Status */}

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  analysis.status === "completed"
                    ? "bg-green-500/10 text-green-400"
                    : analysis.status === "analyzing"
                      ? "bg-blue-500/10 text-blue-400"
                      : analysis.status === "failed"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-yellow-500/10 text-yellow-400"
                }`}
              >
                {analysis.status}
              </span>


              {/* Risk */}

              {analysis.status === "completed" && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                    analysis.riskLevel === "critical"
                      ? "bg-red-500/10 text-red-400"
                      : analysis.riskLevel === "high"
                        ? "bg-orange-500/10 text-orange-400"
                        : analysis.riskLevel === "medium"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-green-500/10 text-green-400"
                  }`}
                >
                  {analysis.riskLevel ?? "low"} risk
                </span>
              )}


              <button
                onClick={() =>
                  navigate(`/analyses/${analysis._id}`)
                }
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-blue-500 hover:text-white"
              >
                View
                <ArrowRight size={15} />
              </button>

            </div>

          </div>

        )
      )}

    </div>

  )}

</section>


        {/* Quick Actions */}

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

            <div>

              <p className="text-xs font-bold tracking-[0.2em] text-blue-400">
                QUICK ACTIONS
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Continue Building
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Add repositories, start new analyses,
                and explore your AI-generated results.
              </p>

            </div>


            <div className="flex flex-wrap gap-3">

              <button
                onClick={() =>
                  navigate("/repositories")
                }
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
              >

                <Database size={18} />

                Manage Repositories

              </button>


              <button
                onClick={() =>
                  navigate("/analyses")
                }
                className="flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-blue-500 hover:text-white"
              >

                <BarChart3 size={18} />

                View Analyses

                <ArrowRight size={17} />

              </button>

            </div>

          </div>

        </section>


        {/* Empty / Activity Hint */}

        {(dashboard?.totalAnalyses ?? 0) === 0 && (

          <section className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-8">

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">

              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">

                <Clock3 size={24} />

              </div>

              <div>

                <h3 className="font-semibold">
                  Start your first AI analysis
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Add a GitHub repository and run the
                  multi-agent analysis system to see
                  health scores, issues, risks, and
                  repository insights.
                </p>

              </div>

            </div>

          </section>

        )}

      </div>

    </div>
  );
}


type StatusRowProps = {
  label: string;
  value: number;
  color: string;
};

function StatusRow({
  label,
  value,
  color,
}: StatusRowProps) {

  return (

    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div
          className={`h-3 w-3 rounded-full ${color}`}
        />

        <span className="text-sm text-slate-300">
          {label}
        </span>

      </div>


      <span className="font-semibold text-white">
        {value}
      </span>

    </div>

  );
}


export default Dashboard;