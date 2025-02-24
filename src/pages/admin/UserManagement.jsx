"use client"

/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios"
import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import {
  FaBan,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaEnvelope,
  FaMoneyBillWave,
  FaPlus,
  FaSearch,
  FaUserTag,
} from "react-icons/fa"
import { server } from "../../constants/config"

const UserForm = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [isAddMoneyDialogOpen, setIsAddMoneyDialogOpen] = useState(false)
  const [selectedUserID, setSelectedUserID] = useState(null)
  const [amount, setAmount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    password: "",
    currency: "INR",
    role: "user",
    gender: "",
    amount: "",
  })

  const [isBanConfirmOpen, setIsBanConfirmOpen] = useState(false)
  const [userToModify, setUserToModify] = useState(null)

  const usersPerPage = 10

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredUsers(filtered)
    setCurrentPage(1)
  }, [searchTerm, users])

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("authToken")
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.get(`${server}api/v1/user/allusers`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (Array.isArray(response.data.users)) {
        setUsers(response.data.users)
        setFilteredUsers(response.data.users)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users. Try again later.")
      toast.error(error || "Failed to fetch users.")
    } finally {
      setIsLoading(false)
    }
  }, [error])

  const validateNewUser = () => {
    if (!newUserData.name.trim()) {
      toast.error("Name is required")
      return false
    }
    if (!newUserData.email.trim()) {
      toast.error("Email is required")
      return false
    }
    if (!newUserData.password.trim()) {
      toast.error("Password is required")
      return false
    }
    if (!newUserData.gender) {
      toast.error("Gender selection is required")
      return false
    }
    if (!newUserData.amount || newUserData.amount <= 0) {
      toast.error("Amount must be greater than 0")
      return false
    }
    return true
  }

  const postNewUser = async () => {
    const token = localStorage.getItem("authToken")

    if (!validateNewUser()) return

    try {
      const response = await axios.post(`${server}api/v1/user/new`, newUserData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })

      toast.success("User added successfully")
      setUsers((prev) => [...prev, response.data.user])
      setFilteredUsers((prev) => [...prev, response.data.user])
      setIsAddingUser(false)
      resetForm()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add user. Please try again later.")
    }
  }

  const resetForm = () => {
    setNewUserData({
      name: "",
      email: "",
      password: "",
      currency: "INR",
      role: "user",
      gender: "",
      amount: "",
    })
  }

  const handleBanActionClick = (user) => {
    setUserToModify(user)
    setIsBanConfirmOpen(true)
  }

  const handleUserStatusChange = async () => {
    const token = localStorage.getItem("authToken")
    const newStatus = userToModify.status === "banned" ? "active" : "banned"

    try {
      const { data } = await axios.post(
        `${server}api/v1/user/userstatus/${userToModify._id}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      toast.success(data.message)
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === userToModify._id ? { ...user, status: newStatus } : user)),
      )
      setFilteredUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === userToModify._id ? { ...user, status: newStatus } : user)),
      )
      setIsBanConfirmOpen(false)
      setUserToModify(null)
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${newStatus === "banned" ? "ban" : "unban"} the user. Please try again later.`,
      )
      console.error("Error updating user status:", error)
    }
  }

  const openAddMoneyDialog = (userId) => {
    setSelectedUserID(userId)
    setIsAddMoneyDialogOpen(true)
  }

  const closeAddMoneyDialog = () => {
    setSelectedUserID(null)
    setIsAddMoneyDialogOpen(false)
    setAmount(0)
  }

  const handleAddMoney = async () => {
    const token = localStorage.getItem("authToken")

    try {
      const response = await axios.put(
        `${server}api/v1/user/addamount/${selectedUserID}`,
        { amount },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      toast.success(response.data?.message)
      closeAddMoneyDialog()
      fetchUsers() // Refresh user list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update amount. Please try again later.")
      console.error("Error updating amount:", error)
    }
  }

  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <div className="max-w-6xl mx-auto p-4  text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <button
          onClick={() => setIsAddingUser(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
        >
          <FaPlus className="mr-2" /> Add User
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-md pl-10"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {isLoading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className=" bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {currentUsers.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex capitalize flex-col items-start">
                      {user.name}
                      <span className="text-xs text-gray-400">{user._id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaEnvelope className="mr-2 text-gray-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaMoneyBillWave className="mr-2 text-gray-400" />
                      {user.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex uppercase items-center">{user.currency}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex capitalize items-center">
                      <FaCheckCircle
                        className={`mr-2 ${user.status === "banned" ? "text-red-500" : "text-green-500"}`}
                      />
                      {user.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex capitalize items-center">
                      <FaUserTag className="mr-2 text-gray-400" />
                      {user.role}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBanActionClick(user)}
                        className={`px-3 py-1 rounded text-white flex items-center ${
                          user.status === "banned" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        <FaBan className="mr-1" />
                        {user.status === "banned" ? "Active" : "Ban"}
                      </button>
                      <button
                        onClick={() => openAddMoneyDialog(user._id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                      >
                        <FaPlus className="mr-1" />
                        Add Money
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
          >
            <span className="sr-only">Previous</span>
            <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          {Array.from({
            length: Math.ceil(filteredUsers.length / usersPerPage),
          }).map((_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-700 bg-gray-800 text-sm font-medium ${
                currentPage === index + 1 ? "text-blue-500" : "text-gray-400 hover:bg-gray-700"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
          >
            <span className="sr-only">Next</span>
            <FaChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>

      {/* Add User Dialog */}
      {isAddingUser && (
        <div className="fixed z-[99] inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 p-4 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-2">Add New User</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="mt-1 h-10 p-4 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="mt-1 block w-full h-10 p-4 rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="mt-1 block w-full h-10 p-4 rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-300">
                  Currency
                </label>
                <select
                  id="currency"
                  value={newUserData.currency}
                  onChange={(e) => setNewUserData({ ...newUserData, currency: e.target.value })}
                  className="mt-1 block w-full h-10  rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <option value="INR">INR</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-300">
                  Role
                </label>
                <select
                  id="role"
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  className="mt-1 block w-full h-10  rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-300">
                  Gender
                </label>
                <select
                  id="gender"
                  value={newUserData.gender}
                  onChange={(e) => setNewUserData({ ...newUserData, gender: e.target.value })}
                  className="mt-1 block w-full h-10  rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
                  Initial Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  value={newUserData.amount}
                  onChange={(e) => setNewUserData({ ...newUserData, amount: e.target.value })}
                  className="mt-1 block w-full h-10 p-4 rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddingUser(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button onClick={postNewUser} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Money Dialog */}
      {isAddMoneyDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Add Amount</h2>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                placeholder="enter amount to add"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-1 h-10 p-4 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeAddMoneyDialog}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button onClick={handleAddMoney} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Add Money
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban/Unban Confirmation Dialog */}
      {isBanConfirmOpen && userToModify && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Confirm Action</h2>
            <p className="mb-6">
              Are you sure you want to {userToModify.status === "banned" ? "active" : "ban"} user{" "}
              <span className="font-semibold">{userToModify.name}</span>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsBanConfirmOpen(false)
                  setUserToModify(null)
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUserStatusChange}
                className={`px-4 py-2 text-white rounded ${
                  userToModify.status === "banned" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {userToModify.status === "banned" ? "Active" : "Ban"} User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserForm

