#import <Foundation/Foundation.h>

@interface ArucoOpenCVWrapper : NSObject
+ (NSArray *)detectMarkersIn:(void *)baseAddress width:(int)width height:(int)height bytesPerRow:(int)bytesPerRow;
@end
