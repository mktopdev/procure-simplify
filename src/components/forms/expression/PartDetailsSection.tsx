import { Input } from "@/components/ui/input";

interface PartDetailsSectionProps {
  formData: {
    part_name: string;
    item_type: string;
    part_reference: string;
  };
  onChange: (field: string, value: string) => void;
}

export const PartDetailsSection = ({ formData, onChange }: PartDetailsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Détails de la Pièce</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Nom de la Pièce</label>
        <input
          type="text"
          value={formData.part_name}
          onChange={(e) => onChange('part_name', e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Type d'Article</label>
        <select
          value={formData.item_type}
          onChange={(e) => onChange('item_type', e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
          required
        >
          <option value="">Sélectionner le type</option>
          <option value="spare_parts">Pièces de rechange</option>
          <option value="tires">Pneus</option>
          <option value="construction">Matériaux de construction</option>
          <option value="office">Fournitures de bureau</option>
          <option value="safety">Équipement de sécurité</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Référence Pièce</label>
        <input
          type="text"
          value={formData.part_reference}
          onChange={(e) => onChange('part_reference', e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
          placeholder="Si connue"
        />
      </div>
    </div>
  );
};