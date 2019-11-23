const AthletesService = {
    getAllAthletes(knex) {
        return knex.select('*').from('atlas_athletes')
    },
    insertAthlete(knex, newAthlete) {
        return knex
            .insert(newAthlete)
            .into('atlas_athletes')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex
            .from('atlas_athletes')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteAthlete(knex, id) {
        return knex
            .from('atlas_athletes')
            .where({id})
            .delete()
    },
    updateAthlete(knex, id, newAthleteFields) {
        return knex
            .from('atlas_athletes')
            .where({id})
            .update(newAthleteFields)
    }
}

module.exports = AthletesService;