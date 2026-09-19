export default function Avatar({ name, url, size = 40 }) {
  const init = (name || "?")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (url) {
    return (
      <img
        src={url}
        alt={name || "avatar"}
        className="rounded-full object-cover bg-[#f5f5f3]"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-[#0a0a0a] text-white flex items-center justify-center font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {init}
    </div>
  );
}
