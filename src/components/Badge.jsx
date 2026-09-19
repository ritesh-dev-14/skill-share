export default function Badge({ children, color = "brand" }) {
  const colors = {
    brand: "bg-[#0a0a0a] text-white",
    green: "bg-[#f5f5f3] text-[#404040]",
    gray: "bg-gray-100 text-gray-600",
    amber: "bg-[#f5f5f3] text-[#404040]",
    red: "bg-[#f5f5f3] text-[#404040]",
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

export function SkillTag({ name, type }) {
  const color = type === "teach" ? "bg-[#0a0a0a] text-white" : "bg-[#f5f5f3] text-[#404040] border border-[#e5e5e5]";
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {name}
    </span>
  );
}
