import React from 'react'

//All the code in this file was written without assistance 

//UI component

const Accuracy = ({accuracy, style}) => {
    const accuracyStyles = {
        "ACCURATE": "bg-green-100 text-green-700 border-green-700",
        "INACCURATE": "bg-red-100 text-red-700 border-red-700",
        "SLIGHTLY_INACCURATE": "bg-yellow-100 text-yellow-700 border-yellow-700",
        "PENDING": "bg-slate-100 text-slate-700 border-slate-700",
    }
  return (
    <div className={`border ${style ? style : "rounded-sm px-1 text-sm"} ${accuracyStyles[accuracy]}`}>
        {accuracy.replace(/_/g, " ")} 
    </div>
  )
}

export default Accuracy