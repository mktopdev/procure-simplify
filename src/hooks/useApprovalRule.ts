import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface ApprovalRuleRow {
  id: string;
  min_amount: number | null;
  max_amount: number | null;
  roles: { key: string; name: string } | null;
}

// Resolves the amount-banded approval_rules row for a module/entity/amount,
// and whether the current user holds the required approver role (or admin).
// This is the generic, configurable approval matrix from the foundational
// schema (replaces per-module hardcoded role switches) — first applied here
// to Purchase Orders; Finance invoice/payment approvals reuse it next.
export const useApprovalRule = (module: string, entityType: string, amount: number | null) => {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data: rule, isLoading: isRuleLoading } = useQuery({
    queryKey: ["approval_rule", module, entityType, amount],
    enabled: amount !== null,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approval_rules")
        .select("id, min_amount, max_amount, roles(key, name)")
        .eq("module", module)
        .eq("entity_type", entityType);
      if (error) throw error;
      const rows = (data ?? []) as unknown as ApprovalRuleRow[];
      return rows.find((r) => {
        const min = r.min_amount ?? -Infinity;
        const max = r.max_amount ?? Infinity;
        return (amount ?? 0) >= min && (amount ?? 0) < max;
      });
    },
  });

  const { data: userRoleKeys, isLoading: isRolesLoading } = useQuery({
    queryKey: ["user_role_keys", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("roles(key)")
        .eq("user_id", userId!);
      if (error) throw error;
      const rows = (data ?? []) as unknown as { roles: { key: string } | null }[];
      return new Set(rows.map((r) => r.roles?.key).filter((k): k is string => !!k));
    },
  });

  const canApprove =
    !!rule &&
    !!userRoleKeys &&
    (userRoleKeys.has("admin") || (!!rule.roles?.key && userRoleKeys.has(rule.roles.key)));

  return {
    requiredRoleName: rule?.roles?.name ?? null,
    canApprove,
    isLoading: isRuleLoading || isRolesLoading,
  };
};
