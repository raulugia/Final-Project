import React, {useState, useEffect} from 'react'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'
import MealCard from '../components/MealCard'
import SkeletonMealCard from '../components/SkeletonMealCard'
import { useParams } from 'react-router-dom'
import Error from '../components/Error'

//this component displays the meals linked to a certain restaurant
//rendered by route "/my-restaurants/:restaurantId"
const RestaurantMeals = () => {
    //get current user
    const user = auth.currentUser
    //state to hold all meals
    const [meals, setMeals] = useState([])
    //state to display filtered meals
    const [filteredMeals, setFilteredMeals] = useState([])
    //state to store the search input value
    const [searchInput, setSearchInput] = useState("")
    const [loading, setLoading] = useState(true)
    //const [hoveredMeal, setHoveredMeal] = useState(null)
    const { restaurantId } = useParams()
    //state to store an error message
    const [error, setError] = useState("")

    //fetch meals linked to a certain restaurant and display them
    useEffect(() => {
        (
            async() => {
                try{
                    //get the id token
                    const token = await user.getIdToken();

                    //make a get request to get the user's restaurants passing the id token for verification
                    const { data } = await axiosInstance.get(`/my-restaurants/${restaurantId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
                    
                    //sort data alphabetically by meal name
                    const sortedData = data.sort((a, b) => {
                      //convert meal names to lowercase for case-insensitive comparison
                      const mealNameA = a.mealName.toLowerCase();
                      const mealNameB = b.mealName.toLowerCase();
                      
                      //case mealNameA comes before mealNameB
                      if (mealNameA < mealNameB) {
                        return -1;
                      }

                      //case mealNameB comes before mealNameA
                      if (mealNameA < mealNameB) {
                        return 1;
                      }

                      //case order does not change
                      return 0;
                    });
                    
                    //update states to display sorted meals
                    setMeals(sortedData)
                    setFilteredMeals(sortedData)
                    //stop rendering loading component
                    setLoading(false)
                } catch(err) {
                    //update state to display an error message
                    if(err.response && err.response.data && err.response.data.error){
                        setError(err.response.data.error)
                    } else {
                        setError("Failed to load meals. Please try again later.")
                    }
                } finally {
                    //hide loading state
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
                return item.mealName.toLowerCase().includes(searchValue.toLowerCase())
            })
            //update state so the filtered meals are displayed
            setFilteredMeals(filtered)
        }
    }
  return (
    <div className='flex flex-col min-h-screen pb-16 gap-4 bg-slate-200'>
        <h1 className='text-2xl font-semibold mt-20 mb-4 ml-[5%] text-slate-800'>{meals[0]?.restaurantName} Meals</h1>
        <div className='flex flex-col gap-4 py-10 mx-auto mt-5 w-[85%] md:w-[70%] rounded-lg backdrop-blur-sm bg-white/30 shadow-lg ring-1 ring-slate-200'>
            <div action="" className='absolute h-fit inset-0 mt-[-30px] mx-5 md:mx-10'>
                <input type="search" name="" id="" value={searchInput} placeholder='Search for meals...' 
                    className='py-3 px-6 text-lg w-full rounded-full shadow-md'
                    onChange={handleInputChange}
                />
            </div>
            {   
                loading ? (
                    <SkeletonMealCard />
                ) : (
                    error ? (
                        <div className="mx-8 mt-5">
                            <Error message={error} />
                        </div>
                    ): (
                        filteredMeals.map(meal => (
                            <MealCard key={meal.mealId} id={meal.mealId} mealName={meal.mealName} thumbnailUrl={meal.thumbnail}/>
                        ))
                    )
                )
            }
        </div>
    </div>
  )
}

export default RestaurantMeals