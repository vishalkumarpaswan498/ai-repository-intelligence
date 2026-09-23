import { Link } from "react-router-dom";
import {
  Brain,
  Bug,
  ShieldCheck,
  Code2,
  BarChart3,
  ArrowRight,
  GitBranch,
  Zap,
  CheckCircle2,
} from "lucide-react";

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="rounded-xl bg-blue-600 p-2">
              <Brain size={24} />
            </div>

            <div>
              <h1 className="text-lg font-bold">
                Miravex
              </h1>

              <p className="text-xs text-slate-400">
                Repository Intelligence
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-white">
              Features
            </a>

            <a href="#how-it-works" className="hover:text-white">
              How It Works
            </a>

            <Link
              to="/login"
              className="hover:text-white"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-500"
            >
              Get Started
            </Link>
          </nav>

          {/* Mobile */}
          <Link
            to="/register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium md:hidden"
          >
            Start
          </Link>

        </div>
      </header>


      {/* Hero Section */}
      <section className="relative overflow-hidden">

        <div className="mx-auto max-w-7xl px-6 py-24 text-center md:py-32">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
            <Zap size={16} />

            AI-Powered Software Engineering
          </div>

          <h2 className="mx-auto max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
            Understand Your Codebase
            <span className="block text-blue-500">
              With AI Agents
            </span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
            Analyze GitHub repositories using multiple
            AI-powered software engineering agents.
            Detect bugs, security issues, code quality
            problems and improve your repository health.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

            <Link
              to="/register"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold transition hover:bg-blue-500"
            >
              Analyze Your Repository

              <ArrowRight size={20} />
            </Link>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-7 py-4 font-semibold text-slate-300 transition hover:bg-slate-900"
            >
              Login to Dashboard
            </Link>

          </div>


          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-3xl font-bold text-blue-400">
                Multi-Agent
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                AI analysis system
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-3xl font-bold text-green-400">
                Smart
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Repository insights
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-3xl font-bold text-purple-400">
                AI
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Software intelligence
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* Features */}
      <section
        id="features"
        className="border-t border-slate-800 bg-slate-900/30 py-24"
      >
        <div className="mx-auto max-w-7xl px-6">

          <div className="mx-auto mb-16 max-w-2xl text-center">

            <p className="font-medium text-blue-400">
              POWERFUL FEATURES
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              AI Agents That Understand Your Code
            </h2>

            <p className="mt-4 text-slate-400">
              Multiple specialized agents analyze your
              repository from different perspectives.
            </p>

          </div>


          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            {/* Bug Detection */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 transition hover:-translate-y-1 hover:border-blue-500/50">

              <div className="w-fit rounded-xl bg-red-500/10 p-3 text-red-400">
                <Bug size={26} />
              </div>

              <h3 className="mt-6 text-xl font-semibold">
                Bug Detection
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Detect potential bugs, logical errors
                and code quality issues.
              </p>

            </div>


            {/* Security */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 transition hover:-translate-y-1 hover:border-blue-500/50">

              <div className="w-fit rounded-xl bg-green-500/10 p-3 text-green-400">
                <ShieldCheck size={26} />
              </div>

              <h3 className="mt-6 text-xl font-semibold">
                Security Analysis
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Identify potential vulnerabilities
                and security risks in your code.
              </p>

            </div>


            {/* Code Review */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 transition hover:-translate-y-1 hover:border-blue-500/50">

              <div className="w-fit rounded-xl bg-purple-500/10 p-3 text-purple-400">
                <Code2 size={26} />
              </div>

              <h3 className="mt-6 text-xl font-semibold">
                Code Review
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Get maintainability and architecture
                insights for your repository.
              </p>

            </div>


            {/* Health Score */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 transition hover:-translate-y-1 hover:border-blue-500/50">

              <div className="w-fit rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <BarChart3 size={26} />
              </div>

              <h3 className="mt-6 text-xl font-semibold">
                Health Score
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Get an overall repository health score
                based on AI analysis.
              </p>

            </div>

          </div>

        </div>
      </section>


      {/* How it works */}
      <section
        id="how-it-works"
        className="py-24"
      >
        <div className="mx-auto max-w-7xl px-6">

          <div className="mb-16 text-center">

            <p className="font-medium text-blue-400">
              HOW IT WORKS
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              From Repository to Intelligence
            </h2>

          </div>


          <div className="grid gap-8 md:grid-cols-4">

            <div className="text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold">
                1
              </div>

              <GitBranch
                className="mx-auto mt-6 text-slate-400"
                size={30}
              />

              <h3 className="mt-4 text-lg font-semibold">
                Add Repository
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Connect your GitHub repository.
              </p>

            </div>


            <div className="text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold">
                2
              </div>

              <Brain
                className="mx-auto mt-6 text-purple-400"
                size={30}
              />

              <h3 className="mt-4 text-lg font-semibold">
                Start Analysis
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Launch the AI analysis pipeline.
              </p>

            </div>


            <div className="text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold">
                3
              </div>

              <Code2
                className="mx-auto mt-6 text-green-400"
                size={30}
              />

              <h3 className="mt-4 text-lg font-semibold">
                AI Agents Analyze
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Specialized agents inspect your code.
              </p>

            </div>


            <div className="text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold">
                4
              </div>

              <BarChart3
                className="mx-auto mt-6 text-blue-400"
                size={30}
              />

              <h3 className="mt-4 text-lg font-semibold">
                Get Insights
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                View issues, reports and health scores.
              </p>

            </div>

          </div>

        </div>
      </section>


      {/* CTA */}
      <section className="border-y border-slate-800 bg-blue-600/10 py-24">

        <div className="mx-auto max-w-3xl px-6 text-center">

          <CheckCircle2
            className="mx-auto text-blue-400"
            size={48}
          />

          <h2 className="mt-6 text-4xl font-bold">
            Ready to Understand Your Codebase?
          </h2>

          <p className="mt-5 text-slate-400">
            Create your account and start analyzing
            your repositories with AI-powered agents.
          </p>

          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold transition hover:bg-blue-500"
          >
            Get Started Free

            <ArrowRight size={20} />
          </Link>

        </div>

      </section>


      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-10">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">

          <div className="flex items-center gap-2">

            <Brain
              size={22}
              className="text-blue-500"
            />

            <span className="font-semibold">
              Miravex Technologies
            </span>

          </div>

          <p className="text-sm text-slate-500">
            © 2026 Miravex Technologies. AI-Powered
            Repository Intelligence.
          </p>

        </div>

      </footer>

    </div>
  );
}

export default Home;