/* eslint-disable react/prop-types */
import { lazy, useMemo } from "react";

const GameOdds = lazy(() => import("../GameOdds"));

const Cricket = ({ liveData, onBetSelect }) => {
  const sortedLiveData = useMemo(() => {
    // Return original data if not valid
    if (!liveData?.[4]?.[4] || !Array.isArray(liveData[4][4])) return liveData;

    try {
      // Create a deep copy of liveData
      const newLiveData = JSON.parse(JSON.stringify(liveData));

      // Sort matches array based on event.event.startDate
      newLiveData[4][4] = newLiveData[4][4].sort((a, b) => {
        const dateA = a?.event?.event?.startDate
          ? new Date(a.event.event.startDate).getTime()
          : 0;
        const dateB = b?.event?.event?.startDate
          ? new Date(b.event.event.startDate).getTime()
          : 0;
        return dateA - dateB;
      });

      return newLiveData;
    } catch (error) {
      console.error("Error sorting live data:", error);
      return liveData;
    }
  }, [liveData]);

  return (
    <div className="">
      <GameOdds liveData={sortedLiveData} onBetSelect={onBetSelect} />
    </div>
  );
};

export default Cricket;
