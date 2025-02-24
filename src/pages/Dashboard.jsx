/* eslint-disable react/prop-types */
import { lazy, useEffect, useRef, useState } from "react";
import Footer from "../components/Footer";

const AllGames = lazy(() => import("./../components/AllGames"));
const GamesHeader = lazy(() => import("./../components/GamesHeader"));
const BetSlip = lazy(() => import("../components/BetSlip"));
const Cricket = lazy(() => import("../components/ui/Cricket"));
const Football = lazy(() => import("../components/ui/Football"));
const Basketball = lazy(() => import("../components/ui/Basketball"));
const ImageCarousel = lazy(() => import("../components/ImageCarousel"));

const Dashboard = ({ showsidebar, toggleSidebar, sportsData }) => {
  const [activeTab, setActiveTab] = useState("cricket");
  const [selectedBet, setSelectedBet] = useState(null);
  const sidebarRef = useRef(null);

  const handleBetSelection = (betData) => {
    setSelectedBet(betData);
  };

  const handleCloseBetSlip = () => {
    setSelectedBet(null);
  };

  // Function to handle clicks outside of sidebar
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        toggleSidebar(false);
      }
    }

    if (showsidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showsidebar, toggleSidebar]);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "cricket":
        return (
          <Cricket liveData={sportsData} onBetSelect={handleBetSelection} />
        );
      case "football":
        return (
          <Football liveData={sportsData} onBetSelect={handleBetSelection} />
        );
      case "basketball":
        return (
          <Basketball liveData={sportsData} onBetSelect={handleBetSelection} />
        );
      case "tennis":
        return (
          <Basketball liveData={sportsData} onBetSelect={handleBetSelection} />
        );
      case "boxing":
        return (
          <Basketball liveData={sportsData} onBetSelect={handleBetSelection} />
        );
      case "horse":
        return (
          <Basketball liveData={sportsData} onBetSelect={handleBetSelection} />
        );
      case "politics":
        return (
          <Basketball liveData={sportsData} onBetSelect={handleBetSelection} />
        );
      case "kabaddi":
        return (
          <Basketball liveData={sportsData} onBetSelect={handleBetSelection} />
        );

      default:
        return <div>Select a sport to display</div>;
    }
  };

  return (
    <>
      <div className="bg-[#21252b] pt-28 px-2 md:pt-12">
        <div className="max-w-full grid grid-cols-1 md:grid-cols-12 lg:h-[calc(100vh-48px)]">
          {/* Sidebar */}
          <div className="md:col-span-2 lg:flex hidden bg-[#21252b] overflow-y-auto">
            <AllGames sportsData={sportsData} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-7 md:col-span-12 rounded-lg p-2 lg:pt-2 lg:overflow-y-auto">
            <ImageCarousel />
            <GamesHeader activeTab={activeTab} setActiveTab={setActiveTab} />
            {renderActiveComponent()}
            <Footer />
          </div>

          {/* Right Sidebar */}
          <div className="md:col-span-3 lg:flex hidden overflow-y-auto">
            <BetSlip match={selectedBet} onClose={handleCloseBetSlip} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
