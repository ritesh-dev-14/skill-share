const STORAGE_KEY = "skillswap-data-v1";
const SESSION_KEY = "skillswap-session-v1";

const demoUsers = [
  {
    id: "demo-maya",
    email: "maya@example.com",
    password: "demo123",
    full_name: "Maya Chen",
    bio: "Product designer who loves making complex ideas feel simple.",
    location: "Austin, TX",
    avatar_url: "",
    skills: [
      { id: "maya-figma", name: "Figma", type: "teach" },
      { id: "maya-research", name: "User Research", type: "teach" },
      { id: "maya-python", name: "Python", type: "learn" },
    ],
  },
  {
    id: "demo-jordan",
    email: "jordan@example.com",
    password: "demo123",
    full_name: "Jordan Williams",
    bio: "Frontend developer building accessible web experiences.",
    location: "Seattle, WA",
    avatar_url: "",
    skills: [
      { id: "jordan-react", name: "React", type: "teach" },
      { id: "jordan-js", name: "JavaScript", type: "teach" },
      { id: "jordan-spanish", name: "Spanish", type: "learn" },
    ],
  },
  {
    id: "demo-priya",
    email: "priya@example.com",
    password: "demo123",
    full_name: "Priya Nair",
    bio: "Data storyteller, mentor, and weekend photographer.",
    location: "Boston, MA",
    avatar_url: "",
    skills: [
      { id: "priya-excel", name: "Data Visualization", type: "teach" },
      { id: "priya-speaking", name: "Public Speaking", type: "teach" },
      { id: "priya-design", name: "Figma", type: "learn" },
    ],
  },
  {
    id: "demo-sam",
    email: "sam@example.com",
    password: "demo123",
    full_name: "Sam Rivera",
    bio: "Photographer learning to turn side projects into products.",
    location: "Denver, CO",
    avatar_url: "",
    skills: [
      { id: "sam-photo", name: "Photography", type: "teach" },
      { id: "sam-marketing", name: "Digital Marketing", type: "teach" },
      { id: "sam-react", name: "React", type: "learn" },
    ],
  },
];

function seedData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  const data = { users: demoUsers, requests: [], messages: [] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function getData() {
  return seedData();
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function getSession() {
  const id = localStorage.getItem(SESSION_KEY);
  return id ? getData().users.find((user) => user.id === id) || null : null;
}

export function setSession(userId) {
  if (userId) localStorage.setItem(SESSION_KEY, userId);
  else localStorage.removeItem(SESSION_KEY);
}

export function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function publicUser(user) {
  if (!user) return null;
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
}
