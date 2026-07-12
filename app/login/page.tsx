"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/app/components/NavBar";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Signing in...");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      router.push("/admin");
    } else {
      setStatus("Invalid password, please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 px-6 py-10 dark:bg-zinc-950 dark:text-zinc-100">
      <NavBar />
      <main className="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-3xl font-semibold">Admin login</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">Enter the admin password to edit portfolio content.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <button className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700">
            Sign in
          </button>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{status}</p>
        </form>
      </main>
    </div>
  );
}
