const LiftsService = {
    getAllLifts(knex) {
        return knex.select('*').from('atlas_lifts')
    },
    insertLift(knex, newLift) {
        return knex
            .insert(newLift)
            .into('atlas_lifts')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex
            .from('atlas_lifts')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteLift(knex, id) {
        return knex
            .from('atlas_lifts')
            .where({id})
            .delete()
    },
    updateLift(knex, id, newLiftFields) {
        return knex
            .from('atlas_lifts')
            .where({id})
            .update(newLiftFields)
    }
}

module.exports = LiftsService;