import ExpoModulesCore
import AVFoundation

public class ArucoDetectorModule: Module, AVCaptureVideoDataOutputSampleBufferDelegate {
  private var captureSession: AVCaptureSession?
  private var videoOutput: AVCaptureVideoDataOutput?
  private var targetFps: Int = 30
  private var lastProcessTime: TimeInterval = 0
  private var frameCount: Int = 0
  private var lastFpsTime: TimeInterval = 0
  private var currentFps: Double = 0.0
  private var isRunning: Bool = false

  public func definition() -> ModuleDefinition {
    Name("ArucoDetector")

    Events("onMarkersDetected")

    Function("startDetection") { (fps: Int) in
      self.targetFps = fps
      self.startCamera()
    }

    Function("stopDetection") {
      self.stopCamera()
    }

    View(ArucoCameraView.self) {
      Events("onMarkersDetected")

      Prop("isTracking") { (view: ArucoCameraView, isTracking: Bool) in
        view.setTracking(isTracking)
      }

      Prop("targetFps") { (view: ArucoCameraView, targetFps: Int) in
        view.setTargetFps(targetFps)
      }
    }
  }

  private func startCamera() {
    if isRunning { return }

    DispatchQueue.global(qos: .userInitiated).async {
      self.captureSession = AVCaptureSession()
      guard let captureSession = self.captureSession else { return }

      captureSession.beginConfiguration()
      captureSession.sessionPreset = .vga640x480

      guard let videoDevice = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back),
            let videoDeviceInput = try? AVCaptureDeviceInput(device: videoDevice),
            captureSession.canAddInput(videoDeviceInput) else {
        return
      }
      captureSession.addInput(videoDeviceInput)

      self.videoOutput = AVCaptureVideoDataOutput()
      guard let videoOutput = self.videoOutput, captureSession.canAddOutput(videoOutput) else {
        return
      }

      videoOutput.setSampleBufferDelegate(self, queue: DispatchQueue(label: "videoQueue"))
      videoOutput.videoSettings = [kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32BGRA)]
      videoOutput.alwaysDiscardsLateVideoFrames = true
      captureSession.addOutput(videoOutput)

      if let connection = videoOutput.connection(with: .video) {
        if connection.isVideoOrientationSupported {
          connection.videoOrientation = .portrait
        }
      }

      captureSession.commitConfiguration()
      captureSession.startRunning()

      self.isRunning = true
      self.frameCount = 0
      self.lastFpsTime = Date().timeIntervalSince1970
    }
  }

  private func stopCamera() {
    if !isRunning { return }
    captureSession?.stopRunning()
    captureSession = nil
    isRunning = false
  }

  public func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
    let currentTime = Date().timeIntervalSince1970
    let minInterval = 1.0 / Double(targetFps)

    if currentTime - lastProcessTime < minInterval {
      return
    }
    lastProcessTime = currentTime

    guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }

    CVPixelBufferLockBaseAddress(pixelBuffer, .readOnly)
    let width = CVPixelBufferGetWidth(pixelBuffer)
    let height = CVPixelBufferGetHeight(pixelBuffer)
    let baseAddress = CVPixelBufferGetBaseAddress(pixelBuffer)
    let bytesPerRow = CVPixelBufferGetBytesPerRow(pixelBuffer)

    let markers = ArucoOpenCVWrapper.detectMarkers(in: baseAddress, width: Int32(width), height: Int32(height), bytesPerRow: Int32(bytesPerRow))

    CVPixelBufferUnlockBaseAddress(pixelBuffer, .readOnly)

    frameCount += 1
    if currentTime - lastFpsTime >= 1.0 {
      currentFps = Double(frameCount) / (currentTime - lastFpsTime)
      frameCount = 0
      lastFpsTime = currentTime
    }

    var markersList: [[String: Any]] = []
    if let detectedMarkers = markers as? [[String: Any]] {
      markersList = detectedMarkers
    }

    sendEvent("onMarkersDetected", [
      "markers": markersList,
      "fps": currentFps,
      "frameWidth": Double(width),
      "frameHeight": Double(height)
    ])
  }
}
