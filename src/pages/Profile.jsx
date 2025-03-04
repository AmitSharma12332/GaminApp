"use client"

/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import axios from "axios"
import { CreditCard, Mail, Plus, Shield, User, UserCircle, Wallet } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { server } from "../constants/config"
import Loader from "./../components/Loader"

const Profile = () => {
  const { user } = useSelector((state) => state.userReducer)
  const [withdrawals, setWithdrawals] = useState(null)
  const [deposits, setDeposits] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [allBets, setAllBets] = useState([])

  const [formData, setFormData] = useState({
    amount: "",
    accNo: "",
    ifsc: "",
    contact: "",
    bankName: "",
    receiverName: "",
  })

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      const token = localStorage.getItem("authToken")
      setLoading(true)
      try {
        const response = await axios.get(`${server}api/v1/payment/status/withdraw?userId=${user?._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setWithdrawals(response.data)
      } catch (err) {
        setError(err.message || "Something went wrong!")
      } finally {
        setLoading(false)
      }
    }

    const fetchDeposits = async () => {
      const token = localStorage.getItem("authToken")
      setLoading(true)
      try {
        const response = await axios.get(`${server}api/v1/payment/status/deposit?userId=${user?._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setDeposits(response.data)
      } catch (err) {
        setError(err.message || "Something went wrong!")
      } finally {
        setLoading(false)
      }
    }

    if (user?._id) {
      fetchPaymentStatus()
      fetchDeposits()
    }
  }, [user?._id])

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem("authToken")
    try {
      const response = await axios.post(`${server}api/v1/payment/request/withdraw?userId=${user?._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        alert("Withdrawal request submitted successfully!")
        setShowModal(false)
        setFormData({
          amount: "",
          accNo: "",
          ifsc: "",
          contact: "",
          bankName: "",
          receiverName: "",
        })
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit request")
    }
  }

  const getTransactions = useCallback(async () => {
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
      const pendingBets = response.data.bets
        .filter((bet) => bet.status === "pending")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      setAllBets(pendingBets)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      return null
    }
  }, [user._id])

  useEffect(() => {
    getTransactions()
  }, [getTransactions])

  const ProfileItem = ({ icon: Icon, label, value, statusColor }) => (
    <div className="flex items-center space-x-3">
      <Icon className="w-5 h-5 text-[rgb(var(--color-text-muted))]" />
      <div>
        <p className="text-sm text-[rgb(var(--color-text-muted))]">{label}</p>
        <p className={`font-medium ${statusColor || "text-[rgb(var(--color-text-primary))]"}`}>{value}</p>
      </div>
    </div>
  )

  const renderProfileTab = () => (
    <div className="w-full max-w-2xl mx-auto rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-[rgb(var(--color-primary))] flex items-center gap-2 mb-6">
          <User className="w-6 h-6" />
          Profile
        </h2>

        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-[rgb(var(--color-background-hover))] rounded-full uppercase flex items-center justify-center text-2xl font-bold text-[rgb(var(--color-text-primary))]">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))]">{user?.name}</h2>
            <span className="inline-block px-2 py-1 text-xs font-semibold text-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary-light))] rounded-full">
              {user?.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileItem icon={UserCircle} label="Username" value={user?.name} />
          <ProfileItem icon={Wallet} label="Wallet Balance" value={`${user?.currency} ${user?.amount}`} />
          <ProfileItem icon={CreditCard} label="Preferred Currency" value={user?.currency.toUpperCase()} />
          <ProfileItem icon={Mail} label="Email" value={user?.email} />
          <ProfileItem icon={User} label="Gender" value={user?.gender} />
          <ProfileItem
            icon={Shield}
            label="Account Status"
            value={user?.status}
            statusColor="text-[rgb(var(--color-primary))]"
          />
        </div>
      </div>
    </div>
  )

  const renderWithdrawalTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-xl text-[rgb(var(--color-primary))]">Withdrawals</h1>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-[rgb(var(--color-primary))] flex justify-center items-center w-fit px-4 text-white py-2 rounded-lg hover:bg-[rgb(var(--color-primary-dark))] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Withdrawal Request
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {withdrawals?.withdrawHistory.map((withdrawal, index) => (
          <div
            key={index}
            className="bg-[rgb(var(--color-background))] p-4 rounded-lg border-dashed border border-[rgb(var(--color-border))]"
          >
            <h1 className="text-[rgb(var(--color-text-primary))]">Receiver Name: {withdrawal.receiverName}</h1>
            <h1 className="text-[rgb(var(--color-text-primary))]">Contact: {withdrawal.contact}</h1>
            <h1 className="text-[rgb(var(--color-text-primary))]">Amount: {withdrawal.amount}</h1>
            <h1 className="text-[rgb(var(--color-text-primary))]">
              Withdrawal Status:{" "}
              <span className="text-[rgb(var(--color-primary))] capitalize">{withdrawal.status}</span>
            </h1>
          </div>
        ))}
      </div>
    </div>
  )

  const renderDepositTab = () => (
    <div className="p-4 rounded-lg">
      <h1 className="text-xl text-[rgb(var(--color-primary))]">All Deposits</h1>
    </div>
  )



  if (loading) return <Loader />
  if (error) return <p className="text-[rgb(var(--color-text-primary))]">Error: {error}</p>

  return (
    <div className="">
      <div className="max-w-full mx-auto p-2 lg:h-[calc(100vh-64px)] flex flex-col lg:flex-row">
        {/* Mobile Tabs */}
        <div className="lg:hidden flex mb-4 bg-[rgb(var(--color-background))] rounded-lg overflow-hidden border border-[rgb(var(--color-border))]">
          {["profile", "withdrawal"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 ${
                activeTab === tab
                  ? "bg-[rgb(var(--color-primary))] text-white"
                  : "text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-background-hover))]"
              } transition-colors`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex bg-[rgb(var(--color-background))] rounded-lg p-2 gap-2 lg:flex-col lg:w-64 overflow-hidden mr-4 border border-[rgb(var(--color-border))]">
          {["profile", "withdrawal"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 rounded-lg text-left ${
                activeTab === tab
                  ? "bg-[rgb(var(--color-primary))] text-white"
                  : "text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-background-hover))]"
              } transition-colors`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[rgb(var(--color-background))] rounded-lg p-4 overflow-y-auto border border-[rgb(var(--color-border))]">
          {activeTab === "profile" && renderProfileTab()}
          {activeTab === "withdrawal" && renderWithdrawalTab()}
          {activeTab === "deposit" && renderDepositTab()}
        </div>

        {/* Withdrawal Modal */}
        {showModal && (
          <div className="fixed inset-0 p-4 z-[99] bg-black/50 flex items-center justify-center">
            <div className="bg-[rgb(var(--color-background))] p-6 rounded-lg w-full md:w-1/3 border border-[rgb(var(--color-border))]">
              <h2 className="text-xl font-bold mb-4 text-[rgb(var(--color-text-primary))]">Withdrawal Request</h2>
              <form className="flex flex-col gap-1" onSubmit={handleFormSubmit}>
                {[
                  { name: "amount", label: "Amount", type: "number" },
                  { name: "accNo", label: "Account Number", type: "text" },
                  { name: "ifsc", label: "IFSC Code", type: "text" },
                  { name: "contact", label: "Contact", type: "text" },
                  { name: "bankName", label: "Bank Name", type: "text" },
                  { name: "receiverName", label: "Receiver Name", type: "text" },
                ].map((field) => (
                  <div key={field.name} className="mb-2">
                    <label className="block text-sm font-bold mb-2 text-[rgb(var(--color-text-primary))]">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleFormChange}
                      className="w-full p-2 border rounded-lg bg-[rgb(var(--color-background))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))]"
                      required
                    />
                  </div>
                ))}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-background-hover))] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[rgb(var(--color-primary))] text-white hover:bg-[rgb(var(--color-primary-dark))] transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile

