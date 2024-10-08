import React, {useState, useEffect} from 'react'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'
import MealCard from '../components/MealCard'
import SkeletonMealCard from '../components/SkeletonMealCard'
import { useParams } from 'react-router-dom'
import Error from '../components/Error'

//All the code in this file was written without assistance 

const Meals = () => {
    //get current user
    const user = auth.currentUser
    //state to store meals
    const [meals, setMeals] = useState([])
    //state to store filtered meals
    const [filteredMeals, setFilteredMeals] = useState([])
    //state to store the search input value
    const [searchInput, setSearchInput] = useState("")
    const [loading, setLoading] = useState(true)
    //get username from url
    const { username } = useParams()
    //state to display errors
    const [error, setError] = useState("")

    //fetch meals
    useEffect(() => {
        (
            async() => {
                try{
                    setError("")
                    //get the id token
                    const token = await user.getIdToken();

                    //make a get request to get the the current user/other user's restaurants
                    const { data } = await axiosInstance.get(`${username ? `/api/user/${username}/meals` : "/api/meals"}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
                    
                    //sort data alphabetically by meal name
                    const sortedData = data.sort((a, b) => {
                      const mealNameA = a.meal.name.toLowerCase();
                      const mealNameB = b.meal.name.toLowerCase();

                      if (mealNameA < mealNameB) {
                        return -1;
                      }

                      if (mealNameA < mealNameB) {
                        return 1;
                      }

                      return 0;
                    });
                    
                    //update status with sorted meals
                    setMeals(sortedData)
                    setFilteredMeals(sortedData)

                    //set loading to false
                    setLoading(false)
                } catch(err) {
                    //display error
                    if(err.response && err.response.data && err.response.data.error){
                        setError(err.response.data.error)
                    } else {
                        setError("Failed to retrieve the data. Please try again later.")
                    }
                } finally {
                    setLoading(false)
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
            const filtered = meals.filter(item=> {
                return item.meal.name.toLowerCase().includes(searchValue.toLowerCase())
            })
            //update state so the filtered meals are displayed
            setFilteredMeals(filtered)
        }
    }
  return (
    <div className='flex flex-col min-h-screen pb-16 gap-4 bg-slate-200'>
        <h1 className='text-2xl font-semibold mt-20 mb-4 ml-[5%] text-slate-800'>My Meals</h1>
        <div className='flex flex-col gap-4 py-10 mx-auto mt-5 w-[85%] md:w-[70%] min-h-[500px] rounded-lg backdrop-blur-sm bg-white/30 shadow-lg ring-1 ring-slate-200'>
            <form action="" className='absolute h-fit inset-0 mt-[-30px] mx-5 md:mx-10'>
                <input type="search" name="" id="" value={searchInput} placeholder='Search for meals...' 
                    className='py-3 px-6 text-lg w-full rounded-full shadow-md'
                    onChange={handleInputChange}
                />
            </form>
            {   
                loading ? (
                    <SkeletonMealCard />
                ) : (
                    error ? (
                        <div className="mx-8 mt-5">
                            <Error message={error} />
                        </div>
                    ) : (
                        filteredMeals.map(item => (
                            <MealCard key={item.id} id={item.meal.id} mealName={item.meal.name} restaurantName={item.meal.restaurant.name} thumbnailUrl={item.thumbnail} username={username}/>
                        ))
                    )
                )
            }
        </div>
    </div>
  )
}

export default Meals