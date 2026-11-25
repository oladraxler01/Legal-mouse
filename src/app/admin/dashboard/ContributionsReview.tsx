"use client";

import { useEffect, useState } from "react";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import { NOTE_FOLDERS } from "@/lib/noteFolders";
import { getPendingContributionsAction, reviewContributionAction, type PendingContribution } from "@/app/actions/admin";

/** Admin list of student uploads waiting for review. Approving publishes them to a Summary Notes folder. */
export default function ContributionsReview() {
  const [items, setItems] = useState<PendingContribution[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const refresh = () => getPendingContributionsAction().then(setItems);
  useEffect(() => {
    getPendingContributionsAction().then(setItems);
  }, []);

  async function review(item: PendingContribution, decision: "approve" | "reject", form: HTMLFormElement) {
    setBusyId(item.id);
    const fd = new FormData(form);
    fd.set("id", item.id);
    fd.set("decision", decision);
    const result = await reviewContributionAction(fd);
    setFeedback({ ok: result.success, text: result.success ? result.message || "Done." : result.error || "Something went wrong." });
    setBusyId(null);
    if (result.success) refresh();
  }

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">Student contributions</h2>
        <p className="text-sm text-on-surface-variant">Notes students uploaded from the Contribute page. Approve to publish into a Summary Notes folder.</p>
      </div>

      {feedback && (
        <button
          onClick={() => setFeedback(null)}
          className={`w-full text-left rounded-xl px-4 py-3 text-sm font-medium ${feedback.ok ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}
        >
          {feedback.text}
        </button>
      )}

      {items === null && (
        <p className="flex items-center gap-2 text-on-surface-variant">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </p>
      )}
      {items?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-outline-variant/30 p-10 text-center text-on-surface-variant">
          Nothing waiting for review. (If students have uploaded and nothing shows, make sure the contributions SQL has been run.)
        </div>
      )}

      {items?.map((item) => (
        <form
          key={item.id}
          onSubmit={(e) => e.preventDefault()}
          className="bg-surface-container border border-outline-variant/15 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-on-surface-variant">
                From <b>{item.author_name}</b> · {new Date(item.created_at).toLocaleString()}
              </p>
              <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary mt-1">
                Open file <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Title</span>
              <input
                name="title"
                defaultValue={item.title}
                className="mt-1 w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-2.5 px-3 text-sm text-on-surface outline-none focus:border-primary/50"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Publish to folder</span>
              <select
                name="folder"
                defaultValue={item.folder || ""}
                className="mt-1 w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-2.5 px-3 text-sm text-on-surface outline-none focus:border-primary/50"
              >
                <option value="" disabled>Choose a folder…</option>
                {NOTE_FOLDERS.map((f) => (
                  <option key={f.slug} value={f.slug}>{f.name}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Note to student (if sending back)</span>
            <input
              name="review_note"
              placeholder="e.g. Please upload a clearer scan"
              className="mt-1 w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-2.5 px-3 text-sm text-on-surface outline-none focus:border-primary/50"
            />
          </label>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              disabled={busyId === item.id}
              onClick={(e) => review(item, "reject", e.currentTarget.form!)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
            >
              <X className="w-4 h-4" /> Send back
            </button>
            <button
              type="button"
              disabled={busyId === item.id}
              onClick={(e) => review(item, "approve", e.currentTarget.form!)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold disabled:opacity-50"
            >
              {busyId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve & publish
            </button>
          </div>
        </form>
      ))}
    </div>
  );
}
