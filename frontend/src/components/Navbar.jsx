import React, { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { FaSearch } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const Navbar = ({ name }) => {
    const [searchInput, setSearchInput] = useState("")
    const navigate = useNavigate()

    const handleSubmit = e => {
        e.preventDefault()
        navigate(`/search?query=${searchInput}`)
    }
    
  return (
    <>
    <div className='bg-black py-2 px-6 flex justify-between items-center fixed w-full'>
        <div>
            <Link to="/home" className='text-2xl text-white'>DiaMate</Link>
        </div>
        <div className='flex gap-10 justify-around'>
            <Link to="/log-meal" className='text-md text-white'>Log Meal</Link>
            <Link to="/friends" className='text-md text-white'>My Meals</Link>
            <Link to="/friends" className='text-md text-white'>My Restaurants</Link>
            <Link to="/friends" className='text-md text-white'>Friends</Link>
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
            <p className='text-sm text-white'>Hello, {name}</p>
        </div>
    </div>
    <Outlet />
    </>
  )
}

export default Navbar