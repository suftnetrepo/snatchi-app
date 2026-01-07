import React from 'react';
import { Modal } from 'react-native';
import {
  Box,
  VStack,
  Text,
  Button,
  HStack,
  Spinner,
} from '@gluestack-ui/themed';

export default function LocationPermissionAlert({
  visible,
  onContinue,
  onRetry,
  loading = false,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        bg="rgba(0,0,0,0.5)"
      >
        <Box
          width="85%"
          bg="$white"
          borderRadius="$xl"
          p="$5"
        >
          <VStack space="md">
            <Text size="lg" fontWeight="$semibold">
              Location Permission Required
            </Text>

            <Text size="sm" color="$textLight600">
              Snatchi needs location access to track job sites.
              Please enable it in Settings.
            </Text>

            <HStack justifyContent="flex-end" space="sm" mt="$4">
              <Button
                variant="outline"
                action="secondary"
                onPress={onRetry}
                isDisabled={loading}
              >
                {loading ? <Spinner /> : <Text>Try Again</Text>}
              </Button>

              <Button
                action="default"
                onPress={onContinue}
                isDisabled={loading}
              >
                <Text>Continue Anyway</Text>
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Modal>
  );
}
