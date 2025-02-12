"use client"

import { memo, useCallback, useEffect, useState } from "react"
import { server } from "../constants/config"
import axios from "axios"
import { useSelector } from "react-redux"
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react"

const MyBetsComponent = () => {
  const [allBets, setAllBets] = useState([])
  const [filteredBets, setFilteredBets] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const { user } = useSelector((state) => state.userReducer)

  const getTransactions = useCallback(async () => {
    if (!user || !user._id) return
  
    const token = localStorage.getItem("authToken")
    if (!token) {
      console.error("No token found")
      return
    }
  
    try {
      const response = await axios.get(`${server}api/v1/bet/transactions?userId=${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log(response.data.bets);

      setAllBets(response.data.bets || [])
      setFilteredBets(response.data.bets || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
    }
  }, [user])

  useEffect(() => {
    getTransactions()
  }, [user, getTransactions]) // Added getTransactions to dependencies

  // Filter and search logic
  useEffect(() => {
    let result = [...allBets]

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((bet) => bet.status === statusFilter)
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((bet) => bet.category === categoryFilter)
    }

    // Apply search
    if (searchTerm) {
      result = result.filter(
        (bet) =>
          bet.match.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bet.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }

    setFilteredBets(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [allBets, searchTerm, statusFilter, categoryFilter, sortConfig])

  // Get unique categories for filter
  const categories = [...new Set(allBets.map((bet) => bet.category))]

  const requestSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return <ChevronDown className="w-4 h-4 opacity-20" />
    }
    return sortConfig.direction === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredBets.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(filteredBets.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <div className="p-4 lg:pt-16 pt-28 rounded-lg">
      <div className="flex justify-between lg:flex-row flex-col items-center mb-6">
        <h1 className="text-xl text-blue-400 mb-2">My Bets</h1>
        <div className="flex flex-wrap justify-center items-center gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search matches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#1f2937] rounded-lg text-sm text-white border border-zinc-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#1f2937] rounded-lg text-sm text-white border border-zinc-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Result</option>
              <option value="pending">Pending</option>
              <option value="lost">Lost</option>
              <option value="won">Won</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-[#1f2937] rounded-lg text-sm text-white border border-zinc-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredBets.length === 0 ? (
        <p className="text-gray-400">No bets found.</p>
      ) : (
        <div className="overflow-x-auto border border-zinc-600 rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1f2937] border-b border-zinc-700">
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer"
                  onClick={() => requestSort("match")}
                >
                  <div className="flex items-center gap-2">Match {getSortIcon("match")}</div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer"
                  onClick={() => requestSort("status")}
                >
                  <div className="flex items-center gap-2">Result {getSortIcon("status")}</div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer"
                  onClick={() => requestSort("stake")}
                >
                  <div className="flex items-center gap-2">Stake {getSortIcon("stake")}</div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer"
                  onClick={() => requestSort("payout")}
                >
                  <div className="flex items-center gap-2">Payout {getSortIcon("payout")}</div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer"
                  onClick={() => requestSort("category")}
                >
                  <div className="flex items-center gap-2">Category {getSortIcon("category")}</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {currentItems.map((bet, index) => (
                <tr key={index} className="hover:bg-[#1f2937]/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-white">{bet.match}</td>
                  <td className="px-4 py-3">
                  <span
                      className={`capitalize text-xs font-medium ${
                        bet.status === "pending"
                          ? "text-yellow-500"
                          : bet.status === "lost"
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                     {bet.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">
                    {user?.currency} {bet.stake}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">
                    {user?.currency} {bet.payout}
                  </td>
                  <td className="px-4 py-3 text-sm text-white capitalize">{bet.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-400">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBets.length)} of {filteredBets.length}{" "}
          entries
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-[#1f2937] rounded text-white disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {[...Array(totalPages).keys()].map((number) => (
            <button
              key={number + 1}
              onClick={() => paginate(number + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === number + 1 ? "bg-blue-500 text-white" : "bg-[#1f2937] text-white"
              }`}
            >
              {number + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-[#1f2937] rounded text-white disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}


const Mybets = memo(MyBetsComponent);
Mybets.displayName = "Mybets";


export default Mybets;
