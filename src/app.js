require('dotenv').config;
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { NODE_ENV, CLIENT_ORIGIN } = require('./config')
const eventsRouter = require('./events/events-router')
const athletesRouter = require('./athletes/athletes-router')
const liftsRouter = require('./lifts/lifts-router')

const app = express();
const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'dev';

app.use(morgan(morganOption));
app.use(helmet());
app.use(
    cors({
        CLIENT_ORIGIN
    })
);

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        logger.error(`Unauthorized request to path ${req.path}`);
        return res.status(401).json({error: 'Unauthorized request'})
    }
    next()
})

app.use(`/api/events`, eventsRouter)
app.use(`/api/athletes`, athletesRouter)
app.use(`/api/lifts`, liftsRouter)

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.use(function errorHandler(error,req,res,next) {
    let response
    if(NODE_ENV === 'production') {
        response = {error: {message: 'server issue'}}
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response);
})

module.exports = app;