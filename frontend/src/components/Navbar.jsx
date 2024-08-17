import React, { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { FaSearch } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { signOut } from "firebase/auth"
import { auth } from '../../utils/firebase';

const Navbar = ({ name }) => {
    const [searchInput, setSearchInput] = useState("")
    const [displayName, setDisplayName] = useState("")
    const [displayOptions, setDisplayOptions] = useState(false)
    const navigate = useNavigate()
    

    const handleSubmit = e => {
        e.preventDefault()
        navigate(`/search?query=${searchInput}`)
    }

    const logOut = async() => {
        signOut(auth).then(() => {
            navigate("/")
        }).catch(err => {
            alert("There was an error logging out")
        })
    }
    
  return (
 
    <div className='py-2 px-6 flex w-full justify-between items-center fixed z-40 text-slate-800 backdrop-blur-[5px] bg-white/40 shadow-md'>
        <div>
            <Link to="/home" className='text-2xl font-bold'>DiaMate</Link>
        </div>
        <div className='flex gap-10 justify-around text-md font-semibold'>
            <Link to="/log-meal" className=''>Log Meal</Link>
            <Link to="/my-meals" className=''>My Meals</Link>
            <Link to="/my-restaurants" className=''>My Restaurants</Link>
            <Link to="/friends" className=''>Friends</Link>
            <Link to="/chats" className=''>Chats</Link>
        </div>
        <div className='flex gap-4'>
            <form className='flex max-w-64 items-center gap-1' onSubmit={handleSubmit}>
                <input type="search" name="" id="" placeholder="Search meals, restaurants"
                    value={searchInput} 
                    className='rounded-md w-full px-2'
                    onChange={e => setSearchInput(e.target.value)}
                />
                <button type="submit"><FaSearch color={"white"} className='hover:cursor-pointer'/></button>
            </form>
            <div class={`relative select-none ${displayOptions ? "bg-slate-100" : ""}`}>
                <div class="flex items-center">
                    {
                        displayOptions ? (
                            <IoIosArrowUp />
                        ) : (
                            <IoIosArrowDown />
                        )
                    }
                    <p className={`text-sm text-black px-1 hover:cursor-pointer`} onClick={() => setDisplayOptions(!displayOptions)}> Hello, {name}</p>
                </div>
                <div className={`bg-slate-100 w-full px-1 top-5 text-sm pt-3 pb-2 flex flex-col gap-1 ${displayOptions ? "absolute shadow-md" : "hidden"}`}>
                    <a href="/account" class="hover:underline hover:cursor-pointer">My Account</a>
                    <p class="hover:underline hover:cursor-pointer" onClick={logOut}>Log out</p>
                </div>
            </div>
        </div>
    </div>


  )
}

export default Navbar