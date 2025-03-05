/* eslint-disable react/prop-types */
"use client";

import axios from "axios";
import {
  Home,
  Gamepad2,
  Joystick,
  Trophy,
  History,
  Menu,
  X,
  User,
} from "lucide-react";
import { memo, useEffect, useState } from "react";
import isEqual from "react-fast-compare";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { server } from "../constants/config";
import { userNotExist } from "../redux/reducer/userReducer";

const NavbarComponent = ({ toggleSidebar, showsidebar }) => {
  const { user, loading } = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [exposure, setExposure] = useState(0);
  const [wallet, setWallet] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Casino", href: "/casino", icon: Gamepad2 },
    { name: "Slot", href: "/slot", icon: Joystick },
    { name: "Fantasy", href: "/fantasy", icon: Trophy },
    { name: "MyBets", href: "/mybets", icon: History },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const response = await axios.get(`${server}api/v1/user/me`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setWallet(response?.data.user.amount);
      } catch (error) {
        console.log(error);
        dispatch(userNotExist());
      }
    };

    const getTransactions = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      try {
        const response = await axios.get(`${server}api/v1/bet/transactions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          const filteredBets = response.data.bets.filter((bet) => {
            const betDate = new Date(bet.createdAt);
            const currentDate = new Date();
            return (
              betDate.toDateString() === currentDate.toDateString() &&
              bet.category === "fancy" &&
              bet.status === "pending"
            );
          });
          const totalStake = filteredBets.reduce(
            (sum, bet) => sum + bet.stake,
            0
          );
          return totalStake;
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
      return 0;
    };

    const getMargins = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
      return;
      }
    
      try {
      const response = await axios.get(`${server}api/v1/bet/allmargins`, {
        headers: {
        Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        const totalLoss = response.data.margins.reduce((sum, margin) => {
          let maxLoss = 0;
          if (margin.profit < 0 && margin.loss > 0) {
            maxLoss += Math.abs(margin.profit);
          }
          if (margin.profit < 0 && margin.loss < 0) {
            maxLoss += Math.max(Math.abs(margin.profit), Math.abs(margin.loss));
          } else if (margin.loss < 0) {
            maxLoss += Math.abs(margin.loss);
          }
          console.log(`Check: ${maxLoss}`);
          return sum + maxLoss;
        }, 0);
        return totalLoss;
      }
      } catch (error) {
      console.error("Error fetching margins:", error);
      }
      return 0;
    };
  

    const updateExposure = async () => {
      const [totalStake, totalLoss] = await Promise.all([
        getTransactions(),
        getMargins(),
      ]);
      setExposure(totalStake + totalLoss);
    };

    if (user) {
      fetchUser();
      updateExposure();
      const interval = setInterval(() => {
        fetchUser();
        updateExposure();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    dispatch(userNotExist());
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest(".profile-dropdown")) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  return (
    <nav className="bg-[rgb(var(--color-primary))] fixed w-full z-[99] shadow-md">
      <div className="max-w-full mx-auto p-2 sm:px-4">
      <div className="marquee md:hidden flex">
          
        </div>
       
        <div className="flex items-center justify-between h-fit lg:hidden">
          <div className="flex items-center gap-2">
            {showsidebar ? (
              <X className="h-6 w-6 text-white" onClick={toggleSidebar} />
            ) : (
              <Menu className="h-6 w-6 text-white" onClick={toggleSidebar} />
            )}
          <h1 className="flex text-white font-semibold">TRIDENT</h1>
          </div>

          <div className="flex items-center gap-2">
            {!loading && user ? (
              <div className="flex items-center gap-1">
                <div className="flex items-center w-fit gap-2 rounded-full px-4 py-1.5">
                  {/* <Wallet className="h-5 w-5 text-white" /> */}
                  <span className="text-white flex flex-col w-full text-xs">
                    Balance : {wallet.toFixed(2)}
                    <span className="">Exposure : -{exposure}</span>
                  </span>
                </div>
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="text-white text-sm font-medium bg-[rgb(var(--color-primary-dark))] px-3 py-1 rounded-full hover:bg-[rgb(var(--color-primary-darker))] transition-colors"
                  >
                    Profile
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-[rgb(var(--color-primary-dark))] rounded-lg shadow-lg py-1 z-10">
                      <div className="px-3 py-2 border-b border-[rgb(var(--color-primary-darker))]">
                        <p className="text-white text-sm font-medium">
                          {user?.name || "User"}
                        </p>
                      </div>
                      <Link to="/profile">
                        <button className="w-full text-left px-3 py-2 text-white text-sm hover:bg-[rgb(var(--color-primary-darker))] transition-colors">
                          My Profile
                        </button>
                      </Link>
                      {user?.role === "admin" && (
                        <Link to="/admin">
                          <button className="w-full text-left px-3 py-2 text-white text-sm hover:bg-[rgb(var(--color-primary-darker))] transition-colors">
                            Admin Panel
                          </button>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-white text-sm hover:bg-[rgb(var(--color-primary-darker))] transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <button className="text-white text-sm font-medium bg-[rgb(var(--color-primary-dark))] px-3 py-1 rounded-full hover:bg-[rgb(var(--color-primary-darker))] transition-colors">
                    Login
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex h-fit">
          {/* Left: Logo & Company Name */}
          <div className="flex items-center gap-2 w-1/4">
            <img src="/logo.webp" className="h-12 w-12" alt="Logo" />
            <Link to="/">
              <h1 className="text-white font-semibold text-2xl">TRIDENT</h1>
            </Link>
          </div>

          {/* Center: Navigation */}
          <div className="flex items-center justify-center flex-1">
            <div className="flex gap-2">
              {navItems .filter((item) => item.name !== "MyBets" || user).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                    location.pathname === item.href
                      ? "text-orange-900 bg-orange-200"
                      : "text-gray-100 hover:text-orange-900 hover:bg-orange-200"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-base font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Auth & Wallet */}
          <div className="flex items-center justify-end w-1/4 gap-3">
            {!loading && user ? (
              <>
                <div className="flex items-center w-fit gap-2 rounded-full px-4 py-1.5">
                  {/* <Wallet className="h-5 w-5 text-white" /> */}
                  <span className="text-white flex flex-col w-full text-sm">
                    <span className="flex gap-1 justify-start items-center">
                      {" "}
                    </span>{" "}
                    Balance : {wallet.toFixed(2)}
                    <span className="">Exposure : -{exposure}</span>
                  </span>
                </div>
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 text-white bg-[rgb(var(--color-primary-dark))] px-4 py-1.5 rounded-full hover:bg-[rgb(var(--color-primary-darker))] transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[rgb(var(--color-primary-dark))] rounded-lg shadow-lg py-1 z-10">
                      <div className="px-4 py-2 border-b border-[rgb(var(--color-primary-darker))]">
                        <p className="text-white capitalize font-medium">
                          {user?.name || "User"}
                        </p>
                      </div>
                      <Link to="/profile">
                        <button className="w-full text-left px-4 py-2 text-white hover:bg-[rgb(var(--color-primary-darker))] transition-colors">
                          My Profile
                        </button>
                      </Link>
                      {user?.role === "admin" && (
                        <Link to="/admin">
                          <button className="w-full text-left px-4 py-2 text-white hover:bg-[rgb(var(--color-primary-darker))] transition-colors">
                            Admin Panel
                          </button>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-white hover:bg-[rgb(var(--color-primary-darker))] transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login">
                <button className="text-white bg-[rgb(var(--color-primary-dark))] px-4 py-1.5 rounded-full hover:bg-[rgb(var(--color-primary-darker))] transition-colors">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Two Columns */}
        <div className="flex items-center justify-evenly lg:hidden  overflow-auto w-full">
          {navItems .filter((item) => item.name !== "MyBets" || user).map((item, index) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex justify-center gap-1 items-center text-gray-100 py-1 px-2 rounded-lg  transition-colors text-xs font-medium ${
                index === navItems.length - 1 && navItems.length % 2 !== 0
                  ? "col-span-2"
                  : ""
              } ${
                location.pathname === item.href
                  ? "text-orange-900 bg-orange-200"
                  : ""
              }`}
            >
              <item.icon className="h-4 w-4" />

              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

const arePropsEqual = (prevProps, nextProps) => {
  return (
    isEqual(prevProps.toggleSidebar, nextProps.toggleSidebar) &&
    prevProps.showsidebar === nextProps.showsidebar
  );
};

const Navbar = memo(NavbarComponent, arePropsEqual);
Navbar.displayName = "Navbar";

export default Navbar;
