import { Link } from "react-router-dom";

export default function Badge({ children, color = "brand" }) {
  const colors = {
    brand: "bg-brand-100 text-brand-700",
    green: "bg-green-100 text-green-700",
    gray: "bg-gray-100 text-gray-600",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

export function SkillTag({ name, type }) {
  const color = type === "teach" ? "bg-brand-100 text-brand-700" : "bg-green-100 text-green-700";
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {name}
    </span>
  );
}
