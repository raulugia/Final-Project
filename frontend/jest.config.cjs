module.exports = {
    setupFilesAfterEnv: [
      "<rootDir>/src/setupTests.js"
    ],
    testEnvironment: "jest-environment-jsdom",
    moduleNameMapper: {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy"
    },
    transform: {
        "^.+\\.jsx?$": "babel-jest"
    }
  }