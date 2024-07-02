import React, { useState } from "react";
import { MdOutlineCameraAlt } from "react-icons/md";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { auth } from "../../utils/firebase";

const LogMeal = () => {
  //state to store the meal rating
  const [mealRating, setMealRating] = useState("");
  //state to store the meal data as an object
  const [mealData, setMealData] = useState({
    mealName: "",
    restaurantName: "",
    carbEstimate: "",
    description: "",
  });
  //state to store the picture uploaded by the user
  const [file, setFile] = useState(null);

  //hook for navigating withing the web app
  const navigate = useNavigate();

  //method to update the mealData state when the inputs change
  const handleChange = (e) => {
    setMealData({ ...mealData, [e.target.name]: e.target.value });
  };

  //method to update the file state when the file input changes
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  //method triggered when the user submits the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    //return if the user has not uploaded a picture
    if (!file) {
      console.error("No picture uploaded");
      return;
    }

    //create a FormData object so the data can be sent to the server
    const data = new FormData();
    const { mealName, restaurantName, carbEstimate, description } = mealData;

    //append the form data to the FormData object
    data.append("mealName", mealName);
    data.append("restaurantName", restaurantName);
    data.append("carbEstimate", carbEstimate);
    data.append("description", description);
    data.append("rating", mealRating);
    data.append("picture", file);

    try {
      //get the current user
      const user = auth.currentUser;
      //case user is authenticated
      if (user) {
        //get the id token
        const token = await user.getIdToken();

        //send a POST request with the form data and authorization header
        const response = await axiosInstance.post("/api/log-meal", data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        //navigate to the /home route
        navigate("/home");
      } else {
        console.log("User not authenticated");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center items-center h-full bg-slate-50">
      <div className="border py-5 px-3 rounded-lg lg:w-[50%] md:w-1/3 shadow-md bg-white">
        <form action="" className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="flex items-center justify-center w-[50%] mx-auto mb-2">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <MdOutlineCameraAlt size={30} style={{ color: "gray" }} />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  (MAX. 800x400px)
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept=".jpg, jpeg, .svg, .png, .bmp, .webp, .heic, .heif, .tiff"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <input
            type="text"
            name="restaurantName"
            id="restaurantName"
            placeholder="Restaurant Name"
            value={mealData.restaurantName}
            onChange={handleChange}
            className="border py-2 px-3 rounded-md"
            required
          />
          <input
            type="text"
            name="mealName"
            id="mealName"
            placeholder="Meal Name"
            value={mealData.mealName}
            onChange={handleChange}
            className="border py-2 px-3 rounded-md"
            required
          />
          <input
            type="text"
            name="carbEstimate"
            id="carbEstimate"
            placeholder="Carb Estimation (grams)"
            value={mealData.carbEstimate}
            onChange={handleChange}
            className="border py-2 px-3 rounded-md"
            required
          />

          <label htmlFor="information" className="mt-5 text-lg font-semibold">
            Additional Information
          </label>
          <textarea
            name="description"
            id="description"
            rows="4"
            value={mealData.description}
            onChange={handleChange}
            className="border py-2 px-3 rounded-md"
          ></textarea>

          <div className="flex flex-col">
            <label htmlFor="accuracy" className="mt-5 text-lg font-semibold">
              Accuracy
            </label>
            <p className="text-xs text-gray-500">
              (Not available until at least 4 hours after the meal consumption
              so the glycemic impact can be evaluated.)
            </p>
          </div>
          <div className="flex justify-around mt-2">
            <div
              onClick={() => setMealRating("ACCURATE")}
              className="flex items-center justify-center px-2 py-1 rounded-md bg-green-500 hover:shadow-md cursor-pointer"
            >
              <p>Accurate</p>
            </div>
            <div
              onClick={() => setMealRating("SLIGHTLY_INACCURATE")}
              className="flex items-center justify-center px-2 py-1 rounded-md bg-yellow-500 hover:shadow-md cursor-pointer"
            >
              <p>Slightly Inaccurate</p>
            </div>
            <div
              onClick={() => setMealRating("INACCURATE")}
              className="flex items-center justify-center px-2 py-1 rounded-md bg-red-500 hover:shadow-md cursor-pointer"
            >
              <p>Inaccurate</p>
            </div>
          </div>

          <button
            type="submit"
            className="mt-5 py-2 border rounded-md text-lg font-semibold cursor-pointer"
          >
            Add Meal
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogMeal;
