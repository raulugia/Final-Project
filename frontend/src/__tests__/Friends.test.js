import React from 'react'
import { render, waitFor, screen, fireEvent, act } from "@testing-library/react"
import Friends from '../pages/Friends'
import { MemoryRouter } from 'react-router-dom'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'

jest.mock("../../utils/firebase")
jest.mock("../../utils/axiosInstance")

describe("Friends component", () => {
    beforeEach(() => {
        auth.currentUser.getIdToken.mockResolvedValue("fake-token")
    })

    test("fetches and displays friends correctly", async() => {
        //create an array of fake friends
        const mockData = [
            {
                name: "Ashley",
                surname: "Smith",
                username: "ashley.smith"
            },
            {
                name: "Adam",
                surname: "Jones",
                username: "adam.jones"
            },
        ]

        //recreate a get request
        axiosInstance.get.mockResolvedValue({ data: mockData })
        
        //render the component using act to make sure all updates have been completed before asserting
        await act(async() => {
            render(
                <MemoryRouter>
                    <Friends />
                </MemoryRouter>
            )
        })

        //test whether the friends have been rendered
        await waitFor(() => expect(screen.getByText(/Ashley Smith/i)).toBeInTheDocument())
        expect(screen.getByText(/Adam Jones/i)).toBeInTheDocument()
        expect(screen.getByText(/@ashley.smith/i)).toBeInTheDocument()
        expect(screen.getByText(/@adam.jones/i)).toBeInTheDocument()
    })


    test("filters friends when the search bar is used", async() => {
        //create an array of fake friends
        const mockData = [
            {
                name: "Ashley",
                surname: "Smith",
                username: "ashley.smith"
            },
            {
                name: "Adam",
                surname: "Jones",
                username: "adam.jones"
            },
        ]

        //recreate a get request
        axiosInstance.get.mockResolvedValue({ data: mockData })
        
        //render the component using act to make sure all updates have been completed before asserting
        await act(async() => {
            render(
                <MemoryRouter>
                    <Friends />
                </MemoryRouter>
            )
        })

        //get the search bar
        const searchBar = screen.getByPlaceholderText(/Search for friends.../i)

        //simulate an input change to Ashley - act is needed due to state changes
        act(() => {
            fireEvent.change(searchBar, { target: { value: "Ashley"} })
        })

        //test that Ashley is rendered by Adam isn't
        await waitFor(() => {
            expect(screen.getByText(/Ashley Smith/i)).toBeInTheDocument()
            expect(screen.queryByText(/Adam Jones/i)).not.toBeInTheDocument()
        })
    })
})