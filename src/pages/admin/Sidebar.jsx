/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";

const menuItems = [
  { id: "dashboard", icon: "📊", label: "Dashboard", href: "/admin" },
  { id: "users", icon: "👥", label: "Users", href: "/admin/usermanagement" },
  { id: "requests", icon: "🛍️", label: "All Bets", href: "/admin/requests" },
  { id: "settings", icon: "⚙️", label: "Settings", href: "/admin/management" },
];

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* Hamburger button for mobile */}
      <button
        className="fixed top-28 left-2 z-20 lg:hidden bg-gray-800 text-white p-2 rounded-md"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-24 lg:top-0  bg-gray-800 left-0 z-30 w-64  text-white h-full transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <div className="p-4">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>
        <nav>
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false); // Close sidebar on mobile after selection
                  }}
                  className={`block my-1 p-4 hover:bg-gray-700 transition-colors ${
                    activeTab === item.id ? "bg-gray-700" : ""
                  }`}
                >
                  <span className="mr-2" role="img" aria-label={item.label}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Overlay to close sidebar on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
