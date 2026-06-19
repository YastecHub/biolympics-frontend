import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store";
import { PageHeader } from "@/components/ui";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type Form = z.infer<typeof schema>;

export default function AdminLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>();

  async function onSubmit(values: Form) {
    setError("");
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    try {
      const { access_token } = await api.login(values.email, values.password);
      setAuth(access_token, [], values.email);
      const me = await api.me();
      setAuth(access_token, me.roles, me.email);
      navigate("/admin");
    } catch {
      setError("Invalid email or password.");
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <PageHeader title="Sign in" subtitle="Officials & administrators only." />
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6" noValidate>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-semibold">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            className="w-full rounded-lg border border-black/10 bg-surface px-3 py-2 dark:border-white/15"
            {...register("email")}
          />
          {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-semibold">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-lg border border-black/10 bg-surface px-3 py-2 dark:border-white/15"
            {...register("password")}
          />
          {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
