import React from 'react'
import { render, fireEvent } from "@testing-library/react"
import FriendCard from '../components/FriendCard'
import { MemoryRouter } from 'react-router-dom'

test("component renders correctly", () => {
    const { getByText } = render(
        <MemoryRouter>
            <FriendCard name="Ashley" surname="Smith" username="ashley.smith" imgUrl="https://example.com/thumbnail.jpg" />
        </MemoryRouter>
    )

    //test whether props are rendered correctly
    expect(getByText(/Ashley Smith/i)).toBeInTheDocument()
    expect(getByText(/@ashley.smith/i)).toBeInTheDocument()
})

test("underline class is applied and removed correctly on hover", () => {
    const { getByText } = render(
        <MemoryRouter>
            <FriendCard name="Ashley" surname="Smith" 
                username="ashley.smith" imgUrl="https://example.com/thumbnail.jpg" 
            />
        </MemoryRouter>
    )

    //get the closest a tag to the user's name (Link component form react router)
    const nameAElement = getByText(/Ashley Smith/i).closest("a")
    //get the user's name element
    const nameTextElement = getByText(/Ashley Smith/i)

    //simulate hover over the Link component, which is the main card wrapper 
    fireEvent.mouseEnter(nameAElement)
    //test whether the user's name has been underlined
    expect(nameTextElement).toHaveClass("underline")

    //simulate mouse leaving the Link component, which is the main card wrapper 
    fireEvent.mouseLeave(nameAElement)
    //test whether the user's name is no longer underlined
    expect(nameTextElement).not.toHaveClass("underline")
})

test("Link has the correct route", () => {
    const { container } = render(
        <MemoryRouter>
           <FriendCard name="Ashley" surname="Smith" username="ashley.smith" imgUrl="https://example.com/thumbnail.jpg" />
        </MemoryRouter>
    )

    //get the a tag
    const a = container.querySelector("a")
    ////test whether its href attribute has the right route
    expect(a).toHaveAttribute("href", "/user/ashley.smith")
})