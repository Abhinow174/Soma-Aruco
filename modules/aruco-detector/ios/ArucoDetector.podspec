require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json'))) rescue { 'version' => '1.0.0' }

Pod::Spec.new do |s|
  s.name           = 'ArucoDetector'
  s.version        = package['version']
  s.summary        = 'ArucoDetector'
  s.description    = 'ArucoDetector'
  s.homepage       = 'https://github.com/expo/expo'
  s.license        = 'MIT'
  s.author         = ''
  s.platforms      = { :ios => '13.0' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'OpenCV', '~> 4.3'

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
