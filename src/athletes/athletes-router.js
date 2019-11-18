const express = require('express')
const xss = require('xss')
const path = require('path')
const AthletesService = require('./athletes-service')

const athletesRouter = express.Router()
const jsonParser = express.json()

const serializeAthlete = athlete => ({
    id: athlete.id,
    name: xss(athlete.name),
    age: athlete.age,
    weight: athlete.weight,
    gender: athlete.gender
})

athletesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        AthletesService.getAllAthletes(
            knexInstance
        )
        .then(athletes => {
            res.json(athletes.map(serializeAthlete))
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {name, age, gender, weight} = req.body;
        const newAthlete = {name, age, gender, weight}
        for(const [key,value] of Object.entries(newAthlete)) {
            if(value === null) {
                return res.status(404).json({
                    error: {message: `Missing ${key} from request body.`}
                })
            }
        }
        AthletesService.insertAthlete(
            req.app.get('db'),
            newAthlete
        )
        .then(athlete => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `${athlete.id}`))
                .json(serializeAthlete(athlete))
        })
        .catch(next)
})

athletesRouter
    .route(`/:athlete_id`)
    .all((req, res, next) => {
        AthletesService.getById(
            req.app.get('db'),
            req.params.athlete_id
        )
        .then(athlete => {
            if(!athlete) {
                return res.status(404).json({
                    error: {message: `Athlete not found`}
                })
            }
            res.athlete = athlete
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeAthlete(res.athlete))
    })
    .delete((req, res, next) => {
        AthletesService.deleteAthlete(
            req.app.get('db'),
            req.params.athlete_id
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const {name, age, gender, weight} = req.body
        const athleteToUpdate = {name, age, gender, weight}

        const numberOfValues = Object.values(athleteToUpdate).filter(Boolean).length
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either vendor, note, or price`
                }
            })
        }
        AthletesService.updateAthlete(
            req.app.get('db'),
            req.params.athlete_id,
            athleteToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
})

module.exports = athletesRouter;