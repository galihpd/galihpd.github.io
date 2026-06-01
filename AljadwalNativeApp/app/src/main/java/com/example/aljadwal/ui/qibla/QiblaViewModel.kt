package com.example.aljadwal.ui.qibla

import android.Manifest
import android.app.Application
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import androidx.core.app.ActivityCompat
import androidx.lifecycle.AndroidViewModel
import com.google.android.gms.location.LocationServices
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

class QiblaViewModel(application: Application) : AndroidViewModel(application), SensorEventListener {

    private val sensorManager = application.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    private val magnetometer = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)

    private var gravity: FloatArray? = null
    private var geomagnetic: FloatArray? = null

    private val _azimuth = MutableStateFlow(0f)
    val azimuth = _azimuth.asStateFlow()

    private val _qiblaBearing = MutableStateFlow(292.5f)
    val qiblaBearing = _qiblaBearing.asStateFlow()
    
    private val _userLocationStr = MutableStateFlow("Sedang mencari lokasi...")
    val userLocationStr = _userLocationStr.asStateFlow()

    private val alpha = 0.1f

    fun startSensors() {
        accelerometer?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
        magnetometer?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
    }

    fun stopSensors() {
        sensorManager.unregisterListener(this)
    }

    fun fetchLocation(context: Context) {
        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)
            fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                location?.let {
                    _qiblaBearing.value = calculateQiblaDirection(it.latitude, it.longitude)
                    
                    val latF = String.format(java.util.Locale.US, "%.4f", it.latitude)
                    val lonF = String.format(java.util.Locale.US, "%.4f", it.longitude)
                    val latStr = if (it.latitude >= 0) "$latF° LU" else "${latF.replace("-", "")}° LS"
                    val lonStr = if (it.longitude >= 0) "$lonF° BT" else "${lonF.replace("-", "")}° BB"
                    _userLocationStr.value = "$latStr, $lonStr"
                }
            }
        }
    }

    private fun calculateQiblaDirection(latitude: Double, longitude: Double): Float {
        val kaabaLat = Math.toRadians(21.422487)
        val kaabaLng = Math.toRadians(39.826206)
        val myLat = Math.toRadians(latitude)
        val myLng = Math.toRadians(longitude)

        val y = Math.sin(kaabaLng - myLng)
        val x = Math.cos(myLat) * Math.tan(kaabaLat) - Math.sin(myLat) * Math.cos(kaabaLng - myLng)
        var qibla = Math.toDegrees(Math.atan2(y, x)).toFloat()
        if (qibla < 0) {
            qibla += 360f
        }
        return qibla
    }

    override fun onSensorChanged(event: SensorEvent) {
        if (event.sensor.type == Sensor.TYPE_ACCELEROMETER) gravity = lowPass(event.values.clone(), gravity)
        if (event.sensor.type == Sensor.TYPE_MAGNETIC_FIELD) geomagnetic = lowPass(event.values.clone(), geomagnetic)

        if (gravity != null && geomagnetic != null) {
            val R = FloatArray(9)
            val I = FloatArray(9)
            if (SensorManager.getRotationMatrix(R, I, gravity, geomagnetic)) {
                val orientation = FloatArray(3)
                SensorManager.getOrientation(R, orientation)
                // Convert to degrees
                var degree = Math.toDegrees(orientation[0].toDouble()).toFloat()
                if (degree < 0) degree += 360f
                _azimuth.value = degree
            }
        }
    }

    private fun lowPass(input: FloatArray, output: FloatArray?): FloatArray {
        if (output == null) return input
        for (i in input.indices) {
            output[i] = output[i] + alpha * (input[i] - output[i])
        }
        return output
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}
