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

type TransportOrder = Database["public"]["Tables"]["transport_orders"]["Row"] & {
  customers: { name: string } | null;
};

interface TransportOrderTableProps {
  orders: TransportOrder[];
  onView: (order: TransportOrder) => void;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  awaiting_assignment: "bg-yellow-100 text-yellow-800 border-yellow-200",
  assigned: "bg-blue-100 text-blue-800 border-blue-200",
  in_transit: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-cyan-100 text-cyan-800 border-cyan-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export const TransportOrderTable = ({ orders, onView }: TransportOrderTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° Ordre</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Créé le</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onView(order)}>
              <TableCell className="font-medium">{order.order_number}</TableCell>
              <TableCell>{order.customers?.name ?? "—"}</TableCell>
              <TableCell>{order.delivery_address ?? "—"}</TableCell>
              <TableCell>
                <Badge variant="outline" className={statusColors[order.status] ?? statusColors.draft}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(order.created_at), "dd/MM/yyyy")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
