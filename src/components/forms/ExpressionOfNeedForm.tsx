import { useState } from "react";
import { motion } from "framer-motion";

export const ExpressionOfNeedForm = () => {
  const [formData, setFormData] = useState({
    itemType: "",
    quantity: "",
    department: "",
    priority: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-8 rounded-lg border border-gray-200 shadow-sm"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Item Type</label>
        <select
          value={formData.itemType}
          onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
          className="w-full rounded-md border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/5"
        >
          <option value="">Select item type</option>
          <option value="spare_parts">Spare Parts</option>
          <option value="tires">Tires</option>
          <option value="construction">Construction Materials</option>
          <option value="office">Office Supplies</option>
          <option value="safety">Health & Safety Equipment</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Quantity</label>
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          className="w-full rounded-md border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/5"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Department</label>
        <select
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          className="w-full rounded-md border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/5"
        >
          <option value="">Select department</option>
          <option value="carrieres">Carrieres</option>
          <option value="road">Road</option>
          <option value="mining">Mining</option>
          <option value="agriculture">Agriculture</option>
          <option value="head_office">Head Office</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Priority Level</label>
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          className="w-full rounded-md border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/5"
        >
          <option value="">Select priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full rounded-md border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/5"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 transition-colors"
      >
        Submit Expression of Need
      </button>
    </motion.form>
  );
};