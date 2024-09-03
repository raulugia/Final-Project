import React from 'react'
import Accuracy from './Accuracy'
import { Link } from 'react-router-dom'

const HomeMealCard = React.forwardRef(({mealName, restaurantName, logId, mealId, createdAt, rating, picture, carbEstimate, isOtherUser, user, description}, ref) => {
    return (
    <Link 
        ref={ref}
        //route changes based on whose logs are being rendered (current user vs other user) 
        to={`${isOtherUser ? `/user/${user.username}/meals/${mealId}/log/${logId}` : `/my-meals/${mealId}/log/${logId}`}`} 
        className='rounded-2xl overflow-hidden shadow-md max-w-[456px] bg-white flex flex-col'
    >   
        {/* <div className='min-h-1/2 flex flex-col items-center bg-gradient-to-t from-blue-600 to-cyan-500 relative pt-2'> */}
        <div className='min-h-1/2 flex flex-col items-center bg-gradient-to-t from-sky-900 to-cyan-600 relative pt-2'>
            <div className='mb-3'>
                <p className='text-white font-bold text-2xl'>{mealName.toUpperCase()}</p>
                <p className='text-white font-semibold'>{restaurantName}</p>
            </div>
            <div className='w-[250px] min-h-[250px] rounded-3xl overflow-hidden z-10 shadow-md'>
                {
                    picture ? (
                        <img className='w-full h-full object-cover' src={picture} alt={mealName} />
                    ) : (
                        <div className='w-full h-full flex items-center justify-center bg-slate-100'>
                            <p className='text-slate-300'>Your picture is being processed.</p>
                        </div>
                    )
                }
                
            </div>
            <div className='flex items-center justify-center border rounded-3xl bg-white w-[340px] h-[320px] absolute top-[130px] shadow-lg'>
                <div className='flex flex-col gap-2 mt-[163px]'>
                    <p 
                        className='text-sm mx-10 h-[33px] w-[250px] leading-[15px] text-slate-600 font-semibold' 
                        style={{overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, textOverflow: "ellipsis"}}
                    >
                        {description}
                    </p>
                    <p className='mx-auto text-xl font-semibold text-slate-400'>Carbs: <span className='text-sky-800 font-bold text-2xl'>{carbEstimate}g</span></p>
                </div>
            </div>
            <div className='absolute z-20 bottom-[-135px]'>
                {
                    // rating === "ACCURATE" || rating === "INACCURATE" || rating === "SLIGHTLY_INACCURATE" ? (
                    //     <Accuracy accuracy={rating} style={"text-lg px-2 font-semibold rounded-md"}/>
                    // ) : rating === "waiting" ? (
                    //     <div>Not available yet</div>
                    // ) : (
                    //     <div>Rate your meal</div>
                    // )
                    <Accuracy accuracy={rating} style={"text-lg px-2 font-semibold rounded-md"}/>
                }
            </div>
        </div>
        <div className='h-1/2 bg-gray-100 min-h-[180px] flex items-end justify-end'>
            <p className='text-sm mb-2 mr-6 text-slate-500'>{createdAt}</p>
        </div>
        {/* <div className='min-w-full max-w-[415px] min-h-[300px] rounded-md overflow-hidden'>
            <img className='w-full' src={picture} alt={mealName} />
        </div>
        
        <div>
            <div className='flex justify-between items-center mt-2'>
            <div className='leading-[18px]'>
                <p className='text-md md:text-2xl font-semibold text-slate-700'>{mealName}</p>
                <p className='text-sm md:text-md text-gray-400'>{restaurantName}</p>
            </div>
            <div className='flex gap-5 items-center'>
                <div className='bg-slate-200 rounded-full px-2'>
                    <p className='text-slate-700 font-semibold'>{carbEstimate}g</p>
                </div>
                {
                    rating === "ACCURATE" || rating === "INACCURATE" || rating === "SLIGHTLY_INACCURATE" ? (
                        <Accuracy accuracy={rating}/>
                    ) : rating === "waiting" ? (
                        <div>Not available yet</div>
                    ) : (
                        <div>Rate your meal</div>
                    )
                }
            </div>
            </div>
        </div>

        <div className='flex justify-end'>
            <p className='text-sm text-gray-400 mt-3'>{createdAt}</p>
        </div> */}

    </Link>
    // <Link 
    //     ref={ref}
    //     //route changes based on whose logs are being rendered (current user vs other user) 
    //     to={`${isOtherUser ? `/user/${user.username}/meals/${mealId}/log/${logId}` : `/my-meals/${mealId}/log/${logId}`}`} 
    //     className='py-4 px-5 rounded-md border border-slate-200 shadow-md max-w-[456px] bg-white'
    // >
    //     <div className='min-w-full max-w-[415px] min-h-[300px] rounded-md overflow-hidden'>
    //         <img className='w-full' src={picture} alt={mealName} />
    //     </div>
        
    //     <div>
    //         <div className='flex justify-between items-center mt-2'>
    //         <div className='leading-[18px]'>
    //             <p className='text-md md:text-2xl font-semibold text-slate-700'>{mealName}</p>
    //             <p className='text-sm md:text-md text-gray-400'>{restaurantName}</p>
    //         </div>
    //         <div className='flex gap-5 items-center'>
    //             <div className='bg-slate-200 rounded-full px-2'>
    //                 <p className='text-slate-700 font-semibold'>{carbEstimate}g</p>
    //             </div>
    //             {
    //                 rating === "ACCURATE" || rating === "INACCURATE" || rating === "SLIGHTLY_INACCURATE" ? (
    //                     <Accuracy accuracy={rating}/>
    //                 ) : rating === "waiting" ? (
    //                     <div>Not available yet</div>
    //                 ) : (
    //                     <div>Rate your meal</div>
    //                 )
    //             }
    //         </div>
    //         </div>
    //     </div>

    //     <div className='flex justify-end'>
    //         <p className='text-sm text-gray-400 mt-3'>{createdAt}</p>
    //     </div>

    // </Link>
  )
})

export default HomeMealCard