import React, {Fragment, useState} from 'react';
import {XStack, StyledText, StyledButton, StyledSpacer} from 'fluent-styles';
import {ScrollView} from 'react-native';
import {fontStyles, theme} from '../../utils/theme';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {capitalizeFirstLetter} from '../../utils/help';

const ChatRoomScrollView = ({onPress}) => {
  const [selected, setSelected] = useState();

  const handleSelect = room => {
    setSelected(room);
    onPress && onPress(room);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <XStack flex={1} paddingHorizontal={8} paddingVertical={6}>
        {['All', 'direct', 'group'].map((room, index) => {
          return (
            <Fragment key={index}>
              <StyledButton
                key={index}
                borderColor={theme.colors.gray[500]}
                backgroundColor={theme.colors.gray[1]}
                onPress={() => handleSelect(room)}>
                <XStack
                  paddingHorizontal={10}
                  paddingVertical={5}
                  key={index}
                  justifyContent="flex-start"
                  alignItems="center">
                  {selected === room && (
                    <>
                      <FontAwesome
                        name="check-circle"
                        size={24}
                        color={theme.colors.gray[800]}
                      />
                      <StyledSpacer marginHorizontal={3} />
                    </>
                  )}
                  <StyledText
                    fontFamily={fontStyles.Roboto_Regular}
                    fontWeight={theme.fontWeight.medium}
                    fontSize={theme.fontSize.normal}
                    color={theme.colors.gray[800]}>
                    {capitalizeFirstLetter(room)}
                  </StyledText>
                </XStack>
              </StyledButton>
              <StyledSpacer marginLeft={4} />
            </Fragment>
          );
        })}
      </XStack>
    </ScrollView>
  );
};

export default ChatRoomScrollView;
