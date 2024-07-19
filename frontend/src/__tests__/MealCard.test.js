import React from 'react'
import { render } from "@testing-library/react"
import MealCard from '../components/MealCard'
import { MemoryRouter } from 'react-router-dom'

test("renders MealCard component", () => {
    const { getByText } = render (
        <MemoryRouter>
            <MealCard id="1" mealName= "Pasta" restaurantName= "italian Restaurant" thumbnailUrl="https://example.com/thumbnail.jpg" />
        </MemoryRouter>
    )

    expect(getByText(/Pasta/i)).toBeInTheDocument()
    expect(getByText(/Italian Restaurant/i)).toBeInTheDocument()
})