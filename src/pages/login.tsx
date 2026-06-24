import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { trpc } from "../utils/trpc";
import { PixelButton } from "../components/PixelButton";
import { PixelInput } from "../components/PixelInput";
import { REGISTRATION_ENABLED } from "../lib/security";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  const registerMutation = trpc.authRegister.useMutation();
  const loginMutation = trpc.authLogin.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await registerMutation.mutateAsync({ email, password, secret });
        // For now simply redirect to login mode after successful registration
        setMode("login");
        setError("Registered successfully, please login.");
      } else {
        const data = await loginMutation.mutateAsync({ email, password });
        localStorage.setItem("sb-access-token", data.token);
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative grid min-h-[100dvh] w-full place-items-center px-4 py-12"
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--grid-line) 1px, transparent 1px), linear-gradient(180deg, var(--grid-line) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }}
    >
      <div className="absolute right-4 top-4 z-20">
        <Link href="/">
          <PixelButton variant="secondary" size="sm">
            返回首页
          </PixelButton>
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Brand mark */}
        <div className="mb-6 flex items-center gap-2 font-mono text-lg font-extrabold text-fg">
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center border-2 border-[var(--ink)] bg-[var(--hi)] text-[var(--hi-ink)] text-xs font-black shadow-[2px_2px_0_0_var(--ink)]"
          >
            M
          </span>
          milkrong<span className="text-fg-muted">/blog</span>
        </div>

        <div className="pixel-panel-lg p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="font-mono text-2xl font-extrabold tracking-tight text-fg">
              {mode === "login" ? "登录" : "注册"}
            </h1>
            <p className="mt-1 text-sm text-fg-muted">
              {mode === "login" ? "输入邮箱与密码进入管理后台" : "创建一个新账号"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="border-l-4 border-[var(--danger)] bg-[var(--surface-2)] px-3 py-2 font-mono text-sm text-[var(--danger)]">
                {error}
              </p>
            )}
            {registerMutation.error && (
              <p className="font-mono text-sm text-[var(--danger)]">
                {registerMutation.error.message}
              </p>
            )}
            {loginMutation.error && (
              <p className="font-mono text-sm text-[var(--danger)]">
                {loginMutation.error.message}
              </p>
            )}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="font-mono text-xs font-bold uppercase tracking-wide text-fg-muted"
              >
                邮箱
              </label>
              <PixelInput
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="font-mono text-xs font-bold uppercase tracking-wide text-fg-muted"
              >
                密码
              </label>
              <PixelInput
                id="password"
                type="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
              />
            </div>
            {mode === "register" && (
              <div className="space-y-1.5">
                <label
                  htmlFor="secret"
                  className="font-mono text-xs font-bold uppercase tracking-wide text-fg-muted"
                >
                  注册密钥
                </label>
                <PixelInput
                  id="secret"
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="输入注册密钥"
                  required
                />
                <p className="font-mono text-xs text-fg-muted">
                  需要正确的注册密钥才能创建账号
                </p>
              </div>
            )}
            <PixelButton
              disabled={loading}
              type="submit"
              className="w-full"
              size="lg"
            >
              {loading
                ? mode === "login"
                  ? "登录中..."
                  : "注册中..."
                : mode === "login"
                ? "登录"
                : "创建账号"}
            </PixelButton>
          </form>

          {REGISTRATION_ENABLED && (
            <div className="mt-5 text-center font-mono text-sm">
              {mode === "login" ? (
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-accent underline underline-offset-4 hover:opacity-80"
                >
                  还没有账号？注册
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-accent underline underline-offset-4 hover:opacity-80"
                >
                  已有账号？登录
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
