import { Badge, Button } from "@/components/wfb";
import { cx } from "@/components/wfb/utils";
import type { ActionState } from "@/app/portal/actions";
import { AdminForm } from "./AdminForm";
import { EmptyState, Panel, fmtDateTime } from "./ui";
import { formatDate, todayISO } from "@/content/format";
import type { EventNote, EventTask } from "@/lib/portal/types";

// The planning the Market and an event partner share: a task checklist and a notes thread.
// Both sides use this component; `side` says who's looking, so "yours" and "theirs" read right.

interface Props {
  marketId: string;
  side: "market" | "partner";
  /** The partner organisation's name, e.g. "The Argo". */
  partnerOrg: string;
  tasks: EventTask[];
  notes: EventNote[];
  toggleTask: (formData: FormData) => Promise<void>;
  deleteTask: (formData: FormData) => Promise<void>;
  addTask: (state: ActionState, formData: FormData) => Promise<ActionState>;
  addNote: (state: ActionState, formData: FormData) => Promise<ActionState>;
  /** Show only open tasks and the latest notes, with no forms (for overview pages). */
  compact?: boolean;
}

const shortDate = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" });

export function EventPlanning(props: Props) {
  return (
    <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-5 max-desktop:grid-cols-1">
      <TaskList {...props} />
      <NotesThread {...props} />
    </div>
  );
}

export function TaskList({ marketId, side, partnerOrg, tasks, toggleTask, deleteTask, addTask, compact }: Props) {
  const today = todayISO();
  const ownerLabel = (o: EventTask["owner"]) => (o === side ? "You" : o === "market" ? "The Market" : partnerOrg);
  const open = tasks.filter((t) => !t.doneAt);
  const groups = [
    { title: side === "market" ? "For the Market" : `For ${partnerOrg}`, items: open.filter((t) => t.owner === side) },
    { title: side === "market" ? `For ${partnerOrg}` : "For the Market", items: open.filter((t) => t.owner !== side) },
    ...(compact ? [] : [{ title: "Done", items: tasks.filter((t) => t.doneAt) }]),
  ];

  return (
    <Panel title="Tasks" id="tasks">
      {tasks.length === 0 ? <EmptyState title="No tasks yet">Add the first one below.</EmptyState> : null}
      <div className="grid grid-cols-1 gap-5">
        {groups.map((g) =>
          g.items.length ? (
            <section key={g.title} aria-label={g.title}>
              <h3 className="mt-0 mb-2 font-sans text-[13px] font-extrabold uppercase tracking-[.12em] text-ink-muted">{g.title}</h3>
              <ul className="m-0 grid list-none gap-2 p-0">
                {g.items.map((t) => {
                  const overdue = !t.doneAt && t.dueDate && t.dueDate < today;
                  return (
                    <li key={t.id} className={cx("flex items-start gap-3 rounded-md border-2 border-ink bg-canvas px-3 py-2", t.doneAt && "opacity-75")}>
                      <form action={toggleTask} className="flex-none">
                        <input type="hidden" name="marketId" value={marketId} />
                        <input type="hidden" name="taskId" value={t.id} />
                        <input type="hidden" name="done" value={t.doneAt ? "false" : "true"} />
                        <button
                          type="submit"
                          aria-label={t.doneAt ? `Mark “${t.title}” as not done` : `Mark “${t.title}” as done`}
                          className={cx("grid size-11 cursor-pointer place-items-center rounded-md border-0 bg-transparent p-0")}
                        >
                          <span aria-hidden="true" className={cx("grid size-6 place-items-center rounded-sm border-2 border-ink font-sans text-[15px] font-extrabold", t.doneAt ? "bg-kale text-on-kale" : "bg-paper")}>
                            {t.doneAt ? "✓" : ""}
                          </span>
                        </button>
                      </form>
                      <div className="min-w-0 flex-1 py-2">
                        <p className={cx("m-0 font-sans text-[16px] leading-[22px] font-bold", t.doneAt && "line-through decoration-2")}>{t.title}</p>
                        {t.notes ? <p className="m-0 mt-0.5 font-sans text-[14px] leading-[20px] text-ink-muted">{t.notes}</p> : null}
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <Badge tone={t.owner === side ? "info" : "neutral"}>{ownerLabel(t.owner)}</Badge>
                          {t.doneAt ? (
                            <Badge tone="success" icon="check-circle">Done {shortDate(t.doneAt)}</Badge>
                          ) : t.dueDate ? (
                            <Badge tone={overdue ? "danger" : "neutral"} icon={overdue ? "alert" : "calendar"}>
                              <span title={formatDate(t.dueDate)}>{overdue ? "Overdue: " : "Due "}{shortDate(t.dueDate)}</span>
                            </Badge>
                          ) : null}
                          {!compact ? (
                            <form action={deleteTask}>
                              <input type="hidden" name="marketId" value={marketId} />
                              <input type="hidden" name="taskId" value={t.id} />
                              <Button type="submit" variant="link" size="sm" aria-label={`Delete “${t.title}”`}>Delete</Button>
                            </form>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null,
        )}
      </div>
      {!compact ? (
        <details className="mt-5 rounded-md border-2 border-dashed border-border-control px-4 py-2 open:pb-4">
          <summary className="min-h-[44px] cursor-pointer py-2.5 font-sans text-[15px] font-extrabold">Add a task</summary>
          <div className="mt-2">
            <AdminForm
              action={addTask}
              submitLabel="Add task"
              fields={[
                { kind: "hidden", name: "marketId", value: marketId },
                { kind: "text", name: "title", label: "Task", required: true, autoComplete: "off" },
                { kind: "select", name: "owner", label: "Who's doing it", options: [{ value: side, label: side === "market" ? "The Market (you)" : `${partnerOrg} (you)` }, { value: side === "market" ? "partner" : "market", label: side === "market" ? partnerOrg : "The Market" }], half: true },
                { kind: "date", name: "dueDate", label: "Due (optional)", half: true },
                { kind: "textarea", name: "notes", label: "Details (optional)" },
              ]}
            />
          </div>
        </details>
      ) : null}
    </Panel>
  );
}

export function NotesThread({ marketId, notes, addNote, compact }: Props) {
  const shown = compact ? notes.slice(0, 3) : notes;
  return (
    <Panel title="Notes" id="notes">
      {!compact ? (
        <div className="mb-5">
          <AdminForm
            action={addNote}
            submitLabel="Post note"
            fields={[
              { kind: "hidden", name: "marketId", value: marketId },
              { kind: "textarea", name: "body", label: "Note", hint: "Shared between the Market and the event partner. Vendors don't see these." },
            ]}
          />
        </div>
      ) : null}
      {shown.length ? (
        <ol className="m-0 grid list-none gap-3 p-0">
          {shown.map((n) => (
            <li key={n.id} className="rounded-md border-2 border-ink bg-canvas px-4 py-3">
              <p className="m-0 font-sans text-[13px] font-extrabold uppercase tracking-[.1em] text-ink-muted">
                {n.authorName}{n.authorOrg ? `, ${n.authorOrg}` : ", the Market"} · {fmtDateTime(n.at)}
              </p>
              <p className="m-0 mt-1 font-sans text-[16px] leading-[24px] whitespace-pre-line">{n.body}</p>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState title="No notes yet" />
      )}
    </Panel>
  );
}
