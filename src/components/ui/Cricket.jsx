/* eslint-disable react/prop-types */
import { lazy } from "react";

const GameOdds = lazy(() => import("../GameOdds"));

const Cricket = ({ liveData, onBetSelect }) => {
  return (
    <div className="">
      <GameOdds liveData={liveData} onBetSelect={onBetSelect} />
    </div>
  );
};

export default Cricket;
