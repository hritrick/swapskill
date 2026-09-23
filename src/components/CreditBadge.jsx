import { useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";

export default function CreditBadge() {
  const { credits } = useContext(AppContext);

  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-xs px-2.5 py-1 rounded-full border border-line"
      title="Your swap-hour credit balance"
    >
      <span className="text-mustard">⏱</span>
      {credits} hrs
    </span>
  );
}
