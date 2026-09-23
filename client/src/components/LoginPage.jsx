import { useContext, useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";

export default function LoginPage() {
  const { login, register, user, loadingAuth } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (isRegistering && !name.trim()) {
      setError("Please provide a name for registration.");
      return;
    }

    try {
      if (isRegistering) {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }

      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || "An error occurred during authentication.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center paper-texture px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-2xl font-semibold tracking-tight">
            Swap<span className="text-teal">Skill</span>
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50 mt-2">
            no cash, just craft
          </p>
        </div>

        <div className="ticket-notch bg-white border-2 border-ink rounded-2xl px-8 py-8 shadow-[6px_6px_0_#E8A33D]">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50 mb-1">
            Member ticket
          </p>
          <h1 className="font-display text-2xl font-semibold mb-6">
            {isRegistering ? "Register to trade" : "Sign in to trade"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-ink/60">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1 w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-ink/60">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-ink/60">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>

            {error && <p className="text-xs text-red-600 font-mono">{error}</p>}

            <button disabled={loadingAuth} type="submit" className="w-full mt-2 py-3 rounded-full font-semibold text-sm bg-teal text-paper disabled:opacity-50">
              {loadingAuth ? "Loading..." : isRegistering ? "Create Account" : "Enter SwapSkill"}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 space-y-2">
          <p className="text-xs text-ink/60 font-mono">
            {isRegistering ? "Already have an account?" : "Don't have an account?"}
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="ml-2 font-semibold text-teal-dark underline focus:outline-none"
            >
              {isRegistering ? "Log in" : "Register"}
            </button>
          </p>
          <Link to="/" className="inline-block text-xs font-mono text-teal-dark underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
