import React from 'react'
import { render } from "@testing-library/react"
import MealCard from '../components/MealCard'
import { MemoryRouter } from 'react-router-dom'

test("renders MealCard component", () => {
    const { getByText } = render (
        <MemoryRouter>
            <MealCard 
                id="1" mealName= "Pasta" 
                restaurantName= "italian Restaurant" thumbnailUrl="https://example.com/thumbnail.jpg" 
            />
        </MemoryRouter>
    )

    //test whether Pasta and Italian Restaurant (case-insensitive) are rendered
    expect(getByText(/Pasta/i)).toBeInTheDocument()
    expect(getByText(/Italian Restaurant/i)).toBeInTheDocument()
})

//this component has a Link with the to={} prop to redirect users on click - test if route is correct
test("Link component has the right route", () => {
    const { container } = render(
        <MemoryRouter>
            <MealCard id="1" mealName= "Pasta" 
                restaurantName= "italian Restaurant" thumbnailUrl="https://example.com/thumbnail.jpg" 
            />
        </MemoryRouter>
    )

    //get the a tag
    const link = container.querySelector("a")
    //test whether its href attribute has the right route
    expect(link).toHaveAttribute("href", "/my-meals/1")
})

test("thumbnail image is rendered correctly", () => {
    const { container } = render (
        <MemoryRouter>
            <MealCard id="1" mealName= "Pasta" restaurantName= "italian Restaurant" thumbnailUrl="https://example.com/thumbnail.jpg" />
        </MemoryRouter>
    )

    //get image
    const img = container.querySelector("img")
    //test whether its src attribute has the expected url
    expect(img).toHaveAttribute("src", "https://example.com/thumbnail.jpg")
})