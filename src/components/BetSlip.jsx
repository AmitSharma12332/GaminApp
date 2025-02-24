/* eslint-disable react/prop-types */
import axios from "axios";
import { Minus, Plus } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { server } from "../constants/config";

// Custom hook for managing transactions
const useTransactions = (eventId) => {
  const [allBets, setAllBets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("No authentication token found");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${server}api/v1/bet/transactions?eventId=${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const pendingBets = response.data.bets.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setAllBets(pendingBets);
      setError(null);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  return { allBets, isLoading, error, fetchTransactions };
};

const BetSlip = memo(({ match, onClose, setStake, eventId, betPlaced }) => {
  const [betAmount, setBetAmount] = useState(100);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const { user } = useSelector((state) => state.userReducer);
  const prevMatchRef = useRef(null);
  const matchRef = useRef(match);

  const {
    allBets,
    isLoading: isLoadingTransactions,
    error: transactionError,
    fetchTransactions,
  } = useTransactions(eventId);

  // Constants
  const MIN_BET = 100;
  const MAX_BET = 500000;

  useEffect(() => {
    if (JSON.stringify(match) !== JSON.stringify(prevMatchRef.current)) {
      matchRef.current = match;
      prevMatchRef.current = match;
    }
  }, [match]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

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

  const handleQuickBet = useCallback(
    (amount) => {
      if (amount <= user?.amount) {
        setBetAmount(amount);
        setStake(amount);
      } else {
        toast.error("Insufficient balance for this bet amount");
      }
    },
    [setStake, user?.amount]
  );

  const handleBetChange = useCallback(
    (value) => {
      const newAmount = Math.max(MIN_BET, Math.min(value, MAX_BET));
      if (newAmount > user?.amount) {
        toast.error("Insufficient balance");
        return;
      }
      setBetAmount(newAmount);
      setStake(newAmount);
    },
    [setStake, user?.amount]
  );

  const validateBet = useCallback(() => {
    if (!user) return "You need to login first";
    if (!matchRef.current) return "Please select a bet first";
    if (betAmount < MIN_BET) return `Minimum bet amount is ${MIN_BET}`;
    if (betAmount > MAX_BET) return `Maximum bet amount is ${MAX_BET}`;
    if (betAmount > user.amount) return "Insufficient balance";
    return null;
  }, [betAmount, user]);

  const placeBet = useCallback(async () => {
    const validationError = validateBet();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const token = localStorage.getItem("authToken");
    const currentMatch = matchRef.current;

    try {
      setIsPlacingBet(true);
      const { data } = await axios.post(
        `${server}api/v1/bet/place?userId=${user._id}`,
        {
          eventId: currentMatch.eventId,
          selection: currentMatch.selectedTeam,
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
        await fetchTransactions();
        betPlaced();
        toast.success(data.message);
        onClose();
      } else {
        toast.error(data.message || "Failed to place bet");
      }
    } catch (error) {
      console.error("Bet placement error:", error);
      toast.error(error.response?.data?.message || "Failed to place bet");
    } finally {
      setIsPlacingBet(false);
    }
  }, [betAmount, user, onClose, betPlaced, fetchTransactions, validateBet]);

  const currentMatch = matchRef.current;

  if (transactionError) {
    toast.error(transactionError);
  }

  return (
    <div className="lg:bg-[#21252b] bg-[#1a2027] lg:rounded-md rounded-none md:border border-0 border-zinc-700 border-dashed text-white w-full md:p-4 md:pt-2 my-2 mt-2 md:rounded-lg p-4 flex flex-col h-full lg:h-[calc(100vh-64px)]">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg capitalize max-w-52 mb-2 flex font-bold">
            {currentMatch
              ? `${currentMatch.home_team} vs ${currentMatch.away_team}`
              : "Select a bet"}
          </h2>
        </div>

        <div className="text-sm">
          <h1>Min : {MIN_BET}</h1>
          <h1>Max : {MAX_BET}</h1>
        </div>
      </div>

      <div className="mb-2 text-sm lg:text-base">
        <div className="md:p-2 p-0 max-w-full rounded inline-block bg-gray-800">
          <span
            className={`font-semibold ${
              currentMatch?.betType === "Lay" || currentMatch?.betType === "No"
                ? "text-red-400"
                : "text-blue-400"
            }`}
          >
            {currentMatch?.selectedTeam}{" "}
          </span>
          <span className="text-gray-400">
            ({currentMatch?.betType} @ {currentMatch?.odds})
          </span>
        </div>
      </div>

      <div className="flex items-center lg:flex-row gap-2 mb-2 md:mb-2">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => handleBetChange(betAmount - 1)}
            className="bg-blue-500 p-2 rounded-lg disabled:opacity-50"
            disabled={betAmount <= MIN_BET || isPlacingBet}
          >
            <Minus size={20} />
          </button>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => handleBetChange(Number(e.target.value))}
            className="bg-gray-700 text-center w-32 p-2 rounded-lg"
            min={MIN_BET}
            max={MAX_BET}
            disabled={isPlacingBet}
          />
          <button
            onClick={() => handleBetChange(betAmount + 1)}
            className="bg-blue-500 p-2 rounded-lg disabled:opacity-50"
            disabled={betAmount >= MAX_BET || isPlacingBet}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 my-3 md:my-2">
        {quickBets.map((bet) => (
          <button
            key={bet.value}
            onClick={() => handleQuickBet(bet.value)}
            className={`border border-zinc-500 py-2 px-4 rounded text-center hover:bg-gray-600 ${
              bet.value > user?.amount || isPlacingBet
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={bet.value > user?.amount || isPlacingBet}
          >
            {bet.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 border border-red-500 text-red-500 py-2 rounded-lg font-medium transition duration-300 hover:bg-red-500 hover:text-white disabled:opacity-50"
          disabled={isPlacingBet}
        >
          Cancel
        </button>
        <button
          onClick={placeBet}
          className="flex-1 bg-green-500 py-2 px-8 rounded-lg font-medium transition duration-300 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPlacingBet || !currentMatch}
        >
          {isPlacingBet ? "Placing Bet..." : "Place Bet"}
        </button>
      </div>

      {user && eventId && (
        <div className="mt-4 flex-1 lg:flex hidden overflow-hidden flex-col">
          <div className="flex justify-between items-center mb-2">
            <h1 className="font-semibold underline text-blue-500">
              Open Bets:
            </h1>
            {isLoadingTransactions && (
              <span className="text-sm text-gray-400">Loading...</span>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-2 text-xs font-semibold text-gray-300">
                    Selection
                  </th>
                  <th className="p-2 text-xs font-semibold text-gray-300">
                    Stake
                  </th>
                  <th className="p-2 text-xs font-semibold text-gray-300">
                    Odds
                  </th>
                  {allBets.some((bet) => bet.fancyNumber) && (
                    <th className="p-2 text-xs font-semibold text-gray-300">
                      Run
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {allBets.map((bet, index) => (
                  <tr
                    key={index}
                    className={`${
                      bet.type === "back" ? "bg-[#68bbff]" : "bg-[#ff6b6f]"
                    } transition-all duration-200`}
                  >
                    <td className="p-2 text-xs text-black border-t border-gray-600">
                      {bet.selection}
                    </td>
                    <td className="p-2 text-xs text-black border-t border-gray-600">
                      {bet.stake.toFixed(2)}
                    </td>
                    <td className="p-2 text-xs text-black border-t border-gray-600">
                      {bet.odds}
                    </td>
                    {allBets.some((bet) => bet.fancyNumber) && (
                      <td className="p-2 text-xs text-black border-t border-gray-600 capitalize">
                        {bet.fancyNumber || "-"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
});

BetSlip.displayName = "BetSlip";

export default BetSlip;
