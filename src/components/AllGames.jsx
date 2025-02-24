/* eslint-disable react/prop-types */
import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Static sports data with live cricket data to be added
const staticSports = [
  {
    name: "Soccer",
    count: 0,
    icon: "⚽",
    subItems: [],
  },
  {
    name: "Tennis",
    count: 0,
    icon: "🎾",
    subItems: [],
  },
  {
    name: "Politics",
    count: 0,
    icon: "🗣️",
    subItems: [],
  },
  {
    name: "Basketball",
    count: 0,
    icon: "🏀",
    subItems: [],
  },
  {
    name: "Horse Racing",
    count: 0,
    icon: "🏇",
    subItems: [],
  },
  {
    name: "Greyhound Racing",
    count: 0,
    icon: "🐕",
    subItems: [],
  },
  {
    name: "Kabaddi",
    count: 0,
    icon: "🤼",
    subItems: [],
  },
  {
    name: "Boxing",
    count: 0,
    icon: "🥊",
    subItems: [],
  },
];

const AllGames = ({ sportsData }) => {
  const [openSport, setOpenSport] = useState(null);
  const [openSeries, setOpenSeries] = useState(null);
  const [cricketGames, setCricketGames] = useState([]);
  const [totalGames, setTotalGames] = useState(0);

  const handleSportsData = (data) => {
    try {
      // Safely access nested data with optional chaining
      const cricketData = data?.[4]?.[4] || [];

      // Group games by series with error handling
      const seriesGroups = cricketData.reduce((acc, match) => {
        if (!match?.event?.series?.name) return acc;

        const seriesName = match.event.series.name;
        if (!acc[seriesName]) {
          acc[seriesName] = [];
        }

        // Only add the match if it has the required data
        if (match.event?.event) {
          acc[seriesName].push({
            id: match.event.event.id,
            name: match.event.event.name,
            startDate: match.event.event.startDate,
            inPlay: match.odds?.[0]?.inplay || false,
          });
        }

        return acc;
      }, {});

      // Convert to subItems format with error handling
      const subItems = Object.entries(seriesGroups).map(
        ([series, matches]) => ({
          name: series,
          count: matches.length,
          games: matches,
        })
      );

      // Update cricket games with series grouping
      setCricketGames(subItems);

      // Update total games count
      const cricketCount = cricketData.length;
      const otherSportsCount = staticSports.reduce(
        (acc, sport) => acc + sport.count,
        0
      );
      setTotalGames(cricketCount + otherSportsCount);
    } catch (error) {
      console.error("Error processing sports data:", error);
      // Set default values in case of error
      setCricketGames([]);
      setTotalGames(staticSports.reduce((acc, sport) => acc + sport.count, 0));
    }
  };

  useEffect(() => {
    if (sportsData) {
      handleSportsData(sportsData);
    }
  }, [sportsData]);

  // Combine cricket with other sports
  const sports = [
    {
      name: "Cricket",
      count: cricketGames.reduce((acc, series) => acc + series.count, 0),
      icon: "🏏",
      subItems: cricketGames,
    },
    ...staticSports,
  ];

  return (
    <div className="lg:h-[calc(100vh-64px)] h-full bg-[#21252b] lg:border mt-2 rounded-lg border-dashed border-zinc-700 text-gray-300 p-4 w-full">
      <div className="mb-2">
        <span className="text-xs text-gray-500">SPORTS</span>
        <span className="float-right text-[#3ea6ff] text-sm">{totalGames}</span>
      </div>

      <div className="space-y-1">
        {sports.map((sport) => (
          <div key={sport.name}>
            <button
              onClick={() =>
                setOpenSport(openSport === sport.name ? null : sport.name)
              }
              className="flex items-center w-full px-2 py-1.5 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <span className="mr-2">{sport.icon}</span>
              <span className="text-lg">{sport.name}</span>
              <span className="ml-auto text-[#3ea6ff]">{sport.count}</span>
              {sport.subItems?.length > 0 && (
                <span className="ml-2">
                  {openSport === sport.name ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </span>
              )}
            </button>

            {openSport === sport.name && sport.subItems?.length > 0 && (
              <div className="ml-7 space-y-1 mt-1">
                {sport.subItems.map((series) => (
                  <div key={series.name}>
                    <div
                      onClick={() =>
                        setOpenSeries(
                          openSeries === series.name ? null : series.name
                        )
                      }
                      className="flex items-center px-2 py-1.5 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <span className="text-sm">{series.name}</span>
                      <span className="ml-auto text-[#3ea6ff]">
                        {series.count}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 ml-2 transition-transform ${
                          openSeries === series.name ? "rotate-90" : ""
                        }`}
                      />
                    </div>

                    {/* Events under series */}
                    {openSeries === series.name && (
                      <div className="ml-4 mt-1 space-y-1">
                        {series.games?.map((game) => (
                          <div
                            key={game.id}
                            className="flex flex-col px-2 py-1.5 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              {/* {game.inPlay && (
                                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                              )} */}
                              <Link
                                to={`/match/${game.id}`}
                                className="text-sm text-gray-300 hover:text-blue-400 transition-colors"
                              >
                                {game.name}
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllGames;
