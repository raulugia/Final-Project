import React from 'react'
import { render, screen } from "@testing-library/react"
import SearchResultCard from '../components/SearchResultCard'
import { MemoryRouter } from 'react-router-dom'

test("renders SearchResultCard correctly when the control flag is 'meal'", () => {
    const { getByText } = render(
        <MemoryRouter>
            <SearchResultCard 
                mealName="Pasta" 
                restaurantName="Italian Restaurant"
                carbs="40" 
                accuracy="ACCURATE"
                date="10/10/2020 at 10:30"
                totalLogs="2" 
                imgUrl="https://example.com/thumbnail.jpg"
                type="meal" 
            />
        </MemoryRouter>
    )

    //
    expect(getByText(/Pasta/i)).toBeInTheDocument()
    expect(getByText(/Italian Restaurant/i)).toBeInTheDocument()
    expect(getByText(/Carb estimation: 40g/i)).toBeInTheDocument()
    expect(getByText(/ACCURATE/i)).toBeInTheDocument()
    expect(getByText(/Last log: 10\/10\/2020 at 10:30/i)).toBeInTheDocument()
    expect(getByText(/Number of logs: 2/i)).toBeInTheDocument()
})

test("renders SearchResultCard correctly when the control flag is 'restaurant'", () => {
    render(
        <MemoryRouter>
            <SearchResultCard 
                mealName="Pasta" 
                restaurantName="Italian Restaurant"
                carbs="40" 
                accuracy="ACCURATE"
                date="10/10/2020 at 10:30"
                totalLogs="2" 
                imgUrl="https://example.com/thumbnail.jpg"
                type="restaurant" 
            />
        </MemoryRouter>
    )

    //test whether the control flag 'type' works checking these elemets are not rendered then 'type' is 'restaurant'
    expect(screen.queryByText(/Pasta/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Carb estimation: 40g/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/ACCURATE/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Last log: 10\/10\/2020 at 10:30/i)).not.toBeInTheDocument()
})

test("image is rendered correctly", () => {
    const { container } = render(
        <MemoryRouter>
            <SearchResultCard 
                mealName="Pasta" 
                restaurantName="Italian Restaurant"
                carbs="40" 
                accuracy="ACCURATE"
                date="10/10/2020 at 10:30"
                totalLogs="2" 
                imgUrl="https://example.com/thumbnail.jpg"
                type="meal" 
            />
        </MemoryRouter>
    )

    //get the image
    const img = container.querySelector("img")
    //test whether its src attribute has the expected url
    expect(img).toHaveAttribute("src", "https://example.com/thumbnail.jpg")
})