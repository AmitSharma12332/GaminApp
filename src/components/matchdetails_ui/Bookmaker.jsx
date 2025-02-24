/* eslint-disable react/prop-types */
import axios from "axios";
import isEqual from "lodash/isEqual";
import { ChevronRight } from "lucide-react";
import PropTypes from "prop-types";
import { lazy, memo, useCallback, useEffect, useState } from "react";
import { server } from "../../constants/config";
import { calculateNewMargin, calculateProfitAndLoss } from "../../utils/helper";

const BetSlip = lazy(() => import("../BetSlip"));

const OddsBox = ({ odds, value, type, onClick, isSelected }) => {
  const bgColor = type === "Back" ? "bg-[#00B2FF]" : "bg-[#FF7A7F]";
  const hoverColor =
    type === "Back" ? "hover:bg-[#00A1E6]" : "hover:bg-[#FF6B6F]";
  const selectedColor = type === "Back" ? "bg-[#0077B3]" : "bg-[#FF4D55]";

  return (
    <button
      onClick={onClick}
      className={`${
        isSelected ? selectedColor : bgColor
      } ${hoverColor} w-full sm:w-12 lg:min-w-[100px] min-w-[70px] md:w-16 h-10 rounded flex flex-col items-center justify-center transition-colors`}
    >
      <span className="text-black font-semibold text-sm">
        {odds?.toFixed(2)}
      </span>
      <span className="text-black text-[10px] lg:text-xs">
        {Math.floor(value)}
      </span>
    </button>
  );
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
      "bookmaker"
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

  // Filter out zero value odds and take only first index
  const filteredBackOdds = backOdds.filter(([value]) => value > 0).slice(0, 1);
  const filteredLayOdds = layOdds.filter(([value]) => value > 0).slice(0, 1);

  return (
    <div className="flex flex-wrap gap-2 sm:flex-nowrap justify-between items-center py-2 border-b border-[#2A3447]">
      <div className="flex flex-col">
        <span className="text-white text-sm w-full sm:w-[200px] mb-0 font-semibold sm:mb-0">
          {teamName}
        </span>
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
                    ? Math.abs(margin?.profit?.toFixed(0))
                    : Math.abs(margin?.loss?.toFixed(0))
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
                        ? Math.abs(newProfit?.toFixed(0))
                        : Math.abs(newLoss?.toFixed(0))}
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
                            ? profit?.toFixed(0)
                            : loss?.toFixed(0)
                          : selectedOdd?.selectionId === selectionId
                          ? loss?.toFixed(0)
                          : profit?.toFixed(0)
                      )}
                    </span>
                  </>
                ))}
            </>
          )}
        </span>
      </div>
      <div className="grid grid-cols-3 sm:flex gap-1 w-full sm:w-auto">
        {filteredBackOdds.map(([odds, value], i) => (
          <div key={`back-${i}`} className="flex flex-col items-center">
            <OddsBox
              odds={odds}
              value={value}
              type="Back"
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
        {filteredLayOdds.map(([odds, value], i) => (
          <div key={`lay-${i}`} className="flex flex-col items-center">
            <OddsBox
              odds={odds}
              value={value}
              type="Lay"
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

const BookmakerComponent = ({
  data,
  eventId,
  onBetSelect,
  setStake,
  stake,
  showBetSlip = true,
  marginAgain,
}) => {
  const [selectedBet, setSelectedBet] = useState(null);
  const [selectedOdd, setSelectedOdd] = useState(null);
  const [margin, setMargin] = useState(null);

  const bookmakerMarket = data.find(
    (market) =>
      (market.market?.name === "Bookmaker" ||
        market.market?.name === "Bookmaker 0%Comm") &&
      Array.isArray(market.odds?.runners) &&
      market.odds.runners.length > 0
  );

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
            response.data.margins[bookmakerMarket?.market?.id];
          setMargin(marginsData);
        }
      } catch (error) {
        console.error(
          "Error fetching margins:",
          error.response?.data || error.message
        );
      }
    },
    [eventId, bookmakerMarket?.market?.id]
  );

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      getMargins(token);
    }
  }, [getMargins, marginAgain]);

  const handleOddsClick = (
    market,
    teamName,
    type,
    odds,
    value,
    selectionId
  ) => {
    if (value <= 0) return; // Don't handle clicks for zero value odds

    const betData = {
      home_team: market?.eventDetails?.runners?.[0]?.name || "Unknown",
      away_team: market?.eventDetails?.runners?.[1]?.name || "Unknown",
      eventId: market?.eventId || "",
      marketId: market?.market?.id || "",
      selectionId: selectionId,
      stake: stake,
      fancyNumber: null,
      category: "bookmaker",
      type: type.toLowerCase(),
      gameId: market?.market?.id || "",
      eventName: teamName,
      selectedTeam: teamName,
      size: value || 0,
      betType: type,
      odds: odds || 0,
      marketName: market?.market?.name || "Unknown Market",
    };

    setSelectedBet(betData);
    setSelectedOdd({
      selectionId,
      type: type.toLowerCase(),
      odds,
    });
    onBetSelect(betData);
  };

  return (
    <div>
      {bookmakerMarket ? (
        <div className="bg-[#1a2027] mt-2 mb-2 rounded-lg overflow-hidden">
          <div className="flex justify-between items-center px-3 py-3 bg-[#2c3847]">
            <h1 className="text-white font-medium">Bookmaker</h1>
            <div className="flex flex-row sm:flex-nowrap items-center gap-1">
              <span className="text-xs bg-[#00B2FF] sm:text-sm text-center w-[100px] text-black py-1 rounded font-semibold">
                Back
              </span>
              <span className="text-xs sm:text-sm bg-[#FF7A7F] w-[100px] text-center text-black py-1 rounded font-semibold">
                Lay
              </span>
            </div>
          </div>

          <div className="py-2 px-4">
            {bookmakerMarket.odds?.runners?.map((runner) => {
              const backOdds = (runner.back || [])
                .map((odds) => [odds.price, odds.size])
                .reverse();
              const layOdds = (runner.lay || []).map((odds) => [
                odds.price,
                odds.size,
              ]);

              return (
                <TeamRow
                  key={runner.selectionId}
                  teamName={runner.name}
                  backOdds={backOdds}
                  layOdds={layOdds}
                  onOddsClick={handleOddsClick}
                  matchData={bookmakerMarket}
                  stake={stake}
                  selectedOdd={selectedOdd}
                  selectionId={runner.selectionId}
                  margin={margin}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-[#1a2027] p-4 rounded-lg text-white text-center">
          No bookmaker market available
        </div>
      )}

      {showBetSlip && (
        <div className="lg:hidden mt-2">
          {selectedBet ? (
            <BetSlip
              match={selectedBet}
              onClose={() => setSelectedBet(null)}
              setStake={setStake}
            />
          ) : (
            <div className="bg-[#1a2027] p-4 rounded-lg text-white text-center">
              Select an odd to place a bet
            </div>
          )}
        </div>
      )}
    </div>
  );
};

BookmakerComponent.propTypes = {
  data: PropTypes.array.isRequired,
  eventId: PropTypes.string.isRequired,
  onBetSelect: PropTypes.func.isRequired,
  stake: PropTypes.number,
  setStake: PropTypes.func,
  showBetSlip: PropTypes.bool,
};

const arePropsEqual = (prevProps, nextProps) => {
  return (
    isEqual(prevProps.data, nextProps.data) &&
    prevProps.onBetSelect === nextProps.onBetSelect &&
    prevProps.stake === nextProps.stake &&
    prevProps.eventId === nextProps.eventId
  );
};

const Bookmaker = memo(BookmakerComponent, arePropsEqual);
Bookmaker.displayName = "Bookmaker";

export default Bookmaker;
