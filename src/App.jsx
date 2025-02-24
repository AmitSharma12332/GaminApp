import axios from "axios";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { io } from "socket.io-client";
import ProtectedRoute from "./components/ProtectedRoute";
import { server } from "./constants/config";
import { userExist, userNotExist } from "./redux/reducer/userReducer";

// Lazy Load Components for Better Performance
const Loader = lazy(() => import("./components/Loader"));
const Navbar = lazy(() => import("./components/Navbar"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const MyBets = lazy(() => import("./pages/MyBets"));
const Casino = lazy(() => import("./pages/Casino"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MatchDetails = lazy(() => import("./pages/MatchDetails"));
const Profile = lazy(() => import("./pages/Profile"));
const AllGames = lazy(() => import("./components/AllGames"));
const Layout = lazy(() => import("./pages/admin/Layout"));
const WebsiteManagement = lazy(() => import("./pages/admin/WebsiteManagement"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const Allrequests = lazy(() => import("./pages/admin/Allrequests"));

// Initialize Socket.io Connection
const socket = io(server, { autoConnect: false });

const App = () => {
  const { user, loading } = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();
  const [showsidebar, setShowSideBar] = useState(false);
  const [sportsData, setSportsData] = useState([]);
  const sidebarRef = useRef(null);

  // Toggle Sidebar
  const toggleSidebar = () => setShowSideBar((prev) => !prev);

  // Close Sidebar on Outside Click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setShowSideBar(false);
      }
    };

    if (showsidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showsidebar]);

  // Fetch User Data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await axios.get(`${server}api/v1/user/me`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.user.status === "banned") {
          toast.error("Your account has been banned.", { icon: "⚠️" });
          localStorage.removeItem("authToken");
          dispatch(userNotExist());
          return;
        }

        dispatch(userExist(response.data.user));
      } catch (error) {
        console.error("User fetch error:", error);
        dispatch(userNotExist());
      }
    };

    fetchUser();
  }, [dispatch]);

  // Handle Real-time Sports Data via Socket.io
  useEffect(() => {
    socket.connect();
    socket.on("sportsData", (data) => {
      setSportsData((prevData) =>
        JSON.stringify(prevData) !== JSON.stringify(data) ? data : prevData
      );
    });

    return () => {
      socket.off("sportsData");
      socket.disconnect();
    };
  }, []);

  return (
    <Router>
      <Suspense fallback={<Loader />}>
        {loading ? (
          <Loader />
        ) : (
          <>
            <Navbar showsidebar={showsidebar} toggleSidebar={toggleSidebar} />
            {showsidebar && (
              <div
                ref={sidebarRef}
                className="fixed top-0 left-0 h-full w-80 bg-[#21252b] overflow-y-auto z-[99] shadow-lg"
              >
                <AllGames sportsData={sportsData} />
              </div>
            )}

            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    sportsData={sportsData}
                    showsidebar={showsidebar}
                    toggleSidebar={toggleSidebar}
                  />
                }
              />
              <Route
                path="/match/:eventId"
                element={<MatchDetails sportsData={sportsData} />}
              />

              <Route path="/casino" element={<Casino />} />
              <Route path="/slot" element={<Casino />} />
              <Route path="/fantasy" element={<Casino />} />

              {/* Public Route: Login */}
              <Route
                path="/login"
                element={
                  <ProtectedRoute isAuthenticated={!user}>
                    <Login />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes: Logged-in Users */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute isAuthenticated={!!user}>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mybets"
                element={
                  <ProtectedRoute isAuthenticated={!!user}>
                    <MyBets />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute
                    isAuthenticated={!!user}
                    adminOnly
                    admin={user?.role === "admin"}
                  >
                    <Layout>
                      <Routes>
                        <Route path="/requests" element={<Allrequests />} />
                        <Route path="/usermanagement" element={<UserManagement />} />
                        <Route path="/management" element={<WebsiteManagement />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            <Toaster position="bottom-center" />
          </>
        )}
      </Suspense>
    </Router>
  );
};

export default App;
