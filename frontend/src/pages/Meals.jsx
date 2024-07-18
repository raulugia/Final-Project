import React, {useState, useEffect} from 'react'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'
import { MdKeyboardArrowRight } from "react-icons/md";

const Meals = () => {
    const user = auth.currentUser
    const [meals, setMeals] = useState([])
    const [filteredMeals, setFilteredMeals] = useState([])
    //state to store the search input value
    const [searchInput, setSearchInput] = useState("")
    const [loading, setLoading] = useState(true)
    const [hoveredMeal, setHoveredMeal] = useState(null)

    useEffect(() => {
        (
            async() => {
                try{
                    //get the id token
                    const token = await user.getIdToken();

                    //make a get request to get the user's restaurants passing the id token for verification
                    const { data } = await axiosInstance.get("/api/meals", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
                    console.log(data)
                    setMeals(data)
                    setFilteredMeals(data)
                    setLoading(false)
                } catch(err) {
                    console.log(err)
                }
            }
        )()
    }, [])

    //method triggered by typing in the search bar - filter meals
    const handleInputChange = (e) => {
        //store input value
        const searchValue = e.target.value
        //update state
        setSearchInput(searchValue)

        //if meals were found
        if(meals.length > 0) {
            //get the meals that match the search input
            const filtered = meals.filter(restaurant => {
                return meal.name.toLowerCase().includes(searchValue.toLowerCase())
            })

            //update state so the filtered meals are displayed
            setFilteredMeals(filtered)
        }
    }
  return (
    <div className='flex flex-col min-h-screen pb-16 gap-4 bg-slate-200'>
        <h1 className='text-2xl font-semibold mt-20 mb-4 ml-[5%] text-slate-800'>My Meals</h1>
        <div className='flex flex-col gap-4 py-10 mx-auto mt-5 w-[70%] rounded-lg backdrop-blur-sm bg-white/30 shadow-lg ring-1 ring-slate-200'>
            <form action="" className='absolute h-fit inset-0 mt-[-30px] mx-10'>
                <input type="search" name="" id="" value={searchInput} placeholder='Search for meals...' 
                    className='py-3 px-6 text-lg w-full rounded-full shadow-md'
                    onChange={handleInputChange}
                />
            </form>
            <div className='flex flex-col gap-4 mt-4'>
            </div>
            {
                filteredMeals.map(item => (
                    <div className='shadow-md bg-slate-50 text-slate-800 w-[70%] h-32 mx-auto mt-4 py-4 px-4 flex items-center justify-between gap-5 rounded-lg'>
                        <div className='flex gap-10 justify-start'>
                            <div className='border h-24 w-24 rounded-md overflow-hidden'>
                                <img src={item.thumbnail} alt="" className='h-full'/>
                            </div>
                            <div className='flex flex-col mt-3'>
                                <p className='text-lg font-semibold'>{item.meal.name}</p>
                                <p className='text-md text-gray-400'>{item.meal.restaurant.name}</p>
                            </div>
                        </div>
                        <MdKeyboardArrowRight size={40} />
                    </div>
                ))
            }
        </div>
    </div>
  )
}

export default Meals