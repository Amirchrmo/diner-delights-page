import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { HttpError } from "../api";
import logo from "../assets/LOGO-header2.png";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) {
        setError("نام کاربری یا رمز عبور اشتباه است.");
      } else {
        setError("خطا در اتصال به سرور. دوباره تلاش کنید.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(160deg, #d2080b 0%, hsl(0 73% 35%) 45%, hsl(0 0% 12%) 100%)",
        }}
      />
      <div className="absolute inset-0 -z-10 opacity-30 bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_80%,hsl(0_65%_55%/.4),transparent_40%)]" />

      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8 text-white">
          <img
            src={logo}
            alt="برگِرد"
            className="mx-auto h-28 w-28 object-contain drop-shadow-lg mb-3"
          />
          <h1 className="text-3xl font-bold tracking-wide">برگِرد ادمین</h1>
          <p className="text-white/80 text-sm mt-2">وارد شوید تا منو را مدیریت کنید</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-menu border border-white/40 p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              نام کاربری
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
              className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-background focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              رمز عبور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-background focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-brand text-white font-medium hover:bg-brand-dark disabled:opacity-60 transition-colors shadow-menu"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        <p className="text-center text-white/60 text-xs mt-6">یه گرد خوشمزه</p>
      </div>
    </div>
  );
}
