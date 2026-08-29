"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Loader2, ArrowRight } from "lucide-react";
import { register } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organisation: "",
    password: "",
    confirm: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !formData.name ||
      !formData.email ||
      !formData.organisation ||
      !formData.password
    ) {
      setError("All fields are required.");
      return;
    }
    if (formData.password !== formData.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        organisation: formData.organisation,
        password: formData.password,
      });
      router.push("/upload");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    {
      id: "name",
      label: "Full Name",
      type: "text",
      placeholder: "Priya Sharma",
      autoComplete: "name",
    },
    {
      id: "email",
      label: "Work Email",
      type: "email",
      placeholder: "priya@company.com",
      autoComplete: "email",
    },
    {
      id: "organisation",
      label: "Organisation",
      type: "text",
      placeholder: "Archangel Compliance Ltd",
      autoComplete: "organization",
    },
    {
      id: "password",
      label: "Password",
      type: "password",
      placeholder: "Min. 8 characters",
      autoComplete: "new-password",
    },
    {
      id: "confirm",
      label: "Confirm Password",
      type: "password",
      placeholder: "Repeat password",
      autoComplete: "new-password",
    },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#09090f] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 dark:from-[#1d3a6e] dark:to-[#1d3a6e] dark:border dark:border-[#2563eb] flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Shield className="w-4 h-4 text-white dark:text-[#3b82f6]" />
            </div>
            <span className="text-sm font-bold text-[#111827] dark:text-[#e8eaf6]">
              GST{" "}
              <span className="text-indigo-600 dark:text-[#3b82f6]">
                ARCHANGEL
              </span>
            </span>
          </Link>
          <ThemeToggle size="sm" />
        </div>

        <div className="bg-white dark:bg-[#0f1017] border border-[#E5E7EB] dark:border-[#1e2130] rounded-2xl shadow-sm dark:shadow-none p-8">
          <div className="mb-7">
            <h1 className="text-xl font-bold text-[#111827] dark:text-[#e8eaf6] tracking-tight mb-1.5">
              Create account
            </h1>
            <p className="text-sm text-[#667085] dark:text-[#5a6380]">
              Set up your compliance workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {fields.map((field) => (
              <div key={field.id}>
                <label
                  htmlFor={field.id}
                  className="block text-xs font-semibold text-[#374151] dark:text-[#9ba3bf] mb-1.5 uppercase tracking-wider"
                >
                  {field.label}
                </label>
                <input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  value={formData[field.id]}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg bg-[#F9FAFB] dark:bg-[#141520] border border-[#E5E7EB] dark:border-[#1e2130] text-sm text-[#111827] dark:text-[#e8eaf6] placeholder:text-[#9CA3AF] dark:placeholder:text-[#383d52] focus:border-indigo-400 dark:focus:border-[#3b82f6] focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-[#3b82f6]/15 outline-none transition-all"
                />
              </div>
            ))}

            {error && (
              <div className="px-3.5 py-2.5 bg-[#FEF2F2] dark:bg-[#3f0d0d] border border-[#FECACA] dark:border-[#7f1d1d] rounded-lg text-xs text-[#DC2626] dark:text-[#ef4444]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "mt-1 h-11 w-full rounded-lg font-semibold text-sm tracking-wide transition-all flex items-center justify-center gap-2",
                "bg-indigo-600 dark:bg-[#3b82f6] hover:bg-indigo-700 dark:hover:bg-[#2563eb] text-white",
                "shadow-lg shadow-indigo-500/20 dark:shadow-none",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#9CA3AF] dark:text-[#5a6380]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-600 dark:text-[#3b82f6] hover:text-indigo-700 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
