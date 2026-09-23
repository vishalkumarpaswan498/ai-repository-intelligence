import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  LoaderCircle,
  CheckCircle2,
  Clock3,
  CircleAlert,
  Eye,
  Activity,
  Search,
  Filter,
  ArrowDownUp,
} from "lucide-react";
import { api } from "../services/api";

type Analysis = {
  _id: string;
  repository: {
    _id: string;
    name: string;
    githubUrl?: string;
  };
  status: "pending" | "analyzing" | "completed" | "failed";
  healthScore?: number;
  createdAt?: string;
};

function Analyses() {
  const navigate = useNavigate();

  const [analyses, setAnalyses] = useState<
    Analysis[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

const [statusFilter, setStatusFilter] =
  useState("all");

const [sortBy, setSortBy] =
  useState("newest");

  useEffect(() => {
  const fetchAnalyses = async (
    showLoading = false
  ) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const data = await api("/analysis");

      setAnalyses(data.analyses || []);

      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to load analyses"
      );
    } finally {
      setLoading(false);
    }
  };

  // First time page load
  fetchAnalyses(true);

  // Auto refresh every 5 seconds
  const interval = setInterval(() => {
    fetchAnalyses(false);
  }, 5000);

  // Stop interval when leaving page
  return () => clearInterval(interval);

}, []);

  const filteredAnalyses = useMemo(() => {
  let result = [...analyses];

  // Search by repository name
  if (search.trim()) {
    result = result.filter((analysis) =>
      analysis.repository?.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  }

  // Filter by status
  if (statusFilter !== "all") {
    result = result.filter(
      (analysis) =>
        analysis.status === statusFilter
    );
  }

  // Sort analyses
  result.sort((a, b) => {
    if (sortBy === "oldest") {
      return (
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime()
      );
    }

    if (sortBy === "health-high") {
      return (
        (b.healthScore ?? 0) -
        (a.healthScore ?? 0)
      );
    }

    if (sortBy === "health-low") {
      return (
        (a.healthScore ?? 0) -
        (b.healthScore ?? 0)
      );
    }

    // Default: newest
    return (
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
    );
  });

  return result;
}, [
  analyses,
  search,
  statusFilter,
  sortBy,
]);

  

  const getStatusStyle = (status: string) => {
    if (status === "completed") {
      return "border-green-500/30 bg-green-500/10 text-green-400";
    }

    if (status === "analyzing") {
      return "border-blue-500/30 bg-blue-500/10 text-blue-400";
    }

    if (status === "failed") {
      return "border-red-500/30 bg-red-500/10 text-red-400";
    }

    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
  };

  const getStatusIcon = (status: string) => {
    if (status === "completed") {
      return <CheckCircle2 size={16} />;
    }

    if (status === "analyzing") {
      return (
        <LoaderCircle
          size={16}
          className="animate-spin"
        />
      );
    }

    if (status === "failed") {
      return <CircleAlert size={16} />;
    }

    return <Clock3 size={16} />;
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-slate-400">
        <LoaderCircle
          size={24}
          className="mr-3 animate-spin"
        />
        Loading analyses...
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-950 p-6 text-white">

      <div className="mx-auto max-w-7xl">

        <section className="mb-10">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>
              <p className="mb-3 text-xs font-bold tracking-[0.2em] text-blue-400">
                AI REPOSITORY INTELLIGENCE
              </p>

              <h1 className="text-3xl font-bold md:text-4xl">
                Analysis History
              </h1>

              <p className="mt-3 text-slate-400">
                Monitor all AI-powered repository analyses
                and view their results.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-5 py-4">
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                <Activity size={20} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Total Analyses
                </p>

                <p className="text-xl font-bold">
                  {analyses.length}
                </p>
              </div>
            </div>

          </div>

        </section>

<section className="mb-6 grid gap-4 lg:grid-cols-3">

  {/* Search */}
  <div className="relative">

    <Search
      size={18}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
    />

    <input
      type="text"
      value={search}
      onChange={(event) =>
        setSearch(event.target.value)
      }
      placeholder="Search repository..."
      className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
    />

  </div>


  {/* Status Filter */}
  <div className="relative">

    <Filter
      size={18}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
    />

    <select
      value={statusFilter}
      onChange={(event) =>
        setStatusFilter(event.target.value)
      }
      className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500"
    >
      <option value="all">
        All Statuses
      </option>

      <option value="completed">
        Completed
      </option>

      <option value="pending">
        Pending
      </option>

      <option value="analyzing">
        Analyzing
      </option>

      <option value="failed">
        Failed
      </option>

    </select>

  </div>


  {/* Sort */}
  <div className="relative">

    <ArrowDownUp
      size={18}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
    />

    <select
      value={sortBy}
      onChange={(event) =>
        setSortBy(event.target.value)
      }
      className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500"
    >
      <option value="newest">
        Newest First
      </option>

      <option value="oldest">
        Oldest First
      </option>

      <option value="health-high">
        Health Score: High to Low
      </option>

      <option value="health-low">
        Health Score: Low to High
      </option>

    </select>

  </div>

</section>

        {message && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {message}
          </div>
        )}

        {filteredAnalyses.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-12 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
              <BarChart3 size={32} />
            </div>

            <h2 className="mt-6 text-xl font-semibold">
              No analyses yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
              Add a repository and start an AI analysis.
              Your analysis history and results will
              appear here.
            </p>

            <button
              onClick={() =>
                navigate("/repositories")
              }
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
            >
              Go to Repositories
            </button>

          </div>

        ) : (

          <div className="grid gap-5">

            {filteredAnalyses.map((analysis) => (

              <div
                key={analysis._id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500/40"
              >

                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

                  <div className="flex items-start gap-4">

                    <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                      <BarChart3 size={24} />
                    </div>

                    <div>

                      <h2 className="text-lg font-semibold">
                        {analysis.repository?.name ||
                          "Unknown Repository"}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Health Score:{" "}

                        <span className="font-medium text-white">
                          {analysis.healthScore ?? 0}/100
                        </span>
                      </p>

                      {analysis.createdAt && (
                        <p className="mt-2 text-xs text-slate-600">
                          Started:{" "}

                          {new Date(
                            analysis.createdAt
                          ).toLocaleString()}
                        </p>
                      )}

                    </div>

                  </div>

                  <div className="flex flex-wrap items-center gap-3">

                    <div
                      className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium ${getStatusStyle(
                        analysis.status
                      )}`}
                    >
                      {getStatusIcon(
                        analysis.status
                      )}

                      <span className="capitalize">
                        {analysis.status}
                      </span>
                    </div>

                    <button
  onClick={() =>
    navigate(`/analyses/${analysis._id}`)
  }
  className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:text-white"
>
  <Eye size={17} />
  View Analysis
</button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Analyses;
