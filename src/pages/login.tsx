import { useState } from "react";
import { useRouter } from "next/router";
import { trpc } from "../utils/trpc";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        await registerMutation.mutateAsync({ email, password });
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
    <div className="max-w-sm mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {mode === "login" ? "Login" : "Register"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-600">{error}</p>}
        {registerMutation.error && (
          <p className="text-red-600">{registerMutation.error.message}</p>
        )}
        {loginMutation.error && (
          <p className="text-red-600">{loginMutation.error.message}</p>
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Password"
          required
        />
        <button
          disabled={loading}
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading
            ? mode === "login"
              ? "Signing In..."
              : "Registering..."
            : mode === "login"
            ? "Sign In"
            : "Create Account"}
        </button>
      </form>
      <div className="mt-4 text-sm text-center">
        {mode === "login" ? (
          <button
            type="button"
            onClick={() => setMode("register")}
            className="text-blue-600 hover:underline"
          >
            Need an account? Register
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMode("login")}
            className="text-blue-600 hover:underline"
          >
            Already have an account? Sign In
          </button>
        )}
      </div>
    </div>
  );
}
