import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import { MdKeyboardArrowRight } from "react-icons/md";
import { auth } from '../../utils/firebase';
import axiosInstance from '../../utils/axiosInstance';

const UserCard = ({username, name, surname, isFriend, uid, friendRequestStatus}) => {
    const user = auth.currentUser
    const [isHovered, setIsHovered] = useState(null)
    const [buttonMessage, setButtonMessage] = useState("")
    const [displayRequestOptions, setDisplayRequestOptions] = useState(false)

    useEffect(() => {
        if(!isFriend && !friendRequestStatus) {
            setButtonMessage("Add Friend")
        } else if(!isFriend && friendRequestStatus === "pending") {
            setButtonMessage("Pending...")
        } else if(!isFriend && friendRequestStatus === "action") {
            setDisplayRequestOptions(true)
        } else {
            setButtonMessage("Message")
        }
    }, [isFriend, friendRequestStatus])

    const handleClick = async(e) => {
        e.preventDefault()

        if(buttonMessage === "Add Friend") {
            console.log("trying to send request")
            const token = await user.getIdToken();
            try {
                setButtonMessage("Pending...")
                const response = await axiosInstance.post("/api/friend-request", 
                    { recipientUid: uid }, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
    
                if(response.status === 200) {
                    console.log("done")
                }
    
            } catch (err) {
                setButtonMessage("Add Friend")
                console.error(err)
            }
        }
    }

  return (
    <div
        onMouseEnter={() => setIsHovered(username)}
        onMouseLeave={() => setIsHovered(null)}
        className="shadow-md bg-slate-50 text-slate-800 w-[70%] mx-auto mt-4 py-4 px-4 flex items-center justify-between gap-5 rounded-lg"
    >   
        <div className="flex items-center flex-grow justify-between">
            <div className="flex items-center justify-between gap-10">
                <div>
                    <div className="bg-slate-500 rounded-full w-20 h-20"></div>
                </div>
                <Link to={`/${username}`} className='flex flex-col items-center'>
                <p className={`text-xl font-semibold text-slate-800 ${isHovered === username ? "underline" : ""}`}>{name} {surname}</p>
                    <p className={"text-lg text-slate-400"}>@{username}</p>
                </Link>
            </div>
            <div className="mr-10">
                <button onClick={handleClick} className='border px-2 py-1 rounded-md hover:bg-slate-100 hover:shadow-sm'>{buttonMessage}</button>
                {/* {
                    isFriend ? (
                        <button className='border px-2 py-1 rounded-md'>Message</button>
                    ) : (
                        <button onClick={sendFriendRequest} className='border px-2 py-1 rounded-md'> Add Friend</button>
                    )
                } */}
            </div>
        </div>
        <Link to={`/${username}`} className="text-slate-800">
            <MdKeyboardArrowRight size={40} />
        </Link>
</div>
  )
}

export default UserCard