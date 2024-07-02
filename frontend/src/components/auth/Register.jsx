import React, { useState, useReducer } from "react";
import { auth } from "../../../utils/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import axiosInstance from "../../../utils/axiosInstance"

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

const Register = () => {
  //state to store errors
  const [error, setError] = useState();
  //hook to manage user details
  const [newUser, dispatch] = useReducer(reducer, {});
  //hook to navigate withing the web app
  const navigate = useNavigate();

  //method triggered after the user submits the form to register
  const handleSubmit = async (e) => {
    e.preventDefault();

    //if all the details were provided 
    if (newUser.name && newUser.surname && newUser.email && newUser.password) {
        try{
            //send a POST request with the user's data so it can be saved in the database in Railway
            await axiosInstance.post("/api/register", {
              email: newUser.email,
              name: newUser.name,
              surname: newUser.surname,
              username: newUser.username,
            })
            
            //create a new user with the email and password provided in the form - new user will be signed in
            const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password)
            //store new user
            const user = userCredential.user;
            //update the user's name in Firebase
            await updateProfile(user, { displayName: newUser.name })

            //navigate to "/home"
            navigate("/home")
        } catch(err) {
            console.log(err.message)
            setError(err.message)
        }
    }
  };

  return (
    <div className="flex justify-center items-center h-full bg-slate-50">
      <div className="border py-5 px-3 rounded-lg shadow-md bg-white">
        <p className="mb-5 text-2xl font-semibold">Register Now!</p>

        <form action="" className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Name"
              className="border py-2 px-3 rounded-md"
              onChange={(e) =>
                dispatch({ type: "name", payload: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Surname"
              className="border py-2 px-3 rounded-md"
              onChange={(e) =>
                dispatch({ type: "surname", payload: e.target.value })
              }
            />
          </div>

          <input
            type="text"
            name=""
            id=""
            className="border py-2 px-3 rounded-md"
            placeholder="Username"
            onChange={(e) =>
              dispatch({ type: "username", payload: e.target.value })
            }
          />
          <input
            type="email"
            name=""
            id=""
            className="border py-2 px-3 rounded-md"
            placeholder="Email"
            onChange={(e) =>
              dispatch({ type: "email", payload: e.target.value })
            }
          />
          <input
            type="password"
            name=""
            id=""
            className="border py-2 px-3 rounded-md"
            placeholder="Password"
            onChange={(e) =>
              dispatch({ type: "password", payload: e.target.value })
            }
          />

          <button
            type="submit"
            className="border py-1.5 rounded-md mt-4 bg-black text-white font-semibold"
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
