import React from "react";
import { MdOutlineCameraAlt } from "react-icons/md";

const LogMeal = () => {
  return (
    <div className="flex justify-center items-center h-full bg-slate-50">
      <div className="border py-5 px-3 rounded-lg lg:w-[50%] md:w-1/3 shadow-md bg-white">
        <form action="" className="flex flex-col gap-3">

          <div class="flex items-center justify-center w-[50%] mx-auto mb-2">
            <label
              for="dropzone-file"
              class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 hover:bg-gray-100"
            >
              <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <MdOutlineCameraAlt size={30} style={{color: "gray"}}/>
                <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span class="font-semibold">Click to upload</span>
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  (MAX. 800x400px)
                </p>
              </div>
              <input id="dropzone-file" type="file" class="hidden" accept=".jpg, jpeg, .svg, .png, .bmp, .webp, .heic, .heif, .tiff"/>
            </label>
          </div>

          <input
            type="text"
            name=""
            id="mealName"
            placeholder="Restaurant Name"
            // value={email}
            // onChange={(e) => setEmail(e.target.value)}
            className="border py-2 px-3 rounded-md"
          />
          <input
            type="text"
            name=""
            id=""
            placeholder="Meal Name"
            // value={email}
            // onChange={(e) => setEmail(e.target.value)}
            className="border py-2 px-3 rounded-md"
          />
          <input
            type="text"
            name=""
            id=""
            placeholder="Carb Estimation (grams)"
            // value={email}
            // onChange={(e) => setEmail(e.target.value)}
            className="border py-2 px-3 rounded-md"
          />

          <label htmlFor="information" className="mt-5 text-lg font-semibold">
            Additional Information
          </label>
          <textarea
            name=""
            id="information"
            rows="4"
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
            <div className="flex items-center justify-center px-2 py-1 rounded-md bg-green-500 hover:shadow-md cursor-pointer">
              <p>Accurate</p>
            </div>
            <div className="flex items-center justify-center px-2 py-1 rounded-md bg-yellow-500 hover:shadow-md cursor-pointer">
              <p>Slightly Inaccurate</p>
            </div>
            <div className="flex items-center justify-center px-2 py-1 rounded-md bg-red-500 hover:shadow-md cursor-pointer">
              <p>Inaccurate</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogMeal;
