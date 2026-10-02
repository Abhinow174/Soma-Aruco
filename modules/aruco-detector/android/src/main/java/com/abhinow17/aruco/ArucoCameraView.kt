package com.abhinow17.aruco

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.camera.core.AspectRatio
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import org.opencv.android.OpenCVLoader
import org.opencv.aruco.Aruco
import org.opencv.aruco.Dictionary
import org.opencv.core.Core
import org.opencv.core.CvType
import org.opencv.core.Mat
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class ArucoCameraView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
    val onMarkersDetected by EventDispatcher()

    private val previewView = PreviewView(context).apply {
        layoutParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        )
        scaleType = PreviewView.ScaleType.FILL_CENTER
    }

    private var cameraProvider: ProcessCameraProvider? = null
    private val executor: ExecutorService = Executors.newSingleThreadExecutor()
    private var isTracking = false
    private var targetFps = 30
    private var lastProcessTime = 0L
    private var frameCount = 0
    private var lastFpsTime = 0L
    private var currentFps = 0.0

    private var dictionary: Dictionary? = null

    init {
        addView(previewView)
        try {
            if (OpenCVLoader.initDebug()) {
                dictionary = Aruco.getPredefinedDictionary(Aruco.DICT_4X4_250)
            }
        } catch (_: Throwable) {}
    }

    fun setTracking(tracking: Boolean) {
        this.isTracking = tracking
    }

    fun setTargetFps(fps: Int) {
        this.targetFps = if (fps > 0) fps else 30
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        startCamera()
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        stopCamera()
    }

    private fun startCamera() {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            return
        }

        val lifecycleOwner = appContext.currentActivity as? LifecycleOwner ?: return
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)

        cameraProviderFuture.addListener({
            try {
                cameraProvider = cameraProviderFuture.get()
                val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

                val preview = Preview.Builder()
                    .setTargetAspectRatio(AspectRatio.RATIO_4_3)
                    .build().also {
                        it.setSurfaceProvider(previewView.surfaceProvider)
                    }

                val imageAnalysis = ImageAnalysis.Builder()
                    .setTargetAspectRatio(AspectRatio.RATIO_4_3)
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()

                imageAnalysis.setAnalyzer(executor) { image ->
                    try {
                        if (!isTracking) {
                            return@setAnalyzer
                        }

                        val currentTime = System.currentTimeMillis()
                        val minInterval = if (targetFps > 0) 1000L / targetFps else 33L
                        if (currentTime - lastProcessTime < minInterval) {
                            return@setAnalyzer
                        }
                        lastProcessTime = currentTime

                        processImage(image)
                    } catch (_: Exception) {
                    } finally {
                        image.close()
                    }
                }

                cameraProvider?.unbindAll()
                cameraProvider?.bindToLifecycle(lifecycleOwner, cameraSelector, preview, imageAnalysis)
            } catch (_: Exception) {
            }
        }, ContextCompat.getMainExecutor(context))
    }

    private fun stopCamera() {
        try {
            cameraProvider?.unbindAll()
        } catch (_: Exception) {}
    }

    private fun processImage(image: ImageProxy) {
        val dict = dictionary ?: return
        val plane = image.planes[0]
        val yBuffer = plane.buffer
        val rowStride = plane.rowStride
        val width = image.width
        val height = image.height

        val ySize = yBuffer.remaining()
        val yArray = ByteArray(ySize)
        yBuffer.get(yArray)

        val mat = Mat(height, rowStride, CvType.CV_8UC1)
        mat.put(0, 0, yArray)

        val cleanMat = if (rowStride == width) mat else mat.submat(0, height, 0, width)

        var rotatedMat: Mat? = null
        val corners = mutableListOf<Mat>()
        val ids = Mat()

        try {
            val processedMat = when (image.imageInfo.rotationDegrees) {
                90 -> {
                    val r = Mat()
                    Core.rotate(cleanMat, r, Core.ROTATE_90_CLOCKWISE)
                    rotatedMat = r
                    r
                }
                180 -> {
                    val r = Mat()
                    Core.rotate(cleanMat, r, Core.ROTATE_180)
                    rotatedMat = r
                    r
                }
                270 -> {
                    val r = Mat()
                    Core.rotate(cleanMat, r, Core.ROTATE_90_COUNTERCLOCKWISE)
                    rotatedMat = r
                    r
                }
                else -> cleanMat
            }

            Aruco.detectMarkers(processedMat, dict, corners, ids)

            frameCount++
            val currentTime = System.currentTimeMillis()
            if (currentTime - lastFpsTime >= 1000) {
                currentFps = frameCount * 1000.0 / (currentTime - lastFpsTime)
                frameCount = 0
                lastFpsTime = currentTime
            }

            val markersList = mutableListOf<Bundle>()
            if (ids.rows() > 0 && !ids.empty()) {
                for (i in 0 until ids.rows()) {
                    val markerId = ids.get(i, 0)[0].toInt()
                    val cornerMat = corners[i]

                    val cornerBundles = mutableListOf<Bundle>()
                    var sumX = 0.0
                    var sumY = 0.0

                    for (j in 0 until 4) {
                        val x = cornerMat.get(0, j)[0]
                        val y = cornerMat.get(0, j)[1]
                        sumX += x
                        sumY += y
                        val point = Bundle().apply {
                            putDouble("x", x)
                            putDouble("y", y)
                        }
                        cornerBundles.add(point)
                    }

                    val center = Bundle().apply {
                        putDouble("x", sumX / 4.0)
                        putDouble("y", sumY / 4.0)
                    }

                    val markerBundle = Bundle().apply {
                        putInt("id", markerId)
                        putParcelableArrayList("corners", ArrayList(cornerBundles))
                        putBundle("center", center)
                    }
                    markersList.add(markerBundle)
                }
            }

            val eventData = Bundle().apply {
                putParcelableArrayList("markers", ArrayList(markersList))
                putDouble("fps", currentFps)
                putDouble("frameWidth", processedMat.cols().toDouble())
                putDouble("frameHeight", processedMat.rows().toDouble())
            }

            onMarkersDetected(eventData)
        } finally {
            mat.release()
            if (cleanMat !== mat) {
                cleanMat.release()
            }
            rotatedMat?.release()
            ids.release()
            for (corner in corners) {
                corner.release()
            }
        }
    }
}
