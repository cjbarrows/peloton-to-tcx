'use strict';

require('dotenv').load();

var pelotonApi = require('./lib/peloton-api');
var tcx = require('./lib/tcx');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

module.exports = p2t;

const convertWorkouts = async (workoutIds, resultsDirectory) => {
    workoutIds.forEach(async workoutId => {
        try {
            const { data: workout } = await pelotonApi.getWorkout(workoutId);

            const { data } = await pelotonApi.getWorkoutSample(workoutId);

            // data.metrics [Output, Cadence, Resistance, Speed, Heart Rate]

            const xml = tcx.fromPeloton(workout, data);
            fs.writeFileSync(
                path.join(resultsDirectory, workoutId + '.tcx'),
                xml.end({ pretty: true })
            );
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    });
};

async function p2t(options) {
    options = options || {};
    const login = options.pLogin || process.env.PELOTON_LOGIN;
    const password = options.pPassword || process.env.PELOTON_PASSWORD;
    const resultsDirectory = options.resultsDirectory || './peloton-results';

    const {
        data: { user_id: userId, session_id: sessionId }
    } = await pelotonApi.authenticate(login, password);

    const { data: history } = await pelotonApi.getWorkoutHistory(userId, sessionId, options.limit);

    var workoutIds = history.data.map(item => item.id);

    await mkdirp(resultsDirectory);

    await convertWorkouts(workoutIds, resultsDirectory);

    console.log(`exported ${workoutIds.length} workouts`);
}

p2t({ limit: 2 });
