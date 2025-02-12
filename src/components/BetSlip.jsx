/* eslint-disable react/prop-types */
"use client";

import axios from "axios";
import { Minus, Plus } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { server } from "../constants/config";
import { calculateProfitAndLoss } from "../utils/helper";

const BetSlip = memo(({ match, onClose }) => {
  const [betAmount, setBetAmount] = useState(100);
  const [allBets, setAllBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.userReducer);
  const prevMatchRef = useRef(null);

  // Use useRef to store mutable values that persist across re-renders
  const matchRef = useRef(match);

  // Update the ref when match changes
  useEffect(() => {
    if (JSON.stringify(match) !== JSON.stringify(prevMatchRef.current)) {
      matchRef.current = match;
      prevMatchRef.current = match;
    }
  }, [match]);

  // Memoized profit and loss calculations
  const { profit, loss } = useMemo(() => {
    const currentMatch = matchRef.current;
    return currentMatch
      ? calculateProfitAndLoss(
          betAmount,
          currentMatch.odds,
          currentMatch.type,
          currentMatch.category
        )
      : { profit: 0, loss: 0 };
  }, [betAmount]);

  // Quick bet options
  const quickBets = useMemo(
    () => [
      { label: "100", value: 100 },
      { label: "1K", value: 1000 },
      { label: "5K", value: 5000 },
      { label: "10K", value: 10000 },
      { label: "25K", value: 25000 },
      { label: "50K", value: 50000 },
      { label: "100K", value: 100000 },
      { label: "500K", value: 500000 },
    ],
    []
  );

  const handleQuickBet = useCallback((amount) => {
    setBetAmount(amount);
  }, []);

  const handleBetChange = useCallback((value) => {
    setBetAmount(Math.max(0, Math.min(value, 500000)));
  }, []);

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
      // Filter only "pending" bets and sort them (newest first)
      const pendingBets = response.data.bets.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setAllBets(pendingBets);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return null;
    }
  }, [user]);

  const placeBet = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    const currentMatch = matchRef.current;

    if (!token) {
      toast.error("You need to login!");
      return;
    }

    if (!currentMatch) {
      toast.error("Select a bet first!");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${server}api/v1/bet/place?userId=${user._id}`,
        {
          eventId: currentMatch.eventId,
          match: `${currentMatch.home_team} vs ${currentMatch.away_team}`,
          marketId: currentMatch.marketId,
          selectionId: currentMatch.selectionId,
          fancyNumber: currentMatch.fancyNumber,
          stake: betAmount,
          odds: currentMatch.odds,
          category: currentMatch.category,
          type: currentMatch.type,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        getTransactions();
        toast.success(data.message);
        onClose();
      } else {
        toast.error(data.message || "Failed to place bet.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while placing the bet.");
    } finally {
      setLoading(false);
    }
  }, [user, betAmount, onClose, getTransactions]);

  useEffect(() => {
    getTransactions();
  }, [getTransactions]);

  const currentMatch = matchRef.current;

  return (
    <div className="lg:bg-[#21252b] bg-[#1a2027] lg:rounded-md rounded-none md:border border-0 border-zinc-700 border-dashed text-white w-full md:p-4 md:pt-2 my-2 mt-2 md:rounded-lg p-4 flex flex-col h-full lg:h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex justify-between items-start ">
        <div>
          <h2 className="text-lg capitalize max-w-52 mb-2 flex font-bold">
            {currentMatch
              ? `${currentMatch.home_team} vs ${currentMatch.away_team}`
              : "Select a bet"}
          </h2>
        </div>

        <div className="text-sm">
          <h1>Min : 100</h1>
          <h1>Max : 50L</h1>
        </div>
      </div>

      {/* Match Details */}
      <div className="mb-2 text-sm lg:text-base">
        <div className="md:p-2 p-0 max-w-52 rounded inline-block bg-gray-800">
          <span
            className={`font-semibold ${
              currentMatch?.betType === "Lay" || currentMatch?.betType === "No"
                ? "text-red-400"
                : "text-blue-400"
            }`}
          >
            {currentMatch?.selectedTeam}{" "}
          </span>
          <span className="text-gray-400 ">
            ({currentMatch?.betType} @ {currentMatch?.odds})
          </span>
        </div>
      </div>

      {/* Amount Input */}
      <div className="flex items-center lg:flex-row gap-2 mb-2 md:mb-2">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => handleBetChange(betAmount - 1)}
            className="bg-blue-500 p-2 rounded-lg"
          >
            <Minus size={20} />
          </button>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => handleBetChange(Number.parseFloat(e.target.value))}
            className="bg-gray-700 text-center w-32 p-2 rounded-lg"
          />
          <button
            onClick={() => handleBetChange(betAmount + 1)}
            className="bg-blue-500 p-2 rounded-lg"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Calculations */}
      {user && currentMatch && (
        <div className="text-sm flex justify-evenly gap-2 lg:text-sm mb-0">
          <div className="flex gap-1 justify-center items-center w-full py-1 bg-red-900 px-3 rounded-md text-white">
            <span className="font-semibold ">Loss:</span>
            <span className="uppercase">
              {user?.currency} {loss?.toFixed(2)}
            </span>
          </div>
          <div className="flex gap-1 justify-center items-center w-full py-1 bg-green-900 px-3 rounded-md text-white">
            <span className="font-semibold "> Profit:</span>
            <span className="uppercase">
              {" "}
              {user?.currency} {profit?.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Quick Bet Amounts */}
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 my-3 md:my-2">
        {quickBets.map((bet) => (
          <button
            key={bet.value}
            onClick={() => handleQuickBet(bet.value)}
            className={`border border-zinc-500 py-2 px-4 rounded text-center hover:bg-gray-600 ${
              bet.value > user?.amount ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={bet.value > user?.amount}
          >
            {bet.label}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 border border-red-500 text-red-500 py-2 rounded-lg font-medium transition duration-300 hover:bg-red-500 hover:text-white"
        >
          Cancel
        </button>
        <button
          onClick={placeBet}
          className="flex-1 bg-green-500 py-2 px-8 rounded-lg font-medium transition duration-300 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Placing Bet..." : "Place Bet"}
        </button>
      </div>

      {user && (
        <div className="mt-4 flex-1 xl:flex hidden overflow-hidden flex-col">
          <h1 className="mb-2 font-semibold underline text-blue-500">
            Recent Bets :
          </h1>
          <div className="overflow-y-auto flex-1">
            {allBets.map((bet, index) => (
              <div
                key={index}
                className="bg-[#242a31] rounded-lg p-2 mb-2 hover:bg-gray-700 transition-all duration-200"
              >
                <div className="flex flex-col space-y-3">
                  {/* Match and Time */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xs font-semibold text-white">
                        {bet.match}
                      </h3>
                    </div>
                    <span
                      className={`capitalize text-xs font-medium ${
                        bet.status === "pending"
                          ? "text-yellow-500"
                          : bet.status === "lost"
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      Bet Result: {bet.status}
                    </span>
                  </div>

                  {/* Betting Details */}
                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex flex-row justify-start items-center gap-1">
                      <span className="text-gray-400 text-xs flex items-center">
                        Stake :
                      </span>
                      <span className="text-white text-xs font-medium uppercase">
                        {user.currency} {bet.stake}
                      </span>
                    </div>{" "}
                    <div className="flex flex-row justify-start items-center gap-1">
                      <span className="text-gray-400 text-xs flex items-center">
                        Odds :
                      </span>
                      <span className="text-white text-xs font-medium uppercase">
                        {bet.odds}
                      </span>
                    </div>
                    <div className="flex flex-row justify-start items-center gap-1">
                      <span className="text-gray-400 text-xs flex items-center">
                        Payout :
                      </span>
                      <span className="text-white text-xs font-medium uppercase">
                        {user.currency} {bet.payout}
                      </span>
                    </div>
                    <div className="flex flex-row justify-start items-center gap-1">
                      <span className="text-gray-400 text-xs flex items-center">
                        Category :
                      </span>
                      <span className="text-white text-xs font-medium capitalize">
                        {bet.category === "fancy"
                          ? `Fancy (${bet.type === "back" ? "Yes" : "No"})`
                          : `${bet.category} (${bet.type})`}
                      </span>
                    </div>
                    {bet.fancyNumber && (
                      <div className="flex flex-row justify-start items-center gap-1">
                        <span className="text-gray-400 text-xs flex items-center">
                          Run :
                        </span>
                        <span className="text-white text-xs font-medium capitalize">
                          {bet.fancyNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

BetSlip.displayName = "BetSlip";

export default BetSlip;
