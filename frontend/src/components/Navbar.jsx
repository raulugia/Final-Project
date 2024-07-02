import React from 'react'
import { Outlet, Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <>
    <div className='bg-black py-2 px-6 flex justify-between items-center'>
        <div>
            <Link to="/home" className='text-2xl text-white'>DiaMate</Link>
        </div>
        <div className='flex gap-10 justify-around'>
            <Link to="/log-meal" className='text-md text-white'>Log Meal</Link>
            <Link to="/friends" className='text-md text-white'>My Meals</Link>
            <Link to="/friends" className='text-md text-white'>My Restaurants</Link>
            <Link to="/friends" className='text-md text-white'>Friends</Link>
        </div>
        <div>
            <p className='text-sm text-white'>Hello, Ashley</p>
        </div>
    </div>
    <Outlet />
    </>
  )
}

export default Navbar