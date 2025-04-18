import React, {useCallback, useEffect, useRef} from 'react';
import {StyleSheet} from 'react-native';
import {YStack, XStack, StyledText, StyledCycle} from 'fluent-styles';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import {theme} from '../../utils/theme';
import {StyledMIcon} from '../../components/icon';

const BottomSheet = ({
  children,
  snapPoints = ['25%', '50%', '90%'],
  title = '',
  onSetShow,
  enableHandlePanningGesture = true,
  enableContentPanningGesture = true,
  enablePanDownToClose = false,
  closeOnBackdropPress = false,
  overDragResistanceFactor = 3,
  backdropProps = {},
  onShow,
  bottomSheetModalRef,
}) => {
  useEffect(() => {
    onShow && bottomSheetModalRef.current?.present();
  }, [onShow]);

  const dismissModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
    onSetShow(false);
  }, [onSetShow]);

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior={closeOnBackdropPress ? 'close' : 'none'} // Control backdrop press behavior
        {...backdropProps}
      />
    ),
    [closeOnBackdropPress, backdropProps],
  );

  return (
    <BottomSheetModalProvider>
      <YStack justifyContent="flex-start" alignItems="flex-start" marginBottom={24}>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          enableHandlePanningGesture={enableHandlePanningGesture}
          enableContentPanningGesture={enableContentPanningGesture}
          enablePanDownToClose={enablePanDownToClose} // Prevent dismiss on drag down
          overDragResistanceFactor={overDragResistanceFactor} // Resistance to over dragging
          handleIndicatorStyle={styles.indicator}
          containerStyle={styles.bottomSheetContainer}>
          <YStack paddingHorizontal={16} paddingVertical={8}>
            {title ? (
              <XStack justifyContent="space-between" alignItems="center">
                <StyledText
                  paddingHorizontal={6}
                  marginTop={4}
                  marginBottom={4}
                  fontWeight={theme.fontWeight.normal}
                  fontSize={theme.fontSize.small}
                  textAlign="left"
                  readOnly
                  color={theme.colors.gray[800]}>
                  {title}
                </StyledText>
                <StyledCycle
                  height={48}
                  width={48}
                  borderColor={theme.colors.gray[400]}>
                  <StyledMIcon
                    size={32}
                    name="close"
                    color={theme.colors.gray[800]}
                    onPress={() => {
                      dismissModal();
                    }}
                  />
                </StyledCycle>
              </XStack>
            ) : null}
            <>{children}</>
          </YStack>
        </BottomSheetModal>
      </YStack>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  bottomSheetContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.gray[700],
  },
});

export default BottomSheet;
