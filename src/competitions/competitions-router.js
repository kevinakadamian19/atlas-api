const express = require('express')
const xss = require('xss')
const path = require('path')
const CompetitionsService = require('./competitions-service')

const competitionsRouter = express.Router()
const jsonParser = express.json()

const serializeCompetition = competition => ({
    id: competition.id,
    name: xss(competition.name)
})

competitionsRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        CompetitionsService.getAllCompetitions(
            knexInstance
        )
        .then(competitions => {
            res.json(competitions.map(serializeCompetition))
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {name} = req.body;
        const newCompetition = {name}
        if(!name) {
            return res.status(404).json({
                error: {message: `Missing name from request body.`}
            })
        }
        CompetitionsService.insertCompetition(
            req.app.get('db'),
            newCompetition
        )
        .then(competition => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `${competition.id}`))
                .json(serializeEvent(competition))
        })
        .catch(next)
})

competitionsRouter
    .route(`/:competition_id`)
    .all((req, res, next) => {
        CompetitionsService.getById(
            req.app.get('db'),
            req.params.competition_id
        )
        .then(competition => {
            if(!competition) {
                return res.status(404).json({
                    error: {message: `Competition not found`}
                })
            }
            res.competition = competition
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeCompetition(res.competition))
    })
    .delete((req, res, next) => {
        CompetitionsService.deleteCompetition(
            req.app.get('db'),
            req.params.competition_id
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const {name} = req.body
        const competitionToUpdate = {name}

        const numberOfValues = Object.values(competitionToUpdate).filter(Boolean).length
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain name.`
                }
            })
        }
        CompetitionsService.updateCompetition(
            req.app.get('db'),
            req.params.competition_id,
            competitionToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
})

module.exports = competitionsRouter;