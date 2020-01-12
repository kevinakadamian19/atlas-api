const {expect} = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeCompetitionsArray } = require('./atlas.fixtures')

describe(`Competitions endpoints`, function() {
    let db;

    before(`make knex instance`, () => {
        db = knex({
            client: 'pg',
            connection: 'process.env.TEST_DB_URL'
        })
    })

    after(`disconnect from db`, () => db.destroy())

    before(`clean the table`, () => db('atlas_competitions').truncate())

    this.afterEach('Clean Up', () => db('atlas_competitions').truncate())

    describe(`GET /api/competitions`, () => {
        context(`Given there are no competitions in the database`, () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/competitions`)
                    .expect(200, [])
            })
        })
        context(`Given there are competitions in the database`, () => {
            const testCompetitions = {makeCompetitionsArray}
            beforeeEach('insert competitions', () => {
                return db
                    .get('/api/competitions')
                    .expect(200, testCompetitions)
            })
            it(`responds with 200 and all of competitions`, () => {
                return supertest(app)
                    .get('/api/competitions')
                    .expect(200, testCompetitions)
            })
        })
    })
    describe(`GET /api/competitions/:competition_id`, () => {
        context(`Given there are no competitions in database`, () => {
            it(`responds with a 404 error`, () => {
                const competitionId = 123456;
                return supertest(app)
                    .get(`/api/competitions/${competitionId}`)
                    .expect(404, {error: {message: `Competition not found`}})
            })
        })
        context(`Given there are competitions in the database`, () => {
            const testCompetitions = { makeCompetitionsArray }
            this.beforeEach(`inserts competitions`, () => {
                return db
                    .into(`atlas_competitions`)
                    .insert(testCompetitions)
            })
            it(`responds with a 200 request, and with the specific competition`, () => {
                const competitionId = 2;
                const expectedCompetition = testCompetitions[competitionId-1]
                return supertest(app)
                    .get(`/api/events/${competitionId}`)
                    .expect(200, expectedCompetition)
            })
        })
    })
    describe(`POST /api/competitions`, () => {
        it(`creates a competition responding with a 201 and new competition`, () => {
            const newCompetition = {
                id: 5,
                name: 'IPF Worlds'
            }
            return supertest(app)
                .post(`/api/competitions`)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newCompetition.name)
                    expect(res.body).to.have.property('id')
                    expect(actual).to.eql(expected)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/competitions/${postRes.body.id}`)
                        .expect(postRes.body)
                )
        })
        const requiredFields = ['name']

        requiredFields.forEach(fields => {
            const newCompetition = {
                name: 'test name'
            }
        })
        it(`responds with a 400 and an error message when ${field} is missing`, () => {
            delete(newCompetition)[field]

            return supertest(app)
                .post(`/api/competitions`)
                .send(newCompetition)
                .expect(400, {
                    error: {
                        message: `Missing ${field} in request body`
                    }
                })
        })
    })
    describe(`DELETE /api/competitions/:competition_id`, () => {
        context(`Given no competitions`, () => {
            it(`responds with a 404`, () => {
                const competitionId = 123456
                return supertest(app)
                    .delete(`/api/competitions/${competitionId}`)
                    .expect(404, {
                        error: {message: `Competition not found`}
                    })
            })
        })
        context(`Given there are competitions in the database`, () => {
            const testCompetitions = { makeCompetitionsArray };
            beforeEach('insert competitions', () => {
                return db
                    .into('atlas_competitions')
                    .insert(testCompetitions)
            })
            it('responds with 204 and removes the competitions', () => {
                const idToRemove = 2
                const expectedCompetitions = testCompetitions.filter(competition => competition.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/competitions/${idToRemove}`)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/competitions`)
                            .expect(expectedCompetitions)
                    })
            })
        })
    })
    describe(`PATCH /api/competitions/:competition_id`, () => {
        context(`Given no competitions`, () => {
            it(`responds with a 404`, () => {
                const competitionId = 123456;
                return supertest(app)
                    .patch(`/api/competitions/${competitionId}`)
                    .expect(404, {error: {message: `Competition not found`}})
            })
        })
        context(`Given there are competitions in database`, () => {
            const testCompetitions = {makeCompetitionsArray};
            beforeEach('insert competition', () => {
                return db
                    .into('atlas_competitions')
                    .insert(testCompetitions)
            })
            it(`responds with 204 and updates the competitions`, () => {
                idToUpdate = 2;
                const patchCompetition = {
                    name: 'Peter Pan Classic'
                }
                const expectedCompetition = {
                    ...testCompetitions[idToUpdate-1],
                    ...patchCompetition
                }
                return supertest(app)
                    .patch(`/api/competitions/${idToUpdate}`)
                    .send(patchCompetition)
                    .expect(res => {
                        supertest(app)
                            .get(`/api/events/${idToUpdate}`)
                            .expect(expectedCompetition)
                    })
            })
            it(`responds with 400 when no required fields are provided`, () => {
                const idToUpdate = 2;
                return supertest(app)
                    .patch(`/api/competitions/${idToUpdate}`)
                    .send({irrelevantField: 'foo'})
                    .expect(400, {
                        error: {
                            message: `Request body must contain name`
                        }
                    })
            })
            it(`responds with a 204 when updating only a subset of fields`, () => {
                const idToUpdate = 2;
                const patchCompetition = {
                    name: 'SBD Class Raw'
                }
                const expectedCompetition = {
                    ...testCompetition[idToUpdate-1],
                    patchEvent
                }
                return supertest(app)
                    .patch(`/api/competitions/${idToUpdate}`)
                    .send({
                        ...patchCompetition,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/competitions/${idToUpdate}`)
                            .expect(expectedCompetition)
                    )
            })
        })
    })
})