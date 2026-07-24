import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentsPanel } from "@/components/documents/DocumentsPanel";
import { usePermissions } from "@/hooks/usePermissions";

const EXPENSE_CATEGORIES = ["fuel", "toll", "driver_allowance", "repairs", "other"];

const TransportOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("transport.manage");

  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("fuel");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  const { data: order } = useQuery({
    queryKey: ["transport_order", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transport_orders")
        .select("*, customers(name)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: trip } = useQuery({
    queryKey: ["trip", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("*, vehicles(plate_number), drivers(name)")
        .eq("transport_order_id", id!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: availableVehicles } = useQuery({
    queryKey: ["vehicles", "available"],
    enabled: !trip,
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("id, plate_number").eq("status", "available");
      if (error) throw error;
      return data;
    },
  });

  const { data: availableDrivers } = useQuery({
    queryKey: ["drivers", "available"],
    enabled: !trip,
    queryFn: async () => {
      const { data, error } = await supabase.from("drivers").select("id, name").eq("status", "available");
      if (error) throw error;
      return data;
    },
  });

  const { data: expenses, refetch: refetchExpenses } = useQuery({
    queryKey: ["trip_expenses", trip?.id],
    enabled: !!trip?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("trip_expenses").select("*").eq("trip_id", trip!.id);
      if (error) throw error;
      return data;
    },
  });

  const totalExpenses = (expenses ?? []).reduce((sum, e) => sum + e.amount, 0);

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["transport_order", id] });
    queryClient.invalidateQueries({ queryKey: ["trip", id] });
  };

  const handleAssign = async () => {
    if (!vehicleId || !driverId || !id) return;
    try {
      const { error: tripError } = await supabase.from("trips").insert({
        transport_order_id: id,
        vehicle_id: vehicleId,
        driver_id: driverId,
        created_by: session?.user?.id,
      });
      if (tripError) throw tripError;

      await supabase.from("vehicles").update({ status: "assigned" }).eq("id", vehicleId);
      await supabase.from("drivers").update({ status: "driving" }).eq("id", driverId);
      await supabase.from("transport_orders").update({ status: "assigned" }).eq("id", id);

      await supabase.rpc("emit_domain_event", {
        p_event_type: "TripAssigned",
        p_entity_type: "transport_order",
        p_entity_id: id,
        p_payload: { vehicle_id: vehicleId, driver_id: driverId },
      });

      refreshAll();
      toast({ title: "Succès", description: "Véhicule et chauffeur assignés" });
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleStartTrip = async () => {
    if (!trip || !id) return;
    try {
      await supabase.from("trips").update({ status: "in_transit", started_at: new Date().toISOString() }).eq("id", trip.id);
      await supabase.from("transport_orders").update({ status: "in_transit" }).eq("id", id);
      await supabase.rpc("emit_domain_event", {
        p_event_type: "TripStarted",
        p_entity_type: "transport_order",
        p_entity_id: id,
      });
      refreshAll();
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleMarkDelivered = async () => {
    if (!trip || !id) return;
    try {
      await supabase.from("trips").update({ status: "delivered", delivered_at: new Date().toISOString() }).eq("id", trip.id);
      await supabase.from("transport_orders").update({ status: "delivered" }).eq("id", id);
      refreshAll();
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleComplete = async () => {
    if (!trip || !id || !order) return;
    try {
      await supabase.from("trips").update({ status: "completed" }).eq("id", trip.id);
      await supabase.from("transport_orders").update({ status: "completed" }).eq("id", id);
      await supabase.from("vehicles").update({ status: "available" }).eq("id", trip.vehicle_id);
      await supabase.from("drivers").update({ status: "available" }).eq("id", trip.driver_id);

      if (totalExpenses > 0) {
        const { error: ledgerError } = await supabase.from("job_ledger_entries").insert({
          entity_type: "transport_order",
          entity_id: id,
          entry_type: "expense",
          category: "Transport",
          amount: totalExpenses,
          currency_code: "GNF",
          description: `Frais de trajet — ${order.order_number}`,
          created_by: session?.user?.id,
        });
        if (ledgerError) throw ledgerError;
      }

      await supabase.rpc("emit_domain_event", {
        p_event_type: "TripCompleted",
        p_entity_type: "transport_order",
        p_entity_id: id,
        p_payload: { total_expenses: totalExpenses },
      });

      refreshAll();
      toast({ title: "Succès", description: "Trajet terminé et coûts comptabilisés" });
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleAddExpense = async () => {
    if (!trip || !expenseAmount) return;
    try {
      const { error } = await supabase.from("trip_expenses").insert({
        trip_id: trip.id,
        category: expenseCategory,
        amount: parseFloat(expenseAmount),
        created_by: session?.user?.id,
      });
      if (error) throw error;
      refetchExpenses();
      setIsAddingExpense(false);
      setExpenseAmount("");
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  if (!order) return <div className="text-center py-12">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/transport/orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{order.order_number}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{order.status}</Badge>
              <span className="text-sm text-gray-500">{order.customers?.name}</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Détails</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block">Ramassage</span>
              <span className="font-medium">{order.pickup_location || "—"}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Livraison</span>
              <span className="font-medium">{order.delivery_address || "—"}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Cargaison</span>
              <span className="font-medium">{order.cargo_description || "—"}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Priorité</span>
              <span className="font-medium capitalize">{order.priority}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trajet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!trip ? (
              canManage && (
                <div className="grid grid-cols-2 gap-2">
                  <Select value={vehicleId} onValueChange={setVehicleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Véhicule disponible" />
                    </SelectTrigger>
                    <SelectContent>
                      {(availableVehicles ?? []).map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.plate_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={driverId} onValueChange={setDriverId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chauffeur disponible" />
                    </SelectTrigger>
                    <SelectContent>
                      {(availableDrivers ?? []).map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="col-span-2 flex justify-end">
                    <Button size="sm" disabled={!vehicleId || !driverId} onClick={handleAssign}>
                      Assigner
                    </Button>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {trip.vehicles?.plate_number} · {trip.drivers?.name}
                  </span>
                  <Badge variant="outline">{trip.status}</Badge>
                </div>
                {canManage && trip.status === "assigned" && (
                  <Button size="sm" onClick={handleStartTrip}>
                    Démarrer le Trajet
                  </Button>
                )}
                {canManage && trip.status === "in_transit" && (
                  <Button size="sm" onClick={handleMarkDelivered}>
                    Marquer comme Livré
                  </Button>
                )}
                {canManage && trip.status === "delivered" && (
                  <Button size="sm" onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                    Terminer et Comptabiliser les Coûts
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {trip && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Frais de Trajet</CardTitle>
              {canManage && !isAddingExpense && trip.status !== "completed" && (
                <Button variant="outline" size="sm" onClick={() => setIsAddingExpense(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {isAddingExpense && (
                <div className="grid grid-cols-3 gap-2 pb-3 border-b border-gray-100">
                  <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Montant"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsAddingExpense(false)}>
                      Annuler
                    </Button>
                    <Button size="sm" onClick={handleAddExpense}>
                      Enregistrer
                    </Button>
                  </div>
                </div>
              )}
              {expenses && expenses.length > 0 ? (
                <ul className="text-sm divide-y divide-gray-100">
                  {expenses.map((e) => (
                    <li key={e.id} className="flex justify-between py-1.5">
                      <span className="capitalize">{e.category}</span>
                      <span>
                        {e.amount.toLocaleString()} {e.currency_code}
                      </span>
                    </li>
                  ))}
                  <li className="flex justify-between py-1.5 font-medium">
                    <span>Total</span>
                    <span>{totalExpenses.toLocaleString()}</span>
                  </li>
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Aucun frais enregistré</p>
              )}
            </CardContent>
          </Card>
        )}

        {trip && <DocumentsPanel ownerType="trip" ownerId={trip.id} canManage={canManage} />}
      </motion.div>
    </div>
  );
};

export default TransportOrderDetail;
