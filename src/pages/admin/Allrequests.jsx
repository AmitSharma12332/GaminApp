"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { server } from "../../constants/config";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

const Allrequests = () => {
  const { user } = useSelector((state) => state.userReducer);
  // eslint-disable-next-line no-unused-vars
  const [allBets, setAllBets] = useState([]);
  const [filteredBets, setFilteredBets] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedBetId, setSelectedBetId] = useState(null);
  const [itemsPerPage] = useState(10);

  // Add new state variables at the top with other state declarations
  const [filters, setFilters] = useState({
    status: "all",
    userId: "",
    selectionId: "",
    eventId: "",
    category: "",
    type: "",
  });

  // Replace the existing getTransactions function
  const getTransactions = useCallback(async () => {
    if (!user || !user._id) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") {
          queryParams.append(key, value);
        }
      });

      const response = await axios.get(
        `${server}api/v1/bet/bets?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAllBets(response.data.bets || []);
      setFilteredBets(response.data.bets || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, [user, filters]);

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });

    const sorted = [...filteredBets].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredBets(sorted);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    // filterBets(value, statusFilter) // Removed filterBets call
    setCurrentPage(1);
  };

  // Add new filter handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Remove the existing filterBets function since filtering will be handled by the API

  const handleStatusChange = async (betId, newStatus) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const res = await axios.post(
        `${server}api/v1/bet/change-status`,
        {
          betId,
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(res.data.message);

      // Refresh the bets list after status change
      getTransactions();
      setIsStatusDropdownOpen(null);
      setIsSettleModalOpen(false);
    } catch (error) {
      console.error("Error changing bet status:", error);
    }
  };

  const openSettleModal = (betId) => {
    setSelectedBetId(betId);
    setIsSettleModalOpen(true);
  };

  useEffect(() => {
    getTransactions();
  }, [getTransactions]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBets.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto py-8">
      {/* Update the search input section in the JSX */}
      <div className="mb-6 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <input
          type="text"
          placeholder="Search by match..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="rounded-md border bg-gray-900 border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="User ID"
          value={filters.userId}
          onChange={(e) => handleFilterChange("userId", e.target.value)}
          className="rounded-md border bg-gray-900 border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Selection ID"
          value={filters.selectionId}
          onChange={(e) => handleFilterChange("selectionId", e.target.value)}
          className="rounded-md border bg-gray-900 border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Event ID"
          value={filters.eventId}
          onChange={(e) => handleFilterChange("eventId", e.target.value)}
          className="rounded-md border bg-gray-900 border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="rounded-md border bg-gray-900 border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="match odds">Match Odds</option>
          <option value="fancy">Fancy</option>
          <option value="bookmaker">Bookmaker</option>
        </select>
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange("type", e.target.value)}
          className="rounded-md border bg-gray-900 border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="back">Back</option>
          <option value="lay">Lay</option>
        </select>
        <div className="relative inline-block w-full">
          <button
            onClick={() =>
              setIsStatusDropdownOpen(isStatusDropdownOpen ? null : "filter")
            }
            className="w-full rounded-md border border-gray-300 bg-gray-900 px-4 py-2 text-left focus:border-blue-500 focus:outline-none"
          >
            {filters.status === "all" ? "Filter by status" : filters.status}
          </button>
          {isStatusDropdownOpen === "filter" && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-gray-900 shadow-lg">
              <div className="py-1">
                {["all", "pending", "won", "lost"].map((status) => (
                  <button
                    key={status}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-800"
                    onClick={() => {
                      handleFilterChange("status", status);
                      setIsStatusDropdownOpen(null);
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-300">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-900">
            <tr>
              <th
                onClick={() => handleSort("match")}
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-200"
              >
                Match{" "}
                {sortConfig.key === "match" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort("match")}
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-200"
              >
                Selection{" "}
              </th>
              <th
                onClick={() => handleSort("type")}
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-200"
              >
                Type{" "}
                {sortConfig.key === "type" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort("odds")}
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-200"
              >
                Odds{" "}
                {sortConfig.key === "odds" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort("stake")}
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-200"
              >
                Stake{" "}
                {sortConfig.key === "stake" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>

              <th className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-200">
                Category{" "}
              </th>
              <th
                onClick={() => handleSort("payout")}
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-200"
              >
                Profit/Loss{" "}
                {sortConfig.key === "payout" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>

              <th className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-200">
                Placed Date{" "}
              </th>
              <th
                onClick={() => handleSort("status")}
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-200"
              >
                Status{" "}
                {sortConfig.key === "status" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-500 bg-gray-800">
            {currentItems.map((bet) => (
              <tr key={bet._id} className="">
                <td className="px-6 py-4 text-sm text-gray-200">{bet.match}</td>
                <td className="px-4 py-3 text-sm text-white">
                  {bet.selection}
                  {bet?.fancyNumber && ` (${bet.fancyNumber})`}
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">{bet.type}</td>
                <td className="px-6 py-4 text-sm text-gray-200">{bet.odds}</td>
                <td className="px-6 py-4 text-sm text-gray-200">{bet.stake}</td>

                <td className="px-6 py-4 text-sm text-gray-200">
                  {bet.category}
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  {bet.payout.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-white">
                  {format(new Date(bet.createdAt), "yyyy-MM-dd HH:mm:ss")}
                </td>

                {/* <td className="px-6 py-4 text-sm text-gray-200">
                  {bet.status === "won"
                    ? (bet.payout - bet.stake).toFixed(2)
                    : bet.status === "lost"
                    ? bet.stake.toFixed(2)
                    : "-"}
                </td> */}
                <td className="px-6 py-4 text-sm text-gray-200">
                  <div className="relative ">
                    <td
                      className={`capitalize w-24 text-center ${
                        bet.status === "pending"
                          ? "text-black bg-yellow-500 rounded-lg px-4 py-1"
                          : bet.status === "lost"
                          ? "text-white bg-red-800 rounded-lg px-4 py-1"
                          : "text-white bg-green-800 rounded-lg px-4 py-1"
                      }`}
                    >
                      {bet.status}
                    </td>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  <button
                    onClick={() => openSettleModal(bet._id)}
                    className="rounded bg-blue-500 px-3 py-1.5 text-white hover:bg-blue-600 focus:outline-none"
                  >
                    Settle Bet
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-400">
          Showing {indexOfFirstItem + 1} to{" "}
          {Math.min(indexOfLastItem, filteredBets.length)} of{" "}
          {filteredBets.length} entries
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-[#1f2937] rounded text-white disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            // Always show first page, last page, current page, and pages around current page
            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 1 &&
                pageNumber <= currentPage + 1) ||
              (pageNumber <= 4 && currentPage <= 3)
            ) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNumber
                      ? "bg-blue-500 text-white"
                      : "bg-[#1f2937] text-white"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            } else if (
              (pageNumber === currentPage - 2 && currentPage > 3) ||
              (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
            ) {
              return (
                <span key={pageNumber} className="px-3 py-1 text-white">
                  ...
                </span>
              );
            }
            return null;
          })}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-[#1f2937] rounded text-white disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settle Bet Modal */}
      {isSettleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-gray-800 p-6">
            <h2 className="mb-4 text-lg font-semibold">Settle Bet</h2>
            <p className="mb-4">Choose the outcome of the bet:</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleStatusChange(selectedBetId, "won")}
                className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Won
              </button>
              <button
                onClick={() => handleStatusChange(selectedBetId, "lost")}
                className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Lost
              </button>
            </div>
            <button
              onClick={() => setIsSettleModalOpen(false)}
              className="mt-4 rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allrequests;
