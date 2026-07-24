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

type RFQ = Database["public"]["Tables"]["rfqs"]["Row"];

interface RFQTableProps {
  rfqs: RFQ[];
  onView: (rfq: RFQ) => void;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  sent: "bg-blue-100 text-blue-800 border-blue-200",
  closed: "bg-yellow-100 text-yellow-800 border-yellow-200",
  awarded: "bg-green-100 text-green-800 border-green-200",
};

export const RFQTable = ({ rfqs, onView }: RFQTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° RFQ</TableHead>
            <TableHead>Titre</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Échéance</TableHead>
            <TableHead>Créé le</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rfqs.map((rfq) => (
            <TableRow key={rfq.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onView(rfq)}>
              <TableCell className="font-medium">{rfq.rfq_number}</TableCell>
              <TableCell>{rfq.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className={statusColors[rfq.status] ?? statusColors.draft}>
                  {rfq.status}
                </Badge>
              </TableCell>
              <TableCell>
                {rfq.submission_deadline ? format(new Date(rfq.submission_deadline), "dd/MM/yyyy") : "—"}
              </TableCell>
              <TableCell>{format(new Date(rfq.created_at), "dd/MM/yyyy")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
