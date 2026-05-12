"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import {
  Users,
  ShieldCheck,
  UserX,
  ChevronDown,
  AlertCircle,
  X,
  Search,
  UserCog,
  UserPlus,
  Mail,
  Clock,
  CheckCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";

// ── Invite Modal ──────────────────────────────────────────────────────────────

function InviteModal({
  roles,
  onClose,
}: {
  roles: { _id: Id<"adminRoles">; name: string }[];
  onClose: () => void;
}) {
  const sendInvite = useMutation(api.admin.sendAdminInvite);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await sendInvite({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        adminRoleId: roleId ? (roleId as Id<"adminRoles">) : undefined,
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-orange/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-brand-orange" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-text">Invite Admin</h3>
              <p className="text-xs text-neutral-text-muted">They'll receive an email to set up their account</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-bg-secondary transition-colors">
            <X className="w-4 h-4 text-neutral-text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-base font-semibold text-neutral-text mb-1">Invite sent!</h4>
              <p className="text-sm text-neutral-text-secondary">
                An invitation email has been sent to <strong>{email}</strong>. The link expires in 48 hours.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-5 py-2 bg-brand-orange text-white text-sm font-semibold rounded-lg hover:bg-brand-orange/90 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-text mb-1.5">Full Name *</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Njoroge"
                  required
                  className="w-full px-3 py-2.5 border border-neutral-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-text mb-1.5">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                  className="w-full px-3 py-2.5 border border-neutral-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-text mb-1.5">Role</label>
                <div className="relative">
                  <select
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 border border-neutral-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange appearance-none bg-white"
                  >
                    <option value="">— Assign role later —</option>
                    {roles.map((r) => (
                      <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-text-muted pointer-events-none" />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>The invitation link expires in <strong>48 hours</strong>. You can resend it from the Pending Invites tab.</span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loading || !fullName.trim() || !email.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-orange text-white text-sm font-semibold rounded-lg hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {loading ? "Sending…" : "Send Invite"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-neutral-text border border-neutral-border rounded-lg hover:bg-neutral-bg-secondary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

type Tab = "admins" | "invites";

export default function AdminsPage() {
  const admins = useQuery(api.admin.listAdmins);
  const roles = useQuery(api.adminRoles.list);
  const invites = useQuery(api.admin.listInvites);
  const adminProfile = useQuery(api.adminRoles.getCurrentAdminRole);

  const setAdminRoleById = useMutation(api.admin.setAdminRoleById);
  const revokeAdminAccess = useMutation(api.admin.revokeAdminAccess);
  const resendInvite = useMutation(api.admin.resendAdminInvite);
  const cancelInvite = useMutation(api.admin.cancelAdminInvite);

  const [tab, setTab] = useState<Tab>("admins");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [revokeConfirm, setRevokeConfirm] = useState<Id<"users"> | null>(null);
  const [changingRole, setChangingRole] = useState<Id<"users"> | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<Id<"adminInvites"> | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  const isSuperAdmin = adminProfile?.permissions.includes("*") ?? false;

  const filtered = (admins ?? []).filter(
    (a) =>
      !search ||
      a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleRoleChange = async (userId: Id<"users">, roleId: string) => {
    setError(null);
    try {
      await setAdminRoleById({
        userId,
        adminRoleId: roleId === "none" ? undefined : (roleId as Id<"adminRoles">),
      });
      setChangingRole(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update role");
    }
  };

  const handleRevoke = async (userId: Id<"users">) => {
    setError(null);
    try {
      await revokeAdminAccess({ userId });
      setRevokeConfirm(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to revoke admin access");
    }
  };

  const handleResend = async (inviteId: Id<"adminInvites">) => {
    setError(null);
    try {
      await resendInvite({ inviteId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to resend invite");
    }
  };

  const handleCancel = async (inviteId: Id<"adminInvites">) => {
    setError(null);
    try {
      await cancelInvite({ inviteId });
      setCancelConfirm(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to cancel invite");
    }
  };

  // ── Loading / access guard ─────────────────────────────────────────────────
  if (!adminProfile) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="bg-white border border-neutral-border rounded-lg p-10 text-center">
        <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-neutral-text-muted" />
        <h3 className="text-lg font-semibold text-neutral-text mb-1">Super-Admin Access Required</h3>
        <p className="text-sm text-neutral-text-secondary">Only super-admins can manage admin users.</p>
      </div>
    );
  }

  const pendingInvites = (invites ?? []).filter((i) => i.status === "pending");

  return (
    <div>
      {showInvite && (
        <InviteModal roles={roles ?? []} onClose={() => setShowInvite(false)} />
      )}

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-text mb-1">Admin Users</h2>
          <p className="text-sm text-neutral-text-secondary">
            Manage who has admin access. Assign roles to control what each admin can see and do.
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-orange text-white text-sm font-semibold rounded-lg hover:bg-brand-orange/90 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite Admin
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-neutral-bg-secondary rounded-xl p-1 w-fit">
        {(["admins", "invites"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t
                ? "bg-white text-neutral-text shadow-sm"
                : "text-neutral-text-muted hover:text-neutral-text"
            }`}
          >
            {t === "invites" ? `Pending Invites` : "Active Admins"}
            {t === "invites" && pendingInvites.length > 0 && (
              <span className="ml-2 text-[10px] bg-brand-orange text-white px-1.5 py-0.5 rounded-full font-bold">
                {pendingInvites.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Active Admins Tab ─────────────────────────────────────────────── */}
      {tab === "admins" && (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-4 py-2.5 border border-neutral-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange bg-white"
            />
          </div>

          <div className="bg-white border border-neutral-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-bg-secondary border-b border-neutral-border">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-neutral-text uppercase tracking-wider">Admin</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-neutral-text uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-neutral-text uppercase tracking-wider">Permissions</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-neutral-text uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {admins === undefined ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-200 rounded-full" />
                          <div>
                            <div className="h-3.5 bg-gray-200 rounded w-28 mb-1.5" />
                            <div className="h-3 bg-gray-200 rounded w-40" />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><div className="h-6 bg-gray-200 rounded w-24" /></td>
                      <td className="px-5 py-4"><div className="h-3 bg-gray-200 rounded w-48" /></td>
                      <td className="px-5 py-4"><div className="h-7 bg-gray-200 rounded w-20 ml-auto" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center">
                      <Users className="w-10 h-10 mx-auto mb-2 text-neutral-text-muted" />
                      <p className="text-sm text-neutral-text-secondary">
                        {search ? "No admins match your search." : "No admin users yet."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((admin) => {
                    const initials = admin.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);
                    const isCurrentUser = admin._id === adminProfile.userId;
                    const adminRole = (roles ?? []).find((r) => r._id === admin.adminRoleId);

                    return (
                      <tr key={admin._id} className="hover:bg-neutral-bg-secondary/40 transition-colors">
                        {/* Admin info */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {admin.profilePhoto ? (
                              <img
                                src={admin.profilePhoto}
                                alt={admin.fullName}
                                className="w-9 h-9 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-semibold flex items-center justify-center">
                                {initials || "?"}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-neutral-text">
                                {admin.fullName}
                                {isCurrentUser && (
                                  <span className="ml-1.5 text-xs text-neutral-text-muted">(you)</span>
                                )}
                              </p>
                              <p className="text-xs text-neutral-text-muted">{admin.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          {changingRole === admin._id ? (
                            <div className="relative w-44">
                              <select
                                autoFocus
                                defaultValue={admin.adminRoleId ?? "none"}
                                onChange={(e) => handleRoleChange(admin._id, e.target.value)}
                                onBlur={() => setChangingRole(null)}
                                className="w-full pl-3 pr-8 py-1.5 text-sm border border-brand-orange rounded-lg focus:outline-none bg-white appearance-none"
                              >
                                <option value="none">— No role —</option>
                                {(roles ?? []).map((r) => (
                                  <option key={r._id} value={r._id}>{r.name}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-text-muted pointer-events-none" />
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                isSuperAdmin && !isCurrentUser && setChangingRole(admin._id)
                              }
                              disabled={!isSuperAdmin || isCurrentUser}
                              className={`group flex items-center gap-1.5 text-sm ${
                                isSuperAdmin && !isCurrentUser
                                  ? "cursor-pointer hover:text-brand-orange"
                                  : "cursor-default"
                              }`}
                              title={
                                isSuperAdmin && !isCurrentUser ? "Click to change role" : undefined
                              }
                            >
                              {admin.isSuperAdmin ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                                  <ShieldCheck className="w-3 h-3" />
                                  Super Admin
                                </span>
                              ) : adminRole ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                                  <UserCog className="w-3 h-3" />
                                  {adminRole.name}
                                </span>
                              ) : (
                                <span className="text-xs text-neutral-text-muted italic">No role</span>
                              )}
                              {isSuperAdmin && !isCurrentUser && (
                                <ChevronDown className="w-3 h-3 text-neutral-text-muted group-hover:text-brand-orange" />
                              )}
                            </button>
                          )}
                        </td>

                        {/* Permissions summary */}
                        <td className="px-5 py-4">
                          {admin.isSuperAdmin ? (
                            <span className="text-xs text-amber-600 font-medium">Full access (*)</span>
                          ) : adminRole ? (
                            <span className="text-xs text-neutral-text-muted">
                              {adminRole.permissions.length} permission
                              {adminRole.permissions.length !== 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-text-muted">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          {revokeConfirm === admin._id ? (
                            <div className="flex items-center gap-2 justify-end">
                              <span className="text-xs text-red-600">Revoke access?</span>
                              <button
                                onClick={() => handleRevoke(admin._id)}
                                className="px-2.5 py-1 bg-red-600 text-white text-xs font-semibold rounded-md hover:bg-red-700"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setRevokeConfirm(null)}
                                className="px-2.5 py-1 border border-neutral-border text-xs rounded-md hover:bg-neutral-bg-secondary"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            !isCurrentUser && (
                              <button
                                onClick={() => setRevokeConfirm(admin._id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                Revoke
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Pending Invites Tab ───────────────────────────────────────────── */}
      {tab === "invites" && (
        <div className="bg-white border border-neutral-border rounded-xl overflow-hidden">
          {invites === undefined ? (
            <div className="p-10 text-center">
              <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : invites.length === 0 ? (
            <div className="p-10 text-center">
              <Mail className="w-10 h-10 mx-auto mb-2 text-neutral-text-muted" />
              <p className="text-sm text-neutral-text-secondary">No invites sent yet.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-neutral-bg-secondary border-b border-neutral-border">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-neutral-text uppercase tracking-wider">Invitee</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-neutral-text uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-neutral-text uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-neutral-text uppercase tracking-wider">Expires</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-neutral-text uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {invites.map((inv) => {
                  const expired = inv.inviteExpiresAt < Date.now();
                  const expiresDate = new Date(inv.inviteExpiresAt).toLocaleDateString("en-KE", {
                    day: "numeric", month: "short", year: "numeric",
                  });
                  return (
                    <tr key={inv._id} className="hover:bg-neutral-bg-secondary/40 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-neutral-text">{inv.fullName}</p>
                        <p className="text-xs text-neutral-text-muted">{inv.email}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-neutral-text-muted">
                        {inv.role?.name ?? <span className="italic">No role</span>}
                      </td>
                      <td className="px-5 py-4">
                        {inv.status === "accepted" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Accepted
                          </span>
                        ) : expired || inv.status === "expired" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                            <Clock className="w-3 h-3" /> Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-neutral-text-muted">{expiresDate}</td>
                      <td className="px-5 py-4 text-right">
                        {inv.status !== "accepted" && (
                          <div className="flex items-center gap-2 justify-end">
                            {cancelConfirm === inv._id ? (
                              <>
                                <span className="text-xs text-red-600">Cancel invite?</span>
                                <button
                                  onClick={() => handleCancel(inv._id)}
                                  className="px-2.5 py-1 bg-red-600 text-white text-xs font-semibold rounded-md hover:bg-red-700"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setCancelConfirm(null)}
                                  className="px-2.5 py-1 border border-neutral-border text-xs rounded-md hover:bg-neutral-bg-secondary"
                                >
                                  No
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleResend(inv._id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                                  title="Resend invite email"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  Resend
                                </button>
                                <button
                                  onClick={() => setCancelConfirm(inv._id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
