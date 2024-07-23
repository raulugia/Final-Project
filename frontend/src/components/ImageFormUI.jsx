import React, { useState } from 'react'

const ImageFormUI = ({imagePreviewUrl, setImagePreviewUrl,setFile}) => {

  //method to update the file state when the file input changes
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const reader = new FileReader();

    //set up an event handler to be called when the reading process has finished
    reader.onloadend = () => {
      //update state to store the image url
      setImagePreviewUrl(reader.result);
    };

    //case a file was chosen by the user
    if (selectedFile) {
      //read file and convert it to url
      reader.readAsDataURL(selectedFile);
    }
  };

  return (
    <div className="flex items-center justify-center w-[50%] mx-auto mb-2">
      <label
        htmlFor="dropzone-file"
        className={`flex flex-col items-center justify-center w-full h-64 rounded-lg cursor-pointer overflow-hidden ${
          imagePreviewUrl
            ? ""
            : "border-2 border-gray-300 border-dashed bg-gray-50 dark:hover:bg-bray-800 hover:bg-gray-100"
        }`}
      >
        {imagePreviewUrl ? (
          <img src={imagePreviewUrl} alt="food" />
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <MdOutlineCameraAlt size={30} style={{ color: "gray" }} />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              (MAX. 800x400px)
            </p>
          </div>
        )}
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          accept=".jpg, .jpeg, .svg, .png, .bmp, .webp, .heic, .heif, .tiff"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}

export default ImageFormUI