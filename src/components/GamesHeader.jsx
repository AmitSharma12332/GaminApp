/* eslint-disable react/prop-types */
import { User } from "lucide-react";
import { FaBasketballBall, FaFutbol, FaHorse } from "react-icons/fa";
import {
  GiBoxingGloveSurprise,
  GiCricketBat,
  GiHeavyFighter,
  GiTennisBall,
} from "react-icons/gi";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

const GamesHeader = ({ activeTab, setActiveTab }) => {
  const sports = [
    { name: "Cricket", icon: <GiCricketBat />, key: "cricket" },
    { name: "Football", icon: <FaFutbol />, key: "football" },
    { name: "Tennis", icon: <GiTennisBall />, key: "tennis" },
    { name: "Boxing", icon: <GiBoxingGloveSurprise />, key: "boxing" },
    { name: "Basketball", icon: <FaBasketballBall />, key: "basketball" },
    { name: "Horse Racing", icon: <FaHorse />, key: "horse" },
    { name: "Kabbadi", icon: <GiHeavyFighter />, key: "kabbadi" },
    { name: "Politics", icon: <User />, key: "politics" },
  ];

  return (
    <div className="h-fit w-full border overflow-x-auto bg-[#242a31] border-zinc-700 border-dashed rounded-lg p-2 flex items-center">
      {sports.map((sport) => (
        <div
          key={sport.key}
          className={`flex items-center justify-center cursor-pointer px-4 py-1 gap-2.5 ${
            activeTab === sport.key
              ? " bg-blue-500 text-white rounded-md"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab(sport.key)}
        >
          <div>{sport.icon}</div>
          <h1 className="whitespace-nowrap">{sport.name}</h1>
        </div>
      ))}
    </div>
  );
};

export default GamesHeader;
