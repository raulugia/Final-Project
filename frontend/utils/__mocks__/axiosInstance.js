const axiosInstance = {
    post: jest.fn(() => Promise.resolve({ status: 200 })),
}

export default axiosInstance