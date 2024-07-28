import React, { useContext, createContext, useState } from 'react'

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
