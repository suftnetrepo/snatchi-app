import {YStack, StyledText} from 'fluent-styles';
import ImageViewer from 'react-native-image-zoom-viewer';
import {fontStyles, theme} from '../../utils/theme';
import {
  Image,
} from 'react-native';

const ImageViewerWithZoom = ({images = [], selectedIndex, onClose}) => {
  return (
    <YStack flex={1}>
      <ImageViewer
        imageUrls={images}
        index={selectedIndex}
        enableSwipeDown={true}
        onSwipeDown={onClose}
        onClick={onClose}
        renderImage={props => {
            const currentIndex = props.imageIndex ?? 0;
          return (
            <YStack justifyContent="flex-start" alignItems="flex-start">
              <Image {...props} resizeMode="cover" />
              <StyledText
                marginTop={8}
                paddingHorizontal={4}
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.small}
                color={theme.colors.gray[100]}
                textAlign="left"
                fontSize={theme.fontSize.small}>
                  {images[currentIndex]?.description}
              </StyledText>
            </YStack>
          );
        }}
      />
    </YStack>
  );
};

export default ImageViewerWithZoom;
