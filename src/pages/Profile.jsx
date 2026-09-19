import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, GraduationCap, MapPin, MessageSquare, Send, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, data, updateProfile, addSkill, removeSkill, sendRequest } = useAuth();
  const isOwn = !id || id === user.id;
  const person = data.users.find((candidate) => candidate.id === (id || user.id));
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: person?.full_name || "", bio: person?.bio || "", location: person?.location || "" });
  const [skill, setSkill] = useState("");
  const [type, setType] = useState("teach");
  const [message, setMessage] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  if (!person) return <div className="text-center py-20 text-[#666]">Profile not found.</div>;
  const existing = data.requests.find((request) => (request.sender_id === user.id && request.receiver_id === person.id) || (request.sender_id === person.id && request.receiver_id === user.id));
  const save = () => { updateProfile(form); setEditing(false); };
  const add = () => { if (skill.trim() && !person.skills.some((item) => item.type === type && item.name.toLowerCase() === skill.trim().toLowerCase())) addSkill(skill, type); setSkill(""); };
  const skillGroups = [["Skills I teach", "teach", GraduationCap], ["Skills I want to learn", "learn", BookOpen]];

  return (
    <div className="space-y-9 max-w-4xl mx-auto">
      {!isOwn && <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#666] hover:text-black"><ArrowLeft size={16} />Back</button>}
      <section className="border-b border-[#0a0a0a] pb-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <Avatar name={person.full_name} url={person.avatar_url} size={88} />
          <div className="flex-1 min-w-0">
            {editing ? <input className="text-2xl font-semibold border-b border-[#0a0a0a] px-0 py-2 w-full mb-2 outline-none" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} /> : <h1 className="text-3xl font-semibold tracking-[-0.04em]">{person.full_name}</h1>}
            {editing ? <input className="text-sm border-b border-[#d4d4d4] px-0 py-2 w-full mb-2 outline-none" placeholder="Location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /> : <p className="text-sm text-[#666] flex items-center gap-1 mt-2"><MapPin size={14} />{person.location || "Remote"}</p>}
            {editing ? <textarea className="text-sm border border-[#d4d4d4] rounded-md px-3 py-2 w-full mt-2" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} /> : <p className="text-[#666] mt-5 max-w-2xl leading-7">{person.bio || "This member is ready to exchange skills."}</p>}
            {isOwn ? <div className="mt-5 flex gap-2"><button onClick={editing ? save : () => setEditing(true)} className="px-4 py-2 bg-[#0a0a0a] text-white rounded-md text-sm font-medium">{editing ? "Save profile" : "Edit profile"}</button>{editing && <button onClick={() => setEditing(false)} className="px-4 py-2 border border-[#d4d4d4] rounded-md text-sm">Cancel</button>}</div> : <div className="mt-5 flex gap-2">{existing?.status === "accepted" ? <Link to={`/messages/${person.id}`} className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white rounded-md text-sm"><MessageSquare size={16} />Message</Link> : existing?.status === "pending" ? <span className="px-4 py-2 border border-[#d4d4d4] rounded-md text-[#666] text-sm">Request pending</span> : <button onClick={() => setShowRequest(true)} className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white rounded-md text-sm"><Send size={16} />Exchange skill</button>}</div>}
          </div>
        </div>
      </section>
      <div className="grid md:grid-cols-2 gap-12">
        {skillGroups.map(([title, skillType, Icon]) => {
          const group = person.skills.filter((item) => item.type === skillType);
          return <section key={skillType}><div className="flex items-center justify-between border-b border-[#0a0a0a] pb-4 mb-2"><h2 className="font-medium flex items-center gap-2"><Icon size={17} />{title}</h2><span className="text-xs text-[#999]">{group.length}</span></div><div className="flex flex-wrap gap-2 py-4">{group.map((item) => <span key={item.id} className={skillType === "teach" ? "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-[#0a0a0a] text-white" : "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-[#d4d4d4] text-[#404040]"}>{item.name}{isOwn && <button onClick={() => removeSkill(item.id)} aria-label={`Remove ${item.name}`}><X size={13} /></button>}</span>)}{group.length === 0 && <p className="text-sm text-[#999]">Nothing listed yet.</p>}</div>{isOwn && <div className="flex gap-2 mt-2"><input value={type === skillType ? skill : ""} onChange={(event) => { setType(skillType); setSkill(event.target.value); }} onKeyDown={(event) => event.key === "Enter" && add()} placeholder={skillType === "teach" ? "Add a teaching skill" : "Add a learning goal"} className="flex-1 border-b border-[#d4d4d4] px-0 py-2 text-sm outline-none focus:border-black" /><button onClick={add} className="px-3 py-2 bg-[#f5f5f3] rounded-md text-sm font-medium">Add</button></div>}</section>;
        })}
      </div>
      {showRequest && <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"><div className="bg-white border border-[#d4d4d4] p-6 w-full max-w-md"><h3 className="text-lg font-semibold">Start an exchange</h3><p className="text-sm text-[#666] mt-2 mb-5">Introduce yourself to {person.full_name}.</p><textarea value={message} onChange={(event) => setMessage(event.target.value)} className="w-full border border-[#d4d4d4] rounded-md px-3 py-2 min-h-[90px] outline-none focus:border-black" placeholder="What would you like to learn or teach?" /><div className="flex gap-2 mt-5"><button onClick={() => { sendRequest(person.id, message); setShowRequest(false); }} className="flex-1 py-2.5 bg-[#0a0a0a] text-white rounded-md text-sm">Send request</button><button onClick={() => setShowRequest(false)} className="px-4 border border-[#d4d4d4] rounded-md text-sm">Cancel</button></div></div></div>}
    </div>
  );
}
