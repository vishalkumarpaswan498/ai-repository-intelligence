import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  GitBranch,
  Plus,
  Trash2,
  Play,
  RefreshCw,
  ExternalLink,
  LoaderCircle,
  Search,
  Filter,
  ArrowDownUp,
  CheckCircle2,
  Clock3,
  CircleAlert,
} from "lucide-react";

import { api } from "../services/api";

type Repository = {
  _id: string;
  name: string;
  githubUrl: string;
  description?: string;
  language?: string;
  analysisStatus:
    | "pending"
    | "analyzing"
    | "completed"
    | "failed";
  healthScore?: number;
};

function Repositories() {
  const navigate = useNavigate();

  const [repositories, setRepositories] =
    useState<Repository[]>([]);

  const [githubUrl, setGithubUrl] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [adding, setAdding] =
    useState(false);

  const [message, setMessage] =
    useState("");

  // Search
  const [search, setSearch] =
    useState("");

  // Status filter
  const [statusFilter, setStatusFilter] =
    useState("all");

  // Sort
  const [sortBy, setSortBy] =
    useState("name");

  const fetchRepositories = async (
    showLoading = true
  ) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const data = await api(
        "/repositories"
      );

      setRepositories(
        data.repositories || []
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to load repositories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  // Filter + Search + Sort
  const filteredRepositories =
    useMemo(() => {
      let result = [...repositories];

      // Search by repository name
      if (search.trim()) {
        result = result.filter(
          (repository) =>
            repository.name
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )
        );
      }

      // Filter by analysis status
      if (statusFilter !== "all") {
        result = result.filter(
          (repository) =>
            repository.analysisStatus ===
            statusFilter
        );
      }

      // Sorting
      result.sort((a, b) => {
        if (sortBy === "name") {
          return a.name.localeCompare(
            b.name
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

        return 0;
      });

      return result;
    }, [
      repositories,
      search,
      statusFilter,
      sortBy,
    ]);

  const handleAddRepository = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const url = githubUrl.trim();

    if (!url) {
      setMessage(
        "Please enter a GitHub repository URL"
      );
      return;
    }

    try {
      setAdding(true);
      setMessage("");

      const urlParts = url
        .replace(/\/$/, "")
        .split("/");

      let repositoryName =
        urlParts[urlParts.length - 1];

      repositoryName =
        repositoryName.replace(
          /\.git$/,
          ""
        );

      await api("/repositories", {
        method: "POST",
        body: JSON.stringify({
          name: repositoryName,
          githubUrl: url,
        }),
      });

      setGithubUrl("");

      await fetchRepositories(false);

      setMessage(
        "Repository added successfully"
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to add repository"
      );
    } finally {
      setAdding(false);
    }
  };

  const handleAnalyze = async (
    repositoryId: string
  ) => {
    try {
      setMessage("");

      const data = await api(
        "/analysis/start",
        {
          method: "POST",
          body: JSON.stringify({
            repositoryId,
          }),
        }
      );

      if (!data.analysisId) {
        throw new Error(
          "Analysis ID was not returned by the server"
        );
      }

      setMessage(
        "Repository analysis started successfully"
      );

      await fetchRepositories(false);

      navigate(
        `/analyses/${data.analysisId}`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to start analysis"
      );
    }
  };
const handleReanalyze = async (
  repositoryId: string
) => {
  try {
    setMessage("");

    const data = await api(
      `/analysis/repository/${repositoryId}/reanalyze`,
      {
        method: "POST",
      }
    );

    if (!data.analysisId) {
      throw new Error(
        "Analysis ID was not returned by the server"
      );
    }

    setMessage(
      "Repository re-analysis started successfully"
    );

    await fetchRepositories(false);

    navigate(
      `/analyses/${data.analysisId}`
    );
  } catch (error) {
    setMessage(
      error instanceof Error
        ? error.message
        : "Failed to start re-analysis"
    );
  }
};


  const handleDelete = async (
    repositoryId: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this repository?"
    );

    if (!confirmed) return;

    try {
      await api(
        `/repositories/${repositoryId}`,
        {
          method: "DELETE",
        }
      );

      setRepositories((previous) =>
        previous.filter(
          (repository) =>
            repository._id !== repositoryId
        )
      );

      setMessage(
        "Repository deleted successfully"
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete repository"
      );
    }
  };

  const getStatusStyle = (
    status: string
  ) => {
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

  const getStatusIcon = (
    status: string
  ) => {
    if (status === "completed") {
      return (
        <CheckCircle2 size={15} />
      );
    }

    if (status === "analyzing") {
      return (
        <LoaderCircle
          size={15}
          className="animate-spin"
        />
      );
    }

    if (status === "failed") {
      return (
        <CircleAlert size={15} />
      );
    }

    return <Clock3 size={15} />;
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center gap-3 text-slate-400">
        <LoaderCircle
          size={24}
          className="animate-spin"
        />

        Loading repositories...
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-950 p-6 text-white">

      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <section className="mb-10">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <p className="mb-3 text-xs font-bold tracking-[0.2em] text-blue-400">
                AI REPOSITORY INTELLIGENCE
              </p>

              <h1 className="text-3xl font-bold md:text-4xl">
                Repositories
              </h1>

              <p className="mt-3 text-slate-400">
                Connect GitHub repositories and
                analyze your code with AI-powered
                software engineering agents.
              </p>

            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-5 py-4">

              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                <GitBranch size={20} />
              </div>

              <div>

                <p className="text-xs text-slate-500">
                  TOTAL REPOSITORIES
                </p>

                <p className="text-xl font-bold">
                  {repositories.length}
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* Add Repository */}

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-5 flex items-center gap-3">

            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
              <Plus size={20} />
            </div>

            <div>

              <h2 className="text-xl font-semibold">
                Add Repository
              </h2>

              <p className="text-sm text-slate-400">
                Paste a public GitHub repository URL.
              </p>

            </div>

          </div>

          <form
            onSubmit={handleAddRepository}
            className="flex flex-col gap-3 md:flex-row"
          >

            <input
              type="url"
              placeholder="https://github.com/username/repository"
              value={githubUrl}
              onChange={(event) =>
                setGithubUrl(
                  event.target.value
                )
              }
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              required
            />

            <button
              type="submit"
              disabled={adding}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {adding ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Plus size={18} />
              )}

              {adding
                ? "Adding..."
                : "Add Repository"}

            </button>

          </form>

        </section>


        {/* Search + Filter + Sort */}

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
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search repositories..."
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
                setStatusFilter(
                  event.target.value
                )
              }
              className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-blue-500"
            >

              <option value="all">
                All Statuses
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="analyzing">
                Analyzing
              </option>

              <option value="completed">
                Completed
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
                setSortBy(
                  event.target.value
                )
              }
              className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-blue-500"
            >

              <option value="name">
                Name: A to Z
              </option>

              <option value="health-high">
                Health: High to Low
              </option>

              <option value="health-low">
                Health: Low to High
              </option>

            </select>

          </div>

        </section>


        {/* Message */}

        {message && (

          <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-300">

            {message}

          </div>

        )}


        {/* Repository List */}

        {filteredRepositories.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-12 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">

              <GitBranch size={32} />

            </div>

            <h2 className="mt-6 text-xl font-semibold">

              {repositories.length === 0
                ? "No repositories yet"
                : "No repositories found"}

            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">

              {repositories.length === 0
                ? "Add your first GitHub repository and start an AI-powered analysis."
                : "Try changing your search or filter settings."}

            </p>

          </div>

        ) : (

          <div className="grid gap-5">

            {filteredRepositories.map(
              (repository) => (

                <div
                  key={repository._id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500/40"
                >

                  <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

                    <div className="min-w-0">

                      <div className="flex items-center gap-3">

                        <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">

                          <GitBranch size={22} />

                        </div>

                        <div>

                          <h2 className="truncate text-lg font-semibold">

                            {repository.name}

                          </h2>

                          <a
                            href={
                              repository.githubUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 flex items-center gap-2 break-all text-sm text-blue-400 hover:text-blue-300"
                          >

                            {repository.githubUrl}

                            <ExternalLink
                              size={14}
                            />

                          </a>

                        </div>

                      </div>


                      <div className="mt-5 flex flex-wrap gap-3">

                        <div
                          className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium ${getStatusStyle(
                            repository.analysisStatus
                          )}`}
                        >

                          {getStatusIcon(
                            repository.analysisStatus
                          )}

                          <span className="capitalize">

                            {
                              repository.analysisStatus
                            }

                          </span>

                        </div>


                        <div className="rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-300">

                          Health:{" "}

                          <span className="font-semibold text-white">

                            {
                              repository.healthScore ??
                              0
                            }
                            /100

                          </span>

                        </div>

                      </div>

                    </div>


                    {/* Actions */}

                    <div className="flex shrink-0 gap-3">

                      {repository.analysisStatus === "completed" ? (
  <button
    onClick={() =>
      handleReanalyze(repository._id)
    }
    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
  >
    <RefreshCw size={17} />

    Re-analyze
  </button>
) : repository.analysisStatus === "analyzing" ? (
  <button
    disabled
    className="flex cursor-not-allowed items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold opacity-50"
  >
    <LoaderCircle
      size={17}
      className="animate-spin"
    />

    Analyzing...
  </button>
) : repository.analysisStatus === "pending" ? (
  <button
    disabled
    className="flex cursor-not-allowed items-center gap-2 rounded-xl bg-yellow-600 px-5 py-3 text-sm font-semibold opacity-70"
  >
    <LoaderCircle
      size={17}
      className="animate-spin"
    />

    Queued...
  </button>
) : repository.analysisStatus === "failed" ? (
  <button
    onClick={() =>
      handleReanalyze(repository._id)
    }
    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
  >
    <RefreshCw size={17} />

    Retry Analysis
  </button>
) : (
  <button
    onClick={() =>
      handleAnalyze(repository._id)
    }
    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
  >
    <Play size={17} />

    Analyze
  </button>
)}

                      <button
                        onClick={() =>
                          handleDelete(
                            repository._id
                          )
                        }
                        className="rounded-xl border border-red-500/30 p-3 text-red-400 transition hover:bg-red-500/10"
                        title="Delete Repository"
                      >

                        <Trash2 size={18} />

                      </button>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default Repositories;