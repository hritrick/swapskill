export default function Footer() {
  return (
    <footer className="border-t border-line paper-texture">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="font-display text-lg font-semibold">
          Swap<span className="text-teal">Skill</span>
        </span>
        <p className="font-mono text-xs text-ink/50">
          Built for the Community Skill Exchange Platform project · Experiment 2 (React Hooks)
        </p>
      </div>
    </footer>
  );
}
