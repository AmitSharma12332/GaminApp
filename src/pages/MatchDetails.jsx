/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Bookmaker from "../components/matchdetails_ui/Bookmaker";
import Fancy from "../components/matchdetails_ui/Fancy";
import Player from "../components/matchdetails_ui/Player";
import Other from "../components/matchdetails_ui/Other";
import BFancy from "../components/matchdetails_ui/BFancy";
import OddEven from "../components/matchdetails_ui/OddEven";
import Line from "../components/matchdetails_ui/Line";
import MatchOdds from "../components/matchdetails_ui/MatchOdds";
import axios from "axios";
import { useParams } from "react-router-dom";
import Loader from "../components/Loader";
import BetSlip from "../components/BetSlip";
import CricketScore from "../components/matchdetails_ui/CircketScore";
import { server } from "../constants/config";
import AllGames from "../components/AllGames";

const AllComponents = ({ data, onBetSelect }) => {
  return (
    <>
      {Object.entries(data).map(([key, value]) => {
        const Component = tabComponents[key];
        return Component ? (
          <div key={key} className="mb-8">
            <Component data={value} onBetSelect={onBetSelect} />
          </div>
        ) : null;
      })}
    </>
  );
};

const tabComponents = {
  all: AllComponents,
  bookmaker: Bookmaker,
  fancy: Fancy,
  player: Player,
  over: Other,
  b_fancy: BFancy,
  odd_even: OddEven,
  line: Line,
};

const MatchDetails = ({ sportsData }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [data, setData] = useState(null);
  const [bookmakers, setBookmakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { eventId } = useParams();
  const [selectedBet, setSelectedBet] = useState(null);

  useEffect(() => {
    if (!eventId) {
      setError("Event ID is missing.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${server}api/v1/getMarkets?eventId=${eventId}`
        );

        if (response.status !== 200) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        setBookmakers(response.data.getBookmaker);
        setData(response.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err.response?.data?.message ||
            "Failed to fetch market data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 500);

    return () => clearInterval(intervalId);
  }, [eventId]);

  const categorizedData = useMemo(() => {
    if (!data) return null;

    const categorizeMarkets = (rawData) => {
      const categories = {
        bookmaker: rawData.getBookmaker.map((market) => ({ ...market, eventDetails: rawData.eventDetail })) || [],
        fancy: [],
        player: [],
        over: [],
        b_fancy: [],
        odd_even: [],
        line: [],
      };

      if (rawData.getFancy) {
        rawData.getFancy.forEach((market) => {
          const marketWithEventDetails = { ...market, eventDetails: rawData.eventDetail }
          const name = market.market.name.toLowerCase()
          if (name.includes("only")) {
            categories.over.push(marketWithEventDetails)
          } else if (name.includes("over")) {
            categories.fancy.push(marketWithEventDetails)
          } else if (name.includes("total")) {
            categories.odd_even.push(marketWithEventDetails)
          } else if (
            name.includes("innings") ||
            name.includes("top") ||
            name.includes("most") ||
            name.includes("highest")
          ) {
            categories.line.push(marketWithEventDetails)
          } else if (name.startsWith("fall of") || name.startsWith("caught") || name.startsWith("match ")) {
            categories.b_fancy.push(marketWithEventDetails)
          } else {
            categories.player.push(marketWithEventDetails)
          }
        })
      }
      return Object.fromEntries(
        Object.entries(categories).filter(([_, value]) => value.length > 0)
      );
    };

    return categorizeMarkets(data);
  }, [data]);

  const fancyData = useMemo(() => {
    return categorizedData?.fancy || [];
  }, [categorizedData]);

  const handleBetSelection = useCallback((bet) => {
    setSelectedBet(bet);
  }, []);

  const activeComponent = useMemo(() => {
    if (!categorizedData) return null;

    if (activeTab === "all") {
      return (
        <AllComponents
          data={categorizedData}
          onBetSelect={handleBetSelection}
        />
      );
    }

    const ActiveComponent = tabComponents[activeTab];
    if (!ActiveComponent) return null;

    return (
      <ActiveComponent
        onBetSelect={handleBetSelection}
        data={categorizedData[activeTab]}
      />
    );
  }, [activeTab, categorizedData, handleBetSelection]);

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

  if (loading) return <Loader message="Loading match details..." />;
  if (error)
    return <p className="text-red-500 p-4 text-center">Error: {error}</p>;

  return (
    <div className="bg-[#21252b] pt-28 px-2 md:pt-12">
      <div className="max-w-full grid grid-cols-1 md:grid-cols-12 lg:h-[calc(100vh-48px)]">
        <div className="md:col-span-2 lg:flex hidden bg-[#21252b] overflow-y-auto">
          <AllGames sportsData={sportsData} />
        </div>
        {/* Main Content */}

        <div className="lg:col-span-7 md:col-span-12 rounded-lg p-2 lg:pt-2 lg:overflow-y-auto">
          {/* Match Score */}
          <div className="p-4 bg-[#262a31] border-dashed border-zinc-700 rounded-lg border">
            <div className="flex flex-col">

            <h1 className="text-2xl font-semibold">
              {data?.eventDetail?.event.name}
            </h1>
            </div>
            <div className="flex items-start justify-between flex-col md:flex-row mt-1 text-gray-400">
              <p>
              {formatDate(data?.eventDetail?.event.startDate)}
              </p>
              <p className=" text-blue-400">
              {data?.eventDetail?.series.name}
            </p>
            </div>
          </div>

          <CricketScore eventId={eventId} />

          {/* Match Odds */}
          <MatchOdds onBetSelect={handleBetSelection} eventId={eventId} />

          {/* Navigation Tabs */}
          <div className="flex gap-1 lg:gap-2 bg-[#262a31] border-dashed border-zinc-700 overflow-x-auto rounded-lg border p-2">
            <button
              key="all"
              className={`px-6 rounded-md py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "all"
                  ? "bg-blue-500"
                  : "text-gray-400 hover:text-blue-500"
              }`}
              onClick={() => setActiveTab("all")}
            >
              ALL
            </button>
            {Object.keys(categorizedData || {}).map((tab) => (
              <button
                key={tab}
                className={`px-3 rounded-md py-2 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab
                    ? "bg-blue-500 "
                    : "text-gray-400 hover:text-blue-500"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Dynamic Content Rendering */}
          {activeComponent}
        </div>

        {/* Bet Slip - Fixed on Right for Large Screens, Moves Below for Small Screens */}
        <div className="md:col-span-3 lg:flex hidden overflow-y-auto">
          <BetSlip match={selectedBet} onClose={() => setSelectedBet(null)} />
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;
