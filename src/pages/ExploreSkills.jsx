import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Compass, MapPin, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import { SkillTag } from "../components/Badge";

export default function ExploreSkills() {
  const { user, data } = useAuth();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(() => data.users.filter((person) => {
    if (person.id === user.id) return false;
    const q = query.trim().toLowerCase();
    const teach = person.skills.filter((skill) => skill.type === "teach");
    const learn = person.skills.filter((skill) => skill.type === "learn");
    const names = [...teach, ...learn].map((skill) => skill.name.toLowerCase());
    const matchesQuery = !q || person.full_name.toLowerCase().includes(q) || person.location.toLowerCase().includes(q) || names.some((name) => name.includes(q));
    const matchesFilter = filter === "all" || (filter === "teach" ? teach : learn).some((skill) => !q || skill.name.toLowerCase().includes(q));
    return matchesQuery && matchesFilter;
  }), [data.users, filter, query, user.id]);
  return <div className="space-y-9"><header className="border-b border-[#e5e5e5] pb-7"><p className="text-xs uppercase tracking-[0.18em] font-semibold text-[#666] mb-3">The directory</p><h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.04em]">Explore skills</h1><p className="text-[#666] mt-3">Find people who can teach what you want to learn.</p></header><div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between"><div className="relative max-w-xl flex-1"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, skill, or location" className="w-full pl-10 pr-4 py-3 rounded-md border border-[#d4d4d4] bg-white outline-none focus:border-[#0a0a0a] text-sm" /></div><div className="flex gap-1 border border-[#d4d4d4] rounded-md p-1 w-fit">{[["all", "All"], ["teach", "Teaching"], ["learn", "Learning"]].map(([key, label]) => <button key={key} onClick={() => setFilter(key)} className={`px-3 py-2 rounded text-xs font-medium ${filter === key ? "bg-[#0a0a0a] text-white" : "text-[#666] hover:text-black"}`}>{label}</button>)}</div></div>{filtered.length === 0 ? <div className="border-y border-[#e5e5e5] py-16 text-center"><Compass size={28} className="mx-auto text-[#999] mb-4" /><p className="text-[#666]">No people found. Try a different search.</p></div> : <div className="border-t border-[#0a0a0a]">{filtered.map((person) => { const teach = person.skills.filter((skill) => skill.type === "teach"); const learn = person.skills.filter((skill) => skill.type === "learn"); return <div key={person.id} className="py-6 border-b border-[#e5e5e5] flex flex-col lg:flex-row lg:items-center gap-5"><div className="flex items-center gap-4 lg:w-[31%]"><Avatar name={person.full_name} url={person.avatar_url} size={48} /><div className="min-w-0"><p className="font-medium truncate">{person.full_name}</p><p className="text-xs text-[#666] flex items-center gap-1 mt-1"><MapPin size={12} />{person.location || "Remote"}</p></div></div><p className="text-sm text-[#666] leading-6 lg:w-[27%] line-clamp-2">{person.bio}</p><div className="flex flex-wrap gap-1.5 lg:flex-1">{teach.slice(0, 2).map((skill) => <SkillTag key={skill.id} name={skill.name} type="teach" />)}{learn.slice(0, 1).map((skill) => <SkillTag key={skill.id} name={skill.name} type="learn" />)}</div><div className="flex items-center gap-4 shrink-0"><Link to={`/profile/${person.id}`} className="text-sm font-medium hover:underline">View profile</Link><Link to={`/profile/${person.id}`} className="inline-flex items-center gap-1.5 bg-[#0a0a0a] text-white rounded-md px-3 py-2 text-xs font-medium hover:bg-[#262626]">Exchange skill <ArrowUpRight size={13} /></Link></div></div>; })}</div>}</div>;
}
