import { format } from "date-fns";
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

type PurchaseOrder = Database["public"]["Tables"]["purchase_orders"]["Row"] & {
  suppliers: { name: string } | null;
};

interface PurchaseOrderTableProps {
  purchaseOrders: PurchaseOrder[];
  onView: (po: PurchaseOrder) => void;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  issued: "bg-blue-100 text-blue-800 border-blue-200",
  accepted: "bg-purple-100 text-purple-800 border-purple-200",
  partially_delivered: "bg-yellow-100 text-yellow-800 border-yellow-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
};

export const PurchaseOrderTable = ({ purchaseOrders, onView }: PurchaseOrderTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° BC</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Devise</TableHead>
            <TableHead>Créé le</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchaseOrders.map((po) => (
            <TableRow key={po.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onView(po)}>
              <TableCell className="font-medium">{po.po_number}</TableCell>
              <TableCell>{po.suppliers?.name ?? "—"}</TableCell>
              <TableCell>
                <Badge variant="outline" className={statusColors[po.status] ?? statusColors.draft}>
                  {po.status}
                </Badge>
              </TableCell>
              <TableCell>{po.currency_code}</TableCell>
              <TableCell>{format(new Date(po.created_at), "dd/MM/yyyy")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
