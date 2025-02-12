"use client"

import axios from "axios"
import { useCallback, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { server } from "../../constants/config"

const Allrequests = () => {
  const { user } = useSelector((state) => state.userReducer)
  const [allBets, setAllBets] = useState([])
  const [filteredBets, setFilteredBets] = useState([])
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [betsPerPage] = useState(10)
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false)
  const [selectedBetId, setSelectedBetId] = useState(null)

  const getTransactions = useCallback(async () => {
    if (!user || !user._id) return

    const token = localStorage.getItem("authToken")
    if (!token) {
      console.error("No token found")
      return
    }

    try {
      const response = await axios.get(`${server}api/v1/bet/allbets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setAllBets(response.data.bets || [])
      setFilteredBets(response.data.bets || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
    }
  }, [user])

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc"
    setSortConfig({ key, direction })

    const sorted = [...filteredBets].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1
      return 0
    })
    setFilteredBets(sorted)
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    filterBets(value, statusFilter)
    setCurrentPage(1)
  }

  const handleStatusFilter = (value) => {
    setStatusFilter(value)
    filterBets(searchTerm, value)
    setCurrentPage(1)
  }

  const filterBets = (search, status) => {
    let filtered = [...allBets]

    if (search) {
      filtered = filtered.filter(
        (bet) =>
          bet.match.toLowerCase().includes(search.toLowerCase()) ||
          bet.type.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (status !== "all") {
      filtered = filtered.filter((bet) => bet.status === status)
    }

    setFilteredBets(filtered)
  }

  const handleStatusChange = async (betId, newStatus) => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    try {
      await axios.post(
        `${server}api/v1/bet/change-status`,
        {
          betId,
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      // Refresh the bets list after status change
      getTransactions()
      setIsStatusDropdownOpen(null)
      setIsSettleModalOpen(false)
    } catch (error) {
      console.error("Error changing bet status:", error)
    }
  }

  const openSettleModal = (betId) => {
    setSelectedBetId(betId)
    setIsSettleModalOpen(true)
  }

  useEffect(() => {
    getTransactions()
  }, [getTransactions])

  // Pagination
  const indexOfLastBet = currentPage * betsPerPage
  const indexOfFirstBet = indexOfLastBet - betsPerPage
  const currentBets = filteredBets.slice(indexOfFirstBet, indexOfLastBet)
  const totalPages = Math.ceil(filteredBets.length / betsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Search by match or type..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-xs rounded-md border bg-gray-900 border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
        <div className="relative inline-block w-[180px]">
          <button
            onClick={() => setIsStatusDropdownOpen(isStatusDropdownOpen ? null : "filter")}
            className="w-full rounded-md border border-gray-300 bg-gray-900 px-4 py-2 text-left focus:border-blue-500 focus:outline-none"
          >
            {statusFilter === "all" ? "Filter by status" : statusFilter}
          </button>
          {isStatusDropdownOpen === "filter" && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-gray-900 shadow-lg">
              <div className="py-1">
                {["all", "pending", "won", "lost"].map((status) => (
                  <button
                    key={status}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-800"
                    onClick={() => {
                      handleStatusFilter(status)
                      setIsStatusDropdownOpen(null)
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
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
              <th
                onClick={() => handleSort("type")}
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-200"
              >
                Type{" "}
                {sortConfig.key === "type" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
              <th
                onClick={() => handleSort("odds")}
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-200"
              >
                Odds{" "}
                {sortConfig.key === "odds" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
              <th
                onClick={() => handleSort("stake")}
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-200"
              >
                Stake{" "}
                {sortConfig.key === "stake" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </th> 
               <th
                
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-200"
              >
                Run{" "}
                
              </th>
              <th
                onClick={() => handleSort("payout")}
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-200"
              >
                Payout{" "}
                {sortConfig.key === "payout" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
              <th
                onClick={() => handleSort("status")}
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-200"
              >
                Status{" "}
                {sortConfig.key === "status" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-500 bg-gray-800">
            {currentBets.map((bet) => (
              <tr key={bet._id} className="">
                <td className="px-6 py-4 text-sm text-gray-200">{bet.match}</td>
                <td className="px-6 py-4 text-sm text-gray-200">{bet.type}</td>
                <td className="px-6 py-4 text-sm text-gray-200">{bet.odds}</td>
                <td className="px-6 py-4 text-sm text-gray-200">{bet.stake}</td>
                <td className="px-6 py-4 text-sm text-gray-200">{bet.fancyNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-200">{bet.payout.toFixed(2)}</td>
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
      <div className="mt-4 flex justify-center">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => paginate(i + 1)}
            className={`mx-1 rounded px-3 py-1 ${
              currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {i + 1}
          </button>
        ))}
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
  )
}

export default Allrequests
