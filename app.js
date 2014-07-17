//! app.js
//! calculate attitude from sensors using DCM.
//! version : 0.1
//! homegrownmarine.com

var console = require('console');
var _ = require('lodash');

var mpu6050 = require('mpu6050');

exports.load = function(server, boatData, settings) {
    var zero = settings.get('attitude.zero');

    var mpu = new mpu6050();
    mpu.initialize();
    mpu.setFullScaleAccelRange(mpu.ACCEL_FS_2)

    var heels = [];
    var pitches = [];
    var position = 0;
    var samples = 50;

    var updateAngles = function(heel, pitch) {
        heels[position] = heel;
        pitches[position] = pitch;
        position = (position + 1) % samples;
    }

    var getAnglesFromAccelerometer = function(acceleration) {
        var signOfZ = acceleration.z >= 0 ? 1.0 : -1.0;

        var heel = acceleration.x * acceleration.x + acceleration.z * acceleration.z;
        heel = Math.atan2(acceleration.y, Math.sqrt(heel)) * 180 / Math.PI;

        var pitch = acceleration.y * acceleration.y + acceleration.z * acceleration.z;
        pitch = Math.atan2(acceleration.x, signOfZ * Math.sqrt(pitch)) * 180 / Math.PI;

        return [heel, pitch];
    }

    var getAngles = function() {
        var heel = _.reduce(heels, function(s, n) { return s + n; }) / heel.length;
        var pitch = _.reduce(pitches, function(s, n) { return s + n; }) / pitches.length;

        return [heel, pitch];
    }

    //@ 50Hz, sample
    setInterval(function() {
        var acceleration = mpu6050.getAcceleration();

        var angles = getAnglesFromAccelerometer({
            x: acceleration[0] / 16384,
            y: acceleration[1] / 16384,
            z: acceleration[2] / 16384
        });

        updateAngles(angles[0], angles[1]);

    }, 20);

    //@ 1Hz, broadcast trim 
    setInterval(function() {

        var angles = getAngles();
        console.info('accels', mpu6050.getAcceleration(), getAngles())

        boatData.broadcast({
            type: 'xhr',
            heel: angles[0],
            pitch: angles[1]
        });
    }, 1000);
};
