import React, { useState } from "react";
import {auth} from '../../../utils/firebase'
import {signInWithEmailAndPassword} from 'firebase/auth'
import { Navigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState();
  const [user, setUser] = useState()
  const [authenticated, setAuthenticated] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (email && password) {
        signInWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                setUser(userCredential.user)
                setAuthenticated(true)
                console.log("success", user)
            })
            .catch(err => {
                setError(err.message)
            })
    }
  }

  if(authenticated) {
    return <Navigate to="/home" />
  }

  return (
    <div className="flex justify-center items-center h-full bg-slate-50">
      <div className="border py-4 px-3 rounded-lg w-1/5 shadow-md bg-white">
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

          {
            error && (
                <p>{error}</p>
            )
          }

          <button
            type="submit"
            className="border py-1.5 rounded-md mt-4 bg-black text-white font-semibold"
            onClick={handleSubmit}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
