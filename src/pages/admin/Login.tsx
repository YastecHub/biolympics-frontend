import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store";
import { Logo } from "@/components/Logo";

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
    <div className="mx-auto grid min-h-[70vh] max-w-5xl items-center gap-8 lg:grid-cols-[1fr_24rem]">
      <section className="relative overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.07] px-6 py-10 shadow-2xl shadow-black/20">
        <div className="absolute inset-x-0 top-0 h-1 bg-brand-lime" />
        <Logo />
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.24em] text-brand-lime">
          Admin Control Centre
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
          Keep the games moving.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/64">
          Sign in to publish updates, manage fixtures, run live scores and push results into the public festival pages.
        </p>
      </section>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-white/12 bg-white/[0.08] p-6 shadow-2xl shadow-black/20"
        noValidate
      >
        <h2 className="font-display text-2xl font-bold">Officials sign in</h2>
        <p className="mt-1 text-sm text-white/56">Use your assigned admin account.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-3 text-white"
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
              className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-3 text-white"
              {...register("password")}
            />
            {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
          </div>
          {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <button type="submit" className="btn-primary w-full !py-3" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
