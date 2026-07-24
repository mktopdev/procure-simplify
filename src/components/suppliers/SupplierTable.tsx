import { Eye } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Database } from "@/integrations/supabase/types";

type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];

interface SupplierTableProps {
  suppliers: Supplier[];
  onView: (supplier: Supplier) => void;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
  blocked: "bg-orange-100 text-orange-800 border-orange-200",
  blacklisted: "bg-red-100 text-red-800 border-red-200",
};

const riskColors: Record<string, string> = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

export const SupplierTable = ({ suppliers, onView }: SupplierTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Risque</TableHead>
            <TableHead className="w-[100px]">Ajouté le</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow
              key={supplier.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onView(supplier)}
            >
              <TableCell className="font-medium">
                {supplier.name}
                {supplier.trading_name && (
                  <span className="block text-xs text-gray-400">{supplier.trading_name}</span>
                )}
              </TableCell>
              <TableCell className="capitalize">{supplier.category || "—"}</TableCell>
              <TableCell>
                {supplier.email || supplier.phone || "—"}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={statusColors[supplier.status] ?? statusColors.active}>
                  {supplier.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={riskColors[supplier.risk_rating] ?? riskColors.low}>
                  {supplier.risk_rating}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                {format(new Date(supplier.created_at), "dd/MM/yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(supplier);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
