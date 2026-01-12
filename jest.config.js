module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverageFrom: [
        'backend/**/*.js',
        '!backend/server.js'
    ],
    coverageDirectory: 'coverage',
    verbose: true,
    setupFilesAfterEnv: [],
    testTimeout: 10000,
    // Run tests serially to avoid database interference
    maxWorkers: 1,
    // Set test environment variables
    setupFiles: ['<rootDir>/tests/setup.js']
};

