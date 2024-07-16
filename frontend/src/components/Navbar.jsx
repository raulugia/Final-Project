import React, { useState, useEffect } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { FaSearch } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const Navbar = ({ name }) => {
    const [searchInput, setSearchInput] = useState("")
    const [displayName, setDisplayName] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        setDisplayName(name)
    }, [name])

    const handleSubmit = e => {
        e.preventDefault()
        navigate(`/search?query=${searchInput}`)
    }
    
  return (
    <>
    <div className='py-2 px-6 flex justify-between items-center fixed z-10 w-full text-slate-800 backdrop-blur-[5px] bg-white/40 shadow-md'>
        <div>
            <Link to="/home" className='text-2xl font-bold'>DiaMate</Link>
        </div>
        <div className='flex gap-10 justify-around text-md font-semibold'>
            <Link to="/log-meal" className=''>Log Meal</Link>
            <Link to="/friends" className=''>My Meals</Link>
            <Link to="/my-restaurants" className=''>My Restaurants</Link>
            <Link to="/friends" className=''>Friends</Link>
        </div>
        <form className='flex w-64 items-center gap-1' onSubmit={handleSubmit}>
            <input type="search" name="" id="" placeholder="Search meals, restaurants"
                value={searchInput} 
                className='rounded-md w-full px-2'
                onChange={e => setSearchInput(e.target.value)}
            />
            <button type="submit"><FaSearch color={"white"} className='hover:cursor-pointer'/></button>
        </form>
        <div>
            <p className='text-sm text-black'>Hello, {displayName}</p>
        </div>
    </div>
    <Outlet />
    </>
  )
}

export default Navbar