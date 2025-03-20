import React, {useState} from 'react';
import {StyledMIcon} from '../../components/icon';
import {StyledDropdown} from '../../components/dropdown';
import {theme} from '../../utils/theme';
import {XStack} from 'fluent-styles';

const TaskDropdown = ({
  items,
  onSaveChanges,
  selectedValue,
  onHide,
  visible = false,
}) => {
  const [value, setValue] = useState(selectedValue);
  const [show, setShow] = useState(visible);

  const onHandleHide = () => {
    onHide(false);
    setShow(false);
  };
  return (
    <>
      {show ? (
        <XStack
          flex={1}
          justifyContent="flex-start"
          alignItems="center"
          gap={1}>
          <XStack
            flex={2}
            justifyContent="flex-start"
            alignItems="center"
            gap={1}>
            <StyledDropdown
              borderRadius={8}
              items={items}
              value={value}
              setValue={setValue}
              onChangeValue={value => setValue(value)}
              placeholder={'Select...'}
              listMode="SCROLLVIEW"></StyledDropdown>
          </XStack>
          <XStack
            flex={1}
            justifyContent="flex-start"
            alignItems="center"
            gap={1}>
            <StyledMIcon
              name="access-time"
              size={1}
              color={theme.colors.gray[1]}
            />
            <StyledMIcon
              name="save"
              size={48}
              color={theme.colors.gray[900]}
              onPress={() => onSaveChanges && onSaveChanges(value)}
            />
            <StyledMIcon
              name="cancel"
              size={48}
              color={theme.colors.gray[900]}
              onPress={() => onHandleHide()}
            />
          </XStack>
        </XStack>
      ) : null}
    </>
  );
};

export default TaskDropdown;
