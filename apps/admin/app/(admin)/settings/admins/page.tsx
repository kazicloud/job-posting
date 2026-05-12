"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Users, ShieldCheck, UserX, ChevronDown, AlertCircle, X, Search, UserCog } from "lucide-react";

export default function AdminsPage() {
  const admins = useQuery(api.admin.listAdmins);
  const roles = useQuery(api.adminRoles.list);
  const adminProfile = useQuery(api.adminRoles.getCurrentAdminRole);
  const promoteToAdmin = useMutation(api.admin.promoteToAdmin);
  const setAdminRoleById = useMutation(api.admin.setAdminRoleById);
  const revokeAdminAccess = useMutation(api.admin.revokeAdminAccess);

  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [revokeConfirm, setRevokeConfirm] = useState<Id<"users"> | null>(null);
  const [changingRole, setChangingRole] = useState<Id<"users"> | null>(null);

  const isSuperAdmin = adminProfile?.permissions.includes("*") ?? false;

  const filtered = (admins ?? []).filter((a) =>
    !search ||
    a.fullName.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
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

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-text mb-1">Admin Users</h2>
        <p className="text-sm text-neutral-text-secondary">
          Manage who has admin access and what role they hold. Roles control what sections and actions each admin can access.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* How roles work — info callout */}
      <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>How it works:</strong> Each admin user is assigned a <em>role</em>. A role carries a set of
        permissions (e.g. <code className="text-xs bg-blue-100 px-1 rounded">employers:verify</code>). Super-Admin roles
        carry <code className="text-xs bg-blue-100 px-1 rounded">*</code> which bypasses all permission checks. To add a
        new admin, promote an existing platform user from the Users section and assign them a role.
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-text-muted" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-4 py-2.5 border border-neutral-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
        />
      </div>

      {/* Admins list */}
      <div className="bg-white border border-neutral-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-bg-secondary border-b border-neutral-border">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-text uppercase tracking-wider">Admin</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-text uppercase tracking-wider">Role</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-text uppercase tracking-wider">Permissions</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-text uppercase tracking-wider">Actions</th>
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
                  <p className="text-sm text-neutral-text-secondary">{search ? "No admins match your search." : "No admin users found."}</p>
                </td>
              </tr>
            ) : (
              filtered.map((admin) => {
                const initials = admin.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                const isCurrentUser = admin._id === adminProfile.userId;
                return (
                  <tr key={admin._id} className="hover:bg-neutral-bg-secondary/40 transition-colors">
                    {/* Admin info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {admin.profilePhoto ? (
                          <img src={admin.profilePhoto} alt={admin.fullName} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-semibold flex items-center justify-center">
                            {initials || "?"}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-neutral-text">
                            {admin.fullName}
                            {isCurrentUser && <span className="ml-1.5 text-xs text-neutral-text-muted">(you)</span>}
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
                          onClick={() => isSuperAdmin && !isCurrentUser && setChangingRole(admin._id)}
                          disabled={!isSuperAdmin || isCurrentUser}
                          className={`group flex items-center gap-1.5 text-sm ${
                            isSuperAdmin && !isCurrentUser
                              ? "cursor-pointer hover:text-brand-orange"
                              : "cursor-default"
                          }`}
                          title={isSuperAdmin && !isCurrentUser ? "Click to change role" : undefined}
                        >
                          {admin.isSuperAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                              <ShieldCheck className="w-3 h-3" /> Super-Admin
                            </span>
                          ) : admin.adminRoleName ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                              <UserCog className="w-3 h-3" /> {admin.adminRoleName}
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-text-muted italic">No role assigned</span>
                          )}
                          {isSuperAdmin && !isCurrentUser && (
                            <ChevronDown className="w-3 h-3 text-neutral-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      )}
                    </td>

                    {/* Permissions summary */}
                    <td className="px-5 py-4">
                      {admin.isSuperAdmin ? (
                        <span className="text-xs text-amber-600 font-medium">All permissions (*)</span>
                      ) : admin.permissions.length > 0 ? (
                        <span className="text-xs text-neutral-text-muted">
                          {admin.permissions.slice(0, 3).join(", ")}
                          {admin.permissions.length > 3 && ` +${admin.permissions.length - 3} more`}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-text-muted italic">None</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {revokeConfirm === admin._id ? (
                          <>
                            <button
                              onClick={() => handleRevoke(admin._id)}
                              className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setRevokeConfirm(null)}
                              className="px-2.5 py-1.5 border border-neutral-border text-xs font-medium rounded-lg hover:bg-neutral-bg-secondary transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          !isCurrentUser && isSuperAdmin && (
                            <button
                              onClick={() => setRevokeConfirm(admin._id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                              title="Revoke admin access"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              Revoke
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
