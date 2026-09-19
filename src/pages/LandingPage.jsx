import { Link } from "react-router-dom";
import { Sparkles, Users, Search, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Share your skills",
    desc: "List what you can teach and what you want to learn. Let others discover you.",
  },
  {
    icon: Search,
    title: "Find the right match",
    desc: "Search and explore community members by skill. Find people who complement you.",
  },
  {
    icon: MessageSquare,
    title: "Connect and learn",
    desc: "Send a skill exchange request, then message once it's accepted.",
  },
];

const steps = [
  { title: "Create your profile", desc: "Sign up and add your name, bio, and location." },
  { title: "Add your skills", desc: "Tag what you can teach and what you want to learn." },
  { title: "Explore & connect", desc: "Discover people and send exchange requests." },
  { title: "Start learning", desc: "Message each other once a request is accepted." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Sparkles size={20} />
            </div>
            <span className="font-bold text-lg text-gray-900">SkillSwap</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-brand-700 transition"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-6">
          <Sparkles size={15} />
          Community Skill Exchange
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight max-w-3xl mx-auto leading-[1.1]">
          Swap skills.{" "}
          <span className="text-brand-600">Learn together.</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          SkillSwap connects students and community members to share what they
          know and learn what they don't. Teach a skill, learn a skill — no
          money, just collaboration.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition"
          >
            Get started free
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 text-brand-700 font-semibold rounded-lg border border-brand-200 hover:bg-brand-50 transition"
          >
            I have an account
          </Link>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-md hover:border-brand-100 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <f.icon size={22} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How it works
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold mb-4">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="p-10 md:p-14 rounded-3xl bg-brand-600 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to swap skills?
          </h2>
          <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
            Join the community and start exchanging knowledge today. It's free
            and always will be.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-700 font-semibold rounded-lg hover:bg-brand-50 transition"
          >
            Create your account
            <ArrowRight size={18} />
          </Link>
        </div>
        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-gray-500">
          {["Free forever", "No payments", "Student-friendly"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-brand-600" />
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-500">
          SkillSwap — a college final-year project. Built with React, Vite,
          Tailwind & Supabase.
        </div>
      </footer>
    </div>
  );
}
