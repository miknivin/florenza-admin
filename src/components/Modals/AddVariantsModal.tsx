"use client";
import React from "react";
import Swal from "sweetalert2";
import { useImageUploadMutation } from "@/redux/api/productsApi";

interface VariantForm {
  size: "12ml" | "20ml" | "30ml" | "50ml" | "100ml" | "150ml";
  price: number;
  discountPrice: number | null;
  imageUrls?: string[] | null;
  imageFiles?: File[] | null;
}

interface VariantModalProps {
  isOpen: boolean;
  closeModal: () => void;
  variantForm: VariantForm;
  setVariantForm: React.Dispatch<React.SetStateAction<VariantForm>>;
  saveVariant: (variant: VariantForm) => void;
  productId: string;
}

const VariantModal: React.FC<VariantModalProps> = ({
  isOpen,
  closeModal,
  variantForm,
  setVariantForm,
  saveVariant,
  productId,
}) => {
  const [imageUpload, { isLoading }] = useImageUploadMutation();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setVariantForm({
      ...variantForm,
      [name]: type === "number" ? (value === "" ? null : Number(value)) : value,
    });
  };

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newFiles = e.target.files ? Array.from(e.target.files) : [];
  const existingFiles = variantForm.imageFiles || [];
  const mergedFiles = [...existingFiles, ...newFiles].slice(0, 5); // limit to 5

  const newUrls = newFiles.map((file) => URL.createObjectURL(file));
  const existingUrls = variantForm.imageUrls || [];
  const mergedUrls = [...existingUrls, ...newUrls].slice(0, 5); // limit to 5

  setVariantForm({
    ...variantForm,
    imageFiles: mergedFiles,
    imageUrls: mergedUrls,
  });
};


  const handleSave = async () => {
    const errors: string[] = [];
    if (!variantForm.size) errors.push("Size is required.");
    if (variantForm.price <= 0) errors.push("Price must be greater than 0.");
    if (variantForm.discountPrice && variantForm.discountPrice < 0)
      errors.push("Discount price cannot be negative.");
    if (
      variantForm.imageFiles &&
      variantForm.imageFiles.some(
        (file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type)
      )
    )
      errors.push("Only JPEG, PNG, or WebP images are allowed.");
    if (
      variantForm.imageFiles &&
      variantForm.imageFiles.some((file) => file.size > 5 * 1024 * 1024)
    )
      errors.push("Each image must be less than 5MB.");
    if (variantForm.imageFiles && variantForm.imageFiles.length > 5)
      errors.push("Maximum 5 images allowed per variant.");

    if (errors.length > 0) {
      Swal.fire({
        title: "Validation Error",
        html: errors.join("<br>"),
        icon: "error",
      });
      return;
    }

    let uploadedImageUrls: string[] = [];
    if (variantForm.imageFiles && variantForm.imageFiles.length > 0) {
      try {
        // Upload each image
        uploadedImageUrls = await Promise.all(
          variantForm.imageFiles.map(async (file) => {
            const uploadResult = await imageUpload({
              fileName: file.name,
              fileType: file.type,
              productId,
            }).unwrap();

            const uploadResponse = await fetch(uploadResult.presignedUrl, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type },
            });

            if (!uploadResponse.ok) {
              throw new Error(`Image upload failed for ${file.name}`);
            }

            return uploadResult.finalUrl;
          })
        );
        console.log("Uploaded image URLs:", uploadedImageUrls); // Debug log
      } catch (error) {
        Swal.fire({
          title: "Upload Error",
          text: error instanceof Error ? error.message : "Unknown error",
          icon: "error",
        });
        return;
      }
    }

    const updatedVariantForm = {
      ...variantForm,
      imageUrls: uploadedImageUrls.length > 0 ? uploadedImageUrls : variantForm.imageUrls || [],
      imageFiles: null,
    };
    setVariantForm(updatedVariantForm);
    console.log("Updated variantForm:", updatedVariantForm); // Debug log
    saveVariant(updatedVariantForm);
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
        <div className="mb-4">
          <label
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            htmlFor="file_input"
          >
            Variant Images (optional, up to 5)
          </label>
          <input
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            id="file_input"
            type="file"
            name="imageFiles"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileChange}
          />
          {variantForm.imageUrls && variantForm.imageUrls.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {variantForm.imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Variant Preview ${index + 1}`}
                  className="h-24 w-24 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={closeModal}
            className="rounded bg-gray-300 px-4 py-2 text-black hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
            disabled={isLoading}
          >
            {isLoading ? "Uploading..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariantModal;