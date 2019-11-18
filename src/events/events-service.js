const EventsService = {
    getAllEvents(knex) {
        return knex.select('*').from('atlas_events')
    },
    insertEvent(knex, newEvent) {
        return knex
            .insert(newEvent)
            .into('atlas_events')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex
            .from('atlas_events')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteEvent(knex, id) {
        return knex
            .from('atlas_events')
            .where({id})
            .delete()
    },
    patchEvent(knex, id, newEventFields) {
        return knex
            .from('atlas_events')
            .where({id})
            .update(newEventFields)
    }
}