#import "ArucoOpenCVWrapper.h"
#import <opencv2/opencv.hpp>
#if __has_include(<opencv2/aruco.hpp>)
#import <opencv2/aruco.hpp>
#elif __has_include(<opencv2/objdetect/aruco_detector.hpp>)
#import <opencv2/objdetect/aruco_detector.hpp>
#endif

@implementation ArucoOpenCVWrapper

+ (NSArray *)detectMarkersIn:(void *)baseAddress width:(int)width height:(int)height bytesPerRow:(int)bytesPerRow {
    if (!baseAddress || width <= 0 || height <= 0) {
        return @[];
    }

    cv::Mat bgraMat(height, width, CV_8UC4, baseAddress, bytesPerRow);
    cv::Mat grayMat;
    cv::cvtColor(bgraMat, grayMat, cv::COLOR_BGRA2GRAY);

    cv::aruco::Dictionary dictionary = cv::aruco::getPredefinedDictionary(cv::aruco::DICT_4X4_250);
    std::vector<int> ids;
    std::vector<std::vector<cv::Point2f>> corners;

#if __has_include(<opencv2/objdetect/aruco_detector.hpp>)
    cv::aruco::DetectorParameters detectorParams = cv::aruco::DetectorParameters();
    cv::aruco::ArucoDetector detector(dictionary, detectorParams);
    detector.detectMarkers(grayMat, corners, ids);
#else
    cv::Ptr<cv::aruco::DetectorParameters> detectorParams = cv::aruco::DetectorParameters::create();
    cv::aruco::detectMarkers(grayMat, cv::makePtr<cv::aruco::Dictionary>(dictionary), corners, ids, detectorParams);
#endif

    NSMutableArray *markers = [NSMutableArray array];
    for (size_t i = 0; i < ids.size(); i++) {
        NSMutableDictionary *marker = [NSMutableDictionary dictionary];
        marker[@"id"] = @(ids[i]);

        NSMutableArray *cornerPoints = [NSMutableArray array];
        float sumX = 0;
        float sumY = 0;
        for (int j = 0; j < 4; j++) {
            float x = corners[i][j].x;
            float y = corners[i][j].y;
            sumX += x;
            sumY += y;
            [cornerPoints addObject:@{@"x": @(x), @"y": @(y)}];
        }
        marker[@"corners"] = cornerPoints;
        marker[@"center"] = @{@"x": @(sumX / 4.0f), @"y": @(sumY / 4.0f)};

        [markers addObject:marker];
    }

    return markers;
}

@end
