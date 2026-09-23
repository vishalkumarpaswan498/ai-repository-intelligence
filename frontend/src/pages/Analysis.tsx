import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bug,
  ShieldCheck,
  Code2,
  TestTube2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  LoaderCircle,
  CircleAlert,
  RefreshCw,
  GitBranch,
  Repeat2
} from "lucide-react";
import { api } from "../services/api";

type Issue = {
  file: string;
  line?: number;
  issue: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  suggestion?: string;
  code?: string;
};

type AgentData = {
  status?: string;
  issuesFound?: number;
  results?: Issue[];
};

type AnalysisData = {
  _id: string;

  status:
    | "pending"
    | "analyzing"
    | "completed"
    | "failed";

  healthScore?: number;

  summary?: string;


  riskLevel?: "low" | "medium" | "high" | "critical";

metrics?: {
  totalFiles?: number;
  totalLines?: number;
  totalFunctions?: number;
  totalImports?: number;
  totalExports?: number;
  totalClasses?: number;
  totalSize?: number;
};

  repository?: {
    _id: string;
    name: string;
    githubUrl?: string;
  };

  agents?: {
  bugDetection?: AgentData;
  security?: AgentData;
  codeReview?: AgentData;
  testing?: AgentData;
};

  createdAt?: string;
  completedAt?: string;
};

function Analysis() {
  const { analysisId } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] =
    useState<AnalysisData | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

    const [reanalyzing, setReanalyzing] =
  useState(false);

  const [message, setMessage] = useState("");


const [selectedAgent, setSelectedAgent] =
  useState<{
    name: string;
    data?: AgentData;
  } | null>(null);


  const fetchAnalysis = async (
  showRefreshing = false
) => {
  if (!analysisId) return;

  try {
    if (showRefreshing) {
      setRefreshing(true);
    }

    const data = await api(
      `/analysis/${analysisId}`
    );

    console.log(
      "📊 Analysis API Response:",
      data.analysis
    );

    setAnalysis(data.analysis);
    setMessage("");

    // Analysis complete ho chuka hai
    if (
      data.analysis?.status === "completed" ||
      data.analysis?.status === "failed"
    ) {
      console.log(
        `✅ Analysis ${data.analysis.status}`
      );
    }
  } catch (error) {
    console.error(
      "❌ Fetch Analysis Error:",
      error
    );

    setMessage(
      error instanceof Error
        ? error.message
        : "Failed to load analysis"
    );
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  
useEffect(() => {
  if (!analysisId) return;

  let interval: ReturnType<typeof setInterval>;

  setLoading(true);
  setAnalysis(null);
  setMessage("");
  setSelectedAgent(null);

  const loadAnalysis = async () => {
    try {
      const data = await api(
        `/analysis/${analysisId}`
      );

      console.log(
        "📊 Analysis status:",
        data.analysis?.status
      );

      setAnalysis(data.analysis);
      setMessage("");

      // Completed ya failed hone ke baad
      // polling ki zarurat nahi hai
      if (
        data.analysis?.status === "completed" ||
        data.analysis?.status === "failed"
      ) {
        clearInterval(interval);
      }
    } catch (error) {
      console.error(
        "❌ Analysis polling error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to load analysis"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  loadAnalysis();

  interval = setInterval(
    loadAnalysis,
    3000
  );

  return () => {
    clearInterval(interval);
  };
}, [analysisId]);

  const getStatusStyle = (status?: string) => {
    if (status === "completed") {
      return "border-green-500/30 bg-green-500/10 text-green-400";
    }

    if (
      status === "analyzing" ||
      status === "running"
    ) {
      return "border-blue-500/30 bg-blue-500/10 text-blue-400";
    }

    if (status === "failed") {
      return "border-red-500/30 bg-red-500/10 text-red-400";
    }

    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
  };

  const handleReanalyze = async () => {
  const repositoryId =
    analysis?.repository?._id;

  if (!repositoryId) {
    setMessage("Repository ID not found");
    return;
  }

  try {
    setReanalyzing(true);
    setMessage("");

    const data = await api(
      `/analysis/repository/${repositoryId}/reanalyze`,
      {
        method: "POST",
      }
    );

    if (!data.analysisId) {
      throw new Error(
        "Failed to create new analysis"
      );
    }


  setLoading(true);
  setAnalysis(null);
  setSelectedAgent(null);


    navigate(
      `/analyses/${data.analysisId}`
    );
  } catch (error) {
    setMessage(
      error instanceof Error
        ? error.message
        : "Failed to start re-analysis"
    );
  } finally {
    setReanalyzing(false);
  }
};



  const getStatusIcon = (status?: string) => {
    if (status === "completed") {
      return <CheckCircle2 size={16} />;
    }

    if (
      status === "analyzing" ||
      status === "running"
    ) {
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

  const agents = [
    {
      name: "Bug Detection",
      description:
        "Detect potential bugs and runtime issues.",
      icon: <Bug size={26} />,
      data: analysis?.agents?.bugDetection,
    },
    {
      name: "Security Analysis",
      description:
        "Identify possible security vulnerabilities.",
      icon: <ShieldCheck size={26} />,
      data: analysis?.agents?.security,
    },
    {
      name: "Code Quality",
      description:
        "Analyze code structure and maintainability.",
      icon: <Code2 size={26} />,
      data: analysis?.agents?.codeReview,
    },
    {
      name: "Testing Analysis",
      description:
        "Detect missing tests and coverage issues.",
      icon: <TestTube2 size={26} />,
      data: analysis?.agents?.testing,
    },
  ];

  const totalIssues = agents.reduce(
    (total, agent) =>
      total + (agent.data?.issuesFound || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-slate-400">
        <LoaderCircle
          size={24}
          className="mr-3 animate-spin"
        />

        Loading analysis...
      </div>
    );
  }

  const riskBreakdown = [
  {
    name: "Critical",
    count: 0,
    color: "bg-red-500",
  },
  {
    name: "High",
    count: 0,
    color: "bg-orange-500",
  },
  {
    name: "Medium",
    count: 0,
    color: "bg-yellow-500",
  },
  {
    name: "Low",
    count: 0,
    color: "bg-blue-500",
  },
];

agents.forEach((agent) => {
  agent.data?.results?.forEach((issue) => {
    const severity =
      issue.severity?.toLowerCase();

    if (severity === "critical") {
      riskBreakdown[0].count++;
    }

    if (severity === "high") {
      riskBreakdown[1].count++;
    }

    if (severity === "medium") {
      riskBreakdown[2].count++;
    }

    if (severity === "low") {
      riskBreakdown[3].count++;
    }
  });
});

  if (!analysis && message) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center text-white">

        <CircleAlert
          size={40}
          className="mb-4 text-red-400"
        />

        <h1 className="text-2xl font-bold">
          Analysis not found
        </h1>

        <p className="mt-3 text-slate-400">
          {message}
        </p>

        <button
          onClick={() =>
            navigate("/analyses")
          }
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500"
        >
          Back to Analyses
        </button>

      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-950 text-white">

      {/* Top Bar */}
      <div className="border-b border-slate-800 bg-slate-900/40">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <button
            onClick={() =>
              navigate("/analyses")
            }
            className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />

            Back to Analyses
          </button>

          <button
  onClick={handleReanalyze}
  disabled={
    reanalyzing ||
    analysis?.status === "pending" ||
    analysis?.status === "analyzing"
  }
  className="flex items-center gap-2 rounded-lg border border-blue-500/50 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
>
  <Repeat2
    size={17}
    className={
      reanalyzing
        ? "animate-spin"
        : ""
    }
  />

  {reanalyzing
    ? "Starting..."
    : "Re-analyze"}
</button>

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                fetchAnalysis(true)
              }
              disabled={refreshing}
              className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-blue-500 hover:text-white disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                size={18}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
            </button>

            <div
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${getStatusStyle(
                analysis?.status
              )}`}
            >
              {getStatusIcon(
                analysis?.status
              )}

              <span className="capitalize">
                {analysis?.status || "pending"}
              </span>
            </div>

          </div>

        </div>

      </div>

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <section className="mb-10">

          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-blue-400">
            AI REPOSITORY INTELLIGENCE
          </p>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">

            {analysis?.repository?.name ||
              "Repository Analysis"}

          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">

            {analysis?.repository?.githubUrl && (
              <a
                href={
                  analysis.repository.githubUrl
                }
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 transition hover:text-blue-400"
              >
                <GitBranch size={17} />

                View Repository
              </a>
            )}

            {analysis?.createdAt && (
              <span>
                Started:{" "}

                {new Date(
                  analysis.createdAt
                ).toLocaleString()}
              </span>
            )}

          </div>

        </section>

        {/* Message */}
        {message && (
          <div className="mb-8 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">

            <CircleAlert size={20} />

            <p className="text-sm">
              {message}
            </p>

          </div>
        )}

        {/* Stats */}
        <section className="mb-10 grid gap-5 md:grid-cols-3">

          {/* Health Score */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
              Repository Health
            </p>

            <div className="mt-4 flex items-end gap-2">

              <span className="text-4xl font-bold">

                {analysis?.healthScore ?? 0}

              </span>

              <span className="mb-1 text-slate-500">
                /100
              </span>

            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">

              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{
                  width: `${analysis?.healthScore ?? 0}%`,
                }}
              />

            </div>

          </div>

          {/* AI Agents */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
              AI Agents
            </p>

            <p className="mt-4 text-4xl font-bold">
              {agents.length}
            </p>

            <p className="mt-3 text-sm text-slate-500">
              Specialized agents analyzing your
              repository.
            </p>

          </div>

          {/* Issues */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
              Total Issues
            </p>

            <div className="mt-4 flex items-center gap-3">

              <AlertTriangle
                size={28}
                className="text-yellow-400"
              />

              <p className="text-4xl font-bold">
                {totalIssues}
              </p>

            </div>

            <p className="mt-3 text-sm text-slate-500">
              Issues detected by AI agents.
            </p>

          </div>

        </section>

{/* Repository Metrics */}
<section className="mb-10">

  <div className="mb-6">

    <p className="text-xs font-bold tracking-[0.2em] text-blue-400">
      REPOSITORY INSIGHTS
    </p>

    <h2 className="mt-2 text-2xl font-bold">
      Analysis Metrics
    </h2>

    <p className="mt-2 text-sm text-slate-400">
      Detailed statistics collected during repository analysis.
    </p>

  </div>

  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        Files Scanned
      </p>

      <p className="mt-3 text-2xl font-bold">
        {analysis?.metrics?.totalFiles ?? 0}
      </p>
    </div>

    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        Lines Analyzed
      </p>

      <p className="mt-3 text-2xl font-bold">
        {analysis?.metrics?.totalLines ?? 0}
      </p>
    </div>

    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        Functions
      </p>

      <p className="mt-3 text-2xl font-bold">
        {analysis?.metrics?.totalFunctions ?? 0}
      </p>
    </div>

    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        Imports
      </p>

      <p className="mt-3 text-2xl font-bold">
        {analysis?.metrics?.totalImports ?? 0}
      </p>
    </div>

    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        Exports
      </p>

      <p className="mt-3 text-2xl font-bold">
        {analysis?.metrics?.totalExports ?? 0}
      </p>
    </div>

    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        Classes
      </p>

      <p className="mt-3 text-2xl font-bold">
        {analysis?.metrics?.totalClasses ?? 0}
      </p>
    </div>

    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        Repository Size
      </p>

      <p className="mt-3 text-2xl font-bold">
        {analysis?.metrics?.totalSize
          ? `${(
              analysis.metrics.totalSize / 1024
            ).toFixed(1)} KB`
          : "0 KB"}
      </p>
    </div>

    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        Risk Level
      </p>

      <p
        className={`mt-3 text-2xl font-bold capitalize ${
          analysis?.riskLevel === "critical"
            ? "text-red-500"
            : analysis?.riskLevel === "high"
              ? "text-orange-400"
              : analysis?.riskLevel === "medium"
                ? "text-yellow-400"
                : "text-green-400"
        }`}
      >
        {analysis?.riskLevel ?? "low"}
      </p>
    </div>

  </div>

</section>

{/* AI Summary + Risk Breakdown */}
<section className="mb-10 grid gap-5 lg:grid-cols-2">



  {/* AI Summary */}
  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

    <div className="flex items-center gap-3">

      <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
        <Activity size={24} />
      </div>

      <div>
        <p className="text-xs font-bold tracking-[0.2em] text-blue-400">
          AI INSIGHT
        </p>

        <h2 className="mt-1 text-xl font-bold">
          AI Summary
        </h2>
      </div>

    </div>

    <div className="mt-6">

      {analysis?.summary ? (

        <p className="text-sm leading-7 text-slate-300">
          {analysis.summary}
        </p>

      ) : (

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

          <p className="text-sm text-slate-400">
            Analysis summary will appear after the
            repository analysis is completed.
          </p>

        </div>

      )}

    </div>

  </div>


  {/* Risk Breakdown */}
  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

    <div className="flex items-center gap-3">

      <div className="rounded-xl bg-orange-500/10 p-3 text-orange-400">
        <AlertTriangle size={24} />
      </div>

      <div>
        <p className="text-xs font-bold tracking-[0.2em] text-orange-400">
          SECURITY & CODE RISK
        </p>

        <h2 className="mt-1 text-xl font-bold">
          Risk Breakdown
        </h2>
      </div>

    </div>


    <div className="mt-6 space-y-5">

      {riskBreakdown.map((risk) => {

        const percentage =
          totalIssues > 0
            ? Math.round(
                (risk.count / totalIssues) * 100
              )
            : 0;

        return (

          <div key={risk.name}>

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div
                  className={`h-3 w-3 rounded-full ${risk.color}`}
                />

                <span className="text-sm text-slate-300">
                  {risk.name}
                </span>

              </div>

              <span className="text-sm font-semibold text-white">

                {risk.count}

                <span className="ml-2 text-xs font-normal text-slate-500">
                  {percentage}%
                </span>

              </span>

            </div>


            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">

              <div
                className={`h-full rounded-full ${risk.color} transition-all duration-500`}
                style={{
                  width: `${percentage}%`,
                }}
              />

            </div>

          </div>

        );

      })}

    </div>


    {/* Overall Risk */}
    <div className="mt-7 border-t border-slate-800 pt-5">

      <div className="flex items-center justify-between">

        <span className="text-sm text-slate-400">
          Overall Risk Level
        </span>

        <span
          className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
            analysis?.riskLevel === "critical"
              ? "bg-red-500/15 text-red-400"
              : analysis?.riskLevel === "high"
                ? "bg-orange-500/15 text-orange-400"
                : analysis?.riskLevel === "medium"
                  ? "bg-yellow-500/15 text-yellow-400"
                  : "bg-green-500/15 text-green-400"
          }`}
        >
          {analysis?.riskLevel ?? "Low"}
        </span>

      </div>

    </div>

  </div>

</section>

        {/* Agent Cards */}
        <section>

          <div className="mb-6 flex items-center gap-3">

            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
              <Activity size={22} />
            </div>

            <div>

              <h2 className="text-2xl font-bold">
                AI Analysis Agents
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Each agent analyzes a different
                aspect of your repository.
              </p>

            </div>

          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            {agents.map((agent) => {

              const agentStatus =
                agent.data?.status ||
                analysis?.status ||
                "pending";

              return (
                <button
  key={agent.name}
  type="button"
  onClick={() =>
    setSelectedAgent({
      name: agent.name,
      data: agent.data,
    })
  }
  className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left transition duration-200 hover:-translate-y-1 hover:border-blue-500/50"
>

                  <div className="flex items-start justify-between">

                    <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">

                      {agent.icon}

                    </div>

                    <div
                      className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${getStatusStyle(
                        agentStatus
                      )}`}
                    >

                      {getStatusIcon(
                        agentStatus
                      )}

                      <span className="capitalize">
                        {agentStatus}
                      </span>

                    </div>

                  </div>

                  <h3 className="mt-5 text-lg font-semibold">
                    {agent.name}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {agent.description}
                  </p>

                  <div className="mt-6 border-t border-slate-800 pt-4">

                    <p className="text-xs text-slate-500">
                      Issues Found
                    </p>

                    <p className="mt-1 text-2xl font-bold">

                      {agent.data?.issuesFound ?? 0}

                    </p>

                  </div>

                </button>
              );
            })}

          </div>

        </section>



        {selectedAgent && (
  <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">

    <div className="flex items-start justify-between gap-4">

      <div>
        <p className="text-xs font-bold tracking-[0.2em] text-blue-400">
          DETAILED RESULTS
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          {selectedAgent.name}
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          {selectedAgent.data?.issuesFound ?? 0} issues found
          during repository analysis.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setSelectedAgent(null)}
        className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:text-white"
      >
        Close
      </button>

    </div>

    {!selectedAgent.data?.results ||
    selectedAgent.data.results.length === 0 ? (

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-6 text-center">

        <CheckCircle2
          size={30}
          className="mx-auto text-green-400"
        />

        <h3 className="mt-3 font-semibold">
          No issues found
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          This agent did not detect any issues.
        </p>

      </div>

    ) : (

      <div className="mt-6 space-y-4">

        {selectedAgent.data.results.map(
          (issue, index) => (

            <div
              key={`${issue.file}-${issue.line}-${index}`}
              className="rounded-xl border border-slate-800 bg-slate-950 p-5"
            >

              <div className="flex flex-wrap items-start justify-between gap-4">

                <div>

                  <h3 className="font-semibold text-white">
                    {issue.issue}
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    {issue.message}
                  </p>

                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    issue.severity === "critical"
                      ? "bg-red-500/15 text-red-400"
                      : issue.severity === "high"
                        ? "bg-orange-500/15 text-orange-400"
                        : issue.severity === "medium"
                          ? "bg-yellow-500/15 text-yellow-400"
                          : "bg-blue-500/15 text-blue-400"
                  }`}
                >
                  {issue.severity}
                </span>

              </div>

              <div className="mt-5 grid gap-3 text-sm md:grid-cols-2">

                <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">

                  <p className="text-xs text-slate-500">
                    File
                  </p>

                  <p className="mt-1 break-all text-slate-200">
                    {issue.file}
                  </p>

                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">

                  <p className="text-xs text-slate-500">
                    Line
                  </p>

                  <p className="mt-1 text-slate-200">
                    {issue.line ?? "Not available"}
                  </p>

                </div>

              </div>

              {issue.suggestion && (
                <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">

                  <p className="text-xs font-semibold text-blue-400">
                    SUGGESTED FIX
                  </p>

 <p className="mt-2 text-sm text-slate-300">
                    {issue.suggestion}
                  </p>

                </div>
              )}


                  {issue.code && (
  <div className="mt-4 overflow-hidden rounded-lg border border-slate-700 bg-black">

    <div className="border-b border-slate-800 px-4 py-2">
      <p className="text-xs font-semibold text-slate-400">
        CODE SNIPPET
      </p>
    </div>

    <pre className="overflow-x-auto p-4 text-sm text-green-400">
      <code>
        {issue.code}
      </code>
    </pre>

  </div>
)}

                 

            </div>

          )
        )}

      </div>

    )}

  </section>
)}

      </main>

    </div>
  );
}

export default Analysis;