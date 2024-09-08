import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react"
import RestaurantMeals from "../pages/RestaurantMeals";
import { MemoryRouter, useParams } from "react-router-dom"
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'

jest.mock("../../utils/firebase")
jest.mock("../../utils/axiosInstance")
//mock route params
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: () => ({ restaurantId: "1"}),
}))

describe("RestaurantMeals component", () => {
    beforeEach(() => {
        auth.currentUser.getIdToken.mockResolvedValue("fake-token")
    })

    test("fetches and displays meal correctly", async() => {
        const mockData = [
            {
                mealId: 1,
                mealName: "Spaghetti",
                thumbnail: "https://fake.com/spaghetti.jpg",
                restaurantName: "Italian Restaurant"
            },
            {
                mealId: 2,
                mealName: "Pizza",
                thumbnail: "https://fake.com/pizza.jpg",
                restaurantName: "Italian Restaurant"
            },
        ]

        //mock a successful get request
        axiosInstance.get.mockResolvedValue({ data: mockData })

        //render the component using act to make sure all updates have been completed before asserting
        await act(async() => {
            render(
                <MemoryRouter>
                    <RestaurantMeals />
                </MemoryRouter>
            )
        })


        //assert that the data is fetched from the API and meals are displayed
        await waitFor(() => {
            expect(screen.getByText(/Spaghetti/i)).toBeInTheDocument()
            expect(screen.getByText(/Pizza/i)).toBeInTheDocument()
        })

        const spaghettiImg = screen.getAllByAltText(/Spaghetti/i)[0]
        const pizzaImg = screen.getAllByAltText(/Pizza/i)[0]

        //assert that thumbnails are rendered
        expect(spaghettiImg).toHaveAttribute("src", "https://fake.com/spaghetti.jpg")
        expect(pizzaImg).toHaveAttribute("src", "https://fake.com/pizza.jpg")
    })

    test("displays error returned by the API", async() => {
        //mock api error response
        axiosInstance.get.mockRejectedValueOnce({
            response: {
                data: {
                    error: "Failed to load meals"
                }
            }
        })

        //render the component using act to make sure all updates have been completed before asserting
        await act(async() => {
            render(
                <MemoryRouter>
                    <RestaurantMeals />
                </MemoryRouter>
            )
        })


        //wait for the error message to be displayed
        await waitFor(() => {
            expect(screen.getByText(/Failed to load meals/i)).toBeInTheDocument()
        })
    })

    test("filters meals based on the search input", async() => {
        const mockData = [
            {
                mealId: 1,
                mealName: "Spaghetti",
                thumbnail: "https://fake.com/spaghetti.jpg",
                restaurantName: "Italian Restaurant"
            },
            {
                mealId: 2,
                mealName: "Pizza",
                thumbnail: "https://fake.com/pizza.jpg",
                restaurantName: "Italian Restaurant"
            },
        ]

        //mock a successful get request
        axiosInstance.get.mockResolvedValue({ data: mockData })

        //render the component using act to make sure all updates have been completed before asserting
        await act(async() => {
            render(
                <MemoryRouter>
                    <RestaurantMeals />
                </MemoryRouter>
            )
        })

        //assert that the data is fetched from the API and meals are displayed
        await waitFor(() => {
            expect(screen.getByText(/Spaghetti/i)).toBeInTheDocument()
            expect(screen.getByText(/Pizza/i)).toBeInTheDocument()
        })

        //get the search input
        const searchInput = screen.getByPlaceholderText(/Search for meals/i)

        //simulate typing "PIzza" in the search bar
        await act(async() => {
            fireEvent.change(searchInput, { target: { value: "Pizza" } })
        })

        //assert that Pizza is the only visible meal
        await waitFor(() => {
            expect(screen.getByText(/Pizza/i)).toBeInTheDocument()
            expect(screen.queryByText(/Spaghetti/i)).not.toBeInTheDocument()
        })
    })

})