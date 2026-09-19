import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Compass,
  User,
  Inbox,
  MessageSquare,
  LogOut,
  Sparkles,
  BookOpen,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/profile", label: "My Skills", icon: BookOpen },
  { to: "/requests", label: "Requests", icon: Inbox },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: User },
];

export default function AppLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#fafaf9] border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 hidden md:flex">
        <div className="px-6 py-6 flex items-center gap-2 border-b border-gray-200">
          <div className="w-8 h-8 rounded-md bg-[#0a0a0a] flex items-center justify-center text-white">
            <Sparkles size={17} />
          </div>
          <span className="font-semibold tracking-tight text-lg text-gray-950">SkillSwap</span>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/profile"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition ${
                  isActive
                    ? "bg-[#c8ff3d] text-[#080808]"
                    : "text-gray-500 hover:bg-gray-200/60 hover:text-gray-950"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-200/60 hover:text-gray-950"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </nav>
        <div className="px-3 py-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <Avatar name={profile?.full_name} url={profile?.avatar_url} size={36} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {profile?.location || "No location"}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-200/60 hover:text-gray-950 w-full transition"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 bg-[#f7f7f5] border-b border-gray-200 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[#0a0a0a] flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <span className="font-bold text-gray-900">SkillSwap</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className={`${mobileMenuOpen ? "flex" : "hidden"} flex-col px-3 pb-3 gap-1 border-t border-gray-200 pt-2`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/profile"}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? "bg-[#c8ff3d] text-[#080808]"
                    : "text-gray-500 hover:bg-gray-200/60"
                }`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon size={15} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-[112px] md:pt-0 min-w-0">
        <div className="p-5 md:p-10 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
