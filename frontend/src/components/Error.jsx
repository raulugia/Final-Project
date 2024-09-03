import React from 'react'

const Error = ({message}) => {
  return (
    <div className="bg-red-100 border border-red-700 px-3 py-4 rounded-lg">
        <p className="text-red-800 font-semibold">Error: {message}</p>
    </div>
  )
}

export default Error