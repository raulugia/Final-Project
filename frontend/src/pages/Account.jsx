import React, { useState, useEffect } from 'react'
import { auth } from '../../utils/firebase'
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import axiosInstance from '../../utils/axiosInstance'
import UpdateUserModal from '../components/UpdateUserModal';
import Error from '../components/Error'
import { useNavigate } from 'react-router-dom';

//All the code in this file was written without assistance

const Account = () => {
    const user = auth.currentUser
    //state to store user data fetched from server
    const [userData, setUserData] = useState({
        name: "",
        surname: "",
        username: "",
        email: "",
        profileThumbnailUrl: "",
        profilePicUrl: "",
    })
    //state to store the data fetched from server and updated data 
    //userData and dataToUpdate will be compared to only send the new data to the server
    const [dataToUpdate, setDataToUpdate] = useState({
        name: "",
        surname: "",
        username: "",
        email: "",
        profileThumbnailUrl: "",
        profilePicUrl: "",
        password: {current: "", new: ""},
    })
    //state to store new profile picture
    const [file, setFile] = useState("")
    //state to display/hide loading feedback and disable/enable submit button - disabled when loading is true
    const [loading, setLoading] = useState(true)
    //sates to provide error feedback to user
    const [errors, setErrors] = useState({email: [], username: [], password: []})
    //states to know if new email/username is available
    const [emailAvailable, setEmailAvailable] = useState()
    const [usernameAvailable, setUsernameAvailable] = useState()
    //states to display feedback
    const [displayMessage, setDisplayMessage] = useState()
    //state to display/hide modal
    const [displayModal, setDisplayModal] = useState(false)
    //state to store credentials for re-authentication
    const [credentialDetails, setCredentialDetails] = useState({email: "", password: ""})
    //state to store an error message
    const [serverError, setServerError] = useState("")
    //state to display a preview image of the new image
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const navigate = useNavigate()
    //flag
    const [deleteUser, setDeleteUser] = useState(false)
    


    //get the user's details
    useState(() => {
        (
            async() => {
                try{
                    //get the token for verification in the server
                    const token = await user.getIdToken()

                    //send a get request to get the user's data
                    const { data } = await axiosInstance.get("/api/user-data", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })

                    if(data){
                        //update states
                        setUserData(data)
                        setDataToUpdate(data)
                        setLoading(false)
                    }

                } catch(err) {
                    //update state to display an error message
                    if(err.response && err.response.data && err.response.data.error){
                        setServerError(err.response.data.error)
                    } else {
                        setServerError("Failed to load your details. Please try again later.")
                    }
                } finally {
                    //hide loading state
                    setLoading(false)
                }
            }
        )()
    },[])

    //submit details to update user
    const handleSubmit = async(e) => {
        e.preventDefault()
        //update loading state - submit button disabled
        setLoading(true)
        //reset modal state
        setDisplayModal(false)

        //case new email/username are not available
        if(emailAvailable === false|| usernameAvailable === false){
            //reset loading state - submit button enabled
            setLoading(false)
            //stop the submission process
            return
        }

        try{
            //get token for server authentication
            const token = await user.getIdToken()

            //case user has entered a new email address
            if(dataToUpdate.email && dataToUpdate.email !== userData.email){
                //case user has not re-authenticated
                if(!credentialDetails.email || !credentialDetails.password ){
                    //display modal so user enters email and password
                    setDisplayModal(true)
                    //reset loading state - submit button enabled
                    setLoading(false)

                    //stop submission process
                    return
                }

                //get credential using details entered by user in the modal
                const credential = EmailAuthProvider.credential(credentialDetails.email, credentialDetails.password)
                //re-authenticate user and update their email on firebase
                await reauthenticateWithCredential(user, credential)
                    .then(async() => {
                        //update email
                        await updateEmail(user, dataToUpdate.email)
                    })
            }
            
            //case user entered current and new password and they are different
            if(dataToUpdate.password && dataToUpdate.password.current && dataToUpdate.password.new &&
                dataToUpdate.password.current !== dataToUpdate.password.new){
                //update password    
                await handlePassword()
            }

            //create a new FormData object to store the form data that will be send to the server
            const formData = new FormData()
            //loop over dataToUpdate
            for(const key in dataToUpdate){
                //only append values that have been changed by user
                if(userData[key] !== dataToUpdate[key]){
                    formData.append(key, dataToUpdate[key])
                }
            }

            //case user uploaded a new profile picture
            if(file) {
                //append file
                formData.append("picture", file)

                //append existing pictures urls
                formData.append("profileThumbnailUrl", userData.profileThumbnailUrl)
                formData.append("profilePicUrl", userData.profilePicUrl)
            }

            //api call to update user'd details
            const { data } = await axiosInstance.put("/api/update-user", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            //case server returns data
            if(data){
                //update state to display updated details
                setUserData(data)
                //reset states
                setEmailAvailable("")
                setUsernameAvailable("")
                //update state to provide feedback
                setDisplayMessage({success: "Details updated successfully"})
                //reset loading state
                setLoading(false)
            }
            

        }catch(err){
            //update state to provide feedback
            setDisplayMessage({error: "Details could not be updated"})
            //reset loading state
            setLoading(false)
        }
    }

    //method to delete a user and its data
    const handleDelete = async(e) => {
        e.preventDefault()
        //update loading state - submit button disabled
        setLoading(true)
        //reset modal state
        setDisplayModal(false)
        setDeleteUser(true)

        try{
            //get token for server authentication
            const token = await user.getIdToken()


            //case user has not re-authenticated
            if(!credentialDetails.email || !credentialDetails.password ){
                //display modal so user enters email and password
                setDisplayModal(true)
                //reset loading state - submit button enabled
                setLoading(false)

                //stop submission process
                return
            }

            //get credential using details entered by user in the modal
            const credential = EmailAuthProvider.credential(credentialDetails.email, credentialDetails.password)
            //re-authenticate user and update their email on firebase
            await reauthenticateWithCredential(user, credential)

            //send a delete request to the api
            const response = await axiosInstance.delete(`/api/delete-user/${userData.username}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            //case success
            if(response.status === 200) {
                //await deleteUser(user)
                navigate("/")
            }
            
            setLoading(false)  
            
        }catch(err){
            //update state to display an error message
            if(err.response && err.response.data && err.response.data.error){
                setServerError(err.response.data.error)
            } else if(err.code && err.code === "auth/wrong-password") {
                setDisplayMessage({error: "Authentication details did not match."})
            } else {
                setServerError("Failed to delete your account. Please try again.")
            }
        } finally {
            //hide loading state
            setLoading(false)
        }
    }

  //method to update the file state when the file input changes
  const handleFileChange = (e) => {
    //extract file
    const selectedFile = e.target.files[0]
    //update state with file
    setFile(selectedFile);

    //create a file reader
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
  }


    //method to update the data that needs to be updated
    const handleInputChange = (e, inputType) => {
        //add field and value that needs updating
        setDataToUpdate({...dataToUpdate, [inputType]: e.target.value})

        //reset errors state (email/username)
        if(inputType === "email") setErrors(prevErrors => ({...prevErrors, email: []}))
        if(inputType === "username") setErrors(prevErrors => ({...prevErrors, username: []}))
    }

    //method to update user's password
    const handlePassword = async() => {
        try{
            //get credential with current password and email
            const credential = EmailAuthProvider.credential(user.email, dataToUpdate.password.current);

            //re-authenticate user
            await reauthenticateWithCredential(user, credential)
            //update password
            await updatePassword(user, dataToUpdate.password.new);

        }catch(err){
            //update state to provide feedback
            setDisplayMessage({error: "Details could not be updated"})
            
            //case authentication failed - display error message
            if(err.message === "Firebase: Error (auth/wrong-password)."){
                setErrors(prevErrors => ({...prevErrors, password: [...prevErrors.password, "Authentication failed - Incorrect password"]}))
            }

            //throw error to ensure form submission stops
            throw err
        }
        
    }

    //method to check if new username/email is available onBlur
    const checkUniqueness = async(fieldType, fieldValue) => {
        //case email/username inputs have been changed - avoid calls to server if data has not been changed
        if(userData && fieldValue !== userData[fieldType]){
            try{
                //get token for server authentication
                const token = await user.getIdToken()

                //send the new email/username to server to check if they are available
                const response = await axiosInstance.post("/api/update-user/is-unique", {[fieldType]: fieldValue}, {
                    headers:{
                        Authorization: `Bearer ${token}`,
                    }
                })

                //extract data from response object
                const { data } = response
                
                //get keys from returned data object
                const key = Object.keys(data)[0]

                //case response status was ok - 200
                if(response.status === 200){
                    //update states to provide feedback
                    if(key === "username") setUsernameAvailable(true)
                    if(key === "email") setEmailAvailable(true)
                }
    
            }catch(err){
                //case server responded with an error
                if(err.response && err.response.status === 400){
                    //get data from response
                    const { data } = err.response
                    //get the keys from the extracted data
                    const key = Object.keys(data)[0]

                    //case email was already taken
                    if (key === "emailError") {
                        //update states to provide feedback
                        setErrors(prevErrors => ({...prevErrors, email: [...prevErrors.email, data[key]]}))
                        setEmailAvailable(false)
                    }

                    //case username was already taken
                    if (key === "usernameError"){
                        //update states to provide feedback
                        setErrors(prevErrors => ({...prevErrors, username: [...prevErrors.username, data[key]]}))
                        setUsernameAvailable(false)
                    } 
                }
            }
        }
    }

  return (
    <div className="min-h-screen flex justify-center items-start">
        <div className="pt-24 pb-5 md:pt-28 w-[800px] mx-5">

            {
                serverError ? (
                    <div className="mx-8 mt-5">
                        <Error message={serverError} />
                    </div>
                ) : (

                    <form className="bg-white px-4 md:px-8 border rounded-xl shadow-md">
                        <div className="my-6">
                            <h1 className="text-lg font-semibold text-slate-700">Manage Your Account</h1>
                            <p className='text-sm text-slate-600'>Click on the Save button to save your changes.</p>
                            {
                                displayMessage?.success ? (
                                    <div className='mt-3 text-sm text-green-700 font-medium bg-green-100 py-2 px-3 rounded-md border border-green-700'>
                                        <p>{ displayMessage.success }</p>
                                    </div>
                                ) : displayMessage?.error ? (
                                    <div className='mt-3 text-sm text-red-600 font-medium bg-red-100 py-2 px-3 rounded-md border border-red-700'>
                                        <p>{ displayMessage?.error }</p>
                                    </div>
                                ) : null
                            }
                        </div>
                        <div className="border-b-2 border-slate-200 w-full mb-6"></div>

                        <div className="flex justify-between md:justify-start gap-5 md:gap-16 items-center mb-6">
                            <div>
                                <div className="bg-slate-700 h-20 w-20 rounded-full overflow-hidden">
                                    <img 
                                        src={imagePreviewUrl ? imagePreviewUrl :  userData.profileThumbnailUrl ? userData.profileThumbnailUrl : userData.profilePicUrl ? userData.profilePicUrl : "../../public/user.png"} 
                                        className='w-full' 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-base text-gray-500 font-semibold mb-2 block">Upload a new profile picture</label>
                                <input type="file" 
                                    onChange={handleFileChange}
                                    accept=".jpg, .jpeg, .svg, .png, .bmp, .webp, .heic, .heif, .tiff" 
                                    className="w-full text-gray-400  text-sm bg-white border file:cursor-pointer cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:bg-gray-100 file:hover:bg-gray-200 file:text-gray-500 rounded" 
                                />
                            </div>
                        </div>

                        <div className='w-full flex flex-col gap-3 mb-6'>
                            <div className="flex flex-col md:flex-row gap-3 md:gap-5 w-full">
                                <div className='w-full'>
                                    <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">Name</p>
                                    <input 
                                        type="text" 
                                        className='border py-1 rounded-lg w-full shadow-sm px-2'
                                        value={dataToUpdate.name ? dataToUpdate.name : userData.name}
                                        onChange={(e) => handleInputChange(e, "name")}
                                    />
                                </div>
                                <div className='w-full'>
                                    <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">Surname</p>
                                    <input 
                                        type="text" 
                                        className='border py-1 rounded-lg w-full shadow-sm px-2' 
                                        value={dataToUpdate.surname ? dataToUpdate.surname :userData.surname}
                                        onChange={(e) => handleInputChange(e, "surname")}
                                    />
                                </div>
                            </div>
                            <div className='md:w-1/2 w-full pr-2'>
                                <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">Username</p>
                                <input 
                                    type="text" 
                                    className={`border py-1 rounded-lg w-full shadow-sm px-2 
                                        ${errors.username.length > 0 ? "border-red-500 text-red-900 placeholder-red-700" : ""}
                                        ${errors.username.length === 0 && usernameAvailable ? "border-green-500 bg-green-50 text-green-900" : ""}`
                                    }
                                    value={dataToUpdate.username}
                                    onChange={(e) => handleInputChange(e, "username")}
                                    onBlur={(e) => checkUniqueness("username", e.target.value)}
                                />
                                <div className="text-sm text-red-600 font-medium mt-1" >
                                    {
                                        errors.username.length > 0 && (
                                            errors.username.map((error, index) => (
                                                <p key={error+index}>{error}</p>
                                            ))
                                        )
                                    }
                                </div>
                                    {
                                        usernameAvailable && (
                                            <div className="text-sm  font-medium mt-1">
                                                <p className="text-green-600">Username is available</p>
                                            </div>
                                        )
                                    }
                            </div>

                        </div>

                        <div className="border-b-2 border-slate-200 w-full mb-6"></div>
                        
                        <div className='mb-6'>
                            <h3 className='text-md font-semibold text-slate-700 mb-3'>Contact email</h3>
                            <div className='w-full'>
                                <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">Email</p>
                                <input 
                                    type="email" 
                                    className={`border py-1 rounded-lg w-full md:w-1/2 shadow-sm px-2 text-sm 
                                        ${errors.email.length > 0 ? "border-red-500 text-red-900 bg-red-50 placeholder-red-700" : ""}
                                        ${errors.email.length === 0 && emailAvailable ? "border-green-500 bg-green-50 text-green-900" : ""}`
                                    } 
                                    value={dataToUpdate.email ? dataToUpdate.email : userData.email}
                                    onChange={(e) => handleInputChange(e, "email")}
                                    onBlur={(e) => checkUniqueness("email", e.target.value)}
                                />

                                <div className="text-sm text-red-600 font-medium mt-1" >
                                    {
                                        errors.email.length > 0 && (
                                            errors.email.map((error, index) => (
                                                    <p key={error+index}>{error}</p>
                                            ))
                                        )
                                    }
                                </div>
                                {
                                    emailAvailable && (
                                        <div className="text-sm  font-medium mt-1">
                                            <p className="text-green-600">Email is available</p>
                                        </div>
                                    )
                                }
                            </div>
                        </div>

                        <div className="border-b-2 border-slate-200 w-full mb-6"></div>

                        <div className='mb-6'>
                            <h3 className='text-md font-semibold text-slate-700 mb-3'>Password</h3>
                            <div className='flex w-full gap-2 md:gap-5'>
                                <div className='w-full'>
                                    <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">Current Password</p>
                                    <input 
                                        type="password" name="current" className='border py-1 rounded-lg w-full shadow-sm px-2'
                                        onChange={(e) => setDataToUpdate(prevDataToUpdate => ({ ...prevDataToUpdate, password: {...prevDataToUpdate.password, current: e.target.value}}))}
                                    />
                                </div>
                                <div className='w-full'>
                                    <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">New Password</p>
                                    <input 
                                        type="password"
                                        name="new" 
                                        className='border py-1 rounded-lg w-full shadow-sm px-2'
                                        onChange={(e) => setDataToUpdate(prevDataToUpdate => ({ ...prevDataToUpdate, password: {...prevDataToUpdate.password, new: e.target.value}}))}
                                    />
                                </div>
                            </div>
                            <div className='flex flex-col text-sm text-red-600 font-medium mt-1'>
                                {
                                    errors.password.length > 0 &&(
                                        errors.password.map((error, index) => (
                                            <p key={error+index}>{error}</p>
                                        ))
                                    )
                                }
                            </div>
                        </div>

                        <div className="border-b-2 border-slate-200 w-full mb-6"></div>

                        <div className="w-full flex gap-3 md:gap-5 mb-6 justify-center md:justify-end text-sm md:text-md">
                            <button 
                                disabled={loading} 
                                className="border border-red-700 rounded-lg px-2 py-1 text-white font-semibold bg-red-600 hover:bg-red-700 hover:shadow-sm"
                                onClick={handleDelete}
                            >
                                Delete Account
                            </button>
                            <button 
                                disabled={loading}
                                onClick={handleSubmit} 
                                className="border border-blue-700 rounded-lg px-2 py-1 text-white font-semibold bg-blue-600 hover:bg-blue-700 hover:shadow-sm"
                            >
                                    Save Changes
                            </button>
                        </div>
                    </form>
                    )
                 }
                
        </div>
        {
            displayModal &&(
                <UpdateUserModal 
                    credentialDetails={credentialDetails} 
                    setCredentialDetails={setCredentialDetails}
                    setDisplayModal={setDisplayModal}
                    handleSubmit={handleSubmit}
                    setLoading={setLoading}
                    handleDelete={handleDelete}
                    deleteUser={deleteUser} 
                />
            )
        }
    </div>
  )
}

export default Account