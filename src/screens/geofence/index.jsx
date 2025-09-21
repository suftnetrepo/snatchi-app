import React from 'react';
import {
  YStack,
  StyledHeader,
  StyledSafeAreaView,
  StyledSpacer,
  StyledText,
  StyledButton,
} from 'fluent-styles';
import { fontStyles, theme } from '../../utils/theme';
import { useNavigation } from '@react-navigation/native';

const GeofenceTest = () => {
  const navigation = useNavigation();

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader marginHorizontal={8} statusProps={{ translucent: true }}>
        <StyledHeader.Full />
      </StyledHeader>
      <YStack
        height={'100%'}
        marginHorizontal={16}
        flex={1}
        justifyContent="flex-start"
        alignItems="center">
        <StyledSpacer marginVertical={64} />
        <YStack marginHorizontal={16} justifyContent="center" alignItems="center">
          <StyledText
            paddingVertical={16}
            paddingHorizontal={16}
            fontFamily={fontStyles.Roboto_Regular}
            fontWeight={theme.fontWeight.normal}
            color={theme.colors.gray[400]}
            textAlign="center"
            fontSize={theme.fontSize.normal}>
            Geofence test
          </StyledText>
        </YStack>
        <StyledSpacer marginVertical={16} />

        {/* Button: GeofencingD */}
        <StyledButton
          width="100%"
          borderColor={theme.colors.cyan[500]}
          backgroundColor={theme.colors.cyan[500]}
          onPress={() => navigation.navigate("GeofencingD")}>
          <StyledText paddingHorizontal={20} paddingVertical={10} color={theme.colors.gray[1]}>
            GeofencingD
          </StyledText>
        </StyledButton>

        <StyledSpacer marginVertical={4} />

        {/* Button: GeofencingC */}
        <StyledButton
          width="100%"
          borderColor={theme.colors.cyan[500]}
          backgroundColor={theme.colors.cyan[500]}
          onPress={() => navigation.navigate("GeofencingC")}>
          <StyledText paddingHorizontal={20} paddingVertical={10} color={theme.colors.gray[1]}>
            GeofencingC
          </StyledText>
        </StyledButton>

        <StyledSpacer marginVertical={4} />

        {/* Button: GeofencingL */}
        <StyledButton
          width="100%"
          borderColor={theme.colors.cyan[500]}
          backgroundColor={theme.colors.cyan[500]}
          onPress={() => navigation.navigate("GeofencingL")}>
          <StyledText paddingHorizontal={20} paddingVertical={10} color={theme.colors.gray[1]}>
            GeofencingL
          </StyledText>
        </StyledButton>

        <StyledSpacer marginVertical={4} />

        {/* Button: GeofencingApp */}
        <StyledButton
          width="100%"
          borderColor={theme.colors.cyan[500]}
          backgroundColor={theme.colors.cyan[500]}
          onPress={() => navigation.navigate("GeofencingApp")}>
          <StyledText paddingHorizontal={20} paddingVertical={10} color={theme.colors.gray[1]}>
            GeofencingApp
          </StyledText>
        </StyledButton>

        <StyledSpacer marginVertical={4} />
      </YStack>
    </StyledSafeAreaView>
  );
};

export default GeofenceTest;
