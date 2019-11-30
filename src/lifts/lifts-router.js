const express = require('express')
const path = require('path')
const LiftsService = require('./lifts-service')

const liftsRouter = express.Router()
const jsonParser = express.json()

const serializeLift = lift => ({
    id: lift.id,
    squat: lift.squat,
    bench: lift.bench,
    deadlift: lift.deadlift,
    athlete: lift.athlete,
    event: lift.event,
    total: lift.total
})

liftsRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        LiftsService.getAllLifts(
            knexInstance
        )
        .then(lifts => {
            res.json(lifts.map(serializeLift))
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {squat, bench, deadlift, athlete, event, total} = req.body;
        const newLift = {squat, bench, deadlift, athlete, event, total}
        for(const [key,value] of Object.entries(newLift)) {
            if(value === null) {
                return res.status(404).json({
                    error: {message: `Missing ${key} from request body.`}
                })
            }
        }
        LiftsService.insertLift(
            req.app.get('db'),
            newLift
        )
        .then(lift => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `${lift.id}`))
                .json(serializeLift(lift))
        })
        .catch(next)
})

liftsRouter
    .route(`/:lift_id`)
    .all((req, res, next) => {
        LiftsService.getById(
            req.app.get('db'),
            req.params.lift_id
        )
        .then(lift => {
            if(!lift) {
                return res.status(404).json({
                    error: {message: `Lift not found`}
                })
            }
            res.lift = lift
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeLift(res.lift))
    })
    .delete((req, res, next) => {
        LiftsService.deleteLift(
            req.app.get('db'),
            req.params.lift_id
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const {squat, bench, deadlift, total} = req.body
        const liftToUpdate = {squat, bench, deadlift, total}

        const numberOfValues = Object.values(liftToUpdate).filter(Boolean).length
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either squat, bench, or deadlift`
                }
            })
        }
        LiftsService.updateLift(
            req.app.get('db'),
            req.params.lift_id,
            liftToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
})

module.exports = liftsRouter;