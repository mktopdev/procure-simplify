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

type SupplierInvoice = Database["public"]["Tables"]["supplier_invoices"]["Row"] & {
  suppliers: { name: string } | null;
};

interface SupplierInvoiceTableProps {
  invoices: SupplierInvoice[];
  onView: (invoice: SupplierInvoice) => void;
}

const statusColors: Record<string, string> = {
  pending_approval: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-blue-100 text-blue-800 border-blue-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export const SupplierInvoiceTable = ({ invoices, onView }: SupplierInvoiceTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Référence</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Échéance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onView(invoice)}>
              <TableCell className="font-medium">{invoice.internal_reference}</TableCell>
              <TableCell>{invoice.suppliers?.name ?? "—"}</TableCell>
              <TableCell>
                {invoice.total_amount.toLocaleString()} {invoice.currency_code}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={statusColors[invoice.status] ?? statusColors.pending_approval}>
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell>{invoice.due_date ? format(new Date(invoice.due_date), "dd/MM/yyyy") : "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
