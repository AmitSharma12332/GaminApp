/* eslint-disable react/prop-types */
import axios from "axios";
import { ChevronRight } from "lucide-react";
import PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import io from "socket.io-client";
import { server } from "../../constants/config";
import { calculateNewMargin, calculateProfitAndLoss } from "../../utils/helper";
import BetSlip from "../BetSlip";

const socket = io(server);

const OddsBox = ({ odds, value, type, onClick, isSelected }) => {
  const bgColor = type === "back" ? "bg-[rgb(var(--back-odd))]" : "bg-[rgb(var(--lay-odd))]"

  const hoverColor = type === "back" ? "hover:bg-[rgb(var(--back-odd-hover))]" : "hover:bg-[rgb(var(--lay-odd-hover))]"

  const selectedColor = type === "back" ? "bg-[#0077B3]" : "bg-[#FF4D55]"

  return (
    <button
      onClick={onClick}
      className={`${
        isSelected ? selectedColor : bgColor
      } ${hoverColor} w-full sm:w-12 min-w-[70px] md:w-16 rounded flex flex-col items-center justify-center transition-colors p-1`}
    >
      <span className="text-black font-semibold text-sm sm:text-base">{odds}</span>
      <span className="text-black text-[10px] lg:text-xs">{value / 1000}K</span>
    </button>
  )
}

OddsBox.propTypes = {
  odds: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  type: PropTypes.oneOf(["back", "lay"]).isRequired,
  onClick: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
};

const TeamRow = ({
  teamName,
  backOdds,
  layOdds,
  onOddsClick,
  matchData,
  stake,
  selectedOdd,
  selectionId,
  margin,
  // cashoutData
}) => {
  const previousMargin =
    margin?.selectionId === selectionId ? margin?.profit : margin?.loss;

  let newProfit = 0;
  let newLoss = 0;

  let profit = 0;
  let loss = 0;

  if (selectedOdd) {
    const res = calculateProfitAndLoss(
      stake,
      selectedOdd.odds,
      selectedOdd.type,
      "match odds"
    );
    profit = res.profit;
    loss = res.loss;

    const data = calculateNewMargin(
      margin,
      selectedOdd.selectionId,
      selectedOdd.type,
      profit,
      loss
    );

    newProfit = data.newProfit;
    newLoss = data.newLoss;
  }

  return (
    <div className="flex flex-wrap gap-2 border-b px-4 sm:flex-nowrap justify-between items-center py-2 border-[rgb(var(--color-border))]">
      <div className="flex flex-col">
        <span className="text-black text-sm w-full sm:w-[200px] mb-0 font-semibold sm:mb-0">
          {teamName}
        </span>

        {/* {cashoutData && cashoutData.selectionId === selectionId && (
          <div className="flex flex-col items-center bg-green-100 p-1 rounded">
            <span className="text-xs font-semibold">Optimal Cashout</span>
            <span className="text-black font-bold">{cashoutData.stake}</span>
            <span className="text-xs text-gray-700">
              {cashoutData.type.charAt(0).toUpperCase() + cashoutData.type.slice(1)} @ {cashoutData.odds}
            </span>
          </div>
        )} */}

        
        <span className="w-full flex justify-start text-xs items-center sm:w-[200px] mb-0 font-semibold sm:mb-0">
          {((previousMargin !== null && previousMargin !== undefined) ||
            selectedOdd) && (
            <>
              <span
                className={`text-xs ${
                  (margin?.selectionId === selectionId
                    ? margin?.profit
                    : margin?.loss) > 0
                    ? "text-green-500"
                    : (margin?.selectionId === selectionId
                        ? margin?.profit
                        : margin?.loss) < 0
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              >
                {margin
                  ? margin?.selectionId === selectionId
                    ? Math.abs(margin?.profit.toFixed(0))
                    : Math.abs(margin?.loss.toFixed(0))
                  : 0}
              </span>
              {selectedOdd &&
                (margin ? (
                  <>
                    <span className="text-gray-400 scale-75 text-[4px]">
                      <ChevronRight />
                    </span>
                    <span
                      className={`text-xs ${
                        (margin?.selectionId === selectionId
                          ? newProfit
                          : newLoss) > 0
                          ? "text-green-500"
                          : (margin?.selectionId === selectionId
                              ? newProfit
                              : newLoss) < 0
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    >
                      {margin?.selectionId === selectionId
                        ? Math.abs(newProfit.toFixed(0))
                        : Math.abs(newLoss.toFixed(0))}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-400 scale-75 text-[4px]">
                      <ChevronRight />
                    </span>
                    <span
                      className={`text-xs ${
                        (selectedOdd?.type === "back"
                          ? selectedOdd?.selectionId === selectionId
                            ? profit
                            : loss
                          : selectedOdd?.selectionId === selectionId
                          ? loss
                          : profit) > 0
                          ? "text-green-500"
                          : (selectedOdd?.type === "back"
                              ? selectedOdd?.selectionId === selectionId
                                ? profit
                                : loss
                              : selectedOdd?.selectionId === selectionId
                              ? loss
                              : profit) < 0
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    >
                      {Math.abs(
                        selectedOdd?.type === "back"
                          ? selectedOdd?.selectionId === selectionId
                            ? profit.toFixed(0)
                            : loss.toFixed(0)
                          : selectedOdd?.selectionId === selectionId
                          ? loss.toFixed(0)
                          : profit.toFixed(0)
                      )}
                    </span>
                  </>
                ))}
            </>
          )}
        </span>
      </div>
      <div className="grid grid-cols-3 sm:flex gap-1 w-full sm:w-auto">
        {backOdds.map(([odds, value], i) => (
          <div key={`back-${i}`} className="flex flex-col items-center">
            <OddsBox
              odds={odds}
              value={value}
              type="back"
              onClick={() =>
                onOddsClick(
                  matchData,
                  teamName,
                  "Back",
                  odds,
                  value,
                  selectionId
                )
              }
              isSelected={
                selectedOdd &&
                selectedOdd.selectionId === selectionId &&
                selectedOdd.type === "back" &&
                selectedOdd.odds === odds
              }
            />
          </div>
        ))}
        {layOdds.map(([odds, value], i) => (
          <div key={`lay-${i}`} className="flex flex-col items-center">
            <OddsBox
              odds={odds}
              value={value}
              type="lay"
              onClick={() =>
                onOddsClick(
                  matchData,
                  teamName,
                  "Lay",
                  odds,
                  value,
                  selectionId
                )
              }
              isSelected={
                selectedOdd &&
                selectedOdd.selectionId === selectionId &&
                selectedOdd.type === "lay" &&
                selectedOdd.odds === odds
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

TeamRow.propTypes = {
  teamName: PropTypes.string.isRequired,
  backOdds: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  layOdds: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  onOddsClick: PropTypes.func.isRequired,
  matchData: PropTypes.object.isRequired,
  stake: PropTypes.number.isRequired,
  selectedOdd: PropTypes.object,
  selectionId: PropTypes.string.isRequired,
  margin: PropTypes.object,
};

const arrangeRunners = (runners = [], odds = []) => {
  if (!runners.length || !odds.length) return [];
  const draw = runners.find((r) => r?.name === "The Draw");
  const teams = runners.filter((r) => r?.name !== "The Draw");

  return [teams[0], draw, teams[1]].filter(Boolean);
};

const MatchOdds = ({
  eventId,
  onBetSelect,
  stake,
  setStake,
  showBetSlip,
  marginAgain,
  betPlaced
}) => {
  const [sportsData, setSportsData] = useState([]);
  const [selectedBet, setSelectedBet] = useState(null);
  const [selectedOdd, setSelectedOdd] = useState(null);
  // const [cashoutData, setCashoutData] = useState(null)

  const [margin, setMargin] = useState(null);
  const matches = sportsData?.[4]?.[4] || [];
  const matchData = matches.find((match) => match.event?.event?.id === eventId);
  const oddsData = matchData?.odds?.[0];
  const runners = arrangeRunners(
    matchData?.event?.runners,
    oddsData?.runners || []
  );

  const handleOddsClick = useCallback(
    (matchData, teamName, type, odds, value, selectionId) => {
      const betData = {
        home_team: matchData?.event?.runners?.[0]?.name || "Unknown",
        away_team: matchData?.event?.runners?.[1]?.name || "Unknown",
        eventId: matchData?.event?.event?.id || "",
        marketId: matchData?.event?.market?.id || "",
        selectionId: selectionId,
        fancyNumber: null,
        stake: stake,
        odds: odds || 0,
        category: "match odds",
        type: type.toLowerCase(),
        gameId: matchData?.market?.id || "",
        eventName: teamName,
        selectedTeam: teamName,
        betType: type,
        size: value || 0,
      };

      setSelectedBet(betData);
      setSelectedOdd({
        selectionId,
        type: type.toLowerCase(),
        odds,
      });
      onBetSelect(betData);
    },
    [stake, onBetSelect]
  );

  const runnersWithOdds = runners.map((runner) => {
    const runnerOdds = oddsData?.runners?.find(
      (r) => r.selectionId === runner.id
    );
    return {
      selectionId: runnerOdds?.selectionId,
      name: runner.name,
      back: runnerOdds?.back || [],
      lay: runnerOdds?.lay || [],
    };
  });

  const getMargins = useCallback(
    async (token) => {
      try {
        const response = await axios.get(
          `${server}api/v1/bet/margins?eventId=${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.success) {
          const marginsData =
            response.data.margins[matchData?.event?.market?.id];
          setMargin(marginsData);
        }
      } catch (error) {
        console.error(
          "Error fetching margins:",
          error.response?.data || error.message
        );
      }
    },
    [eventId, matchData?.event?.market?.id]
  );

  useEffect(() => {
    socket.on("sportsData", (data) => {
      setSportsData(data);
    });

    return () => {
      socket.off("sportsData");
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      getMargins(token);
    }
  }, [getMargins, marginAgain]);


  useEffect(() => {
    setSelectedOdd(null)
    setSelectedBet(null)
  }, [marginAgain])


  // const calculateCashout = useCallback(() => {
  //   if (!matchData || !margin) return

  //   // Get all available odds from all runners
  //   const allOdds = []
  //   runnersWithOdds.forEach((runner) => {
  //     // Add back odds with selection ID and type
  //     runner.back.forEach((odds) => {
  //       allOdds.push({
  //         selectionId: runner.selectionId,
  //         odds: odds.price,
  //         type: "back",
  //         name: runner.name,
  //       })
  //     })

  //     // Add lay odds with selection ID and type
  //     runner.lay.forEach((odds) => {
  //       allOdds.push({
  //         selectionId: runner.selectionId,
  //         odds: odds.price,
  //         type: "lay",
  //         name: runner.name,
  //       })
  //     })
  //   })

  //   // Calculate potential loss for each odd and stake combination
  //   let minLoss = Number.POSITIVE_INFINITY
  //   let bestOption = null

  //   allOdds.forEach((odd) => {
  //     // Try different stake values (you can adjust the range and step as needed)
  //     for (let testStake = 100; testStake <= 10000; testStake += 100) {
  //       const { profit, loss } = calculateProfitAndLoss(testStake, odd.odds, odd.type, "match odds")

  //       const newMargin = calculateNewMargin(margin, odd.selectionId, odd.type, profit, loss)

  //       // Calculate the maximum potential loss across all selections
  //       const potentialLosses = runnersWithOdds.map((runner) => {
  //         if (runner.selectionId === odd.selectionId) {
  //           return newMargin.newLoss
  //         } else {
  //           return newMargin.newProfit
  //         }
  //       })

  //       const maxLoss = Math.max(...potentialLosses.map(Math.abs))

  //       // If this combination results in a lower maximum loss, save it
  //       if (maxLoss < minLoss) {
  //         minLoss = maxLoss
  //         bestOption = {
  //           selectionId: odd.selectionId,
  //           odds: odd.odds,
  //           type: odd.type,
  //           stake: testStake,
  //           name: odd.name,
  //           potentialLoss: minLoss,
  //         }
  //       }
  //     }
  //   })

  //   setCashoutData(bestOption)

  //   // Console log the optimal bet details
  //   console.log("OPTIMAL CASHOUT BET:", {
  //     team: bestOption?.name,
  //     betType: bestOption?.type,
  //     odds: bestOption?.odds,
  //     stake: bestOption?.stake,
  //     potentialLoss: bestOption?.potentialLoss,
  //   })
  // }, [matchData, margin, runnersWithOdds])

  return (
    <div>
    <div className="border border-[rgb(var(--color-border))] mb-2 rounded-lg overflow-hidden w-full shadow-sm">
      <div className="flex flex-wrap sm:flex-nowrap bg-[rgb(var(--color-background))] border-b border-[rgb(var(--color-border))] py-2 justify-between items-center px-4 mb-0">
        <h2 className="text-[rgb(var(--color-text-primary))] text-lg font-semibold">Match Odds</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-1 sm:-translate-x-[130px]">
            <span className="bg-[rgb(var(--color-back))] hover:bg-[rgb(var(--color-back-hover))] text-[rgb(var(--color-text-primary))] px-6 py-1 rounded text-xs sm:text-sm font-medium transition-colors">
              Back
            </span>
            <span className="bg-[rgb(var(--color-lay))] hover:bg-[rgb(var(--color-lay-hover))] text-[rgb(var(--color-text-primary))] px-6 py-1 rounded text-xs sm:text-sm font-medium transition-colors">
              Lay
            </span>
          </div>

          {/* <button
              className="bg-[rgb(var(--color-primary))] px-4 rounded-md py-1 text-white hover:bg-[rgb(var(--color-primary-hover))]"
              onClick={calculateCashout}
            >
              Cash Out
            </button> */}
        </div>
      </div>

      <div className=" bg-[rgb(var(--color-background))]">
        {runnersWithOdds.map((runner, index) => {
          const backOdds = (runner.back || []).map((odds) => [odds.price, odds.size]).reverse()
          const layOdds = (runner.lay || []).map((odds) => [odds.price, odds.size])

          return (
            <TeamRow
              key={index}
              teamName={runner.name}
              backOdds={backOdds}
              layOdds={layOdds}
              onOddsClick={handleOddsClick}
              matchData={matchData}
              stake={stake}
              selectedOdd={selectedOdd}
              selectionId={runner.selectionId}
              margin={margin}
              // cashoutData={cashoutData}

            />
          )
        })}
      </div>
    </div>

    {showBetSlip && (
      <div className="lg:hidden my-4">
        {selectedBet ? (
          <BetSlip
            match={selectedBet}
            onClose={() => setSelectedBet(null)}
            setStake={setStake}
            betPlaced={betPlaced}
          />
        ) : (
          <>
          </>
        )}
      </div>
    )}
  </div>
  );
};

MatchOdds.propTypes = {
  eventId: PropTypes.string.isRequired,
  onBetSelect: PropTypes.func.isRequired,
  stake: PropTypes.number.isRequired,
  setStake: PropTypes.func.isRequired,
  showBetSlip: PropTypes.bool.isRequired,
};

export default MatchOdds;
