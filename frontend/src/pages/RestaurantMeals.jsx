import React, {useState, useEffect} from 'react'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'
import MealCard from '../components/MealCard'
import SkeletonMealCard from '../components/SkeletonMealCard'
import { useParams } from 'react-router-dom'

const RestaurantMeals = () => {
    const user = auth.currentUser
    const [meals, setMeals] = useState([])
    const [filteredMeals, setFilteredMeals] = useState([])
    //state to store the search input value
    const [searchInput, setSearchInput] = useState("")
    const [loading, setLoading] = useState(true)
    //const [hoveredMeal, setHoveredMeal] = useState(null)
    const { restaurantId } = useParams()

    useEffect(() => {
        (
            async() => {
                try{
                    //get the id token
                    const token = await user.getIdToken();

                    //make a get request to get the user's restaurants passing the id token for verification
                    const { data } = await axiosInstance.get(`/api/my-restaurants/${restaurantId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
                    
                    //sort data alphabetically by meal name
                    const sortedData = data.sort((a, b) => {
                      const mealNameA = a.mealName.toLowerCase();
                      const mealNameB = b.mealName.toLowerCase();

                      if (mealNameA < mealNameB) {
                        return -1;
                      }

                      if (mealNameA < mealNameB) {
                        return 1;
                      }

                      return 0;
                    });
                    
                    console.log(sortedData)
                    setMeals(sortedData)
                    setFilteredMeals(sortedData)
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
            const filtered = meals.filter(item=> {
                return item.mealName.toLowerCase().includes(searchValue.toLowerCase())
            })
            //update state so the filtered meals are displayed
            setFilteredMeals(filtered)
        }
    }
  return (
    <div className='flex flex-col min-h-screen pb-16 gap-4 bg-slate-200'>
        <h1 className='text-2xl font-semibold mt-20 mb-4 ml-[5%] text-slate-800'>My Meals</h1>
        <div className='flex flex-col gap-4 py-10 mx-auto mt-5 w-[85%] md:w-[70%] rounded-lg backdrop-blur-sm bg-white/30 shadow-lg ring-1 ring-slate-200'>
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

                    filteredMeals.map(meal => (
                        <MealCard key={meal.id} id={meal.id} mealName={meal.mealName} restaurantName={item.meal.restaurant.name} thumbnailUrl={item.thumbnail}/>
                    ))
                )
            }
        </div>
    </div>
  )
}

export default RestaurantMeals