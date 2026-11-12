"use client";

import { useState, useRef } from "react";
import { 
  Upload, 
  FileText, 
  Scale, 
  Video, 
  Megaphone, 
  CheckCircle2, 
  AlertCircle, 
  Link as LinkIcon, 
  FileUp, 
  LogOut, 
  Sparkles,
  ExternalLink,
  X,
  PlusCircle,
  Eye
} from "lucide-react";
import Link from "next/link";
import { 
  universalUploadAction, 
  postAnnouncementAction, 
  logoutAdminAction, 
  DocumentCategory 
} from "@/app/actions/admin";

interface Announcement {
  id: string;
  created_at: string;
  title: string;
  message: string;
  is_active: boolean;
}

interface DashboardClientProps {
  initialAnnouncements?: Announcement[];
}

export default function DashboardClient({ initialAnnouncements = [] }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"uploader" | "announcements">("uploader");

  // -------------------------------------------------------------
  // Universal Uploader State
  // -------------------------------------------------------------
  const [category, setCategory] = useState<DocumentCategory>("Authorities");
  const [useExternalLink, setUseExternalLink] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Authority sub-dropdown
  const [authorityType, setAuthorityType] = useState<"Statutes" | "Cases" | "Black's Law Dictionary">("Statutes");
  const [statuteCategory, setStatuteCategory] = useState("CONSTITUTIONAL LAW");

  // Status feedback
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // -------------------------------------------------------------
  // Announcements State
  // -------------------------------------------------------------
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [announcementFeedback, setAnnouncementFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const announcementFormRef = useRef<HTMLFormElement>(null);

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle Universal Upload Submit
  async function handleUploadSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadLoading(true);
    setUploadFeedback(null);

    const formData = new FormData(e.currentTarget);
    formData.set("category", category);
    formData.set("is_external_link", useExternalLink ? "true" : "false");

    if (!useExternalLink && selectedFile) {
      formData.set("file", selectedFile);
    }

    if (category === "Authorities") {
      formData.set("authority_type", authorityType);
      if (authorityType === "Statutes") {
        formData.set("sub_type", statuteCategory);
      }
    }

    const result = await universalUploadAction(formData);

    if (result.success) {
      setUploadFeedback({ type: "success", text: result.message || "Resource published successfully!" });
      formRef.current?.reset();
      setSelectedFile(null);
    } else {
      setUploadFeedback({ type: "error", text: result.error || "Failed to publish resource." });
    }
    setUploadLoading(false);
  }

  // Handle Post Announcement Submit
  async function handleAnnouncementSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAnnouncementLoading(true);
    setAnnouncementFeedback(null);

    const formData = new FormData(e.currentTarget);
    const result = await postAnnouncementAction(formData);

    if (result.success) {
      setAnnouncementFeedback({ type: "success", text: result.message || "Announcement posted!" });
      if (result.data) {
        setAnnouncements([result.data, ...announcements]);
      }
      announcementFormRef.current?.reset();
    } else {
      setAnnouncementFeedback({ type: "error", text: result.error || "Failed to post announcement." });
    }
    setAnnouncementLoading(false);
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 md:p-12 pb-32 transition-colors duration-300">
      {/* Top Header & Admin Navigation Bar */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-outline-variant/10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold font-label tracking-widest uppercase bg-primary/20 text-primary border border-primary/30">
              Admin Portal
            </span>
            <span className="text-xs font-label text-on-surface-variant font-medium">
              Legal Mouse Control Center
            </span>
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">
            Universal Content Dashboard
          </h1>
        </div>

        {/* Action Shortcuts & Logout */}
        <div className="flex items-center gap-4">
          <Link
            href="/authorities/statutes"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-label font-bold text-on-surface transition-colors border border-outline-variant/10"
          >
            <Eye className="w-4 h-4 text-primary" />
            Live Statutes View
          </Link>
          <button
            onClick={() => logoutAdminAction()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-label font-bold transition-colors border border-red-500/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-3 mb-10 border-b border-outline-variant/10 pb-4">
        <button
          onClick={() => setActiveTab("uploader")}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-label text-sm font-bold transition-all cursor-pointer ${
            activeTab === "uploader"
              ? "bg-primary text-on-primary shadow-lg shadow-primary/25"
              : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
          }`}
        >
          <Upload className="w-4 h-4" />
          Universal Uploader
        </button>
        <button
          onClick={() => setActiveTab("announcements")}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-label text-sm font-bold transition-all cursor-pointer ${
            activeTab === "announcements"
              ? "bg-primary text-on-primary shadow-lg shadow-primary/25"
              : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Announcements
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          TAB 1: UNIVERSAL UPLOADER
          ═════════════════════════════════════════════════════════════════ */}
      {activeTab === "uploader" && (
        <div className="max-w-4xl bg-surface-container border border-outline-variant/15 rounded-3xl p-8 md:p-10 shadow-xl shadow-black/10 animate-in fade-in duration-300">
          <div className="mb-8">
            <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">
              Publish New Legal Asset
            </h2>
            <p className="font-body text-sm text-on-surface-variant">
              Select the asset category to dynamically configure storage buckets, database tables, and schema mapping.
            </p>
          </div>

          {/* Feedback Banner */}
          {uploadFeedback && (
            <div
              className={`mb-8 p-4 rounded-2xl flex items-center gap-3 text-sm font-label font-bold border ${
                uploadFeedback.type === "success"
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {uploadFeedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <span>{uploadFeedback.text}</span>
            </div>
          )}

          <form ref={formRef} onSubmit={handleUploadSubmit} className="space-y-8">
            {/* 1. Primary Category Selection */}
            <div>
              <label className="block font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-3">
                Document Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: "Authorities", label: "Authorities Hub", icon: Scale, desc: "Statutes, Cases, Black's Law" },
                  { id: "Templates", label: "Templates & Notes", icon: FileText, desc: "Structured drafts & summaries" },
                  { id: "Video Vault", label: "Video Vault", icon: Video, desc: "MP4 animations & YouTube lectures" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = category === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id as DocumentCategory)}
                      className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-primary/10 border-primary shadow-sm"
                          : "bg-surface-container-low border-outline-variant/15 hover:border-outline-variant/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : "text-on-surface-variant/70"}`} />
                        {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <div className={`font-headline font-bold text-base mb-1 ${isSelected ? "text-primary" : "text-on-surface"}`}>
                          {item.label}
                        </div>
                        <p className="font-body text-xs text-on-surface-variant/70 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Category-Specific Fields */}
            {category === "Authorities" && (
              <div className="p-6 bg-surface-container-low border border-outline-variant/15 rounded-2xl space-y-5 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-2">
                      Authority Type
                    </label>
                    <select
                      value={authorityType}
                      onChange={(e) => setAuthorityType(e.target.value as any)}
                      className="w-full bg-surface-container border border-outline-variant/20 rounded-xl py-3 px-4 text-sm font-label text-on-surface outline-none focus:border-primary/50"
                    >
                      <option value="Statutes">Statutes (Acts & Legislative Frameworks)</option>
                      <option value="Cases">Cases (Judicial Precedents)</option>
                      <option value="Black's Law Dictionary">Black's Law Dictionary</option>
                    </select>
                  </div>

                  {authorityType === "Statutes" && (
                    <div>
                      <label className="block font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-2">
                        Statutory Type / Domain
                      </label>
                      <select
                        value={statuteCategory}
                        onChange={(e) => setStatuteCategory(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/20 rounded-xl py-3 px-4 text-sm font-label text-on-surface outline-none focus:border-primary/50"
                      >
                        <option value="CONSTITUTIONAL LAW">CONSTITUTIONAL LAW</option>
                        <option value="CRIMINAL LAW">CRIMINAL LAW</option>
                        <option value="CIVIL/LABOUR LAW">CIVIL/LABOUR LAW</option>
                        <option value="COMMERCIAL LAW">COMMERCIAL LAW</option>
                        <option value="PROPERTY LAW">PROPERTY LAW</option>
                        <option value="Statute">General Statute</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {category === "Templates" && (
              <div className="p-6 bg-surface-container-low border border-outline-variant/15 rounded-2xl space-y-5 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-2">
                      Course Tag
                    </label>
                    <input
                      name="course_tag"
                      placeholder="e.g. Civil Litigation, Constitutional Law"
                      className="w-full bg-surface-container border border-outline-variant/20 rounded-xl py-3 px-4 text-sm font-label text-on-surface outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-2">
                      Custom Slug (Optional)
                    </label>
                    <input
                      name="slug"
                      placeholder="leave empty to auto-generate from title"
                      className="w-full bg-surface-container border border-outline-variant/20 rounded-xl py-3 px-4 text-sm font-label text-on-surface outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-2">
                    Executive Summary
                  </label>
                  <input
                    name="summary"
                    placeholder="Short summary of this template or study note"
                    className="w-full bg-surface-container border border-outline-variant/20 rounded-xl py-3 px-4 text-sm font-label text-on-surface outline-none focus:border-primary/50"
                  />
                </div>

                <div>
                  <label className="block font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-2">
                    Core Content / Notes
                  </label>
                  <textarea
                    name="core_content"
                    rows={4}
                    placeholder="Full text breakdown or guidance for this document..."
                    className="w-full bg-surface-container border border-outline-variant/20 rounded-xl p-4 text-sm font-label text-on-surface outline-none focus:border-primary/50 resize-y"
                  />
                </div>
              </div>
            )}

            {category === "Video Vault" && (
              <div className="p-6 bg-surface-container-low border border-outline-variant/15 rounded-2xl space-y-5 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-2">
                      Duration
                    </label>
                    <input
                      name="duration"
                      placeholder="e.g. 4:30"
                      className="w-full bg-surface-container border border-outline-variant/20 rounded-xl py-3 px-4 text-sm font-label text-on-surface outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-2">
                      Topic / Tag
                    </label>
                    <input
                      name="tag"
                      placeholder="e.g. Tort Law, Criminal Liability"
                      className="w-full bg-surface-container border border-outline-variant/20 rounded-xl py-3 px-4 text-sm font-label text-on-surface outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-2">
                    Thumbnail Image URL (Optional)
                  </label>
                  <input
                    name="thumbnail_url"
                    placeholder="https://... (auto-detected if using YouTube link)"
                    className="w-full bg-surface-container border border-outline-variant/20 rounded-xl py-3 px-4 text-sm font-label text-on-surface outline-none focus:border-primary/50"
                  />
                </div>
              </div>
            )}

            {/* 3. Universal Title */}
            <div>
              <label className="block font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-2">
                Document / Asset Title
              </label>
              <input
                name="title"
                required
                placeholder="e.g. Evidence Act 2011, Notice of Motion Template, Carlill v Carbolic Analysis"
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3.5 px-4 text-base font-label text-on-surface outline-none focus:border-primary/50"
              />
            </div>

            {/* 4. Upload Mode Toggle: File vs External Link */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant">
                  Asset Source
                </label>
                <button
                  type="button"
                  onClick={() => setUseExternalLink(!useExternalLink)}
                  className="flex items-center gap-1.5 text-xs font-label font-bold text-primary hover:underline cursor-pointer"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  {useExternalLink ? "Switch to File Upload" : "Use External Link instead"}
                </button>
              </div>

              {useExternalLink ? (
                /* External Link Input */
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant/50">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <input
                    name="external_url"
                    required
                    type="url"
                    placeholder={
                      category === "Video Vault"
                        ? "https://www.youtube.com/watch?v=... or direct .mp4 URL"
                        : "https://example.com/document.pdf"
                    }
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3.5 pl-12 pr-4 text-sm font-label text-on-surface outline-none focus:border-primary/50"
                  />
                </div>
              ) : (
                /* Drag & Drop File Zone */
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    dragActive
                      ? "border-primary bg-primary/10"
                      : "border-outline-variant/20 bg-surface-container-low hover:border-primary/40 hover:bg-surface-container"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept={category === "Video Vault" ? ".mp4,.webm,.mov" : ".pdf,.doc,.docx,.xlsx"}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container border border-primary/30 max-w-md w-full justify-between">
                      <div className="flex items-center gap-3 truncate">
                        <FileUp className="w-6 h-6 text-primary shrink-0" />
                        <div className="truncate text-left">
                          <p className="font-headline font-bold text-sm text-on-surface truncate">
                            {selectedFile.name}
                          </p>
                          <p className="font-label text-xs text-on-surface-variant/70">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="p-1 rounded-full hover:bg-surface-container-high text-on-surface-variant"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-inner">
                        <FileUp className="w-7 h-7" />
                      </div>
                      <h4 className="font-headline font-bold text-base text-on-surface mb-1">
                        Drag and drop file here, or click to browse
                      </h4>
                      <p className="font-body text-xs text-on-surface-variant/70 max-w-sm">
                        {category === "Video Vault"
                          ? "Supports MP4, WebM, MOV video files"
                          : "Supports PDF, DOCX, DOC files (uploaded to Supabase 'contributions' storage)"}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-outline-variant/10">
              <button
                type="submit"
                disabled={uploadLoading}
                className="w-full flex items-center justify-center gap-2 py-4 px-8 rounded-xl font-label text-sm font-bold text-on-primary bg-gradient-to-r from-primary to-primary-container hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                {uploadLoading ? (
                  <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Publish Asset to {category}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          TAB 2: POST ANNOUNCEMENT
          ═════════════════════════════════════════════════════════════════ */}
      {activeTab === "announcements" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl animate-in fade-in duration-300">
          {/* Post Form */}
          <div className="lg:col-span-7 bg-surface-container border border-outline-variant/15 rounded-3xl p-8 shadow-xl shadow-black/10">
            <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">
              Broadcast Announcement
            </h2>
            <p className="font-body text-sm text-on-surface-variant mb-6">
              Post system-wide notifications, curriculum updates, or maintenance notes to the Legal Mouse user base.
            </p>

            {announcementFeedback && (
              <div
                className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-label font-bold border ${
                  announcementFeedback.type === "success"
                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}
              >
                {announcementFeedback.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0" />
                )}
                <span>{announcementFeedback.text}</span>
              </div>
            )}

            <form ref={announcementFormRef} onSubmit={handleAnnouncementSubmit} className="space-y-6">
              <div>
                <label className="block font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-2">
                  Announcement Title
                </label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Scheduled System Maintenance, New Constitutional Law Statutes Added"
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3.5 px-4 text-sm font-label text-on-surface outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-2">
                  Message Body
                </label>
                <textarea
                  name="message"
                  required
                  rows={6}
                  placeholder="Provide detailed information for the student community..."
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm font-label text-on-surface outline-none focus:border-primary/50 resize-y"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  defaultChecked
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <label htmlFor="is_active" className="font-label text-xs font-bold text-on-surface cursor-pointer">
                  Activate announcement immediately for all students
                </label>
              </div>

              <button
                type="submit"
                disabled={announcementLoading}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-label text-sm font-bold text-on-primary bg-gradient-to-r from-primary to-primary-container hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                {announcementLoading ? (
                  <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                ) : (
                  <>
                    <Megaphone className="w-4 h-4" />
                    Publish Announcement
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Recent Announcements Feed */}
          <div className="lg:col-span-5 bg-surface-container border border-outline-variant/15 rounded-3xl p-8 shadow-xl shadow-black/10">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-6">
              Published Feed ({announcements.length})
            </h3>

            {announcements.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant/60 font-body text-sm italic">
                No announcements published yet.
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {announcements.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-headline font-bold text-sm text-on-surface">
                        {item.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          item.is_active
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-outline-variant/20 text-on-surface-variant"
                        }`}
                      >
                        {item.is_active ? "Active" : "Archived"}
                      </span>
                    </div>
                    <p className="font-body text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="text-[10px] font-label text-on-surface-variant/40 pt-1">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

