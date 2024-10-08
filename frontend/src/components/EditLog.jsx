import React, { useState, useEffect, useRef } from 'react'
import { MdErrorOutline } from "react-icons/md";
import { MdOutlineCameraAlt } from "react-icons/md";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { auth } from "../../utils/firebase";

//All the code in this file was written without assistance 

//Component used to edit an existing log - this component is also used when users needs to review the accuracy of a log after 4 hours (1 min for testing the web app)

const EditLog = ({mealName, restaurantName, rating, description, carbEstimate, picture, createdAt, mealId, logId, setEdit}) => {
    //get current user
    const user = auth.currentUser
    //hook used for navigating withing the web app
    const navigate = useNavigate();
    //state to hold log data
    const [logData, setLogData] = useState({mealName, restaurantName, rating, description, carbEstimate, picture, createdAt})
    //state to display the new image preview
    const [imagePreviewUrl, setImagePreviewUrl] = useState(picture);
    //state to store the new picture
    const [file, setFile] = useState("")
    //state to display errors
    const [error, setError] = useState()
    //state to display options
    const [displayOption, setDisplayOption] = useState(true)
    //state to trigger focus event
    const inputRef = useRef(null)

    //method to update the state that holds the log data
    const handleInputChange = (e, key) => {
        //ensure carb estimate is a number
        if(key === "carbEstimate" && !Number(e.target.value)){
            setError("Carb estimate must be a number")
            return
        }
        //update states
        setLogData({...logData, [key]: e.target.value})
        setError("")
    }

    //focus the first input when the component renders
    useEffect(() => {
        inputRef.current.focus()
    }, [])

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

        //hide the "click to upload" div
        setDisplayOption(false)
    };

    const handleSubmit = async(e) => {
        e.preventDefault()
        setError("")

        const {mealName, restaurantName, rating, description, carbEstimate, picture} = logData
        
        //create a new FormData object and append log data to it
        const formData = new FormData()
        formData.append("mealName", mealName)
        formData.append("restaurantName", restaurantName)
        formData.append("rating", rating)
        formData.append("description", description)
        formData.append("carbEstimate", carbEstimate)

        //case user uploaded a new picture
        if(file) {
            formData.append("picture", file)
        //no new picture - append old one
        }else{
            formData.append("picture", picture)
        }

        try{
            //get token for authentication in the server
            const token = await user.getIdToken()

            //send a get put request to update the log
            await axiosInstance.put(`/api/my-meals/${mealId}/log/${logId}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }).then(response => {
                setEdit(false)
                //navigate to the updated log and reset location state
                navigate(`/my-meals/${response.data.mealId}/log/${response.data.id}`, { state: null, replace: true })
            })

        }catch(err) {
            //update state to display an error message
            if(err.response && err.response.data && err.response.data.error){
                setError(err.response.data.error)
            } else {
                setError("Failed to update log. Please try again later.")
            }
        }
    }

  return (
    <div className='flex flex-col items-center min-h-screen pb-16 bg-slate-200 pt-20'>
        <div className="mr-auto pl-10">
            <h1 className="text-3xl font-semibold mb-3">Review Accuracy</h1>
            <p>Select an accuracy level for this log. You can also edit the log information.</p>
        </div>
        {
            error &&(
                <div className='border border-red-300 flex justify-start items-center gap-1 w-[85%] md:w-[75%] max-w-[790px] rounded-lg px-4 py-1 shadow-sm mt-8 bg-red-200'>
                    <MdErrorOutline size={20} className='text-red-900'/><p className='text-red-900'>Carb estimate must be a number</p>
                </div>
            )
        }
    <div className='border flex justify-start bg-white w-[85%] md:w-[75%] max-w-[790px] rounded-lg px-8 py-7 shadow-md mt-8'>
        <form className='flex md:flex-row flex-col w-full'>

            <div className='md:w-[50%] max-w-[280px] max-h-[280px] overflow-hidden rounded-md mx-auto md:mx-0 relative'>
                <label htmlFor="dropzone-file">
                    <img src={imagePreviewUrl} alt={mealName} 
                        className='w-full h-full object-cover hover:cursor-pointer'
                    />
                    
                    <div className={`flex flex-col items-center justify-center pt-5 pb-6 absolute bg-white/60  w-full h-full top-0 hover:cursor-pointer ${displayOption ? "" : "hidden"}`}>
                        <MdOutlineCameraAlt size={30} className='text-slate-700' />
                        <p className="mb-2 text-sm text-slate-700">
                            <span className="font-semibold">Click to upload</span>
                        </p>
                    </div>

                    <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        accept=".jpg, .jpeg, .svg, .png, .bmp, .webp, .heic, .heif, .tiff"
                        onChange={handleFileChange}
                    />
                </label>
            </div>

            <div className='flex flex-col flex-grow md:ml-14 mt-5 md:mt-0 justify-between'>
                <div>
                    <div className='flex flex-col items-start mb-5 gap-2'>
                        <input 
                            type='text' 
                            className='text-slate-800 md:text-2xl font-semibold bg-slate-100 rounded-sm px-3 border w-[70%]' 
                            value={logData.mealName}
                            onChange={(e) => handleInputChange(e, "mealName")}
                            ref={inputRef}
                        >
                        </input>
                        <input 
                            type='text' 
                            className='text-slate-600 md:text-md bg-slate-100 rounded-sm px-3 border  w-[70%]' 
                            value={logData.restaurantName}
                            onChange={(e) => handleInputChange(e, "restaurantName")}
                        >
                        </input>
                    </div>
                    <div className='flex flex-col items-start justify-start'>

                        <p className='text-slate-700 font-semibold md:text-lg'>Carb estimate: 
                            <input 
                                type='text' 
                                className="font-normal border max-w-[50px] px-2 bg-slate-100 rounded-sm border mx-2" 
                                value={logData.carbEstimate}
                                onChange={(e) => handleInputChange(e, "carbEstimate")}
                            >
                            </input>
                            <span className='font-normal'>g</span>
                        </p>

                        <div className="flex justify-between items-center text-sm w-full mt-5 gap-2">
                            <div
                                onClick={() => setLogData({...logData, rating: "ACCURATE"})}
                                className={`flex items-center justify-center px-2 py-1 rounded-md bg-green-500 hover:shadow-md cursor-pointer ${logData.rating === "ACCURATE" ? "bg-green-500 text-green-900 outline" : "bg-green-500/20 text-green-900/50"}`}
                            >
                            <p>Accurate</p>
                            </div>
                            <div
                                onClick={() => setLogData({...logData, rating: "SLIGHTLY_INACCURATE"})}
                                className={`flex items-center justify-center px-2 py-1 rounded-md hover:shadow-md cursor-pointer ${logData.rating === "SLIGHTLY_INACCURATE" ? "bg-yellow-500 text-yellow-900 outline" : "bg-yellow-500/20 text-yellow-900/50"}`}
                            >
                            <p>Almost</p>
                            </div>
                            <div
                                onClick={() => setLogData({...logData, rating: "INACCURATE"})}
                                className={`flex items-center justify-center px-2 py-1 rounded-md bg-red-500 hover:shadow-md cursor-pointer ${logData.rating === "INACCURATE" ? "bg-red-500 text-red-900 outline" : "bg-red-500/20 text-red-900/50"}`}
                            >
                            <p>Inaccurate</p>
                            </div>
                        </div>
                        
                        <p className='text-slate-700 font-semibold md:text-lg mt-4 mb-1'>Additional Information</p>
                        <textarea
                            name="description"
                            id="description"
                            rows="4"
                            value={logData.description}
                            onChange={(e) => handleInputChange(e, "description")}
                            className="border py-2 px-3 rounded-md text-sm mb-5 leading-[16px] bg-slate-100 text-slate-700 w-full"
                        ></textarea>
                    </div>
                </div>
                <div className='ml-auto mt-8 md:mt-0'>
                    <p className='text-sm text-slate-500'>Created {createdAt}</p>
                </div>
                    <button onClick={handleSubmit} type='submit' className='border mt-5 py-1 rounded-md bg-slate-700 text-white font-semibold hover:shadow-md hover:bg-slate-800'>Update Log</button>
            </div>
        </form>

    </div>
    </div>
  )
}

export default EditLog