import React, { useState } from "react";
import { auth } from "../../../utils/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import {useNavigate } from "react-router-dom";
import { VscError } from "react-icons/vsc";

const Login = () => {
  //states to store email and password
  const [email, setEmail] = useState("");
  //state to store errors
  const [error, setError] = useState("");
  //hook for navigation
  const navigate = useNavigate();
  //state to display success message
  const [displaySuccess, setDisplaySuccess] = useState(false)

  //method triggered when the user submits the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    //if email and password have been provided
    if (email) {
      try{
          //sign in with email and password
          await sendPasswordResetEmail(auth, email)
          
          //display success message
          setDisplaySuccess(true)
      } catch(err) {
        //update the error state if there was an error
        if(err.code && err.code === "auth/user-not-found"){
          setError("Account with this email does not exist")
        } else if(err.code && err.code === "auth/invalid-email"){
          setError("Email not valid")
        } else {
            setError("Email could not be sent")
        }
      }
    }else{
        setError("Please enter your email address.")
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="shadow-lg md:w-[400px] w-[90%] flex flex-col items-start px-5 pb-6 pt-3 rounded-md bg-white/50">
        <h1 className="text-2xl md:text-[25px] font-bold mb-4 md:mb-[40px] text-sky-900 mr-auto">DiaMate</h1>
        <h3 className="text-xl mb-1 md:text-[18px] font-semibold  text-sky-900">Forgot your password?</h3>
        <p className="text-sm leading-tight mb-8">Enter you email address and we will send you the instructions to reset your password.</p>
        <div className="border py-5 px-3 rounded-lg shadow-md bg-white w-[100%]">
            {
                displaySuccess ? (
                    <>
                    <div className="bg-green-100 border my-2 border-green-500 rounded-md px-3 py-3 text-green-900 font-semibold">
                        <p>Email sent successfully</p>
                    </div>
                    
                    </>
                ) : (
                    <form action="" className="flex flex-col gap-3">
                        <input
                        type="email"
                        name=""
                        id=""
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border py-2 px-3 rounded-md"
                        />
    
                        {error && (
                        <div className="flex items-center gap-1 border py-1 rounded-md text-sm font-semibold text-red-700 bg-red-100 border-red-900 px-2">
                            <VscError />
                            <p className="">{error}</p>
                        </div>
                        )
                        }
    
                        <button
                        type="submit"
                        className="border py-1.5 rounded-md mt-4 bg-sky-900 text-white font-semibold"
                        onClick={handleSubmit}
                        >
                        Send Email
                        </button>
    
                    </form>
                )
                }
                        <div className="flex justify-end">
                            <p className="font-bold text-xs mt-2 cursor-pointer text-sky-700 hover:underline" onClick={() => navigate("/")}>
                                Back to sign in page
                            </p>
                        </div>
           </div>
      </div>
    </div>
  );
};

export default Login;
