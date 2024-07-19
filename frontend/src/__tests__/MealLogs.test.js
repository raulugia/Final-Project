import React from 'react'
import { render, waitFor, screen, fireEvent, act } from "@testing-library/react"
import MealLogs from '../pages/MealLogs'
import { MemoryRouter } from 'react-router-dom'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'

jest.mock("../../utils/firebase")
jest.mock("../../utils/axiosInstance")

//create an array of fake friends
const mockData = [
    {   
        carbEstimate: "20",
        createdAt: "2024-07-18T10:56:45.816Z",
        description: "fake description",
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
        picture: "https://example.com/picture.jpg",
        rating: "ACCURATE",
        thumbnail: "https://example.com/thumbnail.jpg",
        userUid: "123abc"
    },
    {
        carbEstimate: "30",
        createdAt: "2024-06-18T12:02:45.816Z",
        description: "fake description",
        id: "2",
        meal: { 
            id: "3", 
            name:"Pasta",
            restaurant: { 
                id: "2",
                name: "Italian Restaurant"
            },
            restaurantId: "2",
        },
        picture: "https://example.com/picture2.jpg",
        rating: "INACCURATE",
        thumbnail: "https://example.com/thumbnail2.jpg",
        userUid: "123abc"
    },
]

describe("MealLogs component", () => {
    beforeEach(() => {
        auth.currentUser.getIdToken.mockResolvedValue("fake-token")
    })

    test("fetches and displays friends correctly", async() => {

        //recreate a get request
        axiosInstance.get.mockResolvedValue({ data: mockData })
        
        //render the component using act to make sure all updates have been completed before asserting
        await act(async() => {
            render(
                <MemoryRouter>
                    <MealLogs />
                </MemoryRouter>
            )
        })

        //test whether the logs have been rendered
        await waitFor(() => expect(screen.getByText(/Pasta/i)).toBeInTheDocument())
        expect(screen.getByText(/Italian Restaurant/i)).toBeInTheDocument()
        expect(screen.getByText((content, element) => {
            return content.includes("Carb estimation:") && element.textContent.includes("20g")
        }))
        expect(screen.getByText("ACCURATE")).toBeInTheDocument()
        expect(screen.getByText((content, element) => {
            return content.includes("Carb estimation:") && element.textContent.includes("30g")
        }))
        expect(screen.getByText("INACCURATE")).toBeInTheDocument()

        //make sure the h1 and h3 are correct
        const h1 = document.querySelector("h1")
        expect(h1).toBeInTheDocument()
        expect(h1).toHaveTextContent(/Logs for Pasta/i)

        const h3 = document.querySelector("h3")
        expect(h3).toBeInTheDocument()
        expect(h3).toHaveTextContent(/Italian Restaurant/i)

        //test whether the createdAt date has been formatted
        expect(screen.getByText(/Created on 18\/07\/2024 at 12:56/i)).toBeInTheDocument()
        expect(screen.getByText(/Created on 18\/06\/2024 at 14:02/i)).toBeInTheDocument()
    })
})