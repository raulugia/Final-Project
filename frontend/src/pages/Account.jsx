import React, { useState, useEffect } from 'react'
import { auth } from '../../utils/firebase'
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import axiosInstance from '../../utils/axiosInstance'
import UpdateUserModal from '../components/UpdateUserModal';

const Account = () => {
    const user = auth.currentUser
    const [userData, setUserData] = useState({
        name: "",
        surname: "",
        username: "",
        email: "",
        profileThumbnailUrl: "",
        profilePicUrl: "",
    })
    const [dataToUpdate, setDataToUpdate] = useState({
        name: "",
        surname: "",
        username: "",
        email: "",
        profileThumbnailUrl: "",
        profilePicUrl: "",
        password: {},
    })
    const [file, setFile] = useState("")
    const [loading, setLoading] = useState(true)
    const [errors, setErrors] = useState({email: [], username: [], password: []})
    const [usernameErrors, setUsernameErrors] = useState([])
    const [emailErrors, setEmailErrors] = useState([])
    const [emailAvailable, setEmailAvailable] = useState()
    const [usernameAvailable, setUsernameAvailable] = useState()

    const [displayModal, setDisplayModal] = useState(false)
    const [credentialDetails, setCredentialDetails] = useState({email: "", password: ""})

    const [displayMessage, setDisplayMessage] = useState()


    useState(() => {
        (
            async() => {
                try{
                    const token = await user.getIdToken()

                    const { data } = await axiosInstance.get("/api/user-data", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })

                    if(data){
                        console.log(data)
                        setUserData(data)
                        setDataToUpdate(data)
                        setLoading(false)
                    }

                }catch(err){
                    console.log(err)
                }
            }
        )()
    },[])

    const handleSubmit = async(e) => {
        e.preventDefault()
        setLoading(true)
        setDisplayModal(false)
        console.log("here")

        if(emailAvailable === false|| usernameAvailable === false){
            console.log("first if")
            setLoading(false)
            return
        }

        try{
            
            const token = await user.getIdToken()
            //case user has entered a new email address
            if(dataToUpdate.email && dataToUpdate.email !== userData.email){
                //case user has not re-authenticated
                if(!credentialDetails.email || !credentialDetails.password ){
                    console.log("need credentials")
                    //display modal so user enters email and password
                    setDisplayModal(true)
                    //update loading state
                    setLoading(false)

                    //stop submission process
                    return
                }

                console.log("updating email in firebase")
                //get credential using details entered by user in the modal
                const credential = EmailAuthProvider.credential(credentialDetails.email, credentialDetails.password)
                console.log(credential)
                //re-authenticate user and update their email on firebase
                await reauthenticateWithCredential(user, credential)
                    .then(async() => {
                        await updateEmail(user, dataToUpdate.email)
                        console.log("email updated")
                    })
            }
            
            //case user entered current and new password and they are different
            if(dataToUpdate.password.current && dataToUpdate.password.new &&
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
            console.log(err)
            //update state to provide feedback
            setDisplayMessage({error: "Details could not be updated"})
            //reset loading state
            setLoading(false)
        }
    }

    const handleInputChange = (e, inputType) => {
        setDataToUpdate({...dataToUpdate, [inputType]: e.target.value})

        if(inputType === "email") setEmailErrors([])
        if(inputType === "username") setUsernameErrors([])
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
                const token = await user.getIdToken()

                const response = await axiosInstance.post("/api/update-user/is-unique", {[fieldType]: fieldValue}, {
                    headers:{
                        Authorization: `Bearer ${token}`,
                    }
                })
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
                        setEmailErrors([...emailErrors, {error: data[key]}])
                        setErrors(prevErrors => ({...prevErrors, email: [...prevErrors.email, data[key]]}))
                        setEmailAvailable(false)
                    }

                    //case username was already taken
                    if (key === "usernameError"){
                        //update states to provide feedback
                        setUsernameErrors([...usernameErrors, {error: data[key]}])
                        setErrors(prevErrors => ({...prevErrors, username: [...prevErrors.username, data[key]]}))
                        setUsernameAvailable(false)
                    } 
                }
                console.log(err)
            }
        }
    }

    useEffect(() => {
        if(errors){
            console.log(errors[0])
        }
    }, [errors])

  return (
    <div className="min-h-screen flex justify-center items-start">
        <div className="pt-24 pb-5 md:pt-28 w-[800px] mx-5">
            <form className="bg-white px-8 border rounded-xl shadow-md">
                <div className="my-6">
                    <h1 className="text-lg font-semibold text-slate-700">Manage Your Account</h1>
                    <p className='text-sm text-slate-600'>Click on the Save button to save your changes.</p>
                    {
                        displayMessage?.success ? (
                            <div className='mt-3 text-sm text-green-700 font-medium'>
                                <p>{ displayMessage.success }</p>
                            </div>
                        ) : (
                            <div className='mt-3 text-sm text-red-600 font-medium'>
                                <p>{ displayMessage?.error }</p>
                            </div>
                        )
                    }
                </div>
                <div className="border-b-2 border-slate-200 w-full mb-6"></div>

                <div className="flex justify-between md:justify-start md:gap-16 items-center mb-6">
                    <div>
                        <div className="bg-slate-700 h-20 w-20 rounded-full"></div>
                    </div>
                    <div>
                        <button className="px-2 border bg-gray-100 text-sm rounded-lg py-1 font-semibold">Upload new picture</button>
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
                                ${usernameErrors.length > 0 ? "border-red-500 text-red-900 placeholder-red-700" : ""}
                                ${usernameErrors.length === 0 && usernameAvailable ? "border-green-500 bg-green-50 text-green-900" : ""}`
                            }
                            value={dataToUpdate.username}
                            onChange={(e) => handleInputChange(e, "username")}
                            onBlur={(e) => checkUniqueness("username", e.target.value)}
                        />
                        <div className="text-sm text-red-600 font-medium mt-1" >
                            {
                                usernameErrors. length > 0 && (
                                    usernameErrors.map((error, index) => (
                                        <p key={error.error+index}>{error.error}</p>
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
                                ${emailErrors.length > 0 ? "border-red-500 text-red-900 bg-red-50 placeholder-red-700" : ""}
                                ${emailErrors.length === 0 && emailAvailable ? "border-green-500 bg-green-50 text-green-900" : ""}`
                            } 
                            value={dataToUpdate.email ? dataToUpdate.email : userData.email}
                            onChange={(e) => handleInputChange(e, "email")}
                            onBlur={(e) => checkUniqueness("email", e.target.value)}
                        />

                        <div className="text-sm text-red-600 font-medium mt-1" >
                            {
                                emailErrors. length > 0 && (
                                    emailErrors.map((error, index) => (
                                            <p key={error.error+index}>{error.error}</p>
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
                    {
                        
                    }
                </div>

                <div className="border-b-2 border-slate-200 w-full mb-6"></div>

                <div className='mb-6'>
                    <h3 className='text-md font-semibold text-slate-700 mb-3'>Password</h3>
                    <div className='flex w-full gap-2 md:gap-5'>
                        <div className='w-full'>
                            <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">Current Password</p>
                            <input 
                                type="password" className='border py-1 rounded-lg w-full shadow-sm px-2'
                                onChange={(e) => setDataToUpdate({...dataToUpdate, password:{...dataToUpdate.password, current: e.target.value}})}
                            />
                        </div>
                        <div className='w-full'>
                            <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">New Password</p>
                            <input 
                                type="password" 
                                className='border py-1 rounded-lg w-full shadow-sm px-2'
                                onChange={(e) => setDataToUpdate({...dataToUpdate, password:{...dataToUpdate.password, new: e.target.value}})}
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
                        onClick={handleSubmit} 
                        className="border border-blue-700 rounded-lg px-2 py-1 text-white font-semibold bg-blue-600 hover:bg-blue-700 hover:shadow-sm"
                    >
                            Save Changes
                    </button>
                    <button disabled={loading} className="border border-red-700 rounded-lg px-2 py-1 text-white font-semibold bg-red-600 hover:bg-red-700 hover:shadow-sm">Delete Account</button>
                </div>
                </form>
        </div>
        {
            displayModal &&(
                <UpdateUserModal 
                    credentialDetails={credentialDetails} 
                    setCredentialDetails={setCredentialDetails}
                    setDisplayModal={setDisplayModal}
                    handleSubmit={handleSubmit}
                    setLoading={setLoading} 
                />
            )
        }
    </div>
  )
}

export default Account