const {expect} = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeLiftsArray } = require('./atlas.fixtures')

describe(`Lifts endpoints`, function() {
    let db;

    before(`make knex instance`, () => {
        db = knex({
            client: 'pg',
            connection: 'process.env.TEST_DB_URL'
        })
    })

    after(`disconnect from db`, () => db.destroy())

    before(`clean the table`, () => db('atlas_lifts').truncate())

    this.afterEach('Clean Up', () => db('atlas_lifts').truncate())

    describe(`GET /api/lifts`, () => {
        context(`Given there are no liftss in the database`, () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/lifts`)
                    .expect(200, [])
            })
        })
        context(`Given there are lifts in the database`, () => {
            const testLifts = {makeLiftsArray}
            beforeeEach('insert events', () => {
                return db
                    .get('/api/lifts')
                    .expect(200, testLifts)
            })
            it(`responds with 200 and all of lifts`, () => {
                return supertest(app)
                    .get('/api/lifts')
                    .expect(200, testLifts)
            })
        })
    })
    describe(`GET /api/lifts/:lift_id`, () => {
        context(`Given there are no lifts in database`, () => {
            it(`responds with a 404 error`, () => {
                const liftId = 123456;
                return supertest(app)
                    .get(`/api/lifts/${liftId}`)
                    .expect(404, {error: {message: `Lift not found`}})
            })
        })
        context(`Given there are lifts in the database`, () => {
            const testLifts = { makeLiftsArray }
            this.beforeEach(`inserts lifts`, () => {
                return db
                    .into(`atlas_lifts`)
                    .insert(testLifts)
            })
            it(`responds with a 200 request, and with the specific lift`, () => {
                const liftId = 2;
                const expectedLift = testLifts[liftId-1]
                return supertest(app)
                    .get(`/api/lifts/${liftId}`)
                    .expect(200, expectedLift)
            })
        })
    })
    describe(`POST /api/lifts`, () => {
        it(`creates a lift responding with a 201 and new lift`, () => {
            const newLift = {
                id: 4,
                bench: 300,
                squat: 200,
                deadlift: 400,
                event: 1,
                athlete: 3
                
            }
            return supertest(app)
                .post(`/api/lifts`)
                .expect(201)
                .expect(res => {
                    expect(res.body.bench.to.eql(newLift.bench),
                    expect(res.body.squat).to.eql(newLift.squat),
                    expect(res.body.deadlift).to.eql(newLift.deadlift),
                    expect(res.body.event).to.eql(newLift.event),
                    expect(res.body.athlete).to.eql(newLift.athlete),
                    expect(res.body).to.have.property('id'),
                    expect(actual).to.eql(expected)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/events/${postRes.body.id}`)
                        .expect(postRes.body)
                )
        })
        const requiredFields = ['squat', 'bench', 'deadlift']

        requiredFields.forEach(fields => {
            const newLift = {
                squat: 250,
                bench: 150,
                deadlift: 350
            }
        })
        it(`responds with a 400 and an error message when ${field} is missing`, () => {
            delete(newLift)[field]

            return supertest(app)
                .post(`/api/lifts`)
                .send(newLift)
                .expect(400, {
                    error: {
                        message: `Missing ${field} in request body`
                    }
                })
        })
    })
    describe(`DELETE /api/lifts/:lift_id`, () => {
        context(`Given no lifts`, () => {
            it(`responds with a 404`, () => {
                const liftId = 123456
                return supertest(app)
                    .delete(`/api/lifts/${liftId}`)
                    .expect(404, {
                        error: {message: `Lift not found`}
                    })
            })
        })
        context(`Given there are lifts in the database`, () => {
            const testLifts = { makeLiftsArray }
            beforeEach('insert lifts', () => {
                return db
                    .into('atlas_lifts')
                    .insert(testLifts)
            })
            it('responds with 204 and removes the lift', () => {
                const idToRemove = 2
                const expectedLifts = testLifts.filter(lift => lift.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/lifts/${idToRemove}`)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/lifts`)
                            .expect(expectedLifts)
                    })
            })
        })
    })
    describe(`PATCH /api/lifts/:lift_id`, () => {
        context(`Given no lifts`, () => {
            it(`responds with a 404`, () => {
                const liftId = 123456;
                return supertest(app)
                    .patch(`/api/lifts/${liftId}`)
                    .expect(404, {error: {message: `Lift not found`}})
            })
        })
        context(`Given there are lifts in database`, () => {
            const testLifts = {makeLiftsArray};
            beforeEach('insert lifts', () => {
                return db
                    .into('atlas_lifts')
                    .insert(testLifts)
            })
            it(`responds with 204 and updates the lift`, () => {
                idToUpdate = 2;
                const patchLift = {
                    squat: 200,
                    bench: 200,
                    deadlift: 450
                }
                const expectedLift = {
                    ...testLifts[idToUpdate-1],
                    ...patchLift
                }
                return supertest(app)
                    .patch(`/api/lifts/${idToUpdate}`)
                    .send(patchLift)
                    .expect(res => {
                        supertest(app)
                            .get(`/api/lifts/${idToUpdate}`)
                            .expect(expectedLift)
                    })
            })
            it(`responds with 400 when no required fields are provided`, () => {
                const idToUpdate = 2;
                return supertest(app)
                    .patch(`/api/lifts/${idToUpdate}`)
                    .send({irrelevantField: 'foo'})
                    .expect(400, {
                        error: {
                            message: `Request body must contain either bench, squat, or deadlift`
                        }
                    })
            })
            it(`responds with a 204 when updating only a subset of fields`, () => {
                const idToUpdate = 2;
                const patchLift = {
                    bench: 700
                }
                const expectedLift = {
                    ...testLifts[idToUpdate-1],
                    patchLift
                }
                return supertest(app)
                    .patch(`/api/lifts/${idToUpdate}`)
                    .send({
                        ...patchLift,
                        fieldToIgnore: 'should not be in Patch response'
                    })
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/lifts/${idToUpdate}`)
                            .expect(expectedLift)
                    )
            })
        })
    })
})