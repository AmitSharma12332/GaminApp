import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { server } from "../constants/config";
import { userExist } from "../redux/reducer/userReducer";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Logging In...");

    try {
      const { data } = await axios.post(
        `${server}api/v1/user/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.setItem("authToken", data.token);
      dispatch(userExist(data.user));
      toast.success(data.message, { id: toastId });
      navigate("/");
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message, {
          id: toastId,
        });
      } else {
        toast.error("Something went wrong. Please try again later.", {
          id: toastId,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex">
      {/* Left side with logo */}
      <div className="w-[80%] hidden justify-center items-center lg:flex p-8">
        <div>
          <h1 className="text-4xl max-w-3xl font-bold text-white mb-2">
            Hi, Welcome back
          </h1>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="lg:w-1/2 w-full flex flex-col items-center justify-center pt-4 px-6">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-8">
              Sign in to <span className="text-orange-400">Shaktiex!!</span>
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email *
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password *
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                className="w-full px-6 py-3 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full px-6 py-3 text-sm font-medium text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
              >
                Go to Home
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
