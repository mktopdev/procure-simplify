import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AuditLog {
  id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  modified_by: string;
  modified_by_profile: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface AuditLogTableProps {
  auditLogs: AuditLog[];
}

export const AuditLogTable = ({ auditLogs }: AuditLogTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des Modifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Champ Modifié</TableHead>
                <TableHead>Ancienne Valeur</TableHead>
                <TableHead>Nouvelle Valeur</TableHead>
                <TableHead>Modifié Par</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell>{log.field_name}</TableCell>
                  <TableCell>{log.old_value}</TableCell>
                  <TableCell>{log.new_value}</TableCell>
                  <TableCell>
                    {log.modified_by_profile?.first_name}{" "}
                    {log.modified_by_profile?.last_name}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};