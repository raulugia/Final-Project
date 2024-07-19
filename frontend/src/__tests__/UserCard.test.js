import React from 'react'
import { render, fireEvent } from "@testing-library/react"
import UserCard from '../components/UserCard'
import { MemoryRouter } from 'react-router-dom'

test("component renders props correctly", () => {
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
    expect(getByText(/@ashley.smith/i)).toBeInTheDocument()
})

test('Add Friend button is displayed when isFriend = false and friendRequestStatus="" ', () => {
    const { container } = render(
        <MemoryRouter>
            <UserCard 
                username="ashley.smith"
                name="Ashley" 
                surname="Smith"
                isFriend={false}
                uid="abc123"
                friendRequestStatus=""  
                imgUrl="https://example.com/thumbnail.jpg" 
            />
        </MemoryRouter>
    )

    //get button
    const button = container.querySelector("button")
    //extract button text
    const buttonTxt = button.textContent || button.innerText

    //test whether the text is Add Friend...
    expect(buttonTxt).toBe("Add Friend")
})

test('Pending... button is displayed when isFriend = false and friendRequestStatus="pending" ', () => {
    const { container } = render(
        <MemoryRouter>
            <UserCard 
                username="ashley.smith"
                name="Ashley" 
                surname="Smith"
                isFriend={false}
                uid="abc123"
                friendRequestStatus="pending"  
                imgUrl="https://example.com/thumbnail.jpg" 
            />
        </MemoryRouter>
    )

    //get button
    const button = container.querySelector("button")
    //extract button text
    const buttonTxt = button.textContent || button.innerText

    //test whether the text is Pending...
    expect(buttonTxt).toBe("Pending...")
    //test whether the button is disabled
    expect(button).toBeDisabled()
})

test('Accept and Reject buttons are displayed when isFriend = false and friendRequestStatus="action"', () => {
    const { container } = render(
        <MemoryRouter>
            <UserCard 
                username="ashley.smith"
                name="Ashley" 
                surname="Smith"
                isFriend={false}
                uid="abc123"
                friendRequestStatus="action"  
                imgUrl="https://example.com/thumbnail.jpg" 
            />
        </MemoryRouter>
    )

    //get accept and reject buttons
    const acceptBtn = container.querySelector("#acceptBtn")
    const rejectBtn = container.querySelector("#rejectBtn")
    
    //test whether they have been rendered
    expect(acceptBtn).toBeInTheDocument()
    expect(rejectBtn).toBeInTheDocument()
})

test('Message button is displayed when isFriend = true and friendRequestStatus=""', () => {
    const { container } = render(
        <MemoryRouter>
            <UserCard 
                username="ashley.smith"
                name="Ashley" 
                surname="Smith"
                isFriend={true}
                uid="abc123"
                friendRequestStatus=""  
                imgUrl="https://example.com/thumbnail.jpg" 
            />
        </MemoryRouter>
    )

    //get button
    const button = container.querySelector("button")
    //extract button text
    const buttonTxt = button.textContent || button.innerText

    //test whether the text is Message
    expect(buttonTxt).toBe("Message")
})

test('Add Friend button changes to Pending... after being clicked', async() => {
    const { getByText, findByText } = render(
        <MemoryRouter>
            <UserCard 
                username="ashley.smith"
                name="Ashley" 
                surname="Smith"
                isFriend={false}
                uid="abc123"
                friendRequestStatus=""  
                imgUrl="https://example.com/thumbnail.jpg" 
            />
        </MemoryRouter>
    )

    //get button
    const addFriendBtn = getByText("Add Friend")
    //simulate click on the button
    fireEvent.click(addFriendBtn)

    //test whether the text has changed to "Pending..."
    expect(await findByText("Pending...")).toBeInTheDocument()
})

test('Accept/Reject buttons change to Message after clicking on Accept', async() => {
    const { getByText, findByText } = render(
        <MemoryRouter>
            <UserCard 
                username="ashley.smith"
                name="Ashley" 
                surname="Smith"
                isFriend={false}
                uid="abc123"
                friendRequestStatus="action"  
                imgUrl="https://example.com/thumbnail.jpg" 
            />
        </MemoryRouter>
    )

    //get button
    const acceptBtn = getByText("Accept")
    //simulate click on the button
    fireEvent.click(acceptBtn)

    //test whether the text has changed to "Pending..."
    expect(await findByText("Message")).toBeInTheDocument()
})

test('Accept/Reject buttons change to Add Friend after clicking on Reject', async() => {
    const { getByText, findByText } = render(
        <MemoryRouter>
            <UserCard 
                username="ashley.smith"
                name="Ashley" 
                surname="Smith"
                isFriend={false}
                uid="abc123"
                friendRequestStatus="action"  
                imgUrl="https://example.com/thumbnail.jpg" 
            />
        </MemoryRouter>
    )

    //get button
    const rejectBtn = getByText("Reject")
    //simulate click on the button
    fireEvent.click(rejectBtn)

    //test whether the text has changed to "Pending..."
    expect(await findByText("Add Friend")).toBeInTheDocument()
})