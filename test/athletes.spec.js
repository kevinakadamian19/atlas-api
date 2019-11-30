const {expect} = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeAthletesArray } = require('./atlas.fixtures')

describe(`Athletes endpoints`, function() {
    let db;

    before(`make knex instance`, () => {
        db = knex({
            client: 'pg',
            connection: 'process.env.TEST_DB_URL'
        })
    })

    after(`disconnect from db`, () => db.destroy())

    before(`clean the table`, () => db('atlas_athletes').truncate())

    this.afterEach('Clean Up', () => db('atlas_athletes').truncate())

    describe(`GET /api/athletes`, () => {
        context(`Given there are no athletes in the database`, () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/athletes`)
                    .expect(200, [])
            })
        })
        context(`Given there are athletes in the database`, () => {
            const testAthletes = makeAthletesArray()
            beforeeEach('insert athletes', () => {
                return db
                    .get('/api/athletes')
                    .expect(200, testAthletes)
            })
            it(`responds with 200 and all of events`, () => {
                return supertest(app)
                    .get('/api/athletes')
                    .expect(200, testAthletes)
            })
        })
    })
    describe(`GET /api/athletes/:athlete_id`, () => {
        context(`Given there are no athletes in databae`, () => {
            it(`responds with a 404 error`, () => {
                const athleteId = 123456;
                return supertest(app)
                    .get(`/api/athletes/${athleteId}`)
                    .expect(404, {error: {message: `Athlete not found`}})
            })
        })
        context(`Given there are athletes in the database`, () => {
            const testAthletes = makeAthletesArray();
            this.beforeEach(`inserts athletes`, () => {
                return db
                    .into(`atlas_athletes`)
                    .insert(testAthletes)
            })
            it(`responds with a 200 request, and with the specific athlete`, () => {
                const athleteId = 2;
                const expectedAthlete = testAthletes[athleteId-1]
                return supertest(app)
                    .get(`/api/athletes/${athleteId}`)
                    .expect(200, expectedAthlete)
            })
        })
    })
    describe(`POST /api/athletes`, () => {
        it(`creates an athlete responding with a 201 and new athlete`, () => {
            const newAthlete = {
                id: 5,
                name: 'John Doe',
                event: 1,
                age: 25,
                gender: 'male',
                weight: 83
            }
            return supertest(app)
                .post(`/api/athletes`)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newAthlete.name)
                    expect(res.body.event).to.eql(newAthlete.event)
                    expect(res.body.age).to.eql(newAthlete.age)
                    expect(res.body.gender).to.eql(newAthlete.gender)
                    expect(res.body.weight).to.eql(newAthlete.weight)
                    expect(res.body).to.have.property('id')
                    expect(actual).to.eql(expected)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/events/${postRes.body.id}`)
                        .expect(postRes.body)
                )
        })
        const requiredFields = ['name', 'age', 'event', 'gender', 'weight']

        requiredFields.forEach(fields => {
            const newAthlete = {
                name: 'test name',
                age: 25,
                event: 1,
                gender: 'female',
                weight: 60
            }
        })
        it(`responds with a 400 and an error message when ${field} is missing`, () => {
            delete(newAthlete)[field]

            return supertest(app)
                .post(`/api/athletes`)
                .send(newAthlete)
                .expect(400, {
                    error: {
                        message: `Missing ${field} in request body`
                    }
                })
        })
    })
    describe(`DELETE /api/athletes/:athlete_id`, () => {
        context(`Given no athletes`, () => {
            it(`responds with a 404`, () => {
                const athleteId = 123456
                return supertest(app)
                    .delete(`/api/athletes/${athleteId}`)
                    .expect(404, {
                        error: {message: `Athlete not found`}
                    })
            })
        })
        context(`Given there are athletes in the database`, () => {
            const testAthletes = makeAthletesArray();
            beforeEach('insert athletes', () => {
                return db
                    .into('atlas_athletes')
                    .insert(testAthletes)
            })
            it('responds with 204 and removes the athletes', () => {
                const idToRemove = 2
                const expectedAthletes = testAthletes.filter(athlete => athlete.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/athletes/${idToRemove}`)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/athletes`)
                            .expect(expectedAthletes)
                    })
            })
        })
    })
    describe(`PATCH /api/athletes/:athlete_id`, () => {
        context(`Given no athletes`, () => {
            it(`responds with a 404`, () => {
                const athleteId = 123456;
                return supertest(app)
                    .patch(`/api/athletes/${athleteId}`)
                    .expect(404, {error: {message: `Athlete not found`}})
            })
        })
        context(`Given there are athletes in database`, () => {
            const testAthletes = makeAthletesArray();
            beforeEach('insert athletes', () => {
                return db
                    .into('atlas_athletes')
                    .insert(testAthletes)
            })
            it(`responds with 204 and updates the event`, () => {
                idToUpdate = 2;
                const patchAthlete = {
                    name: 'Jane Doe',
                    age: 25,
                    event: 2
                }
                const expectedAthlete = {
                    ...testAthletes[idToUpdate-1],
                    ...patchAthlete
                }
                return supertest(app)
                    .patch(`/api/athletes/${idToUpdate}`)
                    .send(patchAthlete)
                    .expect(res => {
                        supertest(app)
                            .get(`/api/athletes/${idToUpdate}`)
                            .expect(expectedAthlete)
                    })
            })
            it(`responds with 400 when no required fields are provided`, () => {
                const idToUpdate = 2;
                return supertest(app)
                    .patch(`/api/athletes/${idToUpdate}`)
                    .send({irrelevantField: 'foo'})
                    .expect(400, {
                        error: {
                            message: `Request body must contain name, age, or event`
                        }
                    })
            })
            it(`responds with a 204 when updating only a subset of fields`, () => {
                const idToUpdate = 2;
                const patchAthlete = {
                    name: 'Joanne Doe'
                }
                const expectedAthlete = {
                    ...testAthlete[idToUpdate-1],
                    patchAthlete
                }
                return supertest(app)
                    .patch(`/api/athletes/${idToUpdate}`)
                    .send({
                        ...patchAthlete,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/athletes/${idToUpdate}`)
                            .expect(expectedAthlete)
                    )
            })
        })
    })
})