module.exports = {
    setupFilesAfterEnv: [
      "<rootDir>/src/setupTests.js"
    ],
    testEnvironment: "jest-environment-jsdom",
    moduleNameMapper: {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy",
      "^../../utils/firebase$": "<rootDir>/utils/__mocks__/firebase.js",
      "^../../utils/axiosInstance$": "<rootDir>/utils/__mocks__/axiosInstance.js"
    },
    transform: {
        "^.+\\.jsx?$": "babel-jest"
    }
  }