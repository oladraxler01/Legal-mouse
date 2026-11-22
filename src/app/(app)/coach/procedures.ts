/* ═══════════════════════════════════════════════════
   Court procedure briefings for the Coach.
   Source: the team's Civil, Criminal and Arbitration procedure documents.
   The Hybrid track has no source document yet and is marked as a draft.
   ═══════════════════════════════════════════════════ */

export type ProcedureNature = "CRIMINAL" | "CIVIL" | "HYBRID" | "ARBITRATION";

export interface ProcedureStep {
  /** Short title shown on the step map */
  title: string;
  /** Who acts at this step (shown as a badge) */
  actor: string;
  /** What the guide types and reads aloud: one to three sentences */
  narration: string;
  /** Optional supporting points shown under the narration */
  points?: string[];
  /** Exact words counsel or the court would use, where the source gives them */
  say?: string;
}

export interface ProcedurePhase {
  label: string;
  steps: ProcedureStep[];
}

export interface Procedure {
  name: string;
  forum: string;
  presiding: string;
  parties: string;
  intro: string;
  authority: string;
  draft?: boolean;
  phases: ProcedurePhase[];
}

/* ─── Civil ──────────────────────────────────────── */
const CIVIL: Procedure = {
  name: "Civil Court Proceedings",
  forum: "High Court",
  presiding: "The Judge",
  parties: "Claimant/Plaintiff v. Defendant",
  intro:
    "Civil proceedings are disputes between individuals, companies or organisations, such as breach of contract, land, debt recovery or negligence. Let me walk you through how a civil hearing runs, from the moment the judge walks in.",
  authority: "Applicable High Court (Civil Procedure) Rules and the Evidence Act.",
  phases: [
    {
      label: "Commencement",
      steps: [
        {
          title: "Entry of the Judge",
          actor: "Registrar",
          narration:
            "The registrar announces the judge's arrival. Everyone in the courtroom stands as a sign of respect, the judge takes the bench and directs everyone to sit.",
          say: "Silence! Court! All rise!",
        },
        {
          title: "Calling of cases",
          actor: "Registrar",
          narration:
            "The registrar calls out the names of the parties and the suit number for each case listed that day. When your case is called, you rise.",
          say: "ABC Limited v. XYZ Limited.",
        },
        {
          title: "Appearances",
          actor: "Counsel",
          narration:
            "Counsel for the Claimant announces appearance first, then counsel for the Defendant. A lead counsel may announce the rest of the team.",
          say: "May it please My Lord, I am Counsel A, appearing for the Claimant.",
        },
        {
          title: "Preliminary applications",
          actor: "Counsel",
          narration:
            "Before the main hearing, counsel may move applications. The applicant explains the relief sought, the other side responds, and the judge rules at once or reserves the ruling.",
          points: ["Adjournment or extension of time", "Amendment of pleadings or substitution of parties", "Leave to file additional documents", "Challenge to the court's jurisdiction"],
        },
      ],
    },
    {
      label: "The trial",
      steps: [
        {
          title: "Introduction of the matter",
          actor: "Judge",
          narration:
            "The judge confirms the purpose of the day. Both counsel confirm they are ready, and the court directs the Claimant to open its case.",
          say: "Is this matter coming up for hearing?",
        },
        {
          title: "Claimant's opening statement",
          actor: "Claimant's counsel",
          narration:
            "Counsel briefly introduces the dispute, summarises what the Claimant intends to prove and identifies the issues in controversy. This is not required in every civil trial.",
        },
        {
          title: "First witness sworn",
          actor: "Registrar",
          narration:
            "The Claimant's first witness enters the witness box. The registrar administers the oath or affirmation, and the witness identifies themselves and their written statement on oath.",
        },
        {
          title: "Examination-in-chief",
          actor: "Claimant's counsel",
          narration:
            "The witness gives evidence for the Claimant, often by adopting their written statement on oath. Documents are tendered as exhibits, and the other side may object to their admissibility.",
          points: ["Agreements, receipts and letters", "Photographs and official documents", "The judge admits or rejects each disputed exhibit"],
        },
        {
          title: "Cross-examination",
          actor: "Defendant's counsel",
          narration:
            "The Defendant's counsel questions the witness to test credibility, expose contradictions and draw out facts that help the defence.",
        },
        {
          title: "Re-examination",
          actor: "Claimant's counsel",
          narration:
            "Counsel may clarify points raised in cross-examination only. It is not a chance to start a new case. The witness is then discharged.",
          say: "Witness discharged.",
        },
        {
          title: "Other witnesses",
          actor: "Claimant's counsel",
          narration:
            "Each further witness goes through the same cycle: oath, examination-in-chief, cross-examination, re-examination and discharge.",
        },
        {
          title: "Claimant closes",
          actor: "Claimant's counsel",
          narration: "Once all witnesses and documents are in, counsel closes the Claimant's case.",
          say: "My Lord, that is the case for the Claimant.",
        },
        {
          title: "Defence opens",
          actor: "Defendant's counsel",
          narration: "The Defendant's counsel is invited to open the defence and explain the Defendant's position on the allegations.",
        },
        {
          title: "Defence witnesses",
          actor: "Defendant's counsel",
          narration:
            "Defence witnesses follow the same cycle, but now the Claimant's counsel cross-examines. The Defendant may tender its own documents.",
        },
        {
          title: "Defendant closes",
          actor: "Defendant's counsel",
          narration: "After the last defence witness is discharged, the defence closes its case.",
          say: "My Lord, that is the case for the Defendant.",
        },
      ],
    },
    {
      label: "Addresses and judgment",
      steps: [
        {
          title: "Final written addresses",
          actor: "Both counsel",
          narration:
            "Both sides file final written addresses summarising the evidence and arguing the law. The Claimant goes first, the Defendant responds, and the Claimant may reply on points of law.",
          say: "May it please My Lord, we have filed our final written address. We humbly adopt same as our argument in this matter.",
        },
        {
          title: "Judgment reserved",
          actor: "Judge",
          narration: "After the addresses are adopted, the judge reserves judgment and fixes a date. The substantive hearing is now over.",
          say: "Judgment is reserved.",
        },
        {
          title: "Delivery of judgment",
          actor: "Judge",
          narration:
            "On the judgment date the formalities repeat, then the judge evaluates the evidence and the law and decides whether the Claimant has proved its case.",
          points: ["Grant all claims, or some and refuse others", "Dismiss the claim", "Grant a counterclaim, with orders as to costs", "Inform the parties of their right of appeal"],
        },
        {
          title: "Court rises",
          actor: "Registrar",
          narration: "The judge concludes the business of the day. Everyone stands as the judge leaves, and the session ends.",
          say: "That will be all. Court rises!",
        },
      ],
    },
  ],
};

/* ─── Criminal ───────────────────────────────────── */
const CRIMINAL: Procedure = {
  name: "Criminal Court Proceedings",
  forum: "High Court",
  presiding: "The Judge",
  parties: "The Prosecution v. the Defendant (Accused Person)",
  intro:
    "Criminal proceedings are brought against a person suspected of an offence. The Prosecution must prove guilt beyond reasonable doubt. Let me take you through a criminal trial step by step.",
  authority: "Administration of Criminal Justice Act 2015 and the Administration of Criminal Justice Laws of the States.",
  phases: [
    {
      label: "Commencement",
      steps: [
        {
          title: "Entry of the Judge",
          actor: "Registrar",
          narration: "The registrar announces the judge. Everyone stands as the judge takes the bench, and the judge directs everyone to sit.",
          say: "All rise!",
        },
        {
          title: "Calling of the case",
          actor: "Registrar",
          narration: "The registrar calls the criminal matter. The accused person is brought before the court, usually into the dock.",
          say: "The State v. John.",
        },
        {
          title: "Appearances",
          actor: "Counsel",
          narration: "Prosecution counsel announces appearance first, followed by defence counsel.",
          say: "May it please My Lord, I am Counsel A, appearing for the Prosecution.",
        },
        {
          title: "Preliminary applications",
          actor: "Counsel",
          narration:
            "Counsel may move applications before the hearing. The applicant moves it, the other side responds, and the judge rules where necessary.",
          points: ["Bail", "Challenge to jurisdiction", "Adjournment or extension of time", "Amendment of the charge"],
        },
        {
          title: "Arraignment",
          actor: "Judge",
          narration:
            "One of the most important stages. The charge is read and explained to the accused in a language they understand, and the court makes sure they understand it. The accused must personally enter a plea.",
          say: "Are you guilty or not guilty of the offence charged?",
          points: ["Edibo v. State (2007) 13 NWLR (Pt. 1051) 306: proper arraignment is fundamental"],
        },
        {
          title: "The plea",
          actor: "Accused person",
          narration:
            "On a guilty plea, the court considers the facts and may convict, but capital offences follow special procedures. On a not guilty plea, the case goes to trial and the Prosecution must prove guilt beyond reasonable doubt.",
        },
      ],
    },
    {
      label: "The trial",
      steps: [
        {
          title: "Prosecution opens",
          actor: "Prosecutor",
          narration: "The prosecutor explains the allegations, identifies the offence charged and outlines the evidence that will prove guilt.",
        },
        {
          title: "Examination-in-chief",
          actor: "Prosecutor",
          narration:
            "Each prosecution witness takes the oath and gives evidence. Exhibits such as medical reports, photographs, CCTV footage or weapons may be tendered, and all must be admissible.",
        },
        {
          title: "Cross-examination",
          actor: "Defence counsel",
          narration: "Defence counsel tests the witness's reliability and credibility, exposes inconsistencies and draws out facts favourable to the accused.",
        },
        {
          title: "Re-examination",
          actor: "Prosecutor",
          narration: "The prosecutor clarifies points from cross-examination, and the witness is discharged.",
          say: "Witness discharged.",
        },
        {
          title: "Other prosecution witnesses",
          actor: "Prosecutor",
          narration: "The cycle repeats for every prosecution witness until the Prosecution has presented all its evidence.",
        },
        {
          title: "Prosecution closes",
          actor: "Prosecutor",
          narration: "The Prosecution closes its case. The court now considers whether there is enough evidence to call on the accused to defend.",
          say: "My Lord, that is the case for the Prosecution.",
        },
        {
          title: "No-case submission",
          actor: "Defence counsel",
          narration:
            "The defence may argue that the Prosecution has not made out a prima facie case. If the submission succeeds, the accused is discharged and acquitted. If it fails, the accused is called upon to enter a defence.",
        },
        {
          title: "Defence opens",
          actor: "Defence counsel",
          narration: "Defence counsel introduces the defence. The accused is told their rights and cannot be compelled to testify against themselves.",
        },
        {
          title: "Defence witnesses",
          actor: "Defence counsel",
          narration:
            "The accused may testify under oath and face cross-examination, and other defence witnesses may be called. The Prosecution now cross-examines.",
        },
        {
          title: "Defence closes",
          actor: "Defence counsel",
          narration: "After the last defence witness, the defence closes its case.",
          say: "My Lord, that is the case for the Defendant.",
        },
      ],
    },
    {
      label: "Addresses and judgment",
      steps: [
        {
          title: "Final written addresses",
          actor: "Both counsel",
          narration:
            "Unlike civil trials, the defence usually addresses the court first, arguing for discharge and acquittal. The Prosecution responds, and the defence may reply on points of law. Both adopt their addresses in court.",
        },
        {
          title: "Judgment reserved",
          actor: "Judge",
          narration: "The judge reserves judgment and fixes a date for delivery.",
          say: "Judgment is reserved.",
        },
        {
          title: "Delivery of judgment",
          actor: "Judge",
          narration:
            "The judge evaluates the evidence and the law. If guilt is not proved beyond reasonable doubt, the accused is discharged and acquitted. If it is proved, the court records a conviction.",
        },
        {
          title: "Sentencing",
          actor: "Judge",
          narration:
            "After a conviction, the court may hear both sides on the appropriate sentence, then pronounces a sentence prescribed by law.",
          points: ["Imprisonment", "A fine", "Community service, where permitted", "Other punishments authorised by statute"],
        },
        {
          title: "Court rises",
          actor: "Registrar",
          narration: "The judge concludes the proceedings and everyone stands as the judge leaves, subject to any appeal.",
          say: "Court rises!",
        },
      ],
    },
  ],
};

/* ─── Arbitration ────────────────────────────────── */
const ARBITRATION: Procedure = {
  name: "Arbitration Proceedings",
  forum: "Arbitral Tribunal",
  presiding: "The Arbitrator",
  parties: "Claimant v. Respondent",
  intro:
    "Arbitration is a form of Alternative Dispute Resolution. The parties agree to have their dispute decided by an independent arbitrator or tribunal, not a judge, and the hearing is usually private and confidential. Here is how an arbitral hearing runs.",
  authority: "Arbitration and Mediation Act 2023, especially sections 30, 31, 33, 36 and 38.",
  phases: [
    {
      label: "Commencement",
      steps: [
        {
          title: "Arrival of the Tribunal",
          actor: "Arbitrator",
          narration:
            "The arbitrator or tribunal enters the hearing room. There is no 'All rise', but everyone follows the formalities and directions set by the tribunal.",
        },
        {
          title: "Introductions",
          actor: "Counsel",
          narration:
            "The arbitrator confirms who is present. Claimant's counsel introduces themselves first, then Respondent's counsel. On a panel, the chairman introduces the other members.",
          say: "Good morning, Mr/Madam Arbitrator. My name is Counsel A, and I represent the Claimant.",
        },
        {
          title: "Jurisdiction and preliminaries",
          actor: "Arbitrator",
          narration:
            "The tribunal confirms it has jurisdiction and settles preliminary matters. Any preliminary objection is argued by both sides and decided at once or reserved.",
          points: ["Validity of the arbitration agreement", "Composition of the tribunal", "Seat, venue and language", "Applicable rules and timetable"],
        },
        {
          title: "Explaining the procedure",
          actor: "Arbitrator",
          narration:
            "The arbitrator explains how the hearing will run: the order of presentation, how evidence and documents are handled, how witnesses are examined and the time each side has.",
        },
      ],
    },
    {
      label: "Presenting the cases",
      steps: [
        {
          title: "Claimant's opening",
          actor: "Claimant's counsel",
          narration: "Counsel explains the dispute, the facts behind it, the reliefs sought and the issues the tribunal must decide.",
        },
        {
          title: "Respondent's opening",
          actor: "Respondent's counsel",
          narration: "Counsel sets out the Respondent's answer to the claim and identifies the areas of disagreement.",
        },
        {
          title: "Claimant's evidence",
          actor: "Claimant's counsel",
          narration:
            "The Claimant presents evidence through witness statements, documents, oral testimony and expert reports. Counsel conducts examination-in-chief of each witness.",
        },
        {
          title: "Cross-examination",
          actor: "Respondent's counsel",
          narration: "Respondent's counsel tests the witness's accuracy and credibility. The arbitrator may also ask questions to clarify issues.",
        },
        {
          title: "Re-examination",
          actor: "Claimant's counsel",
          narration: "Counsel clarifies points from cross-examination, and the witness is discharged.",
        },
        {
          title: "Documentary evidence",
          actor: "Claimant's counsel",
          narration:
            "The Claimant tenders supporting documents. The arbitrator decides their admissibility, relevance, materiality and weight.",
          points: ["Contracts, invoices and receipts", "Letters and emails", "Financial statements and reports"],
        },
        {
          title: "Claimant closes",
          actor: "Claimant's counsel",
          narration: "Once all witnesses and evidence are in, counsel announces the close of the Claimant's case.",
          say: "We close our case.",
        },
        {
          title: "Respondent's case",
          actor: "Respondent's counsel",
          narration:
            "The Respondent opens its defence and calls witnesses, who go through examination-in-chief, cross-examination by Claimant's counsel and re-examination.",
        },
        {
          title: "Respondent closes",
          actor: "Respondent's counsel",
          narration: "After all its evidence, the Respondent closes its case.",
        },
      ],
    },
    {
      label: "Submissions and award",
      steps: [
        {
          title: "Final written submissions",
          actor: "Both counsel",
          narration:
            "Both sides file final submissions. The Claimant argues why the reliefs should be granted, and the Respondent argues for dismissal or its own reliefs, citing the evidence, the contract and the law.",
        },
        {
          title: "Closing the proceedings",
          actor: "Arbitrator",
          narration:
            "Once the submissions are adopted, the arbitrator formally closes the proceedings. No new evidence or submissions can come in without the tribunal's permission.",
        },
        {
          title: "Deliberation",
          actor: "Tribunal",
          narration: "The tribunal considers the evidence, arguments and law. A panel deliberates and decides under the applicable rules.",
        },
        {
          title: "The arbitral award",
          actor: "Tribunal",
          narration:
            "The tribunal issues its decision, called an Arbitral Award, with its reasoning and any orders on damages, payment or costs. The award is binding on the parties.",
        },
        {
          title: "Conclusion",
          actor: "Arbitrator",
          narration:
            "The arbitrator concludes the proceedings; there is no 'Court rises'. If the losing party does not comply, the award can be recognised and enforced by the courts.",
        },
      ],
    },
  ],
};

/* ─── Hybrid (draft) ─────────────────────────────── */
const HYBRID: Procedure = {
  ...CIVIL,
  name: "Hybrid Proceedings",
  parties: "Claimant v. Defendant, with criminal or regulatory elements",
  intro:
    "A hybrid matter mixes a civil claim with criminal or regulatory elements, such as an environmental damages suit alongside statutory negligence. The hearing follows the civil trial structure, but watch the standard of proof on each issue.",
  authority: "Draft track built from the civil and criminal procedures. Awaiting a dedicated source document.",
  draft: true,
  phases: [
    CIVIL.phases[0],
    {
      label: "The trial",
      steps: [
        {
          title: "Two standards of proof",
          actor: "Judge",
          narration:
            "The civil claim is decided on the balance of probabilities, but any criminal allegation must be proved beyond reasonable doubt. Keep the two apart in your arguments.",
        },
        ...CIVIL.phases[1].steps,
      ],
    },
    CIVIL.phases[2],
  ],
};

export const PROCEDURES: Record<ProcedureNature, Procedure> = { CIVIL, CRIMINAL, ARBITRATION, HYBRID };

/* ─── Courtroom expressions (from the team's glossary) ─── */
export const COURT_EXPRESSIONS: [string, string][] = [
  ["May it please My Lord", "A respectful expression used when addressing the judge."],
  ["Appearances, please", "The judge asks counsel to announce their appearances."],
  ["We are ready to proceed", "Counsel is ready for the matter to continue."],
  ["We seek an adjournment", "Counsel asks for the matter to be moved to another date."],
  ["We are not opposing the application", "Counsel does not object to the application."],
  ["We are opposing the application", "Counsel objects to the application."],
  ["We urge Your Lordship to grant the application", "Counsel asks the court to approve the application."],
  ["We urge Your Lordship to dismiss the application", "Counsel asks the court to reject the application."],
  ["We seek leave of this Honourable Court", "Counsel asks for the court's permission."],
  ["With the leave of the court", "With the court's permission."],
  ["Much obliged, My Lord", "An expression of gratitude or acknowledgement to the judge."],
  ["I am obliged, My Lord", "A respectful response acknowledging the judge's direction."],
  ["Witness discharged", "The witness has finished giving evidence and is released."],
  ["We close our case", "Counsel has finished presenting evidence."],
  ["We adopt our final written address", "Counsel relies on the arguments in the filed final address."],
  ["Judgment is reserved", "The judge will deliver judgment on a later date."],
  ["Ruling", "A decision on an application or an issue arising during proceedings."],
  ["Judgment", "The court's final decision on the substantive dispute."],
  ["Court rises", "The court session has ended."],
];
