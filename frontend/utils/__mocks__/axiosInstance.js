const axiosInstance = {
    get: jest.fn(() => Promise.resolve({ status: 200 })),
    post: jest.fn(() => Promise.resolve({ status: 200 })),
}

export default axiosInstance