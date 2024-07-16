import React, {useState} from 'react'
import { Link } from 'react-router-dom'
import { MdKeyboardArrowRight } from "react-icons/md";
import { auth } from '../../utils/firebase';
import axiosInstance from '../../utils/axiosInstance';

const UserCard = ({username, name, surname, isFriend, uid}) => {
    const user = auth.currentUser
    const [isHovered, setIsHovered] = useState(null)
    const [requestSent, setRequestSent] = useState(false)

    const sendFriendRequest = async(e) => {
        e.preventDefault()

        const token = await user.getIdToken();
        try {
            const response = await axiosInstance.post("/api/friend-request", 
                { recipientUid: uid }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if(response.status === 200) {
                setRequestSent(true)
            }

        } catch (err) {
            console.error(err)
        }
    }
  return (
    <Link to={`/${username}`}
        onMouseEnter={() => setIsHovered(username)}
        onMouseLeave={() => setIsHovered(null)}
        className="shadow-md bg-slate-50 text-slate-800 w-[70%] mx-auto mt-4 py-4 px-4 flex items-center justify-between gap-5 rounded-lg"
    >   
        <div className="flex items-center flex-grow justify-between">
            <div className="flex items-center justify-between gap-10">
                <div>
                    <div className="bg-slate-500 rounded-full w-20 h-20"></div>
                </div>
                <div className='flex flex-col items-center'>
                <p className={`text-xl font-semibold text-slate-800 ${isHovered === username ? "underline" : ""}`}>{name} {surname}</p>
                    <p className={"text-lg text-slate-400"}>@{username}</p>
                </div>
            </div>
            <div className="mr-10">
                {
                    isFriend ? (
                        <button className='border px-2 py-1 rounded-md'>Message</button>
                    ) : (
                        <button onClick={sendFriendRequest} className='border px-2 py-1 rounded-md'> Add Friend</button>
                    )
                }
            </div>
        </div>
        <div className="text-slate-800">
            <MdKeyboardArrowRight size={40} />
        </div>
</Link>
  )
}

export default UserCard