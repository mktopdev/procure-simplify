import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";

// Minimal Fleet stub: just enough vehicle/driver data to assign a trip.
// Full Enterprise Asset Management (maintenance, tyres, fuel, documents,
// compliance) is a later phase; this only carries the fields Transportation
// needs today.
const Fleet = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("transport.manage");

  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [capacityTons, setCapacityTons] = useState("");

  const [isAddingDriver, setIsAddingDriver] = useState(false);
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("*").order("plate_number");
      if (error) throw error;
      return data;
    },
  });

  const { data: drivers } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("drivers").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleAddVehicle = async () => {
    if (!plateNumber.trim()) return;
    try {
      const { error } = await supabase.from("vehicles").insert({
        plate_number: plateNumber,
        vehicle_type: vehicleType || null,
        capacity_tons: capacityTons ? parseFloat(capacityTons) : null,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setIsAddingVehicle(false);
      setPlateNumber("");
      setVehicleType("");
      setCapacityTons("");
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleAddDriver = async () => {
    if (!driverName.trim()) return;
    try {
      const { error } = await supabase.from("drivers").insert({
        name: driverName,
        phone: driverPhone || null,
        license_number: licenseNumber || null,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      setIsAddingDriver(false);
      setDriverName("");
      setDriverPhone("");
      setLicenseNumber("");
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Flotte</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Véhicules</CardTitle>
              {canManage && !isAddingVehicle && (
                <Button variant="outline" size="sm" onClick={() => setIsAddingVehicle(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {isAddingVehicle && (
                <div className="grid grid-cols-2 gap-2 pb-3 border-b border-gray-100">
                  <Input
                    placeholder="Immatriculation"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                  />
                  <Input placeholder="Type" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} />
                  <Input
                    type="number"
                    placeholder="Capacité (t)"
                    value={capacityTons}
                    onChange={(e) => setCapacityTons(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsAddingVehicle(false)}>
                      Annuler
                    </Button>
                    <Button size="sm" onClick={handleAddVehicle}>
                      Enregistrer
                    </Button>
                  </div>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Immatriculation</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(vehicles ?? []).map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.plate_number}</TableCell>
                      <TableCell>{v.vehicle_type || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{v.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Chauffeurs</CardTitle>
              {canManage && !isAddingDriver && (
                <Button variant="outline" size="sm" onClick={() => setIsAddingDriver(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {isAddingDriver && (
                <div className="grid grid-cols-2 gap-2 pb-3 border-b border-gray-100">
                  <Input placeholder="Nom" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
                  <Input
                    placeholder="Téléphone"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                  />
                  <Input
                    placeholder="N° Permis"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsAddingDriver(false)}>
                      Annuler
                    </Button>
                    <Button size="sm" onClick={handleAddDriver}>
                      Enregistrer
                    </Button>
                  </div>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(drivers ?? []).map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>{d.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{d.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default Fleet;
