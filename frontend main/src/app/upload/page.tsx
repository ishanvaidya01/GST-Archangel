"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Upload,
  Landmark,
  FileText,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck2,
  Zap,
  Loader2,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface UploadedFileItem {
  id: string;
  file: File | { name: string; size: number; type: string };
  progress: number;
  status: "uploading" | "done" | "error";
}

export default function UploadPage() {
  const router = useRouter();

  // File states for 4 categories
  const [bankFiles, setBankFiles] = useState<UploadedFileItem[]>([]);
  const [purchaseFiles, setPurchaseFiles] = useState<UploadedFileItem[]>([]);
  const [salesFiles, setSalesFiles] = useState<UploadedFileItem[]>([]);
  const [gstFiles, setGstFiles] = useState<UploadedFileItem[]>([]);

  // Drag states
  const [draggingCategory, setDraggingCategory] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Generic handler to add files with simulated smooth upload progress
  const addFilesToCategory = (
    category: "bank" | "purchase" | "sales" | "gst",
    newFiles: FileList | File[]
  ) => {
    setErrorMessage(null);
    const filesArray = Array.from(newFiles);

    const items: UploadedFileItem[] = filesArray.map((file, idx) => ({
      id: `${category}-${Date.now()}-${idx}-${file.name}`,
      file,
      progress: 100,
      status: "done",
    }));

    if (category === "bank") {
      setBankFiles((prev) => [...prev, ...items]);
    } else if (category === "purchase") {
      setPurchaseFiles((prev) => [...prev, ...items]);
    } else if (category === "sales") {
      setSalesFiles((prev) => [...prev, ...items]);
    } else if (category === "gst") {
      setGstFiles((prev) => [...prev, ...items]);
    }
  };

  // Remove file
  const removeFile = (
    category: "bank" | "purchase" | "sales" | "gst",
    id: string
  ) => {
    if (category === "bank") setBankFiles((prev) => prev.filter((f) => f.id !== id));
    if (category === "purchase") setPurchaseFiles((prev) => prev.filter((f) => f.id !== id));
    if (category === "sales") setSalesFiles((prev) => prev.filter((f) => f.id !== id));
    if (category === "gst") setGstFiles((prev) => prev.filter((f) => f.id !== id));
  };



  // Submit Handler — calls real backend
  const handleRunAudit = async () => {
    if (bankFiles.length === 0) {
      setErrorMessage("Please provide at least one Bank Statement file (CSV or XLSX).");
      return;
    }
    if (purchaseFiles.length === 0) {
      setErrorMessage("Please upload at least one Purchase Invoice (PDF) for reconciliation.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const formData = new FormData();
      // Add real files if they exist, otherwise skip demo placeholders
      bankFiles.forEach(item => {
        if (item.file instanceof File) formData.append("bank_csv", item.file);
      });
      purchaseFiles.forEach(item => {
        if (item.file instanceof File) formData.append("purchase_invoices", item.file);
      });
      salesFiles.forEach(item => {
        if (item.file instanceof File) formData.append("sale_invoices", item.file);
      });


      // Step 1: Upload files
      const uploadRes = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
        headers,
      });
      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => ({}));
        throw new Error(errData?.detail ?? `Upload failed (${uploadRes.status})`);
      }
      const { run_id } = await uploadRes.json();

      // Step 2: Trigger audit run
      await fetch(`${API_BASE}/api/audit/run/${run_id}`, {
        method: "POST",
        headers,
      });

      // Step 3: Redirect to processing page
      router.push(`/audit/${run_id}/processing`);
    } catch (err: any) {
      setErrorMessage(err.message ?? "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7F8FD] dark:bg-[#080B14] text-[#0E1630] dark:text-[#F8FAFC] transition-colors duration-200">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -right-[8%] -top-[10%] h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,rgba(139,92,246,0.05)_45%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(99,102,241,0.22)_0%,transparent_70%)] blur-[10px]" />
      <div className="pointer-events-none absolute bottom-[-10%] -left-[5%] h-[600px] w-[600px] bg-[radial-gradient(circle,rgba(79,110,247,0.12)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(79,110,247,0.18)_0%,transparent_70%)]" />

      {/* ── Top Navbar ───────────────────────────────────────────────────────── */}
      <nav className="relative z-10 mx-auto flex max-w-[1600px] items-center justify-between px-8 py-5 lg:px-16 border-b border-[#E2E8F0]/60 dark:border-[#1E293B] bg-white/70 dark:bg-[#0D1220]/80 backdrop-blur-md transition-colors duration-200">
        <Link href="/" className="flex items-center gap-3 group">
          <svg viewBox="0 0 40 40" className="h-8 w-8">
            <defs>
              <linearGradient id="navLogoGrad" x1="0" y1="0" x2="40" y2="40">
                <stop offset="0%" stopColor="#4F6EF7" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <path d="M20 6 L10 12.5 L20 19 L30 12.5 Z" fill="url(#navLogoGrad)" />
            <path
              d="M10 20 L20 26.5 L30 20 L30 24 L20 30.5 L10 24 Z"
              fill="url(#navLogoGrad)"
              opacity="0.75"
            />
          </svg>
          <span className="font-[Manrope,sans-serif] text-[20px] font-extrabold">
            <span className="text-[#0E1630] dark:text-white">GST</span>{" "}
            <span className="text-[#4F6EF7] dark:text-[#60A5FA]">ARCHANGEL</span>
          </span>
        </Link>

        {/* Step Indicator */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#4F6EF7]/10 to-[#8B5CF6]/10 border border-[#4F6EF7]/20 text-[#4F6EF7] dark:text-[#60A5FA] text-[13px] font-semibold">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4F6EF7] text-white text-[11px] font-bold">
              1
            </span>
            <span>Upload Records</span>
          </div>
          <div className="h-px w-6 bg-[#CBD5E1] dark:bg-[#1E293B]" />
          <div className="flex items-center gap-2 text-[#94A3B8] text-[13px] font-medium">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#CBD5E1] dark:border-[#334155] text-[11px]">
              2
            </span>
            <span>Agent Audit</span>
          </div>
          <div className="h-px w-6 bg-[#CBD5E1] dark:bg-[#1E293B]" />
          <div className="flex items-center gap-2 text-[#94A3B8] text-[13px] font-medium">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#CBD5E1] dark:border-[#334155] text-[11px]">
              3
            </span>
            <span>Investigation</span>
          </div>
        </div>

        {/* Action Button & Theme Toggle */}
        <div className="flex items-center gap-3">

          <ThemeToggle />
          <Link
            href="/"
            className="text-[14px] font-semibold text-[#66708A] dark:text-[#94A3B8] hover:text-[#0E1630] dark:hover:text-white transition-colors"
          >
            Cancel
          </Link>
        </div>
      </nav>

      {/* ── Main Container ─────────────────────────────────────────────────── */}
      <main className="relative z-[5] mx-auto max-w-[1400px] px-6 py-10 lg:px-12">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/15 dark:border-indigo-500/30 bg-gradient-to-r from-[#4F6EF7]/10 to-[#8B5CF6]/10 dark:from-[#4F6EF7]/20 dark:to-[#8B5CF6]/20 px-4 py-1.5 text-[13px] font-semibold text-[#4F6EF7] dark:text-[#60A5FA]"
          >
            <Sparkles size={14} /> Autonomous GST Compliance Ingestion
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-[Manrope,sans-serif] text-[34px] font-extrabold leading-tight text-[#0E1630] dark:text-white lg:text-[44px]"
          >
            Upload Your Financial Data
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3 text-[16px] text-[#66708A] dark:text-[#94A3B8] leading-relaxed"
          >
            Provide the records needed for Archangel to reconcile your transactions,
            investigate discrepancies, and identify compliance risks.
          </motion.p>
        </div>

        {/* Error message banner if validation fails */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 mx-auto max-w-3xl flex items-center gap-3 p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-[14px]"
          >
            <AlertCircle size={18} className="shrink-0 text-red-600 dark:text-red-400" />
            <span className="font-medium">{errorMessage}</span>
          </motion.div>
        )}

        {/* ── 4 Upload Categories Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-10">
          {/* 1. Bank Statement */}
          <UploadCard
            title="Bank Statement"
            subtitle="Upload outward & inward transaction ledger"
            formats="CSV / XLSX"
            accept=".csv,.xlsx,.xls"
            required={true}
            icon={<Landmark size={24} className="text-[#4F6EF7] dark:text-[#60A5FA]" />}
            files={bankFiles}
            isDragging={draggingCategory === "bank"}
            onDragOver={(e) => {
              e.preventDefault();
              setDraggingCategory("bank");
            }}
            onDragLeave={() => setDraggingCategory(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDraggingCategory(null);
              if (e.dataTransfer.files) addFilesToCategory("bank", e.dataTransfer.files);
            }}
            onFileInputChange={(e) => {
              if (e.target.files) addFilesToCategory("bank", e.target.files);
            }}
            onRemoveFile={(id) => removeFile("bank", id)}
            formatSize={formatSize}
          />

          {/* 2. Purchase Invoices */}
          <UploadCard
            title="Purchase Invoices"
            subtitle="Input Tax Credit (ITC) vendor invoices & bill copies"
            formats="PDF (Multiple)"
            accept=".pdf"
            required={true}
            multiple={true}
            icon={<FileText size={24} className="text-[#4F6EF7] dark:text-[#60A5FA]" />}
            files={purchaseFiles}
            isDragging={draggingCategory === "purchase"}
            onDragOver={(e) => {
              e.preventDefault();
              setDraggingCategory("purchase");
            }}
            onDragLeave={() => setDraggingCategory(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDraggingCategory(null);
              if (e.dataTransfer.files) addFilesToCategory("purchase", e.dataTransfer.files);
            }}
            onFileInputChange={(e) => {
              if (e.target.files) addFilesToCategory("purchase", e.target.files);
            }}
            onRemoveFile={(id) => removeFile("purchase", id)}
            formatSize={formatSize}
          />

          {/* 3. Sales Invoices */}
          <UploadCard
            title="Sales Invoices"
            subtitle="Outward supply invoices & e-way bill records"
            formats="PDF (Multiple)"
            accept=".pdf"
            required={false}
            multiple={true}
            icon={<FileSpreadsheet size={24} className="text-[#4F6EF7] dark:text-[#60A5FA]" />}
            files={salesFiles}
            isDragging={draggingCategory === "sales"}
            onDragOver={(e) => {
              e.preventDefault();
              setDraggingCategory("sales");
            }}
            onDragLeave={() => setDraggingCategory(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDraggingCategory(null);
              if (e.dataTransfer.files) addFilesToCategory("sales", e.dataTransfer.files);
            }}
            onFileInputChange={(e) => {
              if (e.target.files) addFilesToCategory("sales", e.target.files);
            }}
            onRemoveFile={(id) => removeFile("sales", id)}
            formatSize={formatSize}
          />

          {/* 4. GST Records */}
          <UploadCard
            title="GST Records"
            subtitle="GSTR-2B / GSTR-3B filings or portal exports"
            formats="JSON / CSV / PDF"
            accept=".json,.csv,.pdf"
            required={false}
            multiple={true}
            icon={<ShieldCheck size={24} className="text-[#4F6EF7] dark:text-[#60A5FA]" />}
            files={gstFiles}
            isDragging={draggingCategory === "gst"}
            onDragOver={(e) => {
              e.preventDefault();
              setDraggingCategory("gst");
            }}
            onDragLeave={() => setDraggingCategory(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDraggingCategory(null);
              if (e.dataTransfer.files) addFilesToCategory("gst", e.dataTransfer.files);
            }}
            onFileInputChange={(e) => {
              if (e.target.files) addFilesToCategory("gst", e.target.files);
            }}
            onRemoveFile={(id) => removeFile("gst", id)}
            formatSize={formatSize}
          />
        </div>

        {/* ── Summary & Run Action Card ────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto rounded-[24px] border border-white/80 dark:border-[#1E293B] bg-white dark:bg-[#111827] p-6 sm:p-8 shadow-[0_20px_45px_-18px_rgba(60,70,160,0.14)] dark:shadow-none transition-colors duration-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left summary status badges */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    bankFiles.length > 0
                      ? "bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400"
                      : "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {bankFiles.length > 0 ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <span className="text-[11px] font-bold">!</span>
                  )}
                </span>
                <div>
                  <p className="text-[13px] font-bold text-[#0E1630] dark:text-white">Bank Statement</p>
                  <p className="text-[12px] text-[#66708A] dark:text-[#94A3B8]">
                    {bankFiles.length > 0 ? `${bankFiles.length} file ready` : "Required"}
                  </p>
                </div>
              </div>

              <div className="h-8 w-px bg-[#E2E8F0] dark:bg-[#1E293B] hidden sm:block" />

              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    purchaseFiles.length > 0
                      ? "bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400"
                      : "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {purchaseFiles.length > 0 ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <span className="text-[11px] font-bold">!</span>
                  )}
                </span>
                <div>
                  <p className="text-[13px] font-bold text-[#0E1630] dark:text-white">Purchase Invoices</p>
                  <p className="text-[12px] text-[#66708A] dark:text-[#94A3B8]">
                    {purchaseFiles.length > 0
                      ? `${purchaseFiles.length} files ready`
                      : "Required"}
                  </p>
                </div>
              </div>

              <div className="h-8 w-px bg-[#E2E8F0] dark:bg-[#1E293B] hidden sm:block" />

              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    salesFiles.length > 0
                      ? "bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {salesFiles.length > 0 ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <span className="text-[11px] font-bold">0</span>
                  )}
                </span>
                <div>
                  <p className="text-[13px] font-bold text-[#0E1630] dark:text-white">Sales Invoices</p>
                  <p className="text-[12px] text-[#66708A] dark:text-[#94A3B8]">
                    {salesFiles.length > 0
                      ? `${salesFiles.length} files`
                      : "Optional"}
                  </p>
                </div>
              </div>

              <div className="h-8 w-px bg-[#E2E8F0] dark:bg-[#1E293B] hidden sm:block" />

              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    gstFiles.length > 0
                      ? "bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {gstFiles.length > 0 ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <span className="text-[11px] font-bold">0</span>
                  )}
                </span>
                <div>
                  <p className="text-[13px] font-bold text-[#0E1630] dark:text-white">GST Records</p>
                  <p className="text-[12px] text-[#66708A] dark:text-[#94A3B8]">
                    {gstFiles.length > 0 ? `${gstFiles.length} files` : "Optional"}
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={handleRunAudit}
                disabled={isSubmitting}
                className="w-full md:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#4F6EF7] to-[#8B5CF6] px-8 py-4 text-[15.5px] font-bold text-white shadow-[0_16px_32px_-10px_rgba(90,90,247,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-10px_rgba(90,90,247,0.65)] active:translate-y-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {isSubmitting ? (
                  <><Loader2 size={18} className="animate-spin" /><span>Uploading & Starting Audit…</span></>
                ) : (
                  <><span>RUN GST AUDIT</span><ArrowRight size={18} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Subcomponent: Upload Card ───────────────────────────────────────────────

interface UploadCardProps {
  title: string;
  subtitle: string;
  formats: string;
  accept: string;
  required: boolean;
  multiple?: boolean;
  icon: React.ReactNode;
  files: UploadedFileItem[];
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (id: string) => void;
  formatSize: (bytes: number) => string;
}

function UploadCard({
  title,
  subtitle,
  formats,
  accept,
  required,
  multiple = false,
  icon,
  files,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  onRemoveFile,
  formatSize,
}: UploadCardProps) {
  const inputId = `file-input-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div
      className={`relative flex flex-col rounded-[22px] border bg-white dark:bg-[#111827] p-6 transition-all duration-200 shadow-[0_14px_35px_-16px_rgba(60,70,160,0.08)] dark:shadow-none ${
        isDragging
          ? "border-[#4F6EF7] bg-indigo-50/40 dark:bg-indigo-950/40 ring-2 ring-[#4F6EF7]/20"
          : files.length > 0
          ? "border-[#4F6EF7]/30 dark:border-[#4F6EF7]/40"
          : "border-white/90 dark:border-[#1E293B] hover:border-[#E2E8F0] dark:hover:border-[#334155]"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#4F6EF7]/10 to-[#8B5CF6]/10 dark:from-[#4F6EF7]/20 dark:to-[#8B5CF6]/20 border border-[#4F6EF7]/15 dark:border-[#4F6EF7]/30">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-[Manrope,sans-serif] text-[17px] font-bold text-[#0E1630] dark:text-white">
                {title}
              </h3>
              {required ? (
                <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[11px] font-bold text-[#4F6EF7] dark:text-[#60A5FA]">
                  Required
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Optional
                </span>
              )}
            </div>
            <p className="text-[13px] text-[#66708A] dark:text-[#94A3B8] mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Drop Zone Box */}
      <label
        htmlFor={inputId}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`group relative flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-[#4F6EF7] bg-[#4F6EF7]/5"
            : "border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#4F6EF7]/60 hover:bg-[#F8FAFC] dark:hover:bg-[#151B2B]"
        }`}
      >
        <input
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onFileInputChange}
          className="sr-only"
        />

        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#4F6EF7]/10 to-[#8B5CF6]/10 dark:from-[#4F6EF7]/20 dark:to-[#8B5CF6]/20 text-[#4F6EF7] dark:text-[#60A5FA] group-hover:scale-105 transition-transform">
          <Upload size={18} />
        </div>

        <p className="text-[13.5px] font-semibold text-[#0E1630] dark:text-white">
          <span className="text-[#4F6EF7] dark:text-[#60A5FA]">Click to browse</span> or drag and drop
        </p>
        <p className="text-[12px] text-[#94A3B8] mt-1">{formats}</p>
      </label>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
          <AnimatePresence>
            {files.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between gap-3 rounded-[12px] border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#151B2B] px-3.5 py-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileCheck2 size={16} className="shrink-0 text-[#4F6EF7] dark:text-[#60A5FA]" />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-[#0E1630] dark:text-white">
                      {item.file.name}
                    </p>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {formatSize(item.file.size)} • Ready
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(item.id);
                  }}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#94A3B8] hover:bg-white dark:hover:bg-[#1E293B] hover:text-red-500 transition-colors shadow-sm cursor-pointer"
                  title="Remove file"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
