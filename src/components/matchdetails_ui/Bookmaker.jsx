import { lazy, memo, useState } from "react";
import PropTypes from "prop-types";
import isEqual from "lodash/isEqual";

const BetSlip = lazy(() => import("../BetSlip"));

const BookmakerComponent = ({ data, onBetSelect }) => {
  const [selectedBet, setSelectedBet] = useState(null);

  // Filter out markets with empty odds arrays
  const validMarkets = data.filter(
    (market) =>
      Array.isArray(market.odds?.runners) && market.odds.runners.length > 0
  );

  const handleOddsClick = (market, runner, type, odds) => {
    const betData = {
      home_team: market?.eventDetails?.runners?.[0]?.name || "Unknown",
      away_team: market?.eventDetails?.runners?.[1]?.name || "Unknown",
      eventId: market?.eventId || "",
      marketId: market?.market?.id || "",
      selectionId: runner?.selectionId || null,
      stake: 0,
      fancyNumber: null,
      category: "bookmaker",
      type: type.toLowerCase(),
      gameId: market?.market?.id || "",
      eventName: market?.market?.name || "Unknown Market",
      selectedTeam: runner?.name || market.market?.name,
      size: odds?.price || 0,
      betType: type,
      odds: odds?.price || 0,
      marketName: market?.market?.name || "Unknown Market",
      runnerName: runner?.name || "Unknown Runner",
    };

    setSelectedBet(betData);
    onBetSelect(betData);
  };

  const renderOddsBox = (odds, market, runner, type) => {
    const isActive = odds  && odds.size > 0;

    if (!isActive) {
      return (
        <button
          className={`w-full sm:w-12 lg:min-w-[100px] min-w-[70px] md:w-16 h-10 ${
            type === "Back"
              ? isActive
                ? "bg-[#00B2FF] hover:bg-[#00A1E6]"
                : "bg-[#00b3ff36]"
              : isActive
              ? "bg-[#FF7A7F] hover:bg-[#FF6B6F]"
              : "bg-[#ff7a7e42]"
          } rounded flex flex-col items-center justify-center transition-colors`}
        >
          <span className="text-red-500 font-semibold text-xs">Suspended</span>
        </button>
      );
    }

    return (
      <button
        className={`w-full sm:w-12 lg:min-w-[100px] min-w-[70px] md:w-16 h-10 ${
          type === "Back"
            ? "bg-[#00B2FF] hover:bg-[#00A1E6]"
            : "bg-[#FF7A7F] hover:bg-[#FF6B6F]"
        } rounded flex flex-col items-center justify-center transition-colors`}
        onClick={() => handleOddsClick(market, runner, type, odds)}
      >
        <span className="text-black text-sm font-semibold">
          {odds.price.toFixed(2)}
        </span>
        <span className="text-black text-[10px] lg:text-xs">
          {Math.floor(odds.size)}
        </span>
      </button>
    );
  };

  const getRunnerDisplayName = (runner, market) => {
    const marketName = market.market.name.toLowerCase();
    if (
      marketName.includes("tied match") ||
      marketName.includes("completed match") ||
      marketName.includes("to win the toss")
    ) {
      const matchingRunner = market.runners.find(
        (r) => r.id === runner.selectionId
      );
      if (matchingRunner && matchingRunner.name) {
        return matchingRunner.name;
      }
    }
    return runner.name || "Unknown";
  };

  if (!Array.isArray(data)) {
    return <div className="text-white">No bookmaker data available</div>;
  }

  return (
    <div className="space-y-2 mt-2">
      {validMarkets.map((market, index) => (
        <div
          key={`${market.market?.id || index}`}
          className="bg-[#1a2027] rounded-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-3 py-3 bg-[#2c3847]">
            <h1 className="text-white font-medium w-full sm:w-auto mb-2 sm:mb-0">
              {market.market?.name === "Bookmaker 0%Comm"
                ? "Bookmaker"
                : market.market?.name || "Unknown Market"}
            </h1>
            <div className="flex flex-row sm:flex-nowrap items-center gap-1 w-full sm:w-auto justify-end sm:justify-end">
              <span className="text-xs bg-[#00B2FF] sm:text-sm text-center w-full max-w-[70px] lg:min-w-[100px] sm:w-20 text-black py-1 rounded font-semibold">
                Back
              </span>
              <span className="text-xs sm:text-sm bg-[#FF7A7F] w-full text-center max-w-[65px] lg:min-w-[100px] sm:w-20 text-black py-1 rounded font-semibold">
                Lay
              </span>
            </div>
          </div>

          {/* Odds Grid */}
          <div className="divide-y divide-[#2c3847]">
            {market.odds?.runners?.map((runner, runnerIndex) => {
              const displayName = getRunnerDisplayName(runner, market);
              const isSuspended = runner.status === "SUSPENDED";

              return (
                <div key={runnerIndex} className="flex items-center p-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-white">
                      <span>{displayName}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-fit">
                    {isSuspended ? (
                      <div className="col-span-2 flex items-center justify-center h-10 bg-[#1a2027] rounded">
                        <span className="text-red-500 text-center flex justify-center items-center font-semibold text-xs">
                          Suspended
                        </span>
                      </div>
                    ) : (
                      <>
                        {renderOddsBox(
                          runner.back?.[0],
                          market,
                          runner,
                          "Back"
                        )}
                        {renderOddsBox(runner.lay?.[0], market, runner, "Lay")}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile BetSlip */}
          {selectedBet && selectedBet.gameId === market.market.id && (
            <div className="lg:hidden mt-2">
              <BetSlip
                key={`betslip-${market.market.id}`}
                match={selectedBet}
                onClose={() => setSelectedBet(null)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

BookmakerComponent.propTypes = {
  data: PropTypes.array.isRequired,
  onBetSelect: PropTypes.func.isRequired,
};

const arePropsEqual = (prevProps, nextProps) => {
  return (
    isEqual(prevProps.data, nextProps.data) &&
    prevProps.onBetSelect === nextProps.onBetSelect
  );
};

const Bookmaker = memo(BookmakerComponent, arePropsEqual);
Bookmaker.displayName = "Bookmaker";

export default Bookmaker;
