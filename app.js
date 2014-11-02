//! app.js
//! calculate attitude from accelerometer.
//! version : 0.1
//! homegrownmarine.com

var express = require('express');
var path = require('path');
var _ = require('lodash');
var mpu6050 = require('mpu6050');

exports.load = function(server, boatData, settings) {
    var zero = settings.get('attitude.zero') || {heel: 0, pitch: 0};

    var updateZero = function(newZero) {
        zero = newZero;

        settings.set('attitude.zero', newZero);
    };

    var mpu = new mpu6050();
    mpu.initialize();
    mpu.setFullScaleAccelRange(mpu.ACCEL_FS_2);

    // get raw, samples heel and pitch from acceleration vector.
    var getAnglesFromAccelerometer = function(acceleration) {
        var signOfZ = acceleration.z >= 0 ? 1.0 : -1.0;

        var heel = acceleration.x * acceleration.x + acceleration.z * acceleration.z;
        heel = Math.atan2(acceleration.y, Math.sqrt(heel)) * 180 / Math.PI;

        var pitch = acceleration.y * acceleration.y + acceleration.z * acceleration.z;
        pitch = Math.atan2(acceleration.x, signOfZ * Math.sqrt(pitch)) * 180 / Math.PI;

        return [heel, pitch];
    };

    // keep track of last n (100) samples, and
    // average out noise

    var sum = function(array) {
        var s = 0;
        for ( var i = 0; i < array.length; i++ ) {
            s += array[i];
        }
        return s;
    };

    var heels = [];
    var pitches = [];
    var position = 0;
    var samples = 100;

    // add new sample to history of saved heels/pitches
    var updateAngles = function(heel, pitch) {
        heels[position] = heel;
        pitches[position] = pitch;
        position = (position + 1) % samples;
    };

    // get averaged and corrected angles from sample history
    var getAngles = function() {
        var heel = zero.heel + sum(heels) / heels.length;
        var pitch = zero.pitch + sum(pitches) / pitches.length;

        return [heel, pitch];
    };

    //@ 100Hz, sample
    setInterval(function() {
        var acceleration = mpu.getAcceleration();

        var angles = getAnglesFromAccelerometer({
            x: acceleration[0] / 16384,
            y: acceleration[1] / 16384,
            z: acceleration[2] / 16384
        });

        updateAngles(angles[0], angles[1]);

    }, 10);

    //@ 1Hz, broadcast trim 
    setInterval(function() {
        var angles = getAngles();

        boatData.broadcast({
            type: 'xhr',
            heel: Math.abs(angles[0]).toFixed(1),
            pitch: angles[1].toFixed(1)
        });
    }, 1000);


    server.use('/attitude', express.static(path.join(__dirname, 'www')));

    server.post('/attitude/zero', function(req, res){
        var angles = getAngles();

        var newZero = {
            heel: -1*angles[0],
            pitch: -1*angles[1]
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
