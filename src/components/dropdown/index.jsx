import React, {useState, useEffect} from 'react';
import {YStack, StyledSpacer, StyledText, isValidNumber, isValidColor} from 'fluent-styles';
import DropDownPicker from 'react-native-dropdown-picker';
import {styled} from '../../utils/styled';
import {theme} from '../../utils/theme';

const Dropdown = styled(DropDownPicker, {
  base: {
    borderColor: theme.colors.gray[800],
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: theme.colors.gray[1],

    color: theme.colors.gray[800],
    paddingHorizontal: 16,
  },
  variants: {
    borderColor: color => {
      if (!color) return;
      if (!isValidColor(color)) {
        throw new Error('Invalid color value');
      }
      return {borderColor: color};
    },
    borderRadius: (size = 32) => {
      if (!isValidNumber(size)) {
        throw new Error('Invalid borderRadius value');
      }
      return {borderRadius: size};
    },
    backgroundColor: color => {
      if (!color) return;
      if (!isValidColor(color)) {
        throw new Error('Invalid color value');
      }
      return {backgroundColor: color};
    },
    error: {
      true: {
        borderColor: theme.colors.pink[500],
        borderWidth: 1,
      },
      false: {
        borderColor: theme.colors.gray[800],
      },
    },
  },
});

const StyledDropdown = ({
  items,
  label,
  value,
  setValue,
  onChangeValue,
  errorMessage,
  error,
  labelStyles,
  ...rest
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {label && (
        <>
          <StyledText
            paddingHorizontal={8}
            color={theme.colors.gray[600]}
            fontSize={theme.fontSize.normal}
            fontWeight={theme.fontWeight.normal}
            {...labelStyles}>
            {label}
          </StyledText>
          <StyledSpacer marginVertical={4} />
        </>
      )}
      <Dropdown
        open={open}
        value={value}
        onChangeValue={onChangeValue}
        setValue={setValue}
        setOpen={setOpen}
        items={items}
        {...rest}
        error={error}
      />
      {error && errorMessage && (
        <>
          <StyledSpacer marginVertical={1} />
          <StyledText
            marginHorizontal={8}
            fontWeight={theme.fontWeight.bold}
            fontSize={theme.fontSize.small}
            color={theme.colors.pink[500]}>
            {errorMessage}
          </StyledText>
        </>
      )}
    </>
  );
};

const StyledMultiDropdown = ({
  items,
  label,
  errorMessage,
  labelStyles,
  onSelected,
  ...rest
}) => {
  const [selected, setSelected] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    onSelected && onSelected(selected);
  }, [selected]);

  return (
    <YStack justifyContent="flex-start" alignItems="flex-start">
      {label && (
        <>
          <StyledSpacer marginVertical={4} />
          <StyledText
            paddingHorizontal={8}
            color={theme.colors.gray[600]}
            fontSize={theme.fontSize.normal}
            fontWeight={theme.fontWeight.normal}
            {...labelStyles}>
            {label}
          </StyledText>
          <StyledSpacer marginVertical={4} />
        </>
      )}
      <Dropdown
        open={open}
        setOpen={setOpen}
        items={items}
        setValue={setSelected}
        value={selected}
        multiple
        {...rest}
      />
      {errorMessage && (
        <>
          <StyledSpacer marginVertical={1} />
          <StyledText
            marginHorizontal={16}
            fontWeight={theme.fontWeight.bold}
            fontSize={theme.fontSize.small}
            color={theme.colors.pink[500]}>
            {errorMessage}
          </StyledText>
        </>
      )}
    </YStack>
  );
};

export {StyledDropdown, StyledMultiDropdown};
