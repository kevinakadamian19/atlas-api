const {expect} = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeEventsArray } = require('./atlas.fixtures')

describe(`Events endpoints`, function() {
    let db;

    before(`make knex instance`, () => {
        db = knex({
            client: 'pg',
            connection: 'process.env.TEST_DB_URL'
        })
    })

    after(`disconnect from db`, () => db.destroy())

    before(`clean the table`, () => db('atlas_events').truncate())

    this.afterEach('Clean Up', () => db('atlas_events').truncate())

    describe(`GET /api/events`, () => {
        context(`Given there are no events in the database`, () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/expenses`)
                    .expect(200, [])
            })
        })
        context(`Given there are events in the database`, () => {
            const testEvents = makeEventsArray()
            beforeeEach('insert events', () => {
                return db
                    .get('/api/events')
                    .expect(200, testEvents)
            })
            it(`responds with 200 and all of events`, () => {
                return supertest(app)
                    .get('/api/events')
                    .expect(200, testEvents)
            })
        })
    })
    describe(`GET /api/events/:event_id`, () => {
        context(`Given there are no events in databae`, () => {
            it(`responds with a 404 error`, () => {
                const eventId = 123456;
                return supertest(app)
                    .get(`/api/events/${eventId}`)
                    .expect(404, {error: {message: `Event not found`}})
            })
        })
        context(`Given there are guests in the database`, () => {
            const testEvents = makeEventsArray();
            this.beforeEach(`inserts events`, () => {
                return db
                    .into(`atlas_events`)
                    .insert(testEvents)
            })
            it(`responds with a 200 request, and with the specific event`, () => {
                const eventId = 2;
                const expectedEvent = testEvents[eventId-1]
                return supertest(app)
                    .get(`/api/events/${eventId}`)
                    .expect(200, expectedEvent)
            })
        })
    })
    describe(`POST /api/events`, () => {
        it(`creates a event responding with a 201 and new event`, () => {
            const newEvent = {
                id: 5,
                name: 'IPF Worlds'
            }
            return supertest(app)
                .post(`/api/events`)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newEvent.name)
                    expect(res.body).to.have.property('id')
                    expect(actual).to.eql(expected)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/events/${postRes.body.id}`)
                        .expect(postRes.body)
                )
        })
        const requiredFields = ['name']

        requiredFields.forEach(fields => {
            const newEvent = {
                name: 'test name'
            }
        })
        it(`responds with a 400 and an error message when ${field} is missing`, () => {
            delete(newEvent)[field]

            return supertest(app)
                .post(`/api/events`)
                .send(newEvent)
                .expect(400, {
                    error: {
                        message: `Missing ${field} in request body`
                    }
                })
        })
    })
    describe(`DELETE /api/events/:event_id`, () => {
        context(`Given no events`, () => {
            it(`responds with a 404`, () => {
                const eventId = 123456
                return supertest(app)
                    .delete(`/api/events/${eventId}`)
                    .expect(404, {
                        error: {message: `Event not found`}
                    })
            })
        })
        context(`Given there are events in the database`, () => {
            const testEvents = makeEventsArray();
            beforeEach('insert events', () => {
                return db
                    .into('atlas_events')
                    .insert(testEvents)
            })
            it('responds with 204 and removes the events', () => {
                const idToRemove = 2
                const expectedEvents = testEvents.filter(event => event.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/events/${idToRemove}`)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/events`)
                            .expect(expectedEvents)
                    })
            })
        })
    })
    describe(`PATCH /api/events/:event_id`, () => {
        context(`Given no events`, () => {
            it(`responds with a 404`, () => {
                const eventId = 123456;
                return supertest(app)
                    .patch(`/api/events/${eventId}`)
                    .expect(404, {error: {message: `Event not found`}})
            })
        })
        context(`Given there are events in database`, () => {
            const testEvents = makeEventsArray();
            beforeEach('insert events', () => {
                return db
                    .into('atlas_events')
                    .insert(testEvents)
            })
            it(`responds with 204 and updates the event`, () => {
                idToUpdate = 2;
                const patchEvent = {
                    name: 'Peter Pan Classic'
                }
                const expectedEvent = {
                    ...testEvents[idToUpdate-1],
                    ...patchEvent
                }
                return supertest(app)
                    .patch(`/api/events/${idToUpdate}`)
                    .send(patchEvent)
                    .expect(res => {
                        supertest(app)
                            .get(`/api/events/${idToUpdate}`)
                            .expect(expectedEvent)
                    })
            })
            it(`responds with 400 when no required fields are provided`, () => {
                const idToUpdate = 2;
                return supertest(app)
                    .patch(`/api/events/${idToUpdate}`)
                    .send({irrelevantField: 'foo'})
                    .expect(400, {
                        error: {
                            message: `Request body must contain either name, or email`
                        }
                    })
            })
            it(`responds with a 204 when updating only a subset of fields`, () => {
                const idToUpdate = 2;
                const patchEvent = {
                    name: 'SBD Class Raw'
                }
                const expectedEvent = {
                    ...testEvents[idToUpdate-1],
                    patchEvent
                }
                return supertest(app)
                    .patch(`/api/events/${idToUpdate}`)
                    .send({
                        ...patchEvent,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/events/${idToUpdate}`)
                            .expect(expectedEvent)
                    )
            })
        })
    })
})