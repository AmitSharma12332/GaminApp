/* eslint-disable react/prop-types */
import { lazy, useCallback, useState } from "react";
import { Link } from "react-router-dom";

const BetSlip = lazy(() => import("./BetSlip"));

const GameOdds = ({ liveData, onBetSelect }) => {
  const [selectedBet, setSelectedBet] = useState(null);
  // Access the correct data structure
  const games = liveData?.[4]?.[4] || [];

  const sortedGames = games.sort((a, b) => {
    return (b.odds?.[0]?.inplay ? 1 : 0) - (a.odds?.[0]?.inplay ? 1 : 0);
  });

  const handleOddsClick = (game, team, type, odds) => {
    const betData = {
      home_team: game?.event?.runners?.[0]?.name || "Unknown",
      away_team: game?.event?.runners?.[1]?.name || "Unknown",
      eventId: game?.event?.event?.id || "",
      marketId: game?.odds?.[0]?.marketId || "",
      selectionId:
        game?.event?.runners?.find((r) => r.name === team)?.id || null,
      fancyNumber: null,
      stake: 0,
      odds: odds || 0,
      category: "match odds",
      type: type.toLowerCase(),
      gameId: game?.event?.event?.id || "",
      eventName: game?.event?.event?.name || "Unknown Market",
      selectedTeam: team,
      betType: type,
      size: 0,
    };
    setSelectedBet(betData);
    onBetSelect(betData);
  };

  const handleCloseBetSlip = useCallback(() => {
    setSelectedBet(null);
  }, []);

  // Helper function to get the best back/lay price
  const getBestPrice = (prices) => {
    if (!prices || prices?.length === 0) return "-";
    return prices[0].price.toFixed(2);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper function to arrange runners with draw in middle
  const arrangeRunners = (runners = [], odds = []) => {
    if (!runners?.length || !odds?.length) return [];
    const draw = runners.find((r) => r?.name === "The Draw");
    const teams = runners.filter((r) => r?.name !== "The Draw");
    const arrangedRunners = [
      {
        runner: teams[0],
        odds: odds.find((o) => o?.selectionId === teams[0]?.id),
      },
      { runner: draw, odds: odds.find((o) => o?.selectionId === draw?.id) },
      {
        runner: teams[1],
        odds: odds.find((o) => o?.selectionId === teams[1]?.id),
      },
    ];
    return arrangedRunners;
  };

  const renderOddsBox = (game, runner, odds) => (
    <div className="flex flex-col gap-1 items-center">
      <h1 className="text-xs font-semibold truncate w-full text-center">
        {runner?.name || ""}
      </h1>
      <div className="grid grid-cols-2 gap-1 w-full">
        {runner && odds ? (
          <>
            <button
              onClick={() =>
                handleOddsClick(
                  game,
                  runner.name,
                  "Back",
                  getBestPrice(odds.back)
                )
              }
              className="w-full bg-[#00b2ff] justify-center items-center rounded-sm h-8 text-black text-sm font-semibold"
            >
              {getBestPrice(odds.back)}
            </button>
            <button
              onClick={() =>
                handleOddsClick(
                  game,
                  runner.name,
                  "Lay",
                  getBestPrice(odds.lay)
                )
              }
              className="w-full bg-[#ff7a7f] rounded-sm h-8 text-black text-sm font-semibold flex items-center justify-center"
            >
              {getBestPrice(odds.lay)}
            </button>
          </>
        ) : (
          <>
            <div className="w-full h-8 bg-[#ff7a7e42] rounded-sm">-</div>
            <div className="w-full h-8 bg-[#00b3ff36] rounded-sm">-</div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="pt-2">
      <div className="flex gap-2 flex-col">
        {sortedGames && sortedGames?.length > 0 ? (
          sortedGames.map((game, index) => {
            const arrangedRunners = arrangeRunners(
              game.event?.runners,
              game.odds?.[0]?.runners
            );

            return (
              <div key={game.event?.event?.id || index}>
                <div className="bg-[#242a31] border border-dashed border-zinc-700 flex flex-col md:flex-row justify-between px-3 py-3 rounded-lg">
                  {/* Game Header */}
                  <div className="w-full md:w-1/2 mb-2 md:mb-0">
                    <div className="flex items-center gap-2 text-xs">
                      {game.odds[0]?.inplay && (
                        <div className="flex justify-center flex-col mr-3 items-center">
                          <h1 className="text-xs font-semibold text-green-400">
                            LIVE
                          </h1>
                          <span className="h-0.5 w-6 animate-ping bg-green-500" />
                        </div>
                      )}

                      <span className="text-blue-400 uppercase font-semibold">
                        {game.event?.sport?.name}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-blue-400 uppercase font-semibold">
                        {game.event?.series?.name}
                      </span>
                    </div>
                    <Link
                      to={`/match/${game.event?.event?.id}`}
                      className="block mt-1 hover:text-blue-400"
                    >
                      <div className="flex justify-between items-center mt-2">
                        <div className="">
                          <h3 className="text-white font-medium text-lg">
                            {arrangedRunners[0]?.runner?.name || "Team 1"}
                          </h3>
                          <h3 className="text-white font-medium text-lg">
                            {arrangedRunners[2]?.runner?.name || "Team 2"}
                          </h3>
                        </div>
                      </div>
                    </Link>

                    {/* Live indicator and markets count */}
                    <div className="w-full justify-between items-center flex gap-2">
                      <h1 className="text-xs flex justify-center items-center text-yellow-500">
                        {game.odds?.length || 0}
                        {"  "}
                        <span className="pl-1">MARKETS</span>
                      </h1>
                      <h1 className="text-sm text-gray-400 w-full">
                        {formatDate(game.event?.event?.startDate)}
                      </h1>{" "}
                    </div>
                  </div>

                  {/* Odds Section */}
                  <div className="grid grid-cols-3 gap-2 w-full md:w-full md:ml-24">
                    {renderOddsBox(
                      game,
                      arrangedRunners[0]?.runner,
                      arrangedRunners[0]?.odds
                    )}
                    {arrangedRunners[1]?.runner ? (
                      renderOddsBox(
                        game,
                        arrangedRunners[1]?.runner,
                        arrangedRunners[1]?.odds
                      )
                    ) : (
                      <div className="flex flex-col gap-1 items-center">
                        <h1 className="text-xs font-semibold">The Draw</h1>
                        <div className="grid grid-cols-2 gap-1 w-full">
                          <div className="w-full flex justify-center items-center h-8 bg-[#ff7a7e42] rounded-sm">
                            -
                          </div>
                          <div className="w-full flex justify-center items-center h-8 bg-[#00b3ff36] rounded-sm">
                            -
                          </div>
                        </div>
                      </div>
                    )}
                    {renderOddsBox(
                      game,
                      arrangedRunners[2]?.runner,
                      arrangedRunners[2]?.odds
                    )}
                  </div>
                </div>
                {/* BetSlip for mobile */}
                {selectedBet &&
                  selectedBet.gameId === game.event?.event?.id && (
                    <div className="lg:hidden mt-2">
                      <BetSlip
                        match={selectedBet}
                        onClose={handleCloseBetSlip}
                      />
                    </div>
                  )}
              </div>
            );
          })
        ) : (
          <div className="text-white text-center py-4">
            Loading matches for you...
          </div>
        )}
      </div>
    </div>
  );
};

export default GameOdds;
