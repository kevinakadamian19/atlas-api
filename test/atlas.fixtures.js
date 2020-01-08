function makeEventsArray() {
    return [
        {
            id: 1,
            name: 'Raw Nationals'
        },
        {
            id: 2,
            name: 'Winter Swolestice'
        },
        {
            id: 3,
            name: 'Liz Freel Classic'
        }
    ];
}

function makeAtheletesArray() {
    return [
        {
            id: 1,
            name: 'Russell Orhii',
            weight: '83',
            gender: 'male',
            age: '25',
            event: '1'
        },
        {
            id: 2,
            name: 'Ben Pollack',
            weight: '83',
            gender: 'male',
            age: '30',
            event: '1'
        },
        {
            id: 3,
            name: 'Mimi',
            weight: '64',
            gender: 'female',
            age: '23',
            event: '2'
        }
    ];
}

function makeLiftsArray() {
    return [
        {
            id: 1,
            squat: '205',
            bench: '125',
            deadlift: '250',
            athlete: '1',
            event: '1'
        },
        {
            id: 2,
            squat: '220',
            bench: '150',
            deadlift: '300',
            athlete: '2',
            event: '1'
        },
        {
            id: 3,
            squat: '205',
            bench: '125',
            deadlift: '250',
            athlete: '3',
            event: '2'
        }
    ]
}

module.exports = {
    makeAtheletesArray,
    makeEventsArray,
    makeLiftsArray
};