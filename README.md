Attitude
----
HomegrownMarine.com

Build a heel sensor out of a $35 electrical component, with the [Homegrown Marine boat computer](https://github.com/HomegrownMarine/boat_computer).

I'm currently testing the BNO-055, which has built in 9-axis fusion, with the [Adafruit Breakout board](https://www.adafruit.com/products/2472).  This can also be a solid state, fast compass.

![](https://raw.githubusercontent.com/HomegrownMarine/attitude/master/README/installed_bno055.jpg)


Ouput looks like this:

```
$DATA,IMU,3,3,3,3,EULER,129.75,87.875,-177.875,ACC,-0.18,-0.01,0.02,GRAV,9.79,0.35,-0.06*40
$DATA,IMU,3,3,3,3,EULER,129.1875,87.875,-2,ACC,-0.17,-0.09,-0.13,GRAV,9.8,0.35,0.01*68
$DATA,IMU,3,3,3,3,EULER,128.4375,87.8125,-2,ACC,-0.13,-0.08,-0.17,GRAV,9.79,0.34,0.12*67
$DATA,IMU,3,3,3,3,EULER,128.4375,87.875,-2,ACC,-0.16,-0.07,-0.13,GRAV,9.79,0.34,0.1*6F
$DATA,IMU,3,3,3,3,EULER,128.5,87.9375,-2,ACC,-0.2,-0.05,-0.14,GRAV,9.8,0.34,0.04*5E
$DATA,IMU,3,3,3,3,EULER,128.375,87.9375,-1.9375,ACC,-0.22,-0.05,-0.09,GRAV,9.8,0.34,0.09*4C
$DATA,IMU,3,3,3,3,EULER,127.9375,87.3125,-1.9375,ACC,-0.26,-0.02,-0.12,GRAV,9.79,0.34,0.3*72
$DATA,IMU,3,3,3,3,EULER,127.25,85.875,-2,ACC,0.81,0.44,1.91,GRAV,9.78,0.34,0.61*78
$DATA,IMU,3,3,3,3,EULER,127.1875,85.875,-2,ACC,-0.13,-0.03,-0.06,GRAV,9.78,0.34,0.6*6F
$DATA,IMU,3,3,3,3,EULER,127.25,85.875,-2,ACC,-0.2,-0.06,-0.15,GRAV,9.78,0.34,0.6*54
$DATA,IMU,3,3,3,3,EULER,127.25,85.875,-2,ACC,-0.29,-0.03,0.02,GRAV,9.78,0.34,0.6*43
$DATA,IMU,3,3,3,3,EULER,127.1875,85.875,-2,ACC,-0.21,-0.05,0.1,GRAV,9.78,0.34,0.6*72
```

<video controls="controls">
  <source type="video/mp4" src="https://raw.githubusercontent.com/HomegrownMarine/attitude/master/README/kindle.mov"></source>
  <p>Your browser does not support the video element.</p>
</video>


