import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react"
import Home from "../pages/Home";
import { MemoryRouter, useParams } from "react-router-dom"
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'
import { useStateContext } from "../context/ContextProvider"

//mock axios and firebase
jest.mock("../../utils/firebase")
jest.mock("../../utils/axiosInstance")
jest.mock("../context/ContextProvider")

//mock IntersectionObserver
beforeAll(() => {
    global.IntersectionObserver = class {
        constructor() {}
        observe() {}
        unobserve() {}
        disconnect() {}
    }

    //mock setImmediate
    global.setImmediate = fn => setTimeout(fn, 0)
})

describe("home component", () => {
    //mock token
    beforeEach(() => {
        auth.currentUser.getIdToken.mockResolvedValue("fake-token")
        useStateContext.mockReturnValue({ pendingRequests: []})
    })


    test("renders logs fetched from the API", async() => {
        //mock log data
        const mockLogs = [
            {
                mealId: 1,
                mealName: "Spaghetti",
                restaurantName: "Italian Restaurant",
                createdAt: "Logged on 01/01/2021 at 12:00",
                rating: "ACCURATE"
            },
            {
                mealId: 2,
                mealName: "Pizza",
                restaurantName: "Domino's",
                createdAt: "Logged on 02/01/2021 at 13:00",
                rating: "ACCURATE"
            },
        ]
        //mock user data
        const mockUser = {
            name: "John",
            surname: "Smith",
            profilePicUrl: "https://fake.com/me.jpg",
            profileThumbnailUrl: "https://fake.com/thumbnail_me.jpg"
        }

        //mock a successful get request
        axiosInstance.get.mockResolvedValue({ data: { logs:mockLogs, user:mockUser } })

        //render the component using act to make sure all updates have been completed before asserting
        await act(async() => {
            render(
                <MemoryRouter>
                    <Home />
                </MemoryRouter>
            )
        })

        //ensure the logs and user details are displayed
        await waitFor(() => {
            expect(screen.getByText(/Pizza/i)).toBeInTheDocument()
            expect(screen.getByText(/Spaghetti/i)).toBeInTheDocument()
            expect(screen.getByText(/John/i)).toBeInTheDocument()
        })
    })

})