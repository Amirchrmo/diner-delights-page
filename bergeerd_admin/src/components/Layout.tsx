import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth";
import logo from "../assets/LOGO-header2.png";

export default function Layout() {
  const { username, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/90 backdrop-blur-md shadow-card">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <div className="flex items-center gap-3 shrink-0">
              <img
                src={logo}
                alt="برگِرد"
                className="h-11 w-11 object-contain"
              />
              <div className="leading-tight">
                <div className="font-bold text-lg text-charcoal tracking-wide">
                  برگِرد
                </div>
                <div className="text-[11px] text-warm-gray/70">پنل مدیریت</div>
              </div>
            </div>
            <nav className="hidden sm:flex gap-1">
              <NavItem to="/" end label="منو" />
              <NavItem to="/categories" label="دسته‌بندی‌ها" />
            </nav>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:inline text-sm text-warm-gray/80">
              {username}
            </span>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm rounded-lg border border-black/10 text-warm-gray hover:bg-brand/5 hover:border-brand/30 hover:text-brand transition-colors"
            >
              خروج
            </button>
          </div>
        </div>
        <nav className="sm:hidden flex gap-1 px-4 pb-3">
          <NavItem to="/" end label="منو" mobile />
          <NavItem to="/categories" label="دسته‌بندی‌ها" mobile />
        </nav>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 animate-fade-up">
        <Outlet />
      </main>

      <footer className="border-t border-black/5 py-4 text-center text-xs text-warm-gray/50">
        برگِرد — یه گرد خوشمزه
      </footer>
    </div>
  );
}

function NavItem({
  to,
  end,
  label,
  mobile,
}: {
  to: string;
  end?: boolean;
  label: string;
  mobile?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${mobile ? "flex-1 text-center" : ""} px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-brand text-white shadow-menu"
            : "text-warm-gray hover:bg-brand/8 hover:text-brand"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
