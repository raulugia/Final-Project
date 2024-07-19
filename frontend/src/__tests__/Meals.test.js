import React from 'react'
import { render, waitFor, screen, fireEvent, act } from "@testing-library/react"
import Meals from '../pages/Meals'
import { MemoryRouter } from 'react-router-dom'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'

jest.mock("../../utils/firebase")
jest.mock("../../utils/axiosInstance")

describe("Meals component", () => {
    beforeEach(() => {
        auth.currentUser.getIdToken.mockResolvedValue("fake-token")
    })

    test("fetches and displays friends correctly", async() => {
        //create an array of fake friends
        const mockData = [
            {
                id: "1",
                meal: { 
                    id: "2", 
                    name:"Pasta",
                    restaurant: { 
                        id: "1",
                        name: "Italian Restaurant"
                    },
                    restaurantId: "1",
                },
                thumbnail: "https://example.com/thumbnail.jpg"
            },
            {
                id: "2",
                meal: { 
                    id: "3", 
                    name:"Onion Soup",
                    restaurant: { 
                        id: "3",
                        name: "French Restaurant"
                    },
                    restaurantId: "3",
                },
                thumbnail: "https://example.com/thumbnail2.jpg"
            },
        ]

        //recreate a get request
        axiosInstance.get.mockResolvedValue({ data: mockData })
        
        //render the component using act to make sure all updates have been completed before asserting
        await act(async() => {
            render(
                <MemoryRouter>
                    <Meals />
                </MemoryRouter>
            )
        })

        //test whether the meals have been rendered
        await waitFor(() => expect(screen.getByText(/Pasta/i)).toBeInTheDocument())
        expect(screen.getByText(/Italian Restaurant/i)).toBeInTheDocument()
        expect(screen.getByText(/Onion Soup/i)).toBeInTheDocument()
        expect(screen.getByText(/French Restaurant/i)).toBeInTheDocument()

        //test where the order of the meals is correct - meals should be ordered alphabetically by meal name
        const mealNames = screen.getAllByText(/Pasta|Onion Soup/i)
        expect(mealNames[0]).toHaveTextContent("Onion Soup")
        expect(mealNames[1]).toHaveTextContent("Pasta")
    })


    test("filters friends when the search bar is used", async() => {
        //create an array of fake friends
        const mockData = [
            {
                id: "1",
                meal: { 
                    id: "2", 
                    name:"Pasta",
                    restaurant: { 
                        id: "1",
                        name: "Italian Restaurant"
                    },
                    restaurantId: "1",
                },
                thumbnail: "https://example.com/thumbnail.jpg"
            },
            {
                id: "2",
                meal: { 
                    id: "3", 
                    name:"Onion Soup",
                    restaurant: { 
                        id: "3",
                        name: "French Restaurant"
                    },
                    restaurantId: "3",
                },
                thumbnail: "https://example.com/thumbnail2.jpg"
            },
        ]

        //recreate a get request
        axiosInstance.get.mockResolvedValue({ data: mockData })
        
        //render the component using act to make sure all updates have been completed before asserting
        await act(async() => {
            render(
                <MemoryRouter>
                    <Meals />
                </MemoryRouter>
            )
        })

        //get the search bar
        const searchBar = screen.getByPlaceholderText(/Search for meals.../i)

        //simulate an input change to Pasta - act is needed due to state changes
        act(() => {
            fireEvent.change(searchBar, { target: { value: "Pasta"} })
        })

        //test that Pasta is rendered but Onion Soup isn't
        await waitFor(() => {
            expect(screen.getByText(/Pasta/i)).toBeInTheDocument()
            expect(screen.queryByText(/Onion Soup/i)).not.toBeInTheDocument()
        })
    })
})