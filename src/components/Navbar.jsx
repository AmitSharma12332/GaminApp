/* eslint-disable react/prop-types */
import axios from "axios";
import { Menu, Wallet, X } from "lucide-react";
import { memo, useEffect, useState } from "react";
import isEqual from "react-fast-compare";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { server } from "../constants/config";
import { userNotExist } from "../redux/reducer/userReducer";

const NavbarCompoennt = ({ toggleSidebar, showsidebar }) => {
  const { user, loading } = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(0);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Casino", href: "/casino" },
    { name: "Slot", href: "/slot" },
    { name: "Fantasy", href: "/fantasy" },
    { name: "My Bets", href: "/mybets" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return; // Don't call API if no token

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

    if (user) {
      fetchUser(); // Initial fetch
      const interval = setInterval(fetchUser, 1000); // Call API every 1 second

      return () => clearInterval(interval); // Cleanup on component unmount
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    dispatch(userNotExist()); // Clear user from Redux state
    navigate("/login");
  };

  return (
    <nav className="bg-[#1a2027] bg-opacity-70 backdrop-blur-lg  fixed w-full z-[99]">
      <div className="max-w-full mx-auto px-4">
        <div className="h-8 justify-start items-center  gap-2 md:hidden flex">
          <img src="/logo.webp" className="h-6 w-6" alt="" />
          <h1 className="text-yellow-500 font-semibold">SHAKTI EXCHANGE</h1>
        </div>
        <div className="flex items-center justify-between lg:justify-between h-12">
          <div className="flex items-center gap-3">
            {showsidebar ? (
              <X className="lg:hidden flex" onClick={toggleSidebar} />
            ) : (
              <Menu className="lg:hidden flex" onClick={toggleSidebar} />
            )}
            <div className="flex gap-2 justify-center items-center">
              <img
                src="/logo.webp"
                className="h-12 hidden md:flex w-12"
                alt=""
              />
              <h1 className=" capitalize text-yellow-500 hidden md:flex font-semibold text-base md:text-2xl">
                Shaktiex
              </h1>
            </div>
          </div>
          <div className=" hidden md:flex gap-2 py-2 text-center">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block text-gray-300  hover:text-blue-500 hover:border-b border-blue-500 md:px-3 md:py-2  text-base font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center">
            {!loading && user ? (
              <div className="flex gap-2">
                <div className="flex gap-2 cursor-default justify-center items-center text-sm rounded-full px-4 py-1 text-white font-semibold">
                  <Wallet className="text-white flex text-sm" />
                  <span className="hidden md:flex">Wallet :</span>

                  <span className="uppercase text-sm">
                    {user?.currency} {wallet.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="border border-zinc-500 text-sm text-white md:px-4 px-1 py-1 rounded-md hover:bg-blue-500 transition duration-150"
                >
                  Logout
                </button>
                {user?.role === "admin" ? (
                  <Link to="/admin">
                    <button className="border border-zinc-500 text-sm text-white md:px-4 px-1 py-1 rounded-md hover:bg-blue-500 transition duration-150">
                      Admin
                    </button>
                  </Link>
                ) : (
                  <Link to="/profile">
                    <button className="border border-zinc-500 text-sm text-white px-4 py-1 rounded-md hover:bg-blue-500 transition duration-150">
                      Profile
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <Link to={"/login"}>
                <button className="border border-zinc-500 text-white px-4 py-1 rounded-md hover:bg-blue-500 transition duration-150">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className=" md:hidden flex pb-2 justify-center text-center">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="block text-gray-300 text-sm hover:bg-blue-500 hover:text-white px-3 py-1 rounded-md  font-medium"
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

const arePropsEqual = (prevProps, nextProps) => {
  return (
    isEqual(prevProps.toggleSidebar, nextProps.toggleSidebar) &&
    prevProps.toggleSidebar === nextProps.toggleSidebar
  );
};

const Navbar = memo(NavbarCompoennt, arePropsEqual);
Navbar.displayName = "Navbar";

export default Navbar;
