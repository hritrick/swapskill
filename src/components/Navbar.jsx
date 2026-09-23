import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import CreditBadge from "./CreditBadge.jsx";
import NotificationBell from "./NotificationBell.jsx";

// Single Navbar reused on both the public Landing page and the
// protected Dashboard — it adapts based on route + AppContext's `user`
// instead of every page shipping its own header.
export default function Navbar({ onListSkill }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const onDashboard = location.pathname.startsWith("/dashboard");

  function handleLogout() {
    // AppContext is the single source of truth for auth state — clear it
    // there, then send the user to the Login page. Nothing else in the
    // app keeps a separate/competing copy of the logged-in flag.
    logout();
    setMobileOpen(false);
    navigate("/login", { replace: true });
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-line">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-semibold tracking-tight">
            Swap<span className="text-teal">Skill</span>
          </span>
          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-widest text-ink/50 border border-line rounded px-1.5 py-0.5">
            no cash, just craft
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 font-medium text-sm">
          <Link to="/" className="underline-grow">Home</Link>

          {onDashboard ? (
            <>
              <a href="#how" className="underline-grow">How it works</a>
              <a href="#browse" className="underline-grow">Browse skills</a>
              <a href="#stories" className="underline-grow">Stories</a>
              <CreditBadge />
              <NotificationBell />
              {onListSkill && (
                <button
                  onClick={onListSkill}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-teal text-paper"
                >
                  List a skill
                </button>
              )}
            </>
          ) : (
            <a href="/#how" className="underline-grow">How it works</a>
          )}

          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-line">
              {!onDashboard && (
                <Link to="/dashboard" className="text-sm font-semibold text-teal underline-grow">
                  Dashboard
                </Link>
              )}
              <span className="text-sm text-ink/70">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-xs font-mono text-ink/40 hover:text-ink/70 underline"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-full text-sm font-semibold bg-ink text-paper"
            >
              Login
            </Link>
          )}
        </nav>

        <div className="md:hidden flex items-center gap-1">
          {onDashboard && <NotificationBell />}
          <button
            className="p-2"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-line px-5 pb-5 pt-3 flex flex-col gap-4 font-medium">
          <Link to="/" onClick={closeMobile} className="py-1">Home</Link>

          {onDashboard ? (
            <>
              <a href="#how" onClick={closeMobile} className="py-1">How it works</a>
              <a href="#browse" onClick={closeMobile} className="py-1">Browse skills</a>
              <a href="#stories" onClick={closeMobile} className="py-1">Stories</a>
              <div className="flex items-center justify-between">
                <CreditBadge />
              </div>
              {onListSkill && (
                <button
                  onClick={() => { closeMobile(); onListSkill(); }}
                  className="mt-1 px-4 py-2.5 rounded-full text-sm font-semibold w-full bg-teal text-paper"
                >
                  List a skill
                </button>
              )}
            </>
          ) : (
            <a href="/#how" onClick={closeMobile} className="py-1">How it works</a>
          )}

          {user ? (
            <>
              {!onDashboard && (
                <Link to="/dashboard" onClick={closeMobile} className="py-1 font-semibold text-teal">
                  Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="text-xs font-mono text-ink/40 underline text-left">
                Log out ({user.name})
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={closeMobile}
              className="px-4 py-2.5 rounded-full text-sm font-semibold w-full text-center bg-ink text-paper"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
