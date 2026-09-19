import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Pencil,
  Save,
  X,
  Plus,
  Trash2,
  GraduationCap,
  BookOpen,
  MessageSquare,
  Send,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import { SkillTag } from "../components/Badge";
import { fetchUserSkills, addUserSkill, removeUserSkill, fetchAllSkillNames } from "../lib/skills";

export default function Profile() {
  const { id } = useParams();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const isOwn = !id || id === user?.id;
  const profileId = isOwn ? user?.id : id;

  const [profileData, setProfileData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [allSkillNames, setAllSkillNames] = useState([]);
  const [loading, setLoading] = useState(true);

  // edit mode (own profile)
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", bio: "", location: "", avatar_url: "" });
  const [saving, setSaving] = useState(false);

  // add skill
  const [newSkill, setNewSkill] = useState("");
  const [addingType, setAddingType] = useState(null); // 'teach' | 'learn'
  const [skillError, setSkillError] = useState("");

  // request modal
  const [showRequest, setShowRequest] = useState(false);
  const [requestMsg, setRequestMsg] = useState("");
  const [requestSending, setRequestSending] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);

  useEffect(() => {
    if (!profileId) return;
    let active = true;
    (async () => {
      setLoading(true);
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .maybeSingle();
      if (!active) return;
      setProfileData(p);
      setEditForm({
        full_name: p?.full_name || "",
        bio: p?.bio || "",
        location: p?.location || "",
        avatar_url: p?.avatar_url || "",
      });
      const s = await fetchUserSkills(profileId);
      if (active) setSkills(s);

      const names = await fetchAllSkillNames();
      if (active) setAllSkillNames(names);

      // check existing request (for other profiles)
      if (!isOwn && user) {
        const { data: req } = await supabase
          .from("exchange_requests")
          .select("id, status")
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${profileId}),and(sender_id.eq.${profileId},receiver_id.eq.${user.id})`)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (active) setExistingRequest(req || null);
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [profileId, isOwn, user]);

  async function handleSaveProfile() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editForm.full_name,
        bio: editForm.bio,
        location: editForm.location,
        avatar_url: editForm.avatar_url,
      })
      .eq("id", user.id);
    setSaving(false);
    if (!error) {
      setEditing(false);
      await refreshProfile();
      setProfileData({ ...profileData, ...editForm });
    }
  }

  async function handleAddSkill(type) {
    if (!newSkill.trim()) return;
    setSkillError("");
    try {
      const row = await addUserSkill(user.id, newSkill, type);
      setSkills([...skills, row]);
      setNewSkill("");
      setAddingType(null);
    } catch (e) {
      setSkillError(e.message || "Could not add skill");
    }
  }

  async function handleRemoveSkill(rowId) {
    try {
      await removeUserSkill(rowId);
      setSkills(skills.filter((s) => s.id !== rowId));
    } catch (e) {
      // ignore
    }
  }

  async function handleSendRequest() {
    setRequestSending(true);
    const { error } = await supabase.from("exchange_requests").insert({
      sender_id: user.id,
      receiver_id: profileId,
      message: requestMsg,
    });
    setRequestSending(false);
    if (!error) {
      setShowRequest(false);
      setRequestMsg("");
      setExistingRequest({ status: "pending" });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileData && !isOwn) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Profile not found.</p>
        <Link to="/explore" className="text-brand-700 font-medium hover:underline mt-2 inline-block">
          Back to Explore
        </Link>
      </div>
    );
  }

  const teachSkills = skills.filter((s) => s.type === "teach");
  const learnSkills = skills.filter((s) => s.type === "learn");

  const suggestions = allSkillNames
    .filter((n) => n.toLowerCase().includes(newSkill.toLowerCase()))
    .filter((n) => !skills.some((s) => s.name === n && s.type === addingType))
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {!isOwn && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} /> Back
        </button>
      )}

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <Avatar name={profileData?.full_name} url={profileData?.avatar_url} size={80} />
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="text-xl font-bold text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 w-full mb-2"
                placeholder="Full name"
              />
            ) : (
              <h1 className="text-xl font-bold text-gray-900">
                {profileData?.full_name || "Unnamed"}
              </h1>
            )}
            {editing ? (
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={15} className="text-gray-400" />
                <input
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="text-sm text-gray-600 border border-gray-300 rounded-lg px-2 py-1 flex-1"
                  placeholder="Location"
                />
              </div>
            ) : (
              profileData?.location && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin size={14} /> {profileData.location}
                </p>
              )
            )}
            {editing ? (
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-2 w-full mt-2 min-h-[80px]"
                placeholder="Write a short bio..."
              />
            ) : (
              profileData?.bio && (
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{profileData.bio}</p>
              )
            )}
            {editing && (
              <div className="mt-2">
                <input
                  value={editForm.avatar_url}
                  onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                  className="text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-1.5 w-full"
                  placeholder="Avatar image URL (optional)"
                />
              </div>
            )}
          </div>

          {isOwn ? (
            editing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition"
                >
                  <Save size={16} /> {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
              >
                <Pencil size={16} /> Edit
              </button>
            )
          ) : null}
        </div>

        {/* Action buttons for other profiles */}
        {!isOwn && (
          <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap gap-2">
            {existingRequest?.status === "accepted" ? (
              <Link
                to={`/messages/${profileId}`}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition"
              >
                <MessageSquare size={16} /> Message
              </Link>
            ) : existingRequest?.status === "pending" ? (
              <span className="px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-lg">
                Request pending
              </span>
            ) : existingRequest?.status === "rejected" ? (
              <span className="px-4 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg">
                Request declined
              </span>
            ) : (
              <button
                onClick={() => setShowRequest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition"
              >
                <Send size={16} /> Send exchange request
              </button>
            )}
          </div>
        )}
      </div>

      {/* Skills section */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Teach */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <GraduationCap size={18} />
            </div>
            <h2 className="font-semibold text-gray-900">Skills I Can Teach</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {teachSkills.length === 0 && !isOwn && (
              <p className="text-sm text-gray-400">No teaching skills listed.</p>
            )}
            {teachSkills.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5 bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-sm font-medium">
                {s.name}
                {isOwn && (
                  <button onClick={() => handleRemoveSkill(s.id)} className="hover:text-brand-900">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            {teachSkills.length === 0 && isOwn && (
              <p className="text-sm text-gray-400">Add a skill you can teach.</p>
            )}
          </div>
          {isOwn && (
            <AddSkillInput
              type="teach"
              newSkill={newSkill}
              setNewSkill={setNewSkill}
              addingType={addingType}
              setAddingType={setAddingType}
              onAdd={handleAddSkill}
              suggestions={suggestions}
              error={skillError}
              setSkillError={setSkillError}
            />
          )}
        </div>

        {/* Learn */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <h2 className="font-semibold text-gray-900">Skills I Want to Learn</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {learnSkills.length === 0 && !isOwn && (
              <p className="text-sm text-gray-400">No learning skills listed.</p>
            )}
            {learnSkills.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                {s.name}
                {isOwn && (
                  <button onClick={() => handleRemoveSkill(s.id)} className="hover:text-green-900">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            {learnSkills.length === 0 && isOwn && (
              <p className="text-sm text-gray-400">Add a skill you want to learn.</p>
            )}
          </div>
          {isOwn && (
            <AddSkillInput
              type="learn"
              newSkill={newSkill}
              setNewSkill={setNewSkill}
              addingType={addingType}
              setAddingType={setAddingType}
              onAdd={handleAddSkill}
              suggestions={suggestions}
              error={skillError}
              setSkillError={setSkillError}
            />
          )}
        </div>
      </div>

      {/* Request modal */}
      {showRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowRequest(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Send skill exchange request</h3>
            <p className="text-sm text-gray-500 mb-4">
              {profileData?.full_name} will be notified of your request.
            </p>
            <textarea
              value={requestMsg}
              onChange={(e) => setRequestMsg(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[90px] focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
              placeholder="Introduce yourself and what you'd like to learn or teach..."
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSendRequest}
                disabled={requestSending}
                className="flex-1 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition disabled:opacity-60"
              >
                {requestSending ? "Sending..." : "Send request"}
              </button>
              <button
                onClick={() => setShowRequest(false)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddSkillInput({ type, newSkill, setNewSkill, addingType, setAddingType, onAdd, suggestions, error, setSkillError }) {
  const open = addingType === type;
  return (
    <div className="mt-4">
      {open ? (
        <div className="relative">
          <div className="flex gap-2">
            <input
              autoFocus
              value={newSkill}
              onChange={(e) => {
                setNewSkill(e.target.value);
                setSkillError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAdd(type);
                }
              }}
              placeholder="Type a skill name..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
            />
            <button
              onClick={() => onAdd(type)}
              className="px-3 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700"
            >
              Add
            </button>
            <button
              onClick={() => {
                setAddingType(null);
                setNewSkill("");
                setSkillError("");
              }}
              className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
            >
              <X size={16} />
            </button>
          </div>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          {suggestions.length > 0 && newSkill && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-auto">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setNewSkill(s);
                    onAdd(type);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-brand-50 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => {
            setAddingType(type);
            setNewSkill("");
            setSkillError("");
          }}
          className="flex items-center gap-1.5 text-sm text-brand-700 font-medium hover:underline"
        >
          <Plus size={16} /> Add skill
        </button>
      )}
    </div>
  );
}
