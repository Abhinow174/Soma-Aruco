import ExpoModulesCore
import AVFoundation

public class ArucoCameraView: ExpoView, AVCaptureVideoDataOutputSampleBufferDelegate {
  public let onMarkersDetected = EventDispatcher()

  private var captureSession: AVCaptureSession?
  private var previewLayer: AVCaptureVideoPreviewLayer?
  private var videoOutput: AVCaptureVideoDataOutput?
  private var targetFps: Int = 30
  private var lastProcessTime: TimeInterval = 0
  private var frameCount: Int = 0
  private var lastFpsTime: TimeInterval = 0
  private var currentFps: Double = 0.0
  private var isTracking: Bool = false

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    startCamera()
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    previewLayer?.frame = bounds
  }

  public func setTracking(_ tracking: Bool) {
    self.isTracking = tracking
  }

  public func setTargetFps(_ fps: Int) {
    self.targetFps = fps > 0 ? fps : 30
  }

  private func startCamera() {
    DispatchQueue.global(qos: .userInitiated).async { [weak self] in
      guard let self = self else { return }

      let session = AVCaptureSession()
      session.beginConfiguration()
      session.sessionPreset = .vga640x480

      guard let videoDevice = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back),
            let videoDeviceInput = try? AVCaptureDeviceInput(device: videoDevice),
            session.canAddInput(videoDeviceInput) else {
        return
      }
      session.addInput(videoDeviceInput)

      let output = AVCaptureVideoDataOutput()
      guard session.canAddOutput(output) else { return }
      output.setSampleBufferDelegate(self, queue: DispatchQueue(label: "cameraViewQueue"))
      output.videoSettings = [kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32BGRA)]
      output.alwaysDiscardsLateVideoFrames = true
      session.addOutput(output)

      if let connection = output.connection(with: .video) {
        if connection.isVideoOrientationSupported {
          connection.videoOrientation = .portrait
        }
      }

      session.commitConfiguration()
      session.startRunning()

      DispatchQueue.main.async {
        let layer = AVCaptureVideoPreviewLayer(session: session)
        layer.videoGravity = .resizeAspectFill
        layer.frame = self.bounds
        self.layer.addSublayer(layer)
        self.previewLayer = layer
      }

      self.captureSession = session
      self.videoOutput = output
      self.frameCount = 0
      self.lastFpsTime = Date().timeIntervalSince1970
    }
  }

  deinit {
    captureSession?.stopRunning()
    captureSession = nil
  }

  public func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
    guard isTracking else { return }

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

    onMarkersDetected([
      "markers": markersList,
      "fps": currentFps,
      "frameWidth": Double(width),
      "frameHeight": Double(height)
    ])
  }
}
