/* eslint-disable react/prop-types */

import PropTypes from "prop-types";
import { lazy, useEffect, useState } from "react";
import io from "socket.io-client";
import { server } from "../../constants/config";

const BetSlip = lazy(() => import("../BetSlip"));

const socket = io(server);

const OddsBox = ({ odds, value, type, onClick }) => {
  const bgColor = type === "back" ? "bg-[#00B2FF]" : "bg-[#FF7A7F]";
  const hoverColor =
    type === "back" ? "hover:bg-[#00A1E6]" : "hover:bg-[#FF6B6F]";

  return (
    <button
      onClick={onClick}
      className={`${bgColor} ${hoverColor} w-full sm:w-12 min-w-[60px] md:w-16 rounded flex flex-col items-center justify-center transition-colors`}
    >
      <span className="text-black font-semibold text-sm sm:text-base">
        {odds}
      </span>
      <span className="text-black text-[10px] lg:text-xs">{value / 1000}K</span>
    </button>
  );
};

OddsBox.propTypes = {
  odds: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  type: PropTypes.oneOf(["back", "lay"]).isRequired,
  onClick: PropTypes.func.isRequired,
};

const TeamRow = ({ teamName, backOdds, layOdds, onOddsClick, matchData }) => {
  return (
    <div className="flex flex-wrap gap-2 sm:flex-nowrap justify-between items-center py-2 border-b border-[#2A3447]">
      <span className="text-white text-sm w-full sm:w-[200px] mb-0 font-semibold sm:mb-0">
        {teamName}
      </span>
      <div className="grid grid-cols-3 sm:flex gap-1 w-full sm:w-auto">
        {backOdds.map(([odds, value], i) => (
          <OddsBox
            key={`back-${i}`}
            odds={odds}
            value={value}
            type="back"
            onClick={() =>
              onOddsClick(matchData, teamName, "Back", odds, value)
            }
          />
        ))}
        {layOdds.map(([odds, value], i) => (
          <OddsBox
            key={`lay-${i}`}
            odds={odds}
            value={value}
            type="lay"
            onClick={() => onOddsClick(matchData, teamName, "Lay", odds, value)}
          />
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
};

// Helper function to arrange runners with draw in the middle
const arrangeRunners = (runners = [], odds = []) => {
  if (!runners.length || !odds.length) return [];
  const draw = runners.find((r) => r?.name === "The Draw");
  const teams = runners.filter((r) => r?.name !== "The Draw");

  return [teams[0], draw, teams[1]].filter(Boolean); // Remove null/undefined values
};

export default function MatchOdds({ eventId, onBetSelect }) {
  const [sportsData, setSportsData] = useState([]);
  const [selectedBet, setSelectedBet] = useState(null);

  const handleOddsClick = (matchData, teamName, type, odds) => {
    const betData = {
      home_team: matchData?.event?.runners?.[0]?.name || "Unknown",
      away_team: matchData?.event?.runners?.[1]?.name || "Unknown",
      eventId: matchData?.event?.event?.id || "",
      marketId: matchData?.event?.market?.id || "",
      selectionId:
        matchData?.event?.runners?.find((r) => r.name === teamName)?.id || null,
      fancyNumber: null,
      stake: 0,
      odds: odds || 0,
      category: "match odds",
      type: type.toLowerCase(),
      gameId: matchData?.market?.id || "",
      eventName: teamName,
      selectedTeam: teamName,
      betType: type,
      size: odds || 0,
    };

    setSelectedBet(betData);
    onBetSelect(betData);
  };

  const handleCloseBetSlip = () => {
    setSelectedBet(null);
  };

  useEffect(() => {
    socket.on("sportsData", (data) => {
      setSportsData(data);
    });

    return () => {
      socket.off("sportsData");
    };
  }, []);

  // Find the correct match data from the nested structure
  const matches = sportsData?.[4]?.[4] || [];
  const matchData = matches.find((match) => match.event?.event?.id === eventId);

  // Get the first odds entry and its runners
  const oddsData = matchData?.odds?.[0];

  // Use arrangeRunners to get properly ordered runners
  const runners = arrangeRunners(
    matchData?.event?.runners,
    oddsData?.runners || []
  );

  // Map the runners to their odds
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

  return (
    <div>
      <div className="bg-[#1a2027] mb-2 rounded-lg overflow-hidden w-full">
        <div className="flex flex-wrap sm:flex-nowrap bg-[#2c3847] py-2 justify-between items-center px-4 mb-0">
          <h2 className="text-white text-lg">Match Odds</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-1 sm:-translate-x-[130px]">
              <span className="bg-[#00B2FF] text-black px-6 py-1 rounded text-xs sm:text-sm font-medium">
                Back
              </span>
              <span className="bg-[#FF7A7F] text-black px-6 py-1 rounded text-xs sm:text-sm font-medium">
                Lay
              </span>
            </div>
          </div>
        </div>

        <div className="py-2 px-4">
          {runnersWithOdds.map((runner, index) => {
            // Format back odds - extract price and size from each back entry
            const backOdds = (runner.back || [])
            .map((odds) => [odds.price, odds.size])
            .reverse(); // Reverses the order
          

            // Format lay odds - extract price and size from each lay entry
            const layOdds = (runner.lay || []).map((odds) => [
              odds.price,
              odds.size,
            ]);

            return (
              <TeamRow
                key={index}
                teamName={runner.name}
                backOdds={backOdds}
                layOdds={layOdds}
                onOddsClick={handleOddsClick}
                matchData={matchData}
              />
            );
          })}
        </div>
      </div>

      {/* BetSlip for mobile */}
      {selectedBet && (
        <div className="lg:hidden my-4">
          <BetSlip match={selectedBet} onClose={handleCloseBetSlip} />
        </div>
      )}
    </div>
  );
}

MatchOdds.propTypes = {
  eventId: PropTypes.string.isRequired,
  onBetSelect: PropTypes.func.isRequired,
};
