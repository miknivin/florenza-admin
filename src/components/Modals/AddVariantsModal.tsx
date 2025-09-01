"use client";
import React from "react";
import Swal from "sweetalert2";

interface VariantForm {
  size:"12ml"|"20ml"| "30ml" | "50ml" | "100ml" | "150ml";
  price: number;
  discountPrice: number | null;
}

interface VariantModalProps {
  isOpen: boolean;
  closeModal: () => void;
  variantForm: VariantForm;
  setVariantForm: React.Dispatch<React.SetStateAction<VariantForm>>;
  saveVariant: () => void;
}

const VariantModal: React.FC<VariantModalProps> = ({
  isOpen,
  closeModal,
  variantForm,
  setVariantForm,
  saveVariant,
}) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setVariantForm({
      ...variantForm,
      [name]: type === "number" ? (value === "" ? null : Number(value)) : value,
    });
  };

  const handleSave = () => {
    const errors: string[] = [];
    if (!variantForm.size) {
      errors.push("Size is required.");
    }
    if (variantForm.price <= 0) {
      errors.push("Price must be greater than 0.");
    }
    if (variantForm.discountPrice && variantForm.discountPrice < 0) {
      errors.push("Discount price cannot be negative.");
    }

    if (errors.length > 0) {
      Swal.fire({
        title: "Validation Error",
        html: errors.join("<br>"),
        icon: "error",
      });
      return;
    }

    saveVariant();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-form-input">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          {variantForm.price > 0 ? "Edit Variant" : "Add Variant"}
        </h3>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Size
          </label>
          <select
            name="size"
            value={variantForm.size}
            onChange={handleChange}
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="12ml">12ml</option>
            <option value="20ml">20ml</option>
            <option value="30ml">30ml</option>
            <option value="50ml">50ml</option>
            <option value="100ml">100ml</option>
            <option value="150ml">150ml</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Price
          </label>
          <input
            type="number"
            name="price"
            value={variantForm.price}
            onChange={handleChange}
            placeholder="Enter price"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Discount Price (optional)
          </label>
          <input
            type="number"
            name="discountPrice"
            value={variantForm.discountPrice || ""}
            onChange={handleChange}
            placeholder="Enter discount price"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={closeModal}
            className="rounded bg-gray-300 px-4 py-2 text-black hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariantModal;
