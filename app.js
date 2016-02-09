//! app.js
//! calculate attitude from bno-550 IMU.
//! version : 0.2
//! homegrownmarine.com

var express = require('express');
var BNO055 = require('node-bno055');
var async = require('async');

exports.load = function(server, boatData, settings) {
    var zero = settings.get('attitude.zero') || {heel: 0, pitch: 0};
    function updateZero(newZero) {
        zero = newZero;
        settings.set('attitude.zero', newZero);
    };
    var declination = [];

    function updateCalibration(calibration) {
        if (latest && latest.calibrationStatus.systemStatus >= 2) {
            settings.set('attitude.calibration', calibration);
        }

        boatData.broadcast({
            type: 'DATA',
            subtype: 'IMU:CAL',
            values: [
                calibration?JSON.stringify(calibration):'undefined'
            ]
        });
    };

    var latest;
    function receiveIMUData(results) {
        latest = results;

        if (!results) {
            return;
        }

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

        boatData.broadcast({
            'heel': results.euler.roll,
            'pitch':results.euler.pitch,
            'hdg': results.euler.heading
        });
    }

    function startTimers() {

        var requestActive = false;
    
        // 10Hz, get IMU data
        setInterval(function() {
            if (requestActive) return; //TODO: move this into bno lib.

            requestActive = true;
            async.series({
                calibrationStatus: imu.getCalibrationStatus.bind(imu),
                euler: imu.getEuler.bind(imu),
                linearAcceleration: imu.getLinearAcceleration.bind(imu),
                gravity: imu.getGravity.bind(imu)
            },
            function(err, results) {
                if ( err || !results ) {
                    console.error('attitude imu receive', err);
                    results = null;
                }

                receiveIMUData(results);
                requestActive = false;
            });
        }, 100);

        //every so often update the calibration data
        //for now, we're logging it to see how it changes during sailing.  
        setInterval(function() {
            if ( requestActive ) return;

            requestActive = true;
            imu.getCalibrationData(function(err, results) {
                if (results) {
                    updateCalibration(results);
                }

                requestActive = false;
            });

        }, 30000);
    }

    var calibrationData = settings.get('attitude.calibration');
    var imu = new BNO055({
        calibration: calibrationData,
        orientation: BNO055.orientation(BNO055.AXIS_REMAP_Y, BNO055.AXIS_REMAP_X, BNO055.AXIS_REMAP_Z, 0,1,0)
    });
    
    imu.beginNDOF(function(err) {
        if (err) {
            console.error('attitude imu initialization error', err);
            return;
        }

        startTimers();
    })

    //TODO: calibrate compass
    // offset and declination table


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

    server.get('/attitude/zero', function(req, res) {
        res.send(zero);
    });

    return {url:'/attitude/', title:'Zero Heel/Pitch', priority: 10};
};
