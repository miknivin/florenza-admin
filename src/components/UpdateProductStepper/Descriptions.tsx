"use client";
import React, { useState } from "react";
import { Product } from "@/interfaces/product";
import Swal from "sweetalert2";
import { validateDescriptions } from "@/utlis/validation/details";

interface DescriptionsProps {
  productProp: Product;
  updateProduct: (data: Partial<Product>) => void;
  handleNextStep: () => void;
  isUpdate?: boolean;
}

const Descriptions: React.FC<DescriptionsProps> = ({
  productProp,
  updateProduct,
  handleNextStep,
  isUpdate = false,
}) => {
  const [productState, setProductState] = useState<Product>(productProp);
  const [topNote, setTopNote] = useState("");
  const [heartNote, setHeartNote] = useState("");
  const [baseNote, setBaseNote] = useState("");
  const [feature, setFeature] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    const updatedProduct = { ...productState, [name]: value };
    setProductState(updatedProduct);
    updateProduct(updatedProduct);
  };

  const addNote = (type: "top" | "heart" | "base", note: string) => {
    if (!note.trim()) return;
    const updatedNotes = {
      ...productState.fragranceNotes,
      [type]: [...productState.fragranceNotes[type], note.trim()],
    };
    const updatedProduct = {
      ...productState,
      fragranceNotes: updatedNotes,
    };
    setProductState(updatedProduct);
    updateProduct(updatedProduct);
    if (type === "top") setTopNote("");
    else if (type === "heart") setHeartNote("");
    else setBaseNote("");
  };

  const removeNote = (type: "top" | "heart" | "base", index: number) => {
    const updatedNotes = {
      ...productState.fragranceNotes,
      [type]: productState.fragranceNotes[type].filter((_, i) => i !== index),
    };
    const updatedProduct = {
      ...productState,
      fragranceNotes: updatedNotes,
    };
    setProductState(updatedProduct);
    updateProduct(updatedProduct);
  };

  const addFeature = () => {
    if (!feature.trim()) return;
    if (productState.features.length >= 20) {
      Swal.fire({
        title: "Validation Error",
        text: "Maximum 10 features allowed.",
        icon: "error",
      });
      return;
    }
    const updatedProduct = {
      ...productState,
      features: [...productState.features, feature.trim()],
    };
    setProductState(updatedProduct);
    updateProduct(updatedProduct);
    setFeature("");
  };

  const removeFeature = (index: number) => {
    const updatedProduct = {
      ...productState,
      features: productState.features.filter((_, i) => i !== index),
    };
    setProductState(updatedProduct);
    updateProduct(updatedProduct);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid } = validateDescriptions(productState);

    if (!isValid) {
      Swal.fire({
        title: "Validation Error",
        text: "Please fill all required fields correctly.",
        icon: "error",
      });
      return;
    }

    updateProduct(productState);
    handleNextStep();
  };

  return (
    <div className="rounded-lg border p-4 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Step 2: Descriptions</h2>
      <form onSubmit={handleSubmit}>
        <div className="p-6.5">
          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Short Description (max 230 characters)
            </label>
            <textarea
              name="shortDescription"
              value={productState?.shortDescription}
              onChange={handleChange}
              placeholder="Enter short description"
              maxLength={230}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              rows={3}
            />
            <p className="mt-1 text-sm text-gray-500">
              {productState?.shortDescription?.length || 0}/230 characters
            </p>
          </div>
          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Description
            </label>
            <textarea
              name="description"
              value={productState.description}
              onChange={handleChange}
              placeholder="Enter product description"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              rows={4}
            />
          </div>
          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Features (max 10)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => setFeature(e.target.value)}
                placeholder="Enter feature"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <button
                type="button"
                onClick={addFeature}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-opacity-90"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {productState.features.map((feat, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-sm bg-blue-100 px-2 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  {feat}
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="rounded-xs ms-2 inline-flex items-center bg-transparent p-1 text-sm text-blue-400 hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300"
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
                    <span className="sr-only">Remove feature</span>
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Top Notes
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topNote}
                onChange={(e) => setTopNote(e.target.value)}
                placeholder="Enter top note"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <button
                type="button"
                onClick={() => addNote("top", topNote)}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-opacity-90"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {productState.fragranceNotes.top.map((note, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-sm bg-blue-100 px-2 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  {note}
                  <button
                    type="button"
                    onClick={() => removeNote("top", index)}
                    className="rounded-xs ms-2 inline-flex items-center bg-transparent p-1 text-sm text-blue-400 hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300"
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
                    <span className="sr-only">Remove note</span>
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Heart Notes
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={heartNote}
                onChange={(e) => setHeartNote(e.target.value)}
                placeholder="Enter heart note"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <button
                type="button"
                onClick={() => addNote("heart", heartNote)}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-opacity-90"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {productState.fragranceNotes.heart.map((note, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-sm bg-blue-100 px-2 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  {note}
                  <button
                    type="button"
                    onClick={() => removeNote("heart", index)}
                    className="rounded-xs ms-2 inline-flex items-center bg-transparent p-1 text-sm text-blue-400 hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300"
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
                    <span className="sr-only">Remove note</span>
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Base Notes
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={baseNote}
                onChange={(e) => setBaseNote(e.target.value)}
                placeholder="Enter base note"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <button
                type="button"
                onClick={() => addNote("base", baseNote)}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-opacity-90"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {productState.fragranceNotes.base.map((note, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-sm bg-blue-100 px-2 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  {note}
                  <button
                    type="button"
                    onClick={() => removeNote("base", index)}
                    className="rounded-xs ms-2 inline-flex items-center bg-transparent p-1 text-sm text-blue-400 hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300"
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
                    <span className="sr-only">Remove note</span>
                  </button>
                </span>
              ))}
            </div>
          </div>
          {!isUpdate && (
            <button
              type="submit"
              className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Descriptions;
