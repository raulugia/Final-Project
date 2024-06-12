import React, { useState, useReducer } from "react";

const reducer = (newUser, action) => {
    switch (action.type) {
        case "name":
            return {...newUser, name: action.payload}
        case "surname":
            return {...newUser, surname: action.payload}
        case "email":
            return {...newUser, email: action.payload}
        case "password":
            return {...newUser, password: action.payload}
        default:
            return newUser
    }
}

const Register = () => {
  const [error, setError] = useState();

  const [newUser, dispatch] = useReducer(reducer, {})

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
              onChange={(e) => dispatch({type: "name", payload: e.target.value})}
            />
            <input
              type="text"
              placeholder="Surname"
              className="border py-2 px-3 rounded-md"
              onChange={(e) => dispatch({type: "surname", payload: e.target.value})}
            />
          </div>

          <input
            type="email"
            name=""
            id=""
            className="border py-2 px-3 rounded-md"
            placeholder="Email"
            onChange={(e) => dispatch({type: "email", payload: e.target.value})}
          />
          <input
            type="password"
            name=""
            id=""
            className="border py-2 px-3 rounded-md"
            placeholder="Password"
            onChange={(e) => dispatch({type: "password", payload: e.target.value})}
          />

          <button
            type="submit"
            className="border py-1.5 rounded-md mt-4 bg-black text-white font-semibold"
            //   onClick={handleSubmit}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
