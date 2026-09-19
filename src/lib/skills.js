import { supabase } from "./supabaseClient";

// Returns the skill record for a given name, creating it if needed.
export async function findOrCreateSkill(name) {
  const trimmed = name.trim().toLowerCase();
  const { data: existing } = await supabase
    .from("skills")
    .select("id, name")
    .eq("name", trimmed)
    .maybeSingle();
  if (existing) return existing;
  const { data, error } = await supabase
    .from("skills")
    .insert({ name: trimmed })
    .select("id, name")
    .single();
  if (error) throw error;
  return data;
}

// Fetch all user_skills with skill name for a user.
export async function fetchUserSkills(userId) {
  const { data, error } = await supabase
    .from("user_skills")
    .select("id, type, skill_id, skills(id, name)")
    .eq("user_id", userId);
  if (error) throw error;
  return (data || []).map((r) => ({
    id: r.id,
    type: r.type,
    skill_id: r.skill_id,
    name: r.skills?.name || "",
  }));
}

// Add a skill (teach/learn) for the current user. Returns the new row.
export async function addUserSkill(userId, skillName, type) {
  const skill = await findOrCreateSkill(skillName);
  const { data, error } = await supabase
    .from("user_skills")
    .insert({ user_id: userId, skill_id: skill.id, type })
    .select("id, type, skill_id")
    .single();
  if (error) throw error;
  return { id: data.id, type: data.type, skill_id: data.skill_id, name: skill.name };
}

export async function removeUserSkill(rowId) {
  const { error } = await supabase.from("user_skills").delete().eq("id", rowId);
  if (error) throw error;
}

// Fetch all skill names (for autocomplete).
export async function fetchAllSkillNames() {
  const { data, error } = await supabase.from("skills").select("name").order("name");
  if (error) throw error;
  return (data || []).map((s) => s.name);
}
