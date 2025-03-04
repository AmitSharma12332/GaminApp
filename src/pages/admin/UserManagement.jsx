"use client"

/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios"
import { Ban, ChevronLeft, ChevronRight, Mail, Plus, Search, Shield, UserCircle, Wallet } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
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
      fetchUsers()
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
    <div className="text-[rgb(var(--color-text-primary))]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <button
          onClick={() => setIsAddingUser(true)}
          className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-primary-dark))] transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-80 px-4 py-2 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))] rounded-lg pl-10"
          />
          <Search className="absolute left-3 top-3 text-[rgb(var(--color-text-muted))] h-4 w-4" />
        </div>
      </div>

      {isLoading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-[rgb(var(--color-background))] rounded-lg overflow-hidden border border-[rgb(var(--color-border))]">
            <thead className="bg-[rgb(var(--color-background-hover))]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--color-border))]">
              {currentUsers.map((user) => (
                <tr key={user._id} className="hover:bg-[rgb(var(--color-background-hover))] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex capitalize flex-col items-start">
                      {user.name}
                      <span className="text-xs text-[rgb(var(--color-text-muted))]">{user._id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail className="mr-2 text-[rgb(var(--color-text-muted))] h-4 w-4" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Wallet className="mr-2 text-[rgb(var(--color-text-muted))] h-4 w-4" />
                      {user.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex uppercase items-center">{user.currency}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex capitalize items-center">
                      <Shield
                        className={`mr-2 h-4 w-4 ${user.status === "banned" ? "text-red-500" : "text-green-500"}`}
                      />
                      {user.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex capitalize items-center">
                      <UserCircle className="mr-2 text-[rgb(var(--color-text-muted))] h-4 w-4" />
                      {user.role}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBanActionClick(user)}
                        className={`px-3 py-1 rounded-lg text-white flex items-center gap-1 ${
                          user.status === "banned" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        <Ban className="h-4 w-4" />
                        {user.status === "banned" ? "Active" : "Ban"}
                      </button>
                      <button
                        onClick={() => openAddMoneyDialog(user._id)}
                        className="px-3 py-1 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-primary-dark))] flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
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
        <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))] text-sm font-medium text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-background-hover))]"
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }).map((_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={`relative inline-flex items-center px-4 py-2 border border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))] text-sm font-medium ${
                currentPage === index + 1
                  ? "text-[rgb(var(--color-primary))]"
                  : "text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-background-hover))]"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}
            className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))] text-sm font-medium text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-background-hover))]"
          >
            <span className="sr-only">Next</span>
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>

      {/* Add User Dialog */}
      {isAddingUser && (
        <div className="fixed z-[99] inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-[rgb(var(--color-background))] p-6 rounded-lg w-96 border border-[rgb(var(--color-border))]">
            <h2 className="text-xl font-semibold mb-4">Add New User</h2>
            <div className="space-y-4">
              {[
                { id: "name", label: "Name", type: "text" },
                { id: "email", label: "Email", type: "email" },
                { id: "password", label: "Password", type: "password" },
                {
                  id: "currency",
                  label: "Currency",
                  type: "select",
                  options: [
                    { value: "INR", label: "INR" },
                    { value: "EUR", label: "EUR" },
                    { value: "USD", label: "USD" },
                  ],
                },
                {
                  id: "role",
                  label: "Role",
                  type: "select",
                  options: [
                    { value: "user", label: "User" },
                    { value: "admin", label: "Admin" },
                  ],
                },
                {
                  id: "gender",
                  label: "Gender",
                  type: "select",
                  options: [
                    { value: "", label: "Select gender" },
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" },
                  ],
                },
                { id: "amount", label: "Initial Amount", type: "number" },
              ].map((field) => (
                <div key={field.id}>
                  <label htmlFor={field.id} className="block text-sm font-medium text-[rgb(var(--color-text-primary))]">
                    {field.label}
                  </label>
                  {field.type === "select" ? (
                    <select
                      id={field.id}
                      value={newUserData[field.id]}
                      onChange={(e) => setNewUserData({ ...newUserData, [field.id]: e.target.value })}
                      className="mt-1 block w-full h-10 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))] text-[rgb(var(--color-text-primary))] shadow-sm focus:border-[rgb(var(--color-primary))] focus:ring focus:ring-[rgb(var(--color-primary))] focus:ring-opacity-50"
                    >
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      id={field.id}
                      value={newUserData[field.id]}
                      onChange={(e) => setNewUserData({ ...newUserData, [field.id]: e.target.value })}
                      className="mt-1 block w-full h-10 px-3 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))] text-[rgb(var(--color-text-primary))] shadow-sm focus:border-[rgb(var(--color-primary))] focus:ring focus:ring-[rgb(var(--color-primary))] focus:ring-opacity-50"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddingUser(false)}
                className="px-4 py-2 border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))] rounded-lg hover:bg-[rgb(var(--color-background-hover))]"
              >
                Cancel
              </button>
              <button
                onClick={postNewUser}
                className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-primary-dark))]"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Money Dialog */}
      {isAddMoneyDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-[rgb(var(--color-background))] p-6 rounded-lg w-96 border border-[rgb(var(--color-border))]">
            <h2 className="text-xl font-semibold mb-4">Add Amount</h2>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-[rgb(var(--color-text-primary))]">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                placeholder="Enter amount to add"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-1 block w-full h-10 px-3 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))] text-[rgb(var(--color-text-primary))] shadow-sm focus:border-[rgb(var(--color-primary))] focus:ring focus:ring-[rgb(var(--color-primary))] focus:ring-opacity-50"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeAddMoneyDialog}
                className="px-4 py-2 border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))] rounded-lg hover:bg-[rgb(var(--color-background-hover))]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMoney}
                className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-primary-dark))]"
              >
                Add Money
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban/Unban Confirmation Dialog */}
      {isBanConfirmOpen && userToModify && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-[rgb(var(--color-background))] p-6 rounded-lg w-96 border border-[rgb(var(--color-border))]">
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
                className="px-4 py-2 border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))] rounded-lg hover:bg-[rgb(var(--color-background-hover))]"
              >
                Cancel
              </button>
              <button
                onClick={handleUserStatusChange}
                className={`px-4 py-2 text-white rounded-lg ${
                  userToModify.status === "banned" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
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

