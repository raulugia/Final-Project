export const auth = {
    currentUser: {
        getIdToken: jest.fn(() => Promise.resolve("fake-token"))
    }
}