import React from 'react'
import { render, fireEvent } from "@testing-library/react"
import UserCard from '../components/UserCard'
import { MemoryRouter } from 'react-router-dom'

test("component renders correctly", () => {
    const { getByText } = render(
        <MemoryRouter>
            <UserCard 
                username="ashley.smith"
                name="Ashley" 
                surname="Smith"
                isFriend="false"
                uid="abc123"
                friendRequestStatus=""  
                imgUrl="https://example.com/thumbnail.jpg" 
            />
        </MemoryRouter>
    )

    //
    expect(getByText(/Ashley Smith/i)).toBeInTheDocument()
})