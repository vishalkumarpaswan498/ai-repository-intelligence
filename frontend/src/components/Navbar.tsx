import { Bell, Search, User } from "lucide-react";

function Navbar() {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950 px-8">
      <div className="relative hidden w-full max-w-md md:block">
        <Search
          size={19}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          type="text"
          placeholder="Search repositories..."
          className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2.5 pl-11 pr-4 text-sm text-white outline-none focus:border-blue-500"
        />
      </div>

      <div className="ml-auto flex items-center gap-5">
        <button className="relative text-slate-400 transition hover:text-white">
          <Bell size={21} />

          <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-blue-500" />
        </button>

        <div className="flex items-center gap-3 border-l border-slate-800 pl-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600">
            <User size={18} />
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">
              {user.name || "User"}
            </p>

            <p className="max-w-40 truncate text-xs text-slate-500">
              {user.email || "user@example.com"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;