"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { server } from "../../constants/config"
import { useParams } from "react-router-dom"

const Withdrawal = () => {
  const [withdrawalData, setWithdrawalData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("approved")
  const [currentItemId, setCurrentItemId] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const params = useParams()
  const userId = params.userId

  const fetchWithdrawalHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      setIsLoading(true)
      const response = await fetch(`${server}api/v1/payment/status/withdraw?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch withdrawal history")
      }

      const data = await response.json()

      if (data.success) {
        setWithdrawalData(data.withdrawHistory)
      } else {
        throw new Error(data.message || "Failed to fetch withdrawal history")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchWithdrawalHistory()
  }, [fetchWithdrawalHistory, refreshTrigger])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, dateRange, sortConfig])

  const openStatusModal = (itemId) => {
    setCurrentItemId(itemId)
    setIsModalOpen(true)
  }

  const handleWithdrawl = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(`${server}api/v1/payment/withdrawstatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          withdrawId: currentItemId,
          status: selectedStatus,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update withdrawal status")
      }

      const data = await response.json()

      if (data.success) {
        // Close the modal
        setIsModalOpen(false)

        // Trigger a refresh of the withdrawal history
        setRefreshTrigger((prev) => prev + 1)
      } else {
        throw new Error(data.message || "Failed to update withdrawal status")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Sorting function
  const requestSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setDateRange({ from: "", to: "" })
    setSortConfig({ key: "createdAt", direction: "desc" })
    setCurrentPage(1)
  }

  // Apply all filters and sorting
  const filteredAndSortedData = useMemo(() => {
    // First filter the data
    let filtered = [...withdrawalData]

    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item?.receiverName?.toLowerCase().includes(searchLower) ||
          item?.bankName?.toLowerCase().includes(searchLower) ||
          item?.accNo?.toString().includes(searchTerm) ||
          item?.ifsc?.toLowerCase().includes(searchLower) ||
          item?.contact?.toString().includes(searchTerm),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item?.status?.toLowerCase() === statusFilter)
    }

    // Apply date range filter
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from)
      fromDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter((item) => new Date(item?.createdAt) >= fromDate)
    }

    if (dateRange.to) {
      const toDate = new Date(dateRange.to)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((item) => new Date(item?.createdAt) <= toDate)
    }

    // Then sort the filtered data
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Handle special cases
        if (sortConfig.key === "createdAt") {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
        } else if (sortConfig.key === "amount") {
          aValue = Number.parseFloat(aValue)
          bValue = Number.parseFloat(bValue)
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [withdrawalData, searchTerm, statusFilter, dateRange, sortConfig])

  // Pagination calculations
  const totalItems = filteredAndSortedData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredAndSortedData.slice(indexOfFirstItem, indexOfLastItem)

  // Generate page numbers for pagination
  const pageNumbers = []
  const maxPageNumbersToShow = 5

  if (totalPages <= maxPageNumbersToShow) {
    // Show all page numbers
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i)
    }
  } else {
    // Show limited page numbers with ellipsis
    if (currentPage <= 3) {
      // Near the start
      for (let i = 1; i <= 4; i++) {
        pageNumbers.push(i)
      }
      pageNumbers.push("...")
      pageNumbers.push(totalPages)
    } else if (currentPage >= totalPages - 2) {
      // Near the end
      pageNumbers.push(1)
      pageNumbers.push("...")
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Middle
      pageNumbers.push(1)
      pageNumbers.push("...")
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pageNumbers.push(i)
      }
      pageNumbers.push("...")
      pageNumbers.push(totalPages)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>Error: {error}</p>
      </div>
    )
  }

  if (withdrawalData.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
        <p>No withdrawal history found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-semibold">Withdrawal History</h2>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {/* Search input */}
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search by name, bank, account..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {/* Filter button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clipRule="evenodd"
                />
              </svg>
              Filters
              {(statusFilter !== "all" || dateRange.from || dateRange.to) && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                  {(statusFilter !== "all" ? 1 : 0) + (dateRange.from || dateRange.to ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Sort button */}
            <div className="relative inline-block">
              <button
                onClick={() => document.getElementById("sort-dropdown").classList.toggle("hidden")}
                className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                </svg>
                Sort
              </button>
              <div
                id="sort-dropdown"
                className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border"
              >
                <div className="py-1">
                  <button
                    onClick={() => {
                      requestSort("createdAt")
                      document.getElementById("sort-dropdown").classList.add("hidden")
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${sortConfig.key === "createdAt" ? "font-bold" : ""}`}
                  >
                    Date {sortConfig.key === "createdAt" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </button>
                  <button
                    onClick={() => {
                      requestSort("amount")
                      document.getElementById("sort-dropdown").classList.add("hidden")
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${sortConfig.key === "amount" ? "font-bold" : ""}`}
                  >
                    Amount {sortConfig.key === "amount" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </button>
                  <button
                    onClick={() => {
                      requestSort("status")
                      document.getElementById("sort-dropdown").classList.add("hidden")
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${sortConfig.key === "status" ? "font-bold" : ""}`}
                  >
                    Status {sortConfig.key === "status" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter panel */}
        {isFilterOpen && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Active filters display */}
        {(statusFilter !== "all" || dateRange.from || dateRange.to || searchTerm) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Search: {searchTerm}
                <button onClick={() => setSearchTerm("")} className="ml-2 text-blue-600 hover:text-blue-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}

            {statusFilter !== "all" && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                <button onClick={() => setStatusFilter("all")} className="ml-2 text-blue-600 hover:text-blue-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}

            {(dateRange.from || dateRange.to) && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Date: {dateRange.from ? new Date(dateRange.from).toLocaleDateString() : "Any"}
                {" to "}
                {dateRange.to ? new Date(dateRange.to).toLocaleDateString() : "Any"}
                <button
                  onClick={() => setDateRange({ from: "", to: "" })}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results count and items per page */}
      <div className="px-6 py-3 bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
          <span className="font-medium">{Math.min(indexOfLastItem, totalItems)}</span> of{" "}
          <span className="font-medium">{totalItems}</span> withdrawals
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1) // Reset to first page when changing items per page
            }}
            className="border rounded p-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-500">per page</span>
        </div>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort("createdAt")}
            >
              <div className="flex items-center">
                Date
                {sortConfig.key === "createdAt" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bank Details
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Receiver
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort("amount")}
            >
              <div className="flex items-center">
                Amount
                {sortConfig.key === "amount" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort("status")}
            >
              <div className="flex items-center">
                Status
                {sortConfig.key === "status" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <tr key={item?._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item?.createdAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item?.bankName}</div>
                  <div className="text-sm text-gray-500">Acc: {item?.accNo}</div>
                  <div className="text-sm text-gray-500">IFSC: {item?.ifsc}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item?.receiverName}</div>
                  <div className="text-sm text-gray-500">{item?.contact}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatAmount(item?.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item?.status)}`}
                  >
                    {item?.status?.charAt(0).toUpperCase() + item?.status?.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item?.status === "pending" && (
                    <button
                      onClick={() => openStatusModal(item._id)}
                      className="px-4 py-2 bg-[rgb(var(--color-primary))] rounded-lg text-white hover:bg-opacity-90 transition-colors"
                    >
                      Approve/Reject
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                No results found matching your filters. Try adjusting your search criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="px-6 py-4 bg-white border-t flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-700 mb-4 sm:mb-0">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {pageNumbers.map((number, index) =>
              number === "..." ? (
                <span key={`ellipsis-${index}`} className="px-3 py-1">
                  ...
                </span>
              ) : (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === number ? "bg-[rgb(var(--color-primary))] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {number}
                </button>
              ),
            )}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Custom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Update Withdrawal Status</h3>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="approved"
                    name="status"
                    value="approved"
                    checked={selectedStatus === "approved"}
                    onChange={() => setSelectedStatus("approved")}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="approved" className="font-medium">
                    Approve
                  </label>
                  <span className="text-sm text-gray-500">- Mark as approved</span>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="rejected"
                    name="status"
                    value="rejected"
                    checked={selectedStatus === "rejected"}
                    onChange={() => setSelectedStatus("rejected")}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="rejected" className="font-medium">
                    Reject
                  </label>
                  <span className="text-sm text-gray-500">- Mark as rejected</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawl}
                className="px-4 py-2 bg-[rgb(var(--color-primary))] rounded-md text-white hover:bg-opacity-90 transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Withdrawal

