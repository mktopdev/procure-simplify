import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransportOrderFormProps {
  onCreated: (transportOrderId: string) => void;
  onCancel?: () => void;
}

const PRIORITIES = ["normal", "high", "urgent", "critical"];

export const TransportOrderForm = ({ onCreated, onCancel }: TransportOrderFormProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [cargoDescription, setCargoDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [priority, setPriority] = useState("normal");
  const [targetDeliveryDate, setTargetDeliveryDate] = useState("");

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data: order, error } = await supabase
        .from("transport_orders")
        .insert({
          customer_id: customerId || null,
          pickup_location: pickupLocation || null,
          delivery_address: deliveryAddress || null,
          cargo_description: cargoDescription || null,
          weight: weight ? parseFloat(weight) : null,
          priority,
          target_delivery_date: targetDeliveryDate || null,
          created_by: session?.user?.id,
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.rpc("emit_domain_event", {
        p_event_type: "TransportOrderCreated",
        p_entity_type: "transport_order",
        p_entity_id: order.id,
        p_payload: { order_number: order.order_number },
      });

      toast({ title: "Succès", description: `${order.order_number} créé` });
      onCreated(order.id);
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Client</label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un client" />
            </SelectTrigger>
            <SelectContent>
              {(customers ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Priorité</label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Lieu de Ramassage</label>
          <Input value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Adresse de Livraison</label>
          <Input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Poids (kg)</label>
          <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Date de Livraison Cible</label>
          <Input type="date" value={targetDeliveryDate} onChange={(e) => setTargetDeliveryDate(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium text-gray-700">Description de la Cargaison</label>
          <Textarea value={cargoDescription} onChange={(e) => setCargoDescription(e.target.value)} rows={3} />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
          {isSubmitting ? "Création..." : "Créer l'Ordre de Transport"}
        </Button>
      </div>
    </form>
  );
};
