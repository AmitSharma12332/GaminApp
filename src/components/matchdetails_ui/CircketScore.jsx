/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState } from "react";

const CricketScore = ({ eventId }) => {
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId;

    const fetchScores = async () => {
      try {
        const response = await axios.get(
          `https://testscapi.fpl11.com/api/admin/cricketscore?eventid=${eventId}`
        );

        const parser = new DOMParser();
        const doc = parser.parseFromString(response.data, "text/html");

        const teams = doc.querySelectorAll(".team");

        const team1Name =
          teams[0]?.querySelector(".team_name")?.textContent ||
          "Not Started Yet";
        const team1Run = teams[0]?.querySelector(".run")?.textContent || "0/0";
        const team1Over =
          teams[1]?.querySelectorAll(".over")[0]?.textContent || "(0.0)";
        const team1RR =
          teams[0]?.querySelectorAll(".over")[1]?.textContent ||
          "CRR: 0 | RRR: 0.0";

        const team2Name =
          teams[1]?.querySelector(".team_name")?.textContent ||
          "Not Started Yet";
        const team2Run = teams[1]?.querySelector(".run")?.textContent || "0/0";
        const team2Over =
          teams[0]?.querySelectorAll(".over")[0]?.textContent || "(0.0)";
        const team2RR =
          teams[1]?.querySelectorAll(".over")[1]?.textContent ||
          "CRR: 0 | RRR: 0.0";

        const newScoreData = {
          team1: {
            name: team1Name,
            run: team1Run,
            over: team1Over,
            rr: team1RR,
          },
          team2: {
            name: team2Name,
            run: team2Run,
            over: team2Over,
            rr: team2RR,
          },
        };

        setScoreData(newScoreData);
        localStorage.setItem(
          `cricketScore_${eventId}`,
          JSON.stringify(newScoreData)
        );
      } catch (err) {
        console.error("Error fetching scores:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
    intervalId = setInterval(fetchScores, 500);

    return () => clearInterval(intervalId);
  }, [eventId]);

  if (loading)
    return (
      <div className="text-white h-24 w-full flex justify-center items-center text-center">
        Loading scores...
      </div>
    );

  return (
    <div className="p-4 sm:p-6 bg-[#1a2027] border-dashed border-zinc-700 border my-2 rounded-lg">
      <div className="flex flex-wrap justify-between items-center text-white text-xs sm:text-sm">
        <div className="w-full sm:w-auto mb-2 sm:mb-0">
          <h2 className="font-semibold text-sm sm:text-lg">
            {scoreData.team1.name}
          </h2>
          <span className="text-gray-400 text-[10px] sm:text-sm">
            {scoreData.team1.rr}
          </span>
        </div>
        <div className="text-center flex-1">
          <div className="text-base sm:text-xl font-bold">
            {scoreData.team1.run} : {scoreData.team2.run}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-400">
            {scoreData.team2.over} | {scoreData.team1.over}
          </div>
        </div>
        <div className="w-full sm:w-auto text-right">
          <h2 className="font-semibold text-sm sm:text-lg">
            {scoreData.team2.name}
          </h2>
          <span className="text-gray-400 text-[10px] sm:text-sm">
            {scoreData.team2.rr}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CricketScore;
