import React from 'react'
import { render } from "@testing-library/react"
import MealLogCard from '../components/MealLogCard'
import Accuracy from '../components/Accuracy'
import { MemoryRouter } from 'react-router-dom'

test("renders MealLogCard component", () => {
    const { getByText } = render (
        <MemoryRouter>
            <MealLogCard id="1" mealId= "2" rating="ACCURATE" createdAt="on 10/08/2024 at 14:30" carbEstimate="20" thumbnail="https://example.com/thumbnail.jpg" />
        </MemoryRouter>
    )

    expect(getByText(/on 10\/08\/2024 at 14:30/i)).toBeInTheDocument()
    expect(getByText(/ACCURATE/i))
    //since "Carb estimation: 20g" is rendered with a span tag inside the p tag, custom matching is needed
    expect(getByText((_, element) => {
        return element.textContent === ("Carb estimation: 20g")
    })).toBeInTheDocument()
})

test("thumbnail image is rendered correctly", () => {
    const { container } = render(
        <MemoryRouter>
            <MealLogCard id="1" mealId= "2" rating="ACCURATE" createdAt="on 10/08/2024 at 14:30" carbEstimate="20" thumbnail="https://example.com/thumbnail.jpg" />
        </MemoryRouter>
    )

    //get the image
    const img = container.querySelector("img")
    //test whether its src attribute has the expected url
    expect(img).toHaveAttribute("src", "https://example.com/thumbnail.jpg")
})

test("Link has the correct route", () => {
    const { container } = render(
        <MemoryRouter>
            <MealLogCard id="1" mealId= "2" rating="ACCURATE" createdAt="on 10/08/2024 at 14:30" carbEstimate="20" thumbnail="https://example.com/thumbnail.jpg" />
        </MemoryRouter>
    )

    //get the a tag
    const a = container.querySelector("a")
    ////test whether its href attribute has the right route
    expect(a).toHaveAttribute("href", "/my-meals/2/log/1")
})