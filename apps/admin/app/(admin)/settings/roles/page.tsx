"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { ShieldCheck, Plus, Pencil, Trash2, X, Check, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

// ── Permission catalogue — matches adminAuthHelpers.ts ────────────────────────

const PERMISSION_GROUPS = [
  {
    label: "Dashboard",
    permissions: [{ key: "dashboard:view", label: "View platform statistics" }],
  },
  {
    label: "Employers",
    permissions: [
      { key: "employers:view",    label: "View employer accounts" },
      { key: "employers:verify",  label: "Approve / reject verification" },
      { key: "employers:suspend", label: "Suspend / unsuspend accounts" },
      { key: "employers:edit",    label: "Edit employer profiles" },
    ],
  },
  {
    label: "Job Seekers",
    permissions: [
      { key: "job_seekers:view",   label: "View job seeker accounts" },
      { key: "job_seekers:manage", label: "Manage job seeker accounts" },
    ],
  },
  {
    label: "Jobs",
    permissions: [
      { key: "jobs:view",    label: "View all job listings" },
      { key: "jobs:feature", label: "Feature or flag listings" },
      { key: "jobs:delete",  label: "Delete job listings" },
      { key: "jobs:post",    label: "Post jobs on behalf of employers" },
    ],
  },
  {
    label: "Applications",
    permissions: [{ key: "applications:view", label: "View all applications" }],
  },
  {
    label: "Messages & Support",
    permissions: [
      { key: "messages:view",  label: "View contact form messages" },
      { key: "messages:reply", label: "Reply to contact messages" },
      { key: "chats:view",     label: "View all support chats" },
      { key: "chats:reply",    label: "Reply to support chats" },
      { key: "chats:assign",   label: "Assign support chats" },
    ],
  },
  {
    label: "Subscriptions & Services",
    permissions: [
      { key: "subscriptions:view", label: "View subscription data" },
      { key: "services:view",      label: "View service orders" },
      { key: "services:manage",    label: "Update service orders" },
    ],
  },
  {
    label: "Admin Management (Super-Admin only)",
    permissions: [
      { key: "settings:view", label: "View settings" },
      { key: "roles:view",    label: "View admin roles" },
      { key: "roles:create",  label: "Create admin roles" },
      { key: "roles:update",  label: "Update admin roles" },
      { key: "roles:delete",  label: "Delete admin roles" },
      { key: "admins:view",   label: "View admin users" },
      { key: "admins:invite", label: "Invite new admins" },
      { key: "admins:update", label: "Update admin roles" },
      { key: "admins:remove", label: "Revoke admin access" },
    ],
  },
];

// ── Form ─────────────────────────────────────────────────────────────────────

function RoleForm({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial?: { name: string; description?: string; permissions: string[]; isDefault?: boolean };
  onSave: (data: { name: string; description: string; permissions: string[]; isDefault: boolean }) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);
  const [selected, setSelected] = useState<Set<string>>(new Set(initial?.permissions ?? []));
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(PERMISSION_GROUPS.map(g => g.label)));

  const isSuperAdmin = selected.has("*");

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const toggleGroup = (keys: string[], allChecked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const k of keys) { if (allChecked) next.delete(k); else next.add(k); }
      return next;
    });
  };

  const toggleExpandGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-text mb-1.5">Role Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Support Agent"
            className="w-full px-3 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-text mb-1.5">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            className="w-full px-3 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-4 h-4 accent-brand-orange"
          />
          <span className="text-sm text-neutral-text">Default role for new admins</span>
        </label>
      </div>

      {/* Super-admin shortcut */}
      <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <input
          type="checkbox"
          id="super-admin"
          checked={isSuperAdmin}
          onChange={(e) => {
            setSelected(e.target.checked ? new Set(["*"]) : new Set());
          }}
          className="w-4 h-4 accent-amber-500"
        />
        <label htmlFor="super-admin" className="text-sm font-medium text-amber-800 cursor-pointer">
          Super-Admin — full unrestricted access (<code className="text-xs bg-amber-100 px-1 rounded">*</code>)
        </label>
      </div>

      {/* Permission checkboxes */}
      {!isSuperAdmin && (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {PERMISSION_GROUPS.map((group) => {
            const keys = group.permissions.map(p => p.key);
            const allChecked = keys.every(k => selected.has(k));
            const someChecked = keys.some(k => selected.has(k));
            const isExpanded = expandedGroups.has(group.label);

            return (
              <div key={group.label} className="border border-neutral-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleExpandGroup(group.label)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-neutral-bg-secondary hover:bg-neutral-border/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                      onChange={(e) => { e.stopPropagation(); toggleGroup(keys, allChecked); }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 accent-brand-orange"
                    />
                    <span className="text-sm font-semibold text-neutral-text">{group.label}</span>
                    {someChecked && !allChecked && (
                      <span className="text-xs text-neutral-text-muted">({keys.filter(k => selected.has(k)).length}/{keys.length})</span>
                    )}
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-text-muted" /> : <ChevronDown className="w-4 h-4 text-neutral-text-muted" />}
                </button>
                {isExpanded && (
                  <div className="px-4 py-2 space-y-2">
                    {group.permissions.map((perm) => (
                      <label key={perm.key} className="flex items-center gap-3 cursor-pointer py-1">
                        <input
                          type="checkbox"
                          checked={selected.has(perm.key)}
                          onChange={() => toggle(perm.key)}
                          className="w-4 h-4 accent-brand-orange"
                        />
                        <div>
                          <span className="text-sm text-neutral-text">{perm.label}</span>
                          <code className="ml-2 text-xs text-neutral-text-muted bg-neutral-bg-secondary px-1.5 py-0.5 rounded">
                            {perm.key}
                          </code>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2 border-t border-neutral-border">
        <button
          onClick={() => onSave({ name, description, permissions: Array.from(selected), isDefault })}
          disabled={!name.trim() || isSaving}
          className="px-4 py-2 bg-brand-orange text-white text-sm font-semibold rounded-lg hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          {isSaving ? "Saving…" : "Save Role"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-neutral-text border border-neutral-border rounded-lg hover:bg-neutral-bg-secondary transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const roles = useQuery(api.adminRoles.list);
  const adminProfile = useQuery(api.adminRoles.getCurrentAdminRole);
  const createRole = useMutation(api.adminRoles.create);
  const updateRole = useMutation(api.adminRoles.update);
  const removeRole = useMutation(api.adminRoles.remove);
  const seedRoles = useMutation(api.adminRoles.seedDefaultRoles);

  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingRole, setEditingRole] = useState<{ _id: Id<"adminRoles">; name: string; description?: string; permissions: string[]; isDefault?: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Id<"adminRoles"> | null>(null);

  const isSuperAdmin = adminProfile?.permissions.includes("*") ?? false;

  const handleCreate = async (data: { name: string; description: string; permissions: string[]; isDefault: boolean }) => {
    setIsSaving(true);
    setError(null);
    try {
      await createRole(data);
      setMode("list");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create role");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (data: { name: string; description: string; permissions: string[]; isDefault: boolean }) => {
    if (!editingRole) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateRole({ id: editingRole._id, ...data });
      setMode("list");
      setEditingRole(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update role");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: Id<"adminRoles">) => {
    try {
      await removeRole({ id });
      setDeleteConfirm(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete role");
    }
  };

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
        <p className="text-sm text-neutral-text-secondary">Only super-admins can manage roles.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-text mb-1">Admin Roles</h2>
          <p className="text-sm text-neutral-text-secondary">Define roles with granular permissions. Super-admins have unrestricted access.</p>
        </div>
        {mode === "list" && (
          <div className="flex gap-2">
            {roles !== undefined && roles.length === 0 && (
              <button
                onClick={() => seedRoles()}
                className="px-4 py-2 text-sm font-medium text-neutral-text border border-neutral-border rounded-lg hover:bg-neutral-bg-secondary transition-colors"
              >
                Seed Defaults
              </button>
            )}
            <button
              onClick={() => setMode("create")}
              className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white text-sm font-semibold rounded-lg hover:bg-brand-orange/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Role
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {mode === "create" && (
        <div className="bg-white border border-neutral-border rounded-lg p-6 mb-6">
          <h3 className="text-base font-semibold text-neutral-text mb-4">Create New Role</h3>
          <RoleForm onSave={handleCreate} onCancel={() => setMode("list")} isSaving={isSaving} />
        </div>
      )}

      {mode === "edit" && editingRole && (
        <div className="bg-white border border-neutral-border rounded-lg p-6 mb-6">
          <h3 className="text-base font-semibold text-neutral-text mb-4">Edit Role — {editingRole.name}</h3>
          <RoleForm
            initial={editingRole}
            onSave={handleUpdate}
            onCancel={() => { setMode("list"); setEditingRole(null); }}
            isSaving={isSaving}
          />
        </div>
      )}

      {/* Roles list */}
      <div className="space-y-3">
        {roles === undefined ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-neutral-border rounded-lg p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-56" />
                </div>
              </div>
            </div>
          ))
        ) : roles.length === 0 ? (
          <div className="bg-white border border-neutral-border rounded-lg p-10 text-center">
            <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-neutral-text-muted" />
            <h3 className="text-base font-semibold text-neutral-text mb-1">No roles yet</h3>
            <p className="text-sm text-neutral-text-secondary">Click "Seed Defaults" to create the starter roles, or create one manually.</p>
          </div>
        ) : (
          roles.map((role) => {
            const isSuperRole = role.permissions.includes("*");
            return (
              <div key={role._id} className="bg-white border border-neutral-border rounded-lg p-5">
                {deleteConfirm === role._id ? (
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-neutral-text flex-1">
                      Delete <strong>{role.name}</strong>? This cannot be undone.
                    </p>
                    <button
                      onClick={() => handleDelete(role._id)}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 border border-neutral-border text-xs font-medium rounded-lg hover:bg-neutral-bg-secondary transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isSuperRole ? "bg-amber-100" : "bg-brand-orange/10"}`}>
                        <ShieldCheck className={`w-5 h-5 ${isSuperRole ? "text-amber-600" : "text-brand-orange"}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-sm font-semibold text-neutral-text">{role.name}</h3>
                          {isSuperRole && (
                            <span className="text-xs font-medium px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Super-Admin</span>
                          )}
                          {role.isDefault && (
                            <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">Default</span>
                          )}
                        </div>
                        {role.description && (
                          <p className="text-xs text-neutral-text-secondary mb-2">{role.description}</p>
                        )}
                        {!isSuperRole && (
                          <div className="flex flex-wrap gap-1.5">
                            {role.permissions.slice(0, 6).map((p) => (
                              <code key={p} className="text-[10px] px-1.5 py-0.5 bg-neutral-bg-secondary text-neutral-text-muted rounded">
                                {p}
                              </code>
                            ))}
                            {role.permissions.length > 6 && (
                              <span className="text-[10px] text-neutral-text-muted">+{role.permissions.length - 6} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isSuperRole ? (
                        <span className="text-[11px] text-neutral-text-muted px-2.5 py-1 bg-neutral-bg-secondary rounded-lg select-none" title="The Super Admin role cannot be modified">
                          Protected
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditingRole(role as any); setMode("edit"); setError(null); }}
                            className="p-1.5 text-neutral-text-muted hover:text-neutral-text hover:bg-neutral-bg-secondary rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(role._id)}
                            className="p-1.5 text-neutral-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
