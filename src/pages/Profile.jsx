/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import axios from "axios";
import {
  CreditCard,
  Mail,
  Plus,
  Shield,
  User,
  UserCircle,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { server } from "../constants/config";
import Loader from "./../components/Loader";

const Profile = () => {
  const { user } = useSelector((state) => state.userReducer);
  const [withdrawals, setWithdrawals] = useState(null);
  const [deposits, setDeposits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [allBets, setAllBets] = useState([]);

  const [formData, setFormData] = useState({
    amount: "",
    accNo: "",
    ifsc: "",
    contact: "",
    bankName: "",
    receiverName: "",
  });

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      const token = localStorage.getItem("authToken");
      setLoading(true);
      try {
        const response = await axios.get(
          `${server}api/v1/payment/status/withdraw?userId=${user?._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setWithdrawals(response.data);
      } catch (err) {
        setError(err.message || "Something went wrong!");
      } finally {
        setLoading(false);
      }
    };

    const fetchDeposits = async () => {
      const token = localStorage.getItem("authToken");
      setLoading(true);
      try {
        const response = await axios.get(
          `${server}api/v1/payment/status/deposit?userId=${user?._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDeposits(response.data);
      } catch (err) {
        setError(err.message || "Something went wrong!");
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchPaymentStatus();
      fetchDeposits();
    }
  }, [user?._id]);

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.post(
        `${server}api/v1/payment/request/withdraw?userId=${user?._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("Withdrawal request submitted successfully!");
        setShowModal(false);
        setFormData({
          amount: "",
          accNo: "",
          ifsc: "",
          contact: "",
          bankName: "",
          receiverName: "",
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit request");
    }
  };

  const getTransactions = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No token found");
      return;
    }
    try {
      const response = await axios.get(
        `${server}api/v1/bet/transactions?userId=${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Filter only "pending" bets
      // Filter only "pending" bets and sort them (newest first)
      const pendingBets = response.data.bets
        .filter((bet) => bet.status === "pending")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setAllBets(pendingBets);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return null;
    }
  }, [user._id]);

  useEffect(() => {
    getTransactions();
  }, [getTransactions]);

  const renderProfileTab = () => (
    <div className="w-full max-w-2xl mx-auto rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-2 mb-6">
          <User className="w-6 h-6" />
          Profile
        </h2>

        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full uppercase flex items-center justify-center text-2xl font-bold text-gray-800">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl tex font-semibold">{user?.name}</h2>
            <span className="inline-block px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
              {user?.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileItem icon={UserCircle} label="Username" value={user?.name} />
          <ProfileItem
            icon={Wallet}
            label="Wallet Balance"
            value={`${user?.currency} ${user?.amount}`}
          />
          <ProfileItem
            icon={CreditCard}
            label="Preferred Currency"
            value={user?.currency.toUpperCase()}
          />
          <ProfileItem icon={Mail} label="Email" value={user?.email} />
          <ProfileItem icon={User} label="Gender" value={user?.gender} />
          <ProfileItem
            icon={Shield}
            label="Account Status"
            value={user?.status}
            statusColor="text-green-600"
          />
        </div>
      </div>
    </div>
  );

  const ProfileItem = ({ icon: Icon, label, value, statusColor }) => (
    <div className="flex items-center space-x-3">
      <Icon className="w-5 h-5 text-gray-200" />
      <div>
        <p className="text-sm text-gray-300">{label}</p>
        <p className={`font-medium ${statusColor || "text-gray-200"}`}>
          {value}
        </p>
      </div>
    </div>
  );
  const renderWithdrawalTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-xl text-blue-400">Withdrawals</h1>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 flex justify-center items-center w-fit px-4 text-white py-2 rounded-lg"
          >
            <span>
              <Plus />
            </span>{" "}
            Withdrawal Request
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {withdrawals?.withdrawHistory.map((withdrawal, index) => (
          <div
            key={index}
            className="bg-gray-800 p-4 rounded-lg border-dashed border border-zinc-600"
          >
            <h1 className="text-white">
              Receiver Name: {withdrawal.receiverName}
            </h1>
            <h1 className="text-white">Contact: {withdrawal.contact}</h1>
            <h1 className="text-white">Amount: {withdrawal.amount}</h1>
            <h1 className="text-white">
              Withdrawal Status:{" "}
              <span className="text-yellow-400 capitalize">
                {withdrawal.status}
              </span>
            </h1>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDepositTab = () => (
    <div className=" p-4 rounded-lg">
      <h1 className="text-xl text-blue-400">All Deposits</h1>
      {/* Add deposit history here when available */}
    </div>
  );

  const renderMyBetsTab = () => (
    <div className=" p-4 rounded-lg">
      <h1 className="text-xl text-blue-400 mb-4">My Bets</h1>
      <div className="overflow-y-auto grid grid-cols-1  md:grid-cols-2 xl:grid-cols-3  gap-4">
        {allBets.map((bet, index) => (
          <div key={index} className=" transition-all duration-200">
            <div className="flex flex-col bg-[#1f2937] space-y-3 border-zinc-600 border rounded-lg p-4 border-dashed">
              {/* Match and Time */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {bet.match}
                  </h3>
                  <div className="flex items-center text-gray-400 text-sm mt-1"></div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    bet.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-500"
                      : "bg-green-500/20 text-green-500"
                  }`}
                >
                  {bet.status}
                </span>
              </div>

              {/* Betting Details */}
              <div className="grid grid-cols-3 gap-1">
                <div className="flex flex-row justify-center items-center gap-1">
                  <span className="text-gray-400 text-xs flex items-center">
                    Stake
                  </span>
                  <span className="text-white text-xs font-medium uppercase">
                    {user.currency} {bet.stake}
                  </span>
                </div>
                <div className="flex flex-row justify-center items-center gap-1">
                  <span className="text-gray-400 text-xs flex items-center">
                    Payout
                  </span>
                  <span className="text-white text-xs font-medium uppercase">
                    {user.currency} {bet.payout}
                  </span>
                </div>
                <div className="flex flex-row justify-center items-center gap-1">
                  <span className="text-gray-400 text-xs flex items-center">
                    Payout
                  </span>
                  <span className="text-white text-xs font-medium capitalize">
                    {bet.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>{" "}
    </div>
  );

  if (loading)
    return (
      <div>
        <Loader />
      </div>
    );
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="lg:pt-12 pt-24">
      <div className="max-w-full mx-auto p-2 lg:h-[calc(100vh-64px)] flex flex-col lg:flex-row">
        {/* Tabs for mobile */}
        <div className="lg:hidden flex mb-4 bg-gray-700 rounded-lg overflow-hidden">
          {["profile", "withdrawal", "mybets"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 ${
                activeTab === tab
                  ? "bg-gray-900 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Sidebar for desktop */}
        <div className="hidden lg:flex bg-[#181d26] rounded-lg p-2 gap-2 lg:flex-col lg:w-64  overflow-hidden mr-4">
          {["profile", "withdrawal", "mybets"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 rounded-lg text-left ${
                activeTab === tab
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg p-4 overflow-y-auto">
          {activeTab === "profile" && renderProfileTab()}
          {activeTab === "withdrawal" && renderWithdrawalTab()}
          {activeTab === "deposit" && renderDepositTab()}
          {activeTab === "mybets" && renderMyBetsTab()}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 p-4 z-[99] bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-700 p-6 rounded-lg w-full text-white md:w-1/3">
              <h2 className="text-xl font-bold mb-4">Withdrawal Request</h2>
              <form
                className="flex flex-col gap-1 text-white"
                onSubmit={handleFormSubmit}
              >
                <div className="mb-2">
                  <label className="block text-sm font-bold mb-2">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-bold mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="accNo"
                    value={formData.accNo}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-bold mb-2">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    name="ifsc"
                    value={formData.ifsc}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-bold mb-2">
                    Contact
                  </label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-bold mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-bold mb-2">
                    Receiver Name
                  </label>
                  <input
                    type="text"
                    name="receiverName"
                    value={formData.receiverName}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 text-black px-4 py-2 rounded-lg mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
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
  );
};

export default Profile;
