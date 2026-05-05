"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import type { Question } from "@quizelo/db";
import { Button, TextInput } from "@/components/ui";
import {
  deleteQuestionAction,
  toggleQuestionActiveAction,
  updateQuestionAction,
} from "../actions";

const CATEGORIES = ["geography", "history", "entertainment", "sport", "art", "web", "science", "fun"];
const DIFFICULTIES = ["easy", "medium", "hard", "expert"] as const;

export function QuestionEditForm({
  question,
  /**
   * Where to navigate after a soft-delete. Defaults to the
   * unfiltered list — overridden by the detail page when a
   * reviewer arrives via `?from=` from a filtered queue.
   */
  backHref = "/questions",
}: {
  question: Question;
  backHref?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [prompt, setPrompt] = useState(question.prompt);
  const [explanation, setExplanation] = useState(question.explanation ?? "");
  const [choices, setChoices] = useState(question.choices);
  const [correctChoiceId, setCorrectChoiceId] = useState(question.correctChoiceId);
  const [category, setCategory] = useState(question.category);
  const [difficulty, setDifficulty] = useState(question.difficulty);
  const [locale, setLocale] = useState(question.locale);
  const [eloTarget, setEloTarget] = useState<string>(
    question.eloTarget == null ? "" : String(question.eloTarget),
  );
  const [active, setActive] = useState(question.active);

  function updateChoiceLabel(idx: number, label: string) {
    setChoices(choices.map((c, i) => (i === idx ? { ...c, label } : c)));
  }

  function save() {
    setError(null);
    start(async () => {
      try {
        await updateQuestionAction(question.id, {
          prompt,
          choices,
          correctChoiceId,
          category,
          difficulty,
          locale,
          eloTarget: eloTarget === "" ? null : Number(eloTarget),
          active,
          explanation: explanation.trim() === "" ? null : explanation,
        });
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Update failed");
      }
    });
  }

  function toggleActive() {
    start(async () => {
      await toggleQuestionActiveAction(question.id, !active);
      setActive(!active);
      router.refresh();
    });
  }

  function softDelete() {
    if (!window.confirm("Soft-delete this question? It will be set inactive.")) return;
    start(async () => {
      await deleteQuestionAction(question.id);
      // Return to the queue/filter the reviewer came from instead of
      // dumping them on the unfiltered list.
      router.push(backHref);
    });
  }

  return (
    <div className={`space-y-4 ${pending ? "opacity-60" : ""}`}>
      <Field label="Prompt">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-line bg-bg-2 px-3 py-2 text-sm text-fg-1 outline-none focus:border-accent"
        />
      </Field>

      <Field label="Choices (pick the correct one)">
        <div className="space-y-2">
          {choices.map((c, i) => (
            <label
              key={c.id}
              className={[
                "flex items-center gap-2 rounded-md border px-3 py-2",
                correctChoiceId === c.id
                  ? "border-success/40 bg-success/5"
                  : "border-line bg-bg-2",
              ].join(" ")}
            >
              <input
                type="radio"
                name="correct"
                checked={correctChoiceId === c.id}
                onChange={() => setCorrectChoiceId(c.id)}
                className="accent-success"
              />
              <input
                value={c.label}
                onChange={(e) => updateChoiceLabel(i, e.target.value)}
                className="flex-1 bg-transparent text-sm text-fg-1 outline-none"
              />
              <span className="text-[10px] font-mono text-fg-3">{c.id}</span>
            </label>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-line bg-bg-2 px-3 py-1.5 text-sm text-fg-1"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Difficulty">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as (typeof DIFFICULTIES)[number])}
            className="w-full rounded-md border border-line bg-bg-2 px-3 py-1.5 text-sm text-fg-1"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Locale">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="w-full rounded-md border border-line bg-bg-2 px-3 py-1.5 text-sm text-fg-1"
          >
            <option value="fr">fr</option>
            <option value="en">en</option>
          </select>
        </Field>
        <Field label="ELO target">
          <TextInput
            type="number"
            value={eloTarget}
            onChange={(e) => setEloTarget(e.target.value)}
            placeholder="optional"
          />
        </Field>
      </div>

      <Field label="Explanation (optional)">
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-line bg-bg-2 px-3 py-2 text-sm text-fg-1 outline-none focus:border-accent"
        />
      </Field>

      {error && (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <Button variant="primary" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        <Button onClick={toggleActive} disabled={pending}>
          {active ? "Deactivate" : "Activate"}
        </Button>
        <span className="ml-auto" />
        <Button variant="danger" onClick={softDelete} disabled={pending}>
          Delete
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-widest text-fg-3">{label}</div>
      {children}
    </div>
  );
}
