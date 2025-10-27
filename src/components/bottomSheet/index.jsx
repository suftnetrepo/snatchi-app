import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Box, HStack, VStack, Text, Pressable } from '@gluestack-ui/themed';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../utils/theme';

const BottomSheet = ({
  title = '',
  children,
  isVisible,
  onClose,
  snapPoints = ['40%', '90%'],
}) => {
  const sheetRef = useRef(null);

  // Show or hide when prop changes
  useEffect(() => {
    if (isVisible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isVisible]);

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        onDismiss={onClose}
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.sheetBackground}
      >
        <VStack px="$4" py="$3" space="sm">
          {title ? (
            <HStack justifyContent="space-between" alignItems="center" mb="$2">
              <Text fontSize="$md" fontWeight="$medium" color="$text900">
                {title}
              </Text>
              <Pressable onPress={onClose}>
                <Icon name="close" size={24} color={theme.colors.gray[800]} />
              </Pressable>
            </HStack>
          ) : null}

          <Box>{children}</Box>
        </VStack>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  indicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.gray[400],
    alignSelf: 'center',
  },
});

export default BottomSheet;
