module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_URL: process.env.DB_URL || 'postgresql://postgres@localhost/atlas',
    TEST_DB_URL: process.env.TEST_DB_URL || 'postgresql://postgre@localhost/atlas-test'
}