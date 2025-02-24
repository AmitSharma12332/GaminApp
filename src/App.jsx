import axios from "axios";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { io } from "socket.io-client";
import ProtectedRoute from "./components/ProtectedRoute";
import { server } from "./constants/config";
import { userExist, userNotExist } from "./redux/reducer/userReducer";

// Lazy loading components for better performance
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

// Socket.io connection
const socket = io(server, { autoConnect: false });

const App = () => {
  const { user, loading } = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();
  const [showsidebar, setShowSideBar] = useState(false);
  const [sportsData, setSportsData] = useState([]);
  const sidebarRef = useRef(null);

  const toggleSidebar = useCallback(() => {
    setShowSideBar((prev) => !prev);
  }, []);

  const handleClickOutside = useCallback((event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setShowSideBar(false);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await axios.get(`${server}api/v1/user/me`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.user.status === "banned") {
          toast.error("Your account has been banned.", { icon: "⚠️" });
          // Clear authToken and log out user
          localStorage.removeItem("authToken");
          dispatch(userNotExist());
          return;
        }

        dispatch(userExist(response.data.user));
      } catch (error) {
        console.log(error);
        dispatch(userNotExist());
      }
    };

    fetchUser();
  }, [dispatch]);

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.on("sportsData", (data) => {
      setSportsData((prevData) =>
        JSON.stringify(prevData) !== JSON.stringify(data) ? data : prevData
      );
    });

    return () => socket.off("sportsData");
  }, []);

  useEffect(() => {
    if (showsidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showsidebar, handleClickOutside]);

  return loading ? (
    <Suspense fallback={<Loader />}>
      <Loader />
    </Suspense>
  ) : (
    <Router>
      <Suspense fallback={<Loader />}>
        <Navbar showsidebar={showsidebar} toggleSidebar={toggleSidebar} />
        {showsidebar && (
          <div
            ref={sidebarRef}
            className="md:col-span-2 lg:hidden fixed top-0 left-0 h-full w-80 bg-[#21252b] overflow-y-auto z-[99] shadow-lg"
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

          {/* Protected Route: Only logged-in users */}
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
          {/* Admin Protected Route */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                adminOnly={true}
                admin={user?.role === "admin"}
              >
                <Layout>
                  <Routes>
                    <Route path="/requests" element={<Allrequests />} />
                    <Route
                      path="/usermanagement"
                      element={<UserManagement />}
                    />
                    <Route path="/management" element={<WebsiteManagement />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster position="bottom-center" />
    </Router>
  );
};

export default App;
