interface OrderDetailsSectionProps {
  formData: {
    quantity: number;
    supplier: string;
    priority: string;
  };
  onChange: (field: string, value: string | number) => void;
}

export const OrderDetailsSection = ({ formData, onChange }: OrderDetailsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Détails de la Commande</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Quantité</label>
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) => onChange('quantity', parseInt(e.target.value) || 1)}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
          required
          min="1"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Fournisseur Recommandé</label>
        <input
          type="text"
          value={formData.supplier}
          onChange={(e) => onChange('supplier', e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
          placeholder="À déterminer si inconnu"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Niveau d'Urgence</label>
        <select
          value={formData.priority}
          onChange={(e) => onChange('priority', e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
          required
        >
          <option value="">Sélectionner l'urgence</option>
          <option value="low">Basse</option>
          <option value="medium">Moyenne</option>
          <option value="high">Élevée</option>
        </select>
      </div>
    </div>
  );
};