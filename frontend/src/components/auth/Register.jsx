import React, { useState, useReducer } from "react";
import { auth } from "../../../utils/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import axiosInstance from "../../../utils/axiosInstance"
import { MdOutlineCameraAlt } from "react-icons/md";
import Error from "../Error"

//reducer function to manage state updates based on action types
const reducer = (newUser, action) => {
  switch (action.type) {
    case "name":
      //update the user's name
      return { ...newUser, name: action.payload };
    case "surname":
      //update the user's surname
      return { ...newUser, surname: action.payload };
    case "username":
      return { ...newUser, username: action.payload };
    case "email":
      //update the user's email
      return { ...newUser, email: action.payload };
    case "password":
      //update the user's password
      return { ...newUser, password: action.payload };
    default:
      return newUser;
  }
};
//method to validate password
export const validatePassword = password => {
  //password must be at least 8 characters long and have at least one uppercase and lowercase letter and one number
  const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d.!@#$%^&*()_+-=]{8,}$/;
  //return boolean representing if password is valid
  return passwordPattern.test(password)
}

//method to validate email
export const validatedEmail = email => {
  //standard pattern for email addresses
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  //case email has a pattern that is not allowed
  if(!emailPattern.test(email)){
    return "Email addressed not valid"
  }

  //case email is too long
  if(email.length > 255){
    return "Email address cannot be more than 255 characters"
  }

  //case validated successfully 
  return true
}

//method to validate the username
export const validateUsername = (username) => {
  //username pattern - letters, numbers, underscores, hyphens or periods allowed
  let usernamePattern = /^[a-zA-Z0-9._-]+$/

  //case username has characters that are not allowed
  if(!usernamePattern.test(username)){
    return "Usernames can only have letters, numbers, underscores, hyphens and periods"
  }

  //case username is too long
  if(username.length > 25){
    return "Username cannot exceed 25 characters"
  }

  //case validated successfully
  return true
}

//method to validate the name and surname
export const validateNameSurname = (inputValue, inputType) => {
  //only letters, apostrophes and hyphens allowed
  let inputPattern = /^[a-zA-Z'-]/g
  
  //case name/surname has characters that are not allowed
  if(!inputPattern.test(inputValue)){
    return `${inputType} can only have letters, apostrophes and hyphens`
  }

  //case name/surname too long
  if(inputValue.length > 100){
    return `${inputType} cannot exceed 100 characters`
  }

  //case validated successfully
  return true
}

const Register = () => {
  //state to store errors
  const [error, setError] = useState();
  //hook to manage user details
  const [newUser, dispatch] = useReducer(reducer, {});
  const [loading, setLoading] = useState(false)
  //hook to navigate withing the web app
  const navigate = useNavigate();

  //state to store the picture uploaded by the user
  const [file, setFile] = useState(null);
  //
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  //method triggered after the user submits the form to register
  const handleSubmit = async (e) => {
    e.preventDefault();

    //if all the details were provided 
    if (newUser.name && newUser.surname && newUser.email && newUser.password) {
      //case password is not valid
      if(!validatePassword(newUser.password)) {
        //update state to display error and return to avoid submission
        setError("Password not valid. Ensure your password is at least 8 characters long, have at least one uppercase and lowercase letter and one number")
        return
      }

      //case name is not valid
      if(validateNameSurname(newUser.name, "Name") !== true){
        //update state to display error and return to avoid submission
        setError(validateNameSurname(newUser.name, "Name"))
        return
      }

      //case surname is not valid
      if(validateNameSurname(newUser.surname, "Surname") !== true){
        //update state to display error and return to avoid submission
        setError(validateNameSurname(newUser.surname, "Surname"))
        return
      }

      //case username is not valid
      if(validateUsername(newUser.username) !== true){
        //update state to display error and return to avoid submission
        setError(validateUsername(newUser.username))
        return
      }

      try{
          setLoading(true)
          //create a new user with the email and password provided in the form - new user will be signed in
          const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password)
          //store new user
          const user = userCredential.user;

          //create a FormData object so the data can be sent to the server
          const data = new FormData();
          data.append("email", newUser.email);
          data.append("name", newUser.name);
          data.append("surname", newUser.surname);
          data.append("username", newUser.username);
          data.append("uid", user.uid);

          if(file){
            data.append("profilePicUrl", file);
          }

          //send a POST request with the user's data so it can be saved in the database in Railway
          const response = await axiosInstance.post("/api/register", data)

          //case database updated successfully
          if(response.status === 200){
            //update the user's name in Firebase
            await updateProfile(user, { displayName: newUser.name })
            
            //navigate to "/home"
            navigate("/home")
          }
          setLoading(false)
        //catch errors
        }catch(err) {
            if(err.code && err.code === "auth/email-already-in-use"){
              setError("Email address already in use")
            } else if(err.code && err.code === "auth/weak-password"){
              setError("Password not strong enough")
            } else if(err.response && err.response.data && err.response.data.error){
              setError(err.response.data.error)
            } else {
              setError("Failed to create account. Please try again later.")
            }
            setLoading(false)
        }
      }
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


  return (
    <div className="flex justify-center items-center h-full min-h-screen px-3">
      {
          loading&&(
              <div className='w-full h-full flex items-start justify-center absolute inset-0 f-full bg-black/60'>
                  <div className='flex gap-2 mt-60 bg-gray-400 py-1 px-2 rounded-md'>
                      <svg aria-hidden="true" className="inline w-6 h-6 text-gray-200 animate-spin fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                      </svg>
                      <p className='text-md text-white'>Loading...</p>
                  </div>
              </div>
          )
        }
      <div className="border py-5 px-3 rounded-lg shadow-md bg-white w-full md:w-[446px]">
        
        <p className="mb-5 text-2xl text-sky-900 font-semibold">Register Now!</p>

        <form action="" className="flex flex-col gap-3 max-w-[446px]">
        <div className="flex items-center justify-center w-[50%] mx-auto mb-2">
            <label
              htmlFor="dropzone-file"
              className={`flex flex-col items-center justify-center w-[170px] h-[170px] rounded-full cursor-pointer overflow-hidden ${imagePreviewUrl ? "" : "border-2 border-gray-300 border-dashed bg-gray-50 dark:hover:bg-bray-800 hover:bg-gray-100"}`}
            >
              {
                imagePreviewUrl ? (
                  <img src={imagePreviewUrl} alt="profile picture" />
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

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Name"
              className="border py-2 px-3 rounded-md w-full"
              onChange={(e) =>
                dispatch({ type: "name", payload: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Surname"
              className="border py-2 px-3 rounded-md w-full"
              onChange={(e) =>
                dispatch({ type: "surname", payload: e.target.value })
              }
              required
            />
          </div>

          <input
            type="text"
            className="border py-2 px-3 rounded-md"
            placeholder="Username"
            onChange={(e) =>
              dispatch({ type: "username", payload: e.target.value })
            }
            required
          />
          <input
            type="email"
            className="border py-2 px-3 rounded-md"
            placeholder="Email"
            onChange={(e) =>
              dispatch({ type: "email", payload: e.target.value })
            }
            required
          />
          <input
            type="password"
            className="border py-2 px-3 rounded-md"
            placeholder="Password"
            onChange={(e) =>
              dispatch({ type: "password", payload: e.target.value })
            }
            required
          />

          {
            error && (
              <div className="text-sm truncate text-wrap max-w-full">
                <Error message={error} />
              </div>
            )
          }

          <button
            type="submit"
            className="border py-1.5 rounded-md mt-4 bg-sky-900 text-white font-semibold"
            onClick={handleSubmit}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
