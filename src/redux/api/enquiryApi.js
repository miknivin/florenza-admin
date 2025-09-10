// src/redux/api/enquiryApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const enquiryApi = createApi({
  reducerPath: "enquiryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Enquiries"],
  endpoints: (builder) => ({
    getEnquiries: builder.query({
      query: () => "/enquiries",
      providesTags: ["Enquiries"],
      transformResponse: (response) => {
        console.log("Raw API Response:", response);
        return { enquiries: response.data }; // Adjust based on response
      },
    }),
  }),
});

export const { useGetEnquiriesQuery } = enquiryApi;