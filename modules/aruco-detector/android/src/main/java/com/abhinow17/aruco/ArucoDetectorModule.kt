package com.abhinow17.aruco

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.opencv.android.OpenCVLoader

class ArucoDetectorModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("ArucoDetector")

        Events("onMarkersDetected")

        OnCreate {
            OpenCVLoader.initDebug()
        }

        Function("startDetection") { fps: Int ->
        }

        Function("stopDetection") {
        }

        View(ArucoCameraView::class) {
            Events("onMarkersDetected")

            Prop("isTracking") { view: ArucoCameraView, isTracking: Boolean ->
                view.setTracking(isTracking)
            }

            Prop("targetFps") { view: ArucoCameraView, targetFps: Int ->
                view.setTargetFps(targetFps)
            }
        }
    }
}
