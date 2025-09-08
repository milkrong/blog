import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { trpc } from "../utils/trpc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
    <div className="relative min-h-screen w-full grid lg:grid-cols-2">
      <div className="absolute top-4 right-4 z-20">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">返回首页</Link>
        </Button>
      </div>
      {/* Left visual panel */}
      <div className="hidden lg:block relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(/login-bg.jpg), radial-gradient(at 30% 30%, rgba(56,189,248,0.25), transparent 60%), linear-gradient(to bottom right, hsl(var(--primary)/0.15), transparent)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/60 to-background/10 backdrop-blur-sm" />
        <div className="relative z-10 flex h-full items-end p-10">
          <div className="max-w-md text-sm text-muted-foreground">
            <h2 className="text-3xl font-bold tracking-tight mb-2">欢迎回来</h2>
            <p>登录后可进入管理后台发布或编辑文章。</p>
          </div>
        </div>
      </div>
      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">
              {mode === "login" ? "登录" : "注册"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "输入邮箱与密码登录账号" : "创建一个新账号"}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            {registerMutation.error && (
              <p className="text-sm text-destructive">
                {registerMutation.error.message}
              </p>
            )}
            {loginMutation.error && (
              <p className="text-sm text-destructive">
                {loginMutation.error.message}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
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
              <div className="space-y-2">
                <Label htmlFor="secret">注册密钥</Label>
                <Input
                  id="secret"
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="输入注册密钥"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  需要正确的注册密钥才能创建账号
                </p>
              </div>
            )}
            <Button disabled={loading} type="submit" className="w-full">
              {loading
                ? mode === "login"
                  ? "登录中..."
                  : "注册中..."
                : mode === "login"
                ? "登录"
                : "创建账号"}
            </Button>
          </form>
          {REGISTRATION_ENABLED && (
            <div className="text-center text-sm">
              {mode === "login" ? (
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  还没有账号？注册
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-primary underline-offset-4 hover:underline"
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
