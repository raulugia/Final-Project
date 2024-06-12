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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [error, setError] = useState();
  const [user, setUser] = useState();
  const [authenticated, setAuthenticated] = useState(false);

  const provider = new GoogleAuthProvider();

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email && password) {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          setUser(userCredential.user);
          setAuthenticated(true);
          console.log("success", user);
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  };

  const googleSignIn = async () => {
    signInWithPopup(auth, provider)
      .then((userCredential) => {
        setUser(userCredential.user);
        setAuthenticated(true);
      })
      .catch((err) => {
        setError(err.message);
      });
    console.log("success");
  };

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
