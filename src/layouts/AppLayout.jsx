import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  User,
  Inbox,
  MessageSquare,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/explore", label: "Explore Skills", icon: Compass },
  { to: "/requests", label: "Requests", icon: Inbox },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/profile", label: "My Profile", icon: User },
];

export default function AppLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 hidden md:flex">
        <div className="px-6 py-5 flex items-center gap-2 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <Sparkles size={20} />
          </div>
          <span className="font-bold text-lg text-gray-900">SkillSwap</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/profile"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full transition"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 bg-white border-b border-gray-200 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <span className="font-bold text-gray-900">SkillSwap</span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-gray-500 hover:text-gray-900"
          >
            <LogOut size={20} />
          </button>
        </div>
        <nav className="flex px-2 pb-2 overflow-x-auto gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/profile"}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <item.icon size={15} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-[112px] md:pt-0 min-w-0">
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
