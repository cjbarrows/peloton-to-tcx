'use strict';

const axios = require('axios').default;

var api = {};
module.exports = api;

api.authenticate = function(login, password, done) {
    return axios.post('https://api.onepeloton.com/auth/login', {
        password,
        username_or_email: login
    });
    /*
    request(
        {
            url: 'https://api.onepeloton.com/auth/login',
            method: 'POST',
            body: JSON.stringify({
                password: password,
                username_or_email: login
            })
        },
        function(err, res, body) {
            if (err) {
                return done(err);
            }

            if (res.statusCode !== 200) {
                return done(new Error('Status code ' + res.statusCode));
            }

            done(null, JSON.parse(body));
        }
    );
    */
};

api.getWorkoutHistory = function(userId, sessionId, limit) {
    var url =
        'https://api.onepeloton.com/api/user/' +
        userId +
        '/workouts?joins=peloton.ride&limit=' +
        (limit || 1) +
        '&page=0&sort_by=-created';

    return axios.get(url, {
        headers: {
            cookie: 'peloton_session_id=' + sessionId + ';'
        }
    });
    /*
    request(
        {
            url: url,
            headers: {
                cookie: 'peloton_session_id=' + sessionId + ';'
            }
        },
        function(err, res, body) {
            if (err) {
                return done(err);
            }

            if (res.statusCode !== 200) {
                return done(new Error('Status code ' + res.statusCode));
            }

            done(null, JSON.parse(body));
        }
    );
    */
};

api.getWorkout = function(workoutId) {
    var url =
        'https://api.onepeloton.com/api/workout/' +
        workoutId +
        '?joins=peloton,peloton.ride,peloton.ride.instructor,user';

    return axios.get(url);

    /*
        request(url, function(err, res, body) {
        if (err) {
            return done(err);
        }

        if (res.statusCode !== 200) {
            return done(new Error('Status code ' + res.statusCode));
        }

        done(null, JSON.parse(body));
    });
    */
};

api.getWorkoutSample = function(workoutId) {
    /*
    var url =
        'https://api.onepeloton.com/api/workout/' +
        workoutId +
        // '/sample?every_n=10&fields=seconds_since_pedaling_start,power,cadence,speed,heart_rate,distance&limit=14400';
        */

    const url = `https://api.onepeloton.com/api/workout/${workoutId}/performance_graph?every_n=1`;

    return axios.get(url);
    /*
    request(url, function(err, res, body) {
        if (err) {
            return done(err);
        }

        if (res.statusCode !== 200) {
            return done(new Error('Status code ' + res.statusCode));
        }

        done(null, JSON.parse(body));
    });
*/
};
