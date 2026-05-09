"use client";

import { useState, useTransition } from "react";
import {
  adjustEloAction,
  banUserAction,
  deleteShadowAction,
  forceVerifyEmailAction,
  resetPasswordAction,
  setPremiumAction,
} from "./actions";
import { Badge, Button, TD, TR } from "@/components/ui";
import { formatDateShort, formatRelative } from "@/lib/format";

export type UserRowData = {
  id: string;
  email: string | null;
  name: string | null;
  emailVerified: Date | null;
  isPremium: boolean;
  premiumUntil: Date | null;
  elo: number;
  createdAt: Date;
  hasPassword: boolean;
  /** Server-spawned bot account from the shadow pool. */
  isShadow: boolean;
};

export function UserRow({ u }: { u: UserRowData }) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  const isCurrentlyPremium =
    u.isPremium || (u.premiumUntil != null && u.premiumUntil.getTime() > Date.now());

  return (
    <>
      <TR className={pending ? "opacity-50" : ""}>
        <TD>
          <div className="flex items-center gap-1.5 text-fg-1">
            <span>{u.name ?? "—"}</span>
            {u.isShadow && <Badge tone="warn">shadow</Badge>}
          </div>
          <div className="text-xs text-fg-3">{u.email ?? "—"}</div>
        </TD>
        <TD>
          {u.emailVerified ? (
            <Badge tone="success">verified</Badge>
          ) : (
            <Badge tone="warn">unverified</Badge>
          )}
        </TD>
        <TD>
          {isCurrentlyPremium ? (
            <Badge tone="accent">premium</Badge>
          ) : (
            <Badge>free</Badge>
          )}
          {u.premiumUntil && (
            <div className="mt-0.5 text-[10px] text-fg-3">
              until {formatDateShort(u.premiumUntil)}
            </div>
          )}
        </TD>
        <TD>
          <span className="font-mono text-fg-1">{u.elo}</span>
        </TD>
        <TD className="text-xs text-fg-2">{formatRelative(u.createdAt)}</TD>
        <TD className="text-right">
          <Button variant="ghost" onClick={() => setOpen((v) => !v)}>
            {open ? "Close" : "Manage"}
          </Button>
        </TD>
      </TR>

      {open && (
        <TR className="bg-bg-2/40">
          <TD className="py-4" />
          <TD colSpan={5} className="py-4 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-xs uppercase tracking-widest text-fg-3">Premium</span>
              <Button
                disabled={pending}
                onClick={() => start(() => setPremiumAction(u.id, 30))}
              >
                +30 days
              </Button>
              <Button
                disabled={pending}
                onClick={() => start(() => setPremiumAction(u.id, 365))}
              >
                +1 year
              </Button>
              <Button
                disabled={pending || !isCurrentlyPremium}
                variant="danger"
                onClick={() => start(() => setPremiumAction(u.id, "off"))}
              >
                Revoke
              </Button>

              <span className="ml-4 mr-2 text-xs uppercase tracking-widest text-fg-3">Email</span>
              <Button
                disabled={pending || !!u.emailVerified}
                onClick={() => start(() => forceVerifyEmailAction(u.id))}
              >
                Force verify
              </Button>

              <span className="ml-4 mr-2 text-xs uppercase tracking-widest text-fg-3">ELO</span>
              <Button disabled={pending} onClick={() => start(() => adjustEloAction(u.id, +50))}>
                +50
              </Button>
              <Button disabled={pending} onClick={() => start(() => adjustEloAction(u.id, -50))}>
                -50
              </Button>
              <Button
                disabled={pending}
                onClick={() => {
                  const v = window.prompt("Set ELO to (0–4000):");
                  if (!v) return;
                  const n = Number(v);
                  if (!Number.isFinite(n)) return;
                  start(() => adjustEloAction(u.id, n - u.elo));
                }}
              >
                Set…
              </Button>

              <span className="ml-4 mr-2 text-xs uppercase tracking-widest text-fg-3">Password</span>
              <Button
                disabled={pending}
                onClick={() => {
                  const v = window.prompt("New password (min 8 chars):");
                  if (!v) return;
                  start(() => resetPasswordAction(u.id, v));
                }}
              >
                Reset
              </Button>

              <span className="ml-auto" />
              {u.isShadow ? (
                <Button
                  disabled={pending}
                  variant="danger"
                  onClick={() => {
                    if (
                      !window.confirm(
                        "Delete this shadow? Cascades to its match history.",
                      )
                    ) {
                      return;
                    }
                    start(async () => {
                      const res = await deleteShadowAction(u.id);
                      if (!res.ok) {
                        const reason =
                          res.code === "in_match"
                            ? "Shadow is in an active match — try again after it ends."
                            : res.code === "not_shadow"
                              ? "Refused: not a shadow account."
                              : "Shadow no longer exists.";
                        window.alert(reason);
                      }
                    });
                  }}
                >
                  Delete shadow
                </Button>
              ) : (
                <Button
                  disabled={pending}
                  variant="danger"
                  onClick={() => {
                    if (!window.confirm("Ban user? Removes verification + password.")) return;
                    start(() => banUserAction(u.id));
                  }}
                >
                  Ban
                </Button>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-fg-3 sm:grid-cols-4">
              <Field label="ID" value={u.id} mono />
              <Field label="Joined" value={formatDateShort(u.createdAt)} />
              <Field
                label="Password set"
                value={u.hasPassword ? "yes" : "no"}
              />
              <Field
                label="Email verified at"
                value={u.emailVerified ? formatDateShort(u.emailVerified) : "—"}
              />
            </div>
          </TD>
        </TR>
      )}
    </>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="uppercase tracking-widest">{label}</div>
      <div className={`mt-0.5 text-fg-1 ${mono ? "font-mono text-[11px]" : ""} truncate`}>
        {value}
      </div>
    </div>
  );
}
