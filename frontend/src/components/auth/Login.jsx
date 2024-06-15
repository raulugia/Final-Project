import React, { useState } from "react";
import { auth } from "../../../utils/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import Register from "./Register";
import axiosInstance from "../../../utils/axiosInstance"

const Login = () => {
  //states to store email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //state to store errors
  const [error, setError] = useState();
  //state to store the user
  const [user, setUser] = useState();
  //state to check if the user is authenticated
  const [authenticated, setAuthenticated] = useState(false);

  //create an instance of the Google provider object
  const provider = new GoogleAuthProvider();
  //hook for navigation
  const navigate = useNavigate();

  //method triggered when the user submits the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    //if email and password have been provided
    if (email && password) {
      try{
          //sign in with email and password
          const userCredential = await signInWithEmailAndPassword(auth, email, password)
          //store the returned user
          const user = userCredential.user
          
          //update the state with the authenticated user
          setUser(user)
          //update authenticated to true
          setAuthenticated(true);
          console.log("success", user);
      } catch(err) {
          setError(err.message)
      }
    }
  };

  //method triggered if user clicks on the sign in with Google button
  const googleSignIn = async () => {
    try{
        //sign in with Google using a popup
        const userCredential = await signInWithPopup(auth, provider)
        //store the authenticated user
        const user = userCredential.user

        //update state with the user
        setUser(user)
        //update state to true
        setAuthenticated(true);

        //check if the user is new or existing. If the creationTime and lastSignInTime are the same, the user is new.
        const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;

        //if the user is new
        if(isNewUser) {
            //send a POST request to the server so the user is added to the database in Railway
            await axiosInstance.post("/api/register", {
                email: user.email,
                name: user.displayName || "",
                surname: "",
            })
        }

        console.log("success", user)
    } catch(err) {
        //update the error state if there was an error
        setError(err.message)
    }
  };

  //if the user is authenticated, navigate to "/home"
  if (authenticated) {
    return <Navigate to="/home" />;
  }

  return (
    <div className="flex justify-center items-center h-full bg-slate-50">
      <div className="border py-5 px-3 rounded-lg lg:w-[35%] md:w-1/3 shadow-md bg-white">
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
          <input
            type="password"
            name=""
            id=""
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border py-2 px-3 rounded-md"
          />

          {error && <p>{error}</p>}

          <button
            type="submit"
            className="border py-1.5 rounded-md mt-4 bg-black text-white font-semibold"
            onClick={handleSubmit}
          >
            Sign In
          </button>

          <div className="flex justify-end">
            <p className="text-xs">
              Don't have an account?
              <span className="font-bold cursor-pointer text-blue-500 hover:underline" onClick={() => navigate("/register")}>
                Register
              </span>
            </p>
          </div>

          <div className="flex justify-around items-center gap-1.5 my-2">
            <div className="flex-grow border-t"></div>
            <p className="text-sm text-gray-400">or</p>
            <div className="flex-grow border-t"></div>
          </div>

          <button
            type="button"
            className="border py-1.5 rounded-md bg-white text-black font-semibold hover:bg-gray-50"
            onClick={googleSignIn}
          >
            <div className="flex justify-center items-center gap-4">
              <FcGoogle size={24} /> Sign In with Google
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
