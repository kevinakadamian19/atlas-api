const CompetitionsService = {
    getAllCompetitions(knex) {
        return knex.select('*').from('atlas_competitions')
    },
    insertCompetition(knex, newEvent) {
        return knex
            .insert(newEvent)
            .into('atlas_competitions')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex
            .from('atlas_competitions')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteCompetition(knex, id) {
        return knex
            .from('atlas_competitions')
            .where({id})
            .delete()
    },
    updateCompetitions(knex, id, newCompetitionFields) {
        return knex
            .from('atlas_competitions')
            .where({id})
            .update(newCompetitionFields)
    }
}

module.exports = CompetitionsService;