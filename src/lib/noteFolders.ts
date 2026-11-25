/* Summary Notes folders.
 *
 * Notes live in the `notes` table alongside templates. A note belongs to a folder when its
 * course_tag is "Summary Notes: <folder name>" (set by the admin uploader), or one of the
 * folder's older tags (e.g. "Legal Methods" from before folders existed).
 * Anything else in the `notes` table is a template.
 */

export const NOTE_TAG_PREFIX = "Summary Notes: ";

export interface NoteFolder {
  slug: string;
  name: string;
  /** Older course_tag values that also belong in this folder. */
  legacyTags?: string[];
}

export const NOTE_FOLDERS: NoteFolder[] = [
  { slug: "legal-method", name: "Legal Method", legacyTags: ["Legal Methods", "Legal Method"] },
  { slug: "logic", name: "Logic" },
  { slug: "legal-writing", name: "Legal Writing" },
  { slug: "contract-law", name: "Contract Law" },
  { slug: "constitutional-law", name: "Constitutional Law" },
  { slug: "nigerian-legal-system", name: "Nigerian Legal System" },
];

/** The course_tag the uploader saves for a note in this folder. */
export function folderTag(folder: NoteFolder) {
  return `${NOTE_TAG_PREFIX}${folder.name}`;
}

/** Every course_tag that counts as a Summary Note. */
export function allNoteTags(): string[] {
  return NOTE_FOLDERS.flatMap((f) => [folderTag(f), ...(f.legacyTags || [])]);
}

/** The folder a course_tag belongs to, if it is a note. */
export function folderForTag(tag: string | null | undefined): NoteFolder | undefined {
  if (!tag) return undefined;
  const t = tag.trim().toLowerCase();
  return NOTE_FOLDERS.find(
    (f) => folderTag(f).toLowerCase() === t || (f.legacyTags || []).some((l) => l.toLowerCase() === t)
  );
}

export function isNoteTag(tag: string | null | undefined) {
  return !!folderForTag(tag);
}
