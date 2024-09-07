import React, { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { FaSearch } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { signOut } from "firebase/auth"
import { auth } from '../../utils/firebase';
import { CgLogOut } from "react-icons/cg";

//All the code in this file was written without assistance 

//Navbar is responsive - hamburger menu will appear on small screens

const Navbar = ({ name }) => {
    //state to store the search query
    const [searchInput, setSearchInput] = useState("")
    //state to toggle the visibility of the options element
    const [displayOptions, setDisplayOptions] = useState(false)
    //state to toggle the visibility of the navbar on small screens - triggered by hamburger button
    const [displayLinks, setDisplayLinks] = useState(false)
    const navigate = useNavigate()
    
    //method to navigate user on submit - search bar
    const handleSubmit = e => {
        e.preventDefault()
        navigate(`/search?query=${searchInput}`, {replace: true})
    }

    //method to log the user out
    const logOut = async() => {
        signOut(auth).then(() => {
            navigate("/")
        }).catch(err => {
            alert("There was an error logging out")
        })
    }
    
  return (
 
    <nav className='py-2 px-3 md:px-6 flex w-full justify-between items-center fixed z-40 text-slate-800 backdrop-blur-[5px] bg-white/40 shadow-md'>
        <div>
            <Link to="/home" className='text-2xl font-bold'>DiaMate</Link>
        </div>

        <div className='lg:flex md:gap-10 lg:justify-around lg:text-md font-semibold hidden'>
            <Link to="/log-meal" className=''>Log Meal</Link>
            <Link to="/my-meals" className=''>My Meals</Link>
            <Link to="/my-restaurants" className=''>My Restaurants</Link>
            <Link to="/friends" className=''>Friends</Link>
            <Link to="/chats" className=''>Chats</Link>
        </div>

        {/* Links for small screens */}
        <div className={`rounded-sm shadow-md gap-5 z-40 bg-slate-200 pl-3 pr-6 py-2 md:justify-around text-md font-semibold absolute top-14 right-0 min-w-full ${displayLinks ? "flex flex-col" : "hidden"}`}>
            <Link onClick={() => setDisplayLinks(!displayLinks)} to="/log-meal" className=''>Log Meal</Link>
            <Link onClick={() => setDisplayLinks(!displayLinks)} to="/my-meals" className=''>My Meals</Link>
            <Link onClick={() => setDisplayLinks(!displayLinks)} to="/my-restaurants" className=''>My Restaurants</Link>
            <Link onClick={() => setDisplayLinks(!displayLinks)} to="/friends" className=''>Friends</Link>
            <Link onClick={() => setDisplayLinks(!displayLinks)} to="/chats" className=''>Chats</Link>
            <Link onClick={() => setDisplayLinks(!displayLinks)} to="/account" className=''>Account</Link>
            <div className="flex gap-2 items-center justify-end">
                <CgLogOut />
                <p className='' onClick={logOut}>Log Out</p>
            </div>
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
            <div className={`lg:relative lg:block lg:select-none hidden ${displayOptions ? "bg-slate-100" : ""}`}>
                <div className="flex items-center">
                    {
                        displayOptions ? (
                            <IoIosArrowUp className="hover:cursor-pointer" onClick={() => setDisplayOptions(!displayOptions)}/>
                        ) : (
                            <IoIosArrowDown className="hover:cursor-pointer" onClick={() => setDisplayOptions(!displayOptions)}/>
                        )
                    }
                    <p className={`text-sm text-black px-1 hover:cursor-pointer`} onClick={() => setDisplayOptions(!displayOptions)}> Hello, {name}</p>
                </div>
                <div className={`bg-slate-100 w-full px-1 top-5 text-sm pt-3 pb-2 flex flex-col gap-1 ${displayOptions ? "absolute shadow-md" : "hidden"}`}>
                    <a href="/account" className="hover:underline hover:cursor-pointer">My Account</a>
                    <p className="hover:underline hover:cursor-pointer" onClick={logOut}>Log out</p>
                </div>
            </div>
        </div>
        {/* Hamburger button */}
        <button 
            type="button" 
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-slate-500 rounded-lg lg:hidden hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200"
            onClick={() => setDisplayLinks(!displayLinks)}
        >
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
            </svg>
        </button>
    </nav>


  )
}

export default Navbar