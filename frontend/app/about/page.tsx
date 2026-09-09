import Link from "next/link";

export const metadata = {
  title: "About Us — ShopEase",
  description: "Learn about ShopEase's mission, values, and the team behind your favorite e-commerce destination.",
};

const values = [
  {
    icon: "bi-patch-check",
    title: "Quality First",
    desc: "Every product we sell goes through rigorous quality checks. We only list items we'd buy ourselves.",
  },
  {
    icon: "bi-shield-lock",
    title: "Customer Trust",
    desc: "We believe in transparency, honest pricing, and no hidden fees. Your trust is our most valuable asset.",
  },
  {
    icon: "bi-globe",
    title: "Global Standards",
    desc: "We support sustainable sourcing and top-tier logistics to deliver excellence worldwide.",
  },
  {
    icon: "bi-lightning-charge",
    title: "Innovation",
    desc: "We constantly improve our platform to make your shopping experience faster and seamless.",
  },
];

const team = [
  { name: "Kimsorng", role: "Founder & CEO", avatar: "K" },
  { name: "Sokha", role: "Head of Products", avatar: "S" },
  { name: "Dara", role: "Lead Engineer", avatar: "D" },
  { name: "Phea", role: "Customer Success", avatar: "P" },
];

export default function AboutPage() {
  return (
    <div className="bg-[#f8fafc] py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Hero */}
        <section className="rounded-3xl bg-[#0f172a] px-6 py-16 text-center sm:px-12 text-white shadow-xl">
          <div className="mx-auto max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              About ShopEase
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              We started ShopEase with a simple belief: everyone deserves access to high-quality tech, fashion, and lifestyle products with effortless ordering and dependable service.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900">Our Core Values</h2>
            <p className="text-sm text-slate-500 mt-1">The principles guiding everything we build and deliver.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
                  <i className={`bi ${v.icon} text-lg`}></i>
                </div>
                <h3 className="text-base font-bold text-slate-900">{v.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900">Leadership Team</h2>
            <p className="text-sm text-slate-500 mt-1">Passionate about delivering the best shopping experience.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {team.map((m) => (
              <div key={m.name} className="p-6 rounded-2xl border border-slate-200 bg-white text-center shadow-2xs space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white shadow-sm">
                  {m.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{m.name}</h4>
                  <p className="text-xs text-slate-500">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}