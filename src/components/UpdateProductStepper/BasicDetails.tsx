"use client";
import React, { useState } from "react";
import SelectGroupOne from "../SelectGroup/SelectGroupOne";
import { Product } from "@/interfaces/product";
import Swal from "sweetalert2";
import { validateForm } from "@/utlis/validation/productValidators/basicDetails";
import VariantModal from "../Modals/AddVariantsModal";

interface VariantForm {
  size: "12ml" | "20ml" | "30ml" | "50ml" | "100ml" | "150ml";
  price: number;
  discountPrice: number | null;
  imageUrls?: string[] | null;
  imageFiles?: File[] | null;
}

interface BasicDetailsProps {
  productProp: Product;
  updateProduct: (data: Partial<Product>) => void;
  handleNextStep: () => void;
  isUpdate?: boolean;
}

const BasicDetails: React.FC<BasicDetailsProps> = ({
  productProp,
  updateProduct,
  handleNextStep,
  isUpdate = false,
}) => {
  const [productState, setProductState] = useState<Product>(productProp);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [variantForm, setVariantForm] = useState<VariantForm>({
    size: "12ml",
    price: 0,
    discountPrice: null,
    imageUrls: null,
    imageFiles: null,
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const updatedProduct = {
      ...productState,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    };

    setProductState(updatedProduct);
    updateProduct(updatedProduct);
  };

  const handleSendValue = (value: any) => {
    const updatedProduct = {
      ...productState,
      category: value,
    };

    setProductState(updatedProduct);
    updateProduct(updatedProduct);
  };

  const openModal = (index?: number) => {
    if (index !== undefined) {
      const variant = productState.variants[index];
      setVariantForm({
        size: variant.size,
        price: variant.price,
        discountPrice: variant.discountPrice,
        imageUrls: variant.imageUrl || null,
        imageFiles: null,
      });
      setEditIndex(index);
    } else {
      setVariantForm({
        size: "12ml",
        price: 0,
        discountPrice: null,
        imageUrls: null,
        imageFiles: null,
      });
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditIndex(null);
    setVariantForm({
      size: "12ml",
      price: 0,
      discountPrice: null,
      imageUrls: null,
      imageFiles: null,
    });
  };

  const saveVariant = (variant: VariantForm) => {
    const errors: string[] = [];
    if (!variant.size) errors.push("Size is required.");
    if (variant.price <= 0) errors.push("Price must be greater than 0.");
    if (variant.discountPrice && variant.discountPrice < 0)
      errors.push("Discount price cannot be negative.");
    if (
      productState.variants.some(
        (v, i) =>
          v.size === variant.size && (editIndex === null || i !== editIndex)
      )
    )
      errors.push("Size must be unique among variants.");

    if (errors.length > 0) {
      Swal.fire({
        title: "Validation Error",
        html: errors.join("<br>"),
        icon: "error",
      });
      return;
    }

    const updatedVariants = [...productState.variants];
    if (editIndex !== null) {
      updatedVariants[editIndex] = {
        size: variant.size,
        price: variant.price,
        discountPrice: variant.discountPrice,
        imageUrl: variant.imageUrls || [], // Use empty array as default
      };
    } else {
      updatedVariants.push({
        size: variant.size,
        price: variant.price,
        discountPrice: variant.discountPrice,
        imageUrl: variant.imageUrls || [],
      });
    }

    const updatedProduct = { ...productState, variants: updatedVariants };
    setProductState(updatedProduct);
    updateProduct(updatedProduct);
    closeModal();
  };

  const removeVariant = (index: number) => {
    if (productState.variants.length <= 1) {
      Swal.fire({
        title: "Error",
        text: "At least one variant is required.",
        icon: "error",
      });
      return;
    }
    const updatedVariants = productState.variants.filter((_, i) => i !== index);
    const updatedProduct = { ...productState, variants: updatedVariants };
    setProductState(updatedProduct);
    updateProduct(updatedProduct);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting product:", JSON.stringify(productState, null, 2)); // Debug log
    const { isValid, errors } = validateForm(productState);

    if (!isValid) {
      Swal.fire({
        title: "Validation Error",
        html: errors.join("<br>"),
        icon: "error",
      });
      return;
    }

    updateProduct(productState);
    handleNextStep();
  };

  return (
    <div className="rounded-lg border p-4 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Step 1: Basic Details</h2>
      <form onSubmit={handleSubmit}>
        <div className="p-6.5">
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Perfume Name
              </label>
              <input
                type="text"
                name="name"
                value={productState.name}
                onChange={handleChange}
                placeholder="Enter perfume name"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
            <div className="w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={productState.sku}
                onChange={handleChange}
                placeholder="Enter SKU (e.g., COCO)"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
          </div>
          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Stock Quantity
            </label>
            <input
              type="number"
              name="stockQuantity"
              value={productState.stockQuantity}
              onChange={handleChange}
              placeholder="Enter stock quantity"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Gender
            </label>
            <select
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              name="gender"
              value={productState.gender}
              onChange={handleChange}
            >
              <option value="Unisex">Unisex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="mb-4.5">
            <SelectGroupOne
              category={productState.category}
              sendValue={handleSendValue}
            />
          </div>
          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Variants
            </label>
            <div className="flex flex-wrap gap-2">
              {productState.variants.map((variant, index) => (
                <span
                  key={index}
                  id={`badge-dismiss-${index}`}
                  className="me-2 inline-flex cursor-pointer items-center rounded-sm bg-blue-100 px-2 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  onClick={() => openModal(index)}
                >
                  {variant.size}
                  <button
                    type="button"
                    className="rounded-xs ms-2 inline-flex items-center bg-transparent p-1 text-sm text-blue-400 hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300"
                    data-dismiss-target={`#badge-dismiss-${index}`}
                    aria-label="Remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVariant(index);
                    }}
                  >
                    <svg
                      className="h-2 w-2"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span className="sr-only">Remove badge</span>
                  </button>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => openModal()}
              className="mt-2 rounded bg-blue-600 p-2 text-white hover:bg-opacity-90"
            >
              Add Variant
            </button>
          </div>
          {!isUpdate && (
            <button
              type="submit"
              className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Next
            </button>
          )}
        </div>
      </form>
      <VariantModal
        productId={productState._id || Date.now().toString()}
        isOpen={isModalOpen}
        closeModal={closeModal}
        variantForm={variantForm}
        setVariantForm={setVariantForm}
        saveVariant={saveVariant}
      />
    </div>
  );
};

export default BasicDetails;