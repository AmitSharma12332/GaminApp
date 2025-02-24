/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import axios from "axios";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { server } from "../../constants/config";

const WebsiteManagement = () => {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const token = localStorage.getItem("authToken");

  // Fetch images
  const fetchImages = async () => {
    try {
      const response = await axios.get(`${server}api/v1/misc/get-images`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setImages(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch images");
    }
  };

  useEffect(() => {
    fetchImages();
  }, []); //Fixed useEffect dependency

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle image upload
  const handleUpload = async () => {
    if (!file || !title) {
      toast.error("Please select a file and enter a title.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);

    try {
      await axios.post(`${server}api/v1/misc/add-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Image uploaded successfully!");
      setFile(null);
      setTitle("");
      fetchImages();
    } catch (error) {
      toast.error("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle image deletion
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${server}api/v1/misc/dlt-image/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Image deleted!");
      fetchImages();
    } catch (error) {
      toast.error("Failed to delete image.");
    }
  };

  return (
    <div className="p-6 mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-200">
        Manage Website Images
      </h2>

      {/* Upload Section */}
      <div className="mb-8 p-6 bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-200">
          Upload New Image
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ImageIcon className="w-5 h-5 mr-2" />
              {file ? file.name : "Choose file"}
            </label>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Image Title"
            className="w-full sm:w-auto text-black flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className={`w-full sm:w-auto px-4 py-2 rounded-md text-white font-medium ${
              isUploading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            } transition duration-150 ease-in-out flex items-center justify-center`}
          >
            {isUploading ? (
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <Upload className="w-5 h-5 mr-2" />
            )}
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {/* Images Table */}
      <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className=" text-left">
              <th className="px-6 py-3 text-xs font-medium text-gray-200 uppercase tracking-wider">
                Image Title
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-200 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {images?.map((img) => (
              <tr key={img.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {img.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDelete(img._id)}
                    className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WebsiteManagement;
