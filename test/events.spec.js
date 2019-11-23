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
    describe(`GET /api/events/:event_id`)
})