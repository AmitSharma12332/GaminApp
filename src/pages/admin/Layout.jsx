/* eslint-disable react/prop-types */
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Fixed */}
      <div className="  text-black z-[99] fixed h-full">
        <Sidebar />
      </div>

      {/* Right Content - Scrollable */}
      <div className="lg:ml-64 flex-1 p-6 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Layout;
