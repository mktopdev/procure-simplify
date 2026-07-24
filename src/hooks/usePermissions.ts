import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

// RBAC foundation: resolves the current user's permission keys via
// user_roles -> role_permissions -> permissions. Reused by every module
// (Suppliers, Procurement, Finance, Transportation, ...) to gate UI actions.
// The server-side source of truth is Postgres RLS (has_permission()); this
// hook is purely for hiding/disabling controls the user couldn't use anyway.
export const usePermissions = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data: permissionKeys, isLoading } = useQuery({
    queryKey: ["permissions", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Set<string>> => {
      const { data: userRoles, error: userRolesError } = await supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", userId!);
      if (userRolesError) throw userRolesError;

      const roleIds = (userRoles ?? []).map((r) => r.role_id);
      if (roleIds.length === 0) return new Set();

      const { data: rolePermissions, error: rolePermissionsError } = await supabase
        .from("role_permissions")
        .select("permission_id")
        .in("role_id", roleIds);
      if (rolePermissionsError) throw rolePermissionsError;

      const permissionIds = [
        ...new Set((rolePermissions ?? []).map((rp) => rp.permission_id)),
      ];
      if (permissionIds.length === 0) return new Set();

      const { data: permissions, error: permissionsError } = await supabase
        .from("permissions")
        .select("key")
        .in("id", permissionIds);
      if (permissionsError) throw permissionsError;

      return new Set((permissions ?? []).map((p) => p.key));
    },
  });

  const hasPermission = (key: string) => permissionKeys?.has(key) ?? false;

  return {
    hasPermission,
    isLoading,
    permissionKeys: permissionKeys ?? new Set<string>(),
  };
};
