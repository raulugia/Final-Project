import React, { useContext, createContext, useState } from 'react'

//context with the pending friend requests

const StateContext = createContext()

export const ContextProvider = ({ children }) => {
    const [pendingRequests, setPendingRequests] = useState([])
    
  return (
    <StateContext.Provider value={{pendingRequests, setPendingRequests}}>
        { children }
    </StateContext.Provider>
  )
}


export const useStateContext = () => useContext(StateContext)
