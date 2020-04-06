'use strict';

const builder = require('xmlbuilder');
const safelyGetProperty = require('./safelyGetProperty');

const tcx = {};
module.exports = tcx;

var milesToMeters = 1609.34;

// TODO: work with the new format
// I don't think every point has a "seconds_since_pedaling_start"
// I think that's looked up via a separate array

// data.seconds_since_pedaling_start = Array[2667]
// data.metrics = Array[5] display_name: "Output", "Cadence", "Resistance", "Speed", "Heart Rate", values[2667]

const getMetric = (metrics, displayName, index) => {
    return safelyGetProperty(
        metrics,
        metric => metric.display_name === displayName,
        'values',
        index
    );
};

tcx.fromPeloton = function(workout, data) {
    const numPoints = data.seconds_since_pedaling_start.length;
    const start = workout.peloton.start_time * 1000;

    const root = builder.create('TrainingCenterDatabase');
    const activity = root
        .ele('Activities')
        .ele('Activity')
        .att('Sport', 'Biking');
    activity.ele('Id', new Date(start).toISOString());
    const lap = activity.ele('Lap');
    lap.att('StartTime', new Date(start).toISOString());

    const totalSeconds = data.seconds_since_pedaling_start[numPoints - 1];
    lap.ele('TotalTimeSeconds', totalSeconds);

    const totalMiles = safelyGetProperty(
        data,
        'summaries',
        summary => summary.display_name === 'Distance',
        'value'
    );
    if (totalMiles) {
        lap.ele('DistanceMeters', (totalMiles * milesToMeters).toFixed(2));
    }

    var track = lap.ele('Track');

    data.seconds_since_pedaling_start.forEach((seconds_since_pedaling_start, index) => {
        const cadence = getMetric(data.metrics, 'Cadence', index);
        const power = getMetric(data.metrics, 'Output', index);
        const heartRate = getMetric(data.metrics, 'Heart Rate', index);
        const trackpoint = {
            Time: new Date(start + seconds_since_pedaling_start * 1000).toISOString(),
            Cadence: cadence,
            // DistanceMeters: (point.distance * milesToMeters).toFixed(2),
            Extensions: {
                TPX: {
                    Watts: power
                }
            }
        };

        if (heartRate) {
            trackpoint.HeartRateBpm = { Value: heartRate };
        }

        track.ele('Trackpoint').ele(trackpoint);
    });

    return root;
};
