import React from 'react'
import { render, waitFor, screen, fireEvent, act } from "@testing-library/react"
import Restaurants from '../pages/Restaurants'
import SkeletonRestaurantCard from '../components/SkeletonRestaurantCard'
import { MemoryRouter } from 'react-router-dom'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'

jest.mock("../../utils/firebase")
jest.mock("../../utils/axiosInstance")

describe("Restaurants component", () => {
    beforeEach(() => {
        auth.currentUser.getIdToken.mockResolvedValue("fake-token")
    })

   test("fetches and displays restaurants correctly", async() => {
    //create an array of fake restaurants
    const mockData = [
        { id: 1, name: "Restaurant1"},
        { id: 2, name: "Restaurant2"},
    ]

    //recreate a get request
    axiosInstance.get.mockResolvedValue({ data: mockData })

    //render the component using act to make sure all updates have been completed before asserting
    await act(async() => {
        render(
            <MemoryRouter>
                <Restaurants />
            </MemoryRouter>
        )
    })

    //test whether both restaurants are rendered as expected
    await waitFor(() => expect(screen.getByText("Restaurant1")).toBeInTheDocument())
    expect(screen.getByText("Restaurant2")).toBeInTheDocument()
   })


   test("displays 'We couldn't find any restaurants that match your search.' if no restaurants match the search input", async() => {
    //create an array of fake restaurants
    const mockData = [
        { id: 1, name: "Restaurant1"},
        { id: 2, name: "Restaurant2"},
    ]

    //recreate a get request
    axiosInstance.get.mockResolvedValue({ data: mockData })

    //render the component using act to make sure all updates have been completed before asserting
    await act(async() => {
        render(
            <MemoryRouter>
                <Restaurants />
            </MemoryRouter>
        )
    })

    //get search bar
    const searchInput = screen.getByPlaceholderText(/search for restaurants/i)
    
    //simulate an input change to Restaurant3, which does not exist in mockData - act is needed due to state changes
    act(() => {
        fireEvent.change(searchInput, { target: { value: "Restaurant3"} })
    })

    //test whether the message indicating no restaurants were found is displayed
    await waitFor(() => {
        expect(screen.getByText(/We couldn't find any restaurants that match your search./i)).toBeInTheDocument()
    }) 
   })
})