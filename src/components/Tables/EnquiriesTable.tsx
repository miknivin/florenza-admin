"use client";
import Spinner from "@/components/common/Spinner/index";
import { useGetEnquiriesQuery } from "@/redux/api/enquiryApi";
import { Enquiry } from "@/types/enquiry";
import { useState, useMemo } from "react";
import PaginationComponent from "@/utlis/pagination/PaginationComponent";
import SearchInput from "@/utlis/search/SearchInput";

const EnquiriesTable = () => {
  const { data, isLoading, isError } = useGetEnquiriesQuery({});
  console.log("API Data:", data); // Debug: Log the API response

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const filteredEnquiries = useMemo(() => {
    let enquiries = data?.enquiries || [];
    console.log("Enquiries:", enquiries); // Debug: Log filtered enquiries

    if (!searchQuery) return enquiries;

    const queryLower = searchQuery.toLowerCase();
    return enquiries.filter((enquiry: Enquiry) => {
      const name = (enquiry.name || "").toLowerCase();
      const email = (enquiry.email || "").toLowerCase();
      const phone = (enquiry.phone || "").toLowerCase();
      const message = (enquiry.message || "").toLowerCase();
      return (
        name.includes(queryLower) ||
        email.includes(queryLower) ||
        phone.includes(queryLower) ||
        message.includes(queryLower)
      );
    });
  }, [data?.enquiries, searchQuery]);

  const totalItems = filteredEnquiries.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEnquiries = filteredEnquiries.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <p className="text-center text-danger">Failed to load enquiries.</p>;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark xl:pb-1">
        <div className="gap-4">
          <h4 className="mb-2 text-xl font-semibold text-black dark:text-white">
            Enquiries
          </h4>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <SearchInput
          placeholder="Search by name, email, phone, or message..."
          onSearch={handleSearch}
        />
        <div className="flex items-center justify-end gap-4">
          <select
            defaultValue="10"
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="select rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <option disabled={true}>Select items per page</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                Name
              </th>
              <th
                style={{ paddingLeft: "11px" }}
                className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11"
              >
                Created At
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                Email
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Phone
              </th>
              <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white">
                Message
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedEnquiries?.map((enquiry: Enquiry, key: number) => (
              <tr key={key}>
                <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {enquiry.name}
                  </h5>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {new Date(enquiry.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })}
                  </p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">{enquiry.email}</p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {enquiry?.phone || "N/A"}
                  </p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white truncate max-w-[200px]">
                    {enquiry.message}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!filteredEnquiries || filteredEnquiries.length === 0) && (
          <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <p className="text-center text-gray-500 dark:text-gray-400">
              {searchQuery ? "No enquiries match your search." : "No enquiries found."}
            </p>
          </div>
        )}
      </div>

      <PaginationComponent
        currentPage={currentPage}
        totalPages={Math.ceil(totalItems / itemsPerPage)}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default EnquiriesTable;