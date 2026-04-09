"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useDashboardUser } from "@/contexts/DashboardUserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, Mail, Phone, Shield, ShieldCheck, Trash2, UserX, UserCheck, Loader2 } from "lucide-react";
import { CardSkeleton } from "@/components/shared/skeleton-loader";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserRecord {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
  total_bookings: number;
}

export default function UsersPage() {
  const t = useTranslations("Users");
  const locale = useLocale();

  // Estado para modal de cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState<{ user: UserRecord | null }>({ user: null });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const resetPasswordModalState = () => {
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const openPasswordModal = (targetUser: UserRecord) => {
    setShowPasswordModal({ user: targetUser });
    resetPasswordModalState();
  };

  const closePasswordModal = () => {
    setShowPasswordModal({ user: null });
    resetPasswordModalState();
  };

  const handleChangePassword = async () => {
    if (!showPasswordModal.user) return;

    if (newPassword.length < 6) {
      setPasswordError(t("passwordMinLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwordsMismatch"));
      return;
    }

    setPasswordLoading(true);
    setPasswordError("");
    try {
      const response = await fetch("/api/dashboard/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: showPasswordModal.user.id, action: "change_password", newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setPasswordError(data?.error || t("passwordChangeFailed"));
        return;
      }
      const fullName = `${showPasswordModal.user.first_name} ${showPasswordModal.user.last_name}`;
      closePasswordModal();
      toast.success(t("passwordUpdated", { name: fullName }));
    } catch (error) {
      setPasswordError(t("networkError"));
    } finally {
      setPasswordLoading(false);
    }
  };
  const { user } = useDashboardUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/dashboard/users");
      const data = await response.json();
      setUsers(data.users ?? []);
    } catch (error) {
      console.error(error);
      toast.error(t("loadUsersFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserAction = async (
    targetUser: UserRecord,
    action: "activate" | "deactivate" | "grant_admin" | "delete"
  ) => {
    if (actionLoadingId !== null) return;

    if (action === "delete") {
      setDeleteTarget(targetUser);
      return;
    }

    await executeUserAction(targetUser, action);
  };

  const executeUserAction = async (
    targetUser: UserRecord,
    action: "activate" | "deactivate" | "grant_admin" | "delete"
  ) => {
    setActionLoadingId(targetUser.id);

    try {
      const response =
        action === "delete"
          ? await fetch(`/api/dashboard/users?userId=${targetUser.id}`, { method: "DELETE" })
          : await fetch("/api/dashboard/users", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: targetUser.id, action }),
            });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error || t("actionFailed"));
        return;
      }

      toast.success(data?.message || t("actionSuccess"));

      // Actualización local del usuario
      setUsers((prev) => {
        if (action === "delete") {
          return prev.filter((u) => u.id !== targetUser.id);
        }
        return prev.map((u) =>
          u.id === targetUser.id
            ? {
                ...u,
                is_active:
                  action === "activate"
                    ? true
                    : action === "deactivate"
                    ? false
                    : u.is_active,
                role:
                  action === "grant_admin"
                    ? "admin"
                    : u.role,
              }
            : u
        );
      });
    } catch (error) {
      console.error(error);
      toast.error(t("actionError"));
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      filterRole === "all" ||
      (filterRole === "admin" && (u.role === "admin" || u.role === "super_admin")) ||
      (filterRole === "clients" && u.role !== "admin" && u.role !== "super_admin");
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-500 mt-1">{t("registeredClients", { count: users.length })}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-10"
            name="users-search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
          />
        </div>
        <div className="flex gap-2">
          {["all", "clients", "admin"].map((role) => (
            <Button key={role} variant={filterRole === role ? "default" : "outline"} size="sm" onClick={() => setFilterRole(role)}
              className={filterRole === role ? "bg-brand-600 hover:bg-brand-700" : ""}>
              {role === "all" ? t("filterAll") : role === "admin" ? t("filterAdmins") : t("filterClients")}
            </Button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-slate-800">
              <TableHead className="p-4">{t("colUser")}</TableHead>
              <TableHead className="p-4">{t("colContact")}</TableHead>
              <TableHead className="p-4">{t("colRole")}</TableHead>
              <TableHead className="p-4">{t("colOrders")}</TableHead>
              <TableHead className="p-4">{t("colStatus")}</TableHead>
              <TableHead className="p-4">{t("colRegistration")}</TableHead>
              <TableHead className="p-4 text-right">{t("colActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <EmptyState icon={Users} title={t("emptyUsers")} description={t("emptyUsersHint")} />
                </TableCell>
              </TableRow>
            )}
            {filteredUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
                        {u.first_name[0]}{u.last_name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.first_name} {u.last_name}</p>
                        <p className="text-xs text-gray-500">ID: {u.id}</p>
                      </div>
                    </div>
                </TableCell>
                <TableCell className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="w-3 h-3" /> {u.email}
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="w-3 h-3" /> {u.phone}
                        </div>
                      )}
                    </div>
                </TableCell>
                <TableCell className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.role === "super_admin" ? "bg-red-100 text-red-700" : u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {(u.role === "admin" || u.role === "super_admin") ? <ShieldCheck className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                      {u.role === "super_admin" ? t("role.superAdmin") : u.role === "admin" ? t("role.admin") : t("role.client")}
                    </span>
                </TableCell>
                <TableCell className="p-4 text-sm text-gray-700 font-medium">{u.total_bookings}</TableCell>
                <TableCell className="p-4">
                    <StatusBadge entity="users" status={u.is_active ? "active" : "inactive"} />
                </TableCell>
                <TableCell className="p-4 text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString(locale)}</TableCell>
                <TableCell className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-brand-600"
                        disabled={actionLoadingId === u.id || u.id === user.id}
                        title={u.id === user.id ? t("cannotModifySelf") : u.is_active ? t("deactivateUser") : t("activateUser")}
                        aria-label={u.id === user.id ? t("cannotModifySelf") : u.is_active ? t("deactivateUser") : t("activateUser")}
                        onClick={() => handleUserAction(u, u.is_active ? "deactivate" : "activate")}
                      >
                        {actionLoadingId === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : u.is_active ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-brand-600"
                        disabled={actionLoadingId === u.id || u.role === "admin" || u.role === "super_admin" || u.id === user.id}
                        title={u.role === "admin" || u.role === "super_admin" ? t("alreadyAdmin") : t("grantAdmin")}
                        aria-label={u.role === "admin" || u.role === "super_admin" ? t("alreadyAdmin") : t("grantAdmin")}
                        onClick={() => handleUserAction(u, "grant_admin")}
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-red-600"
                        disabled={actionLoadingId === u.id || u.role === "admin" || u.role === "super_admin" || u.id === user.id}
                        title={u.role === "admin" || u.role === "super_admin" ? t("cannotDeleteAdmin") : t("deleteUser")}
                        aria-label={u.role === "admin" || u.role === "super_admin" ? t("cannotDeleteAdmin") : t("deleteUser")}
                        onClick={() => handleUserAction(u, "delete")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-green-600"
                        disabled={u.role === "admin" || u.role === "super_admin" || u.id === user.id}
                        title={u.role === "admin" || u.role === "super_admin" ? t("cannotChangeAdminPassword") : t("changePassword")}
                        aria-label={u.role === "admin" || u.role === "super_admin" ? t("cannotChangeAdminPassword") : t("changePassword")}
                        onClick={() => openPasswordModal(u)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M10 2a4 4 0 0 0-4 4v3H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1V6a4 4 0 0 0-4-4zm-2 7V6a2 2 0 1 1 4 0v3H8zm-3 2a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7z" clipRule="evenodd" />
                        </svg>
                      </Button>
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
          {/* Modal de cambio de contraseña */}
          {showPasswordModal.user && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                <h2 className="text-lg font-bold mb-2">{t("changePassword")}</h2>
                <p className="text-sm mb-4">{t("modalUserLabel")}: <span className="font-semibold">{showPasswordModal.user.first_name} {showPasswordModal.user.last_name}</span> (ID: {showPasswordModal.user.id})</p>
                {/* Campo oculto de usuario para guiar al autofill y evitar que tome la barra de búsqueda */}
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={showPasswordModal.user.email}
                  readOnly
                  tabIndex={-1}
                  aria-hidden="true"
                  className="hidden"
                />
                <Input
                  type="password"
                  name="new-password"
                  autoComplete="new-password"
                  placeholder={t("newPasswordPlaceholder")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={passwordLoading}
                  className="mb-3"
                />
                <Input
                  type="password"
                  name="confirm-new-password"
                  autoComplete="new-password"
                  placeholder={t("confirmPasswordPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={passwordLoading}
                  className="mb-3"
                />
                {passwordError && <div className="text-red-600 text-sm mb-2">{passwordError}</div>}
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={closePasswordModal} disabled={passwordLoading}>{t("cancel")}</Button>
                  <Button variant="default" onClick={handleChangePassword} disabled={passwordLoading || newPassword.length < 6 || confirmPassword.length < 6}>
                    {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("save")}
                  </Button>
                </div>
              </div>
            </div>
          )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDeleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? t("confirmDelete", { name: `${deleteTarget.first_name} ${deleteTarget.last_name}` })
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteTarget) {
                  executeUserAction(deleteTarget, "delete");
                  setDeleteTarget(null);
                }
              }}
            >
              {t("deleteConfirmAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

