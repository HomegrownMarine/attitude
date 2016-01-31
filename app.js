//! app.js
//! calculate attitude from bno-550 IMU.
//! version : 0.2
//! homegrownmarine.com

var BNO055 = require('node-bno055');
var async = require('async');

exports.load = function(server, boatData, settings) {
    var zero = settings.get('attitude.zero') || {heel: 0, pitch: 0};
    var updateZero = function(newZero) {
        zero = newZero;

        settings.set('attitude.zero', newZero);
    };

    var updateCalibration = function(calibration) {
        settings.set('attitude.calibration', calibration);
    };

    var calibrationData = settings.get('attitude.calibration');
    var imu = new BNO055({
        calibration: calibrationData,
        orientation: BNO055.orientation(BNO055.AXIS_REMAP_Y, BNO055.AXIS_REMAP_X, BNO055.AXIS_REMAP_Z, 0,1,0)
    });

    //TODO: calibrate compass
    // offset and declination table

    var gettingCalibration = false;
    var latest;

    // 10Hz, get IMU data
    setInterval(function() {
        if (gettingCalibration) return; //TODO: move this into bno lib.

        async.series({
            calibrationStatus: imu.getCalibrationStatus.bind(imu),
            euler: imu.getEuler.bind(imu),
            linearAcceleration: imu.getLinearAcceleration.bind(imu),
            gravity: imu.getGravity.bind(imu)
        },
        function(err, results) {
            latest = results;

            boatData.broadcast({
                type: 'DATA',
                subtype: 'IMU',
                values: [
                    results.calibrationStatus.systemStatus,
                    results.calibrationStatus.gyroStatus,
                    results.calibrationStatus.accelerometerStatus,
                    results.calibrationStatus.magnetometerStatus,
                    'EULER',
                    results.euler.heading,
                    results.euler.roll,
                    results.euler.pitch,
                    'ACC',
                    results.linearAcceleration.x,
                    results.linearAcceleration.y,
                    results.linearAcceleration.z,
                    'GRAV',
                    results.gravity.x,
                    results.gravity.y,
                    results.gravity.z
                ]
            });


        });
    }, 100);

    //every so often update the calibration data
    //for now, we're logging it to see how it changes during sailing.  
    setInterval(function() {
        if (latest.calibrationStatus.systemStatus == 3) {
            gettingCalibration = true;
            imu.getCalibrationData(function(err, results) {
                boatData.broadcast({
                    type: 'DATA',
                    subtype: 'IMU:CAL',
                    values: [
                        results?JSON.stringify(results):'undefined'
                    ]
                });
                if (results) {
                    updateCalibration(results);
                }

                gettingCalibration = false;
            });

        }
    }, 30000);


    server.use('/attitude', express.static(path.join(__dirname, 'www')));

    server.post('/attitude/zero', function(req, res){
        var newZero = {
            heel: -1*latest.euler.roll,
            pitch: -1*latest.euler.pitch
        };
        updateZero(newZero);

        //just resend zero as proof of success
        res.send(newZero);
    });

    // server.get('/attitude/zero', function(req, res) {
    //     res.send(zero);
    // });

    return {url:'/attitude/', title:'Zero Heel/Pitch', priority: 10};
};
