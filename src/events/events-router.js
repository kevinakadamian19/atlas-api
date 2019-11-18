const express = require('express')
const xss = require('xss')
const path = require('path')
const EventsService = require('./events-service')

const eventsRouter = express.Router()
const jsonParser = express.json()

const serializeEvent = event => ({
    id: event.id,
    name: xss(event.name)
})

eventsRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        EventsService.getAllEvents(
            knexInstance
        )
        .then(events => {
            res.json(events.map(serializeEvent))
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {name} = req.body;
        const newEvent = {name}
        if(!name) {
            return res.status(404).json({
                error: {message: `Missing name from request body.`}
            })
        }
        EventsService.insertEvent(
            req.app.get('db'),
            newEvent
        )
        .then(event => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `${event.id}`))
                .json(serializeEvent(event))
        })
        .catch(next)
})

eventsRouter
    .route(`/:event_id`)
    .all((req, res, next) => {
        EventsService.getById(
            req.app.get('db'),
            req.params.event_id
        )
        .then(event => {
            if(!event) {
                return res.status(404).json({
                    error: {message: `Event not found`}
                })
            }
            res.event = event
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeEvent(res.event))
    })
    .delete((req, res, next) => {
        EventsService.deleteEvent(
            req.app.get('db'),
            req.params.event_id
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const {name} = req.body
        const eventToUpdate = {name}

        const numberOfValues = Object.values(eventToUpdate).filter(Boolean).length
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain name.`
                }
            })
        }
        EventsService.updateEvent(
            req.app.get('db'),
            req.params.event_id,
            eventToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
})

module.exports = eventsRouter;