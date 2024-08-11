import React from 'react'

const UpdateUserModal = ({credentialDetails, setCredentialDetails, setDisplayModal, handleSubmit}) => {
    
    const handleCancel = () => {
        setCredentialDetails({email: "", password: ""})
        setDisplayModal(false)
    }
    
    return (
    <div className='flex items-center justify-center absolute inset-0 z-100 w-full min-h-screen bg-black/60'>
        <div className='py-3 px-8 border rounded-lg shadow-md bg-white'>
            <div className="mb-4">
                <h3 className='text-2xl font-semibold'>Authentication Required</h3>
                <p className='text-sm'>Please enter your sing in details</p>
            </div>
            <div className='flex flex-col gap-1 mb-3'>
                <label htmlFor="email" className='text-sm'>Email</label>
                <input 
                    type="email"  id='email'
                    onChange={e => setCredentialDetails({...credentialDetails, email: e.target.value})} 
                    className='py-1 px-2 rounded-md border'/>
            </div>
            <div className='flex flex-col gap-1 mb-2'>
                <label htmlFor="password" className='text-sm'>Password</label>
                <input 
                    type="password"  id='password' 
                    onChange={e => setCredentialDetails({...credentialDetails, password: e.target.value})}
                    className='py-1 px-2 rounded-md border'
                />
            </div>
            <div className='flex gap-3 w-full mb-2 mt-5'>
                <button 
                    type="button"
                    onClick={handleCancel} 
                    className="py-1 px-2 rounded-md bg-gray-50 border mt-3 w-full"
                >
                    Cancel
                </button>
                <button 
                    type="button"
                    onClick={handleSubmit} 
                    className="py-1 px-2 rounded-md bg-blue-700 border border-blue-700 text-white mt-3 w-full"
                >
                    Confirm
                </button>
            </div>
        </div>
    </div>
  )
}

export default UpdateUserModal