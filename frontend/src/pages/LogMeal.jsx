import React, { useState } from "react";
import { MdOutlineCameraAlt } from "react-icons/md";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { auth } from "../../utils/firebase";
import socket from "../../utils/socket";

//All the code in this file was written without assistance 

const LogMeal = () => {
  //get the current user
  const user = auth.currentUser;
  //state to store the meal data as an object
  const [mealData, setMealData] = useState({
    mealName: "",
    restaurantName: "",
    carbEstimate: "",
    description: "",
  });
  //state to store the picture uploaded by the user
  const [file, setFile] = useState(null);
  //states to display the preview image
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  //state to display error message
  const [error, setError] = useState("");
  //state to hide/show loading message
  const [loading, setLoading] = useState(false)
  //hook for navigating withing the web app
  const navigate = useNavigate();

  //method to update the mealData state when the inputs change
  const handleChange = (e) => {
    setMealData({ ...mealData, [e.target.name]: e.target.value });
  };

  //method to update the file state when the file input changes
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile);

    const reader = new FileReader();

    //set up an event handler to be called when the reading process has finished
    reader.onloadend = () => {
      //update state to store the image url
      setImagePreviewUrl(reader.result)
    }

    //case a file was chosen by the user
    if(selectedFile) {
      //read file and convert it to url
      reader.readAsDataURL(selectedFile)
    }
  };

  //method triggered when the user submits the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    setError("")

    //return if the user has not uploaded a picture
    if (!file) {
      setError("You must submit a picture for the log")
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
    //data.append("rating", mealRating);
    data.append("picture", file);

    try {
      //get the id token
      const token = await user.getIdToken();
      
      //send a POST request with the form data and authorization header
      const response = await axiosInstance.post("/api/log-meal", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      //extract the log id
      const { id: mealLogId } = response.data

      //case log was saved to the database
      if(mealLogId){
        //send an event to the websocket to send a notification to the user saying a new meal is ready to be reviewed (accuracy)
        //set to 1 ashminute so web app can be marked otherwise it would be 4 hours
        setTimeout(() => {
          socket.emit("accuracyReviewNotification", {
            mealLogId,
            userUid: user.uid,
          })
        }, 60000)
      }

      //navigate to the /home route
      navigate("/home");
    } catch(err) {
      //update state to display an error message
      if(err.response && err.response.data && err.response.data.error){
          setError(err.response.data.error)
      } else {
          setError("Failed to log the meal. Please try again later.")
      }
    }finally{
      setLoading(false)
    }
  };

  return (
    <div className="flex justify-center items-center px-2 md:px-0 min-h-screen bg-slate-200 relative">
      {
        loading && (
          <div className='flex items-start justify-center absolute inset-0 z-25 h-full'>
              <div className='flex gap-2 mt-[60%] md:mt-[30%] bg-gray-400 py-1 px-2 rounded-md outline outline-gray-500'>
                  <svg aria-hidden="true" className="inline w-6 h-6 text-gray-200 animate-spin fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                  </svg>
                  <p className='text-md text-white'>Loading...</p>
              </div>
          </div>
        )
      }
      <div className="border mt-12 py-5 px-3 rounded-lg lg:w-[50%] md:w-[60%] max-w-[520px] shadow-md bg-white">
      {
        error && (
          <div className="mb-3 border border-red-700 bg-red-100 text-red-900 font-semibold rounded-sm px-3 py-1">
            <p>{error}</p>
          </div>
        )
      }
        <form action="" className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="flex items-center justify-center w-[280px] lg:w-[50%] mx-auto mb-2 ">
            <label
              htmlFor="dropzone-file"
              className={`flex flex-col items-center justify-center w-full h-64 rounded-lg cursor-pointer overflow-hidden ${imagePreviewUrl ? "" : "border-2 border-gray-300 border-dashed bg-gray-50 dark:hover:bg-bray-800 hover:bg-gray-100"}`}
            >
              {
                imagePreviewUrl ? (
                  <img src={imagePreviewUrl} alt="food" />
                ) : (

                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <MdOutlineCameraAlt size={30} style={{ color: "gray" }} />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span>
                  </p>
                </div>
                )
              }
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept=".jpg, .jpeg, .svg, .png, .bmp, .webp, .heic, .heif, .tiff"
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
          {/* <div className="flex justify-around mt-2">
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
          </div> */}

          <button
            type="submit"
            className="mt-5 py-2 border rounded-md text-lg text-white bg-slate-700 hover:bg-slate-600 hover:shadow-sm font-semibold cursor-pointer"
          >
            Add Meal
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogMeal;
