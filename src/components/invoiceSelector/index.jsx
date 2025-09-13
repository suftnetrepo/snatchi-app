import React from 'react';
import { XStack, StyledButton, StyledText } from 'fluent-styles';
import { theme } from '../../utils/theme';

const INVOICE_TYPES = [
  { label: 'Draft', value: 'Draft' },
  { label: 'Save', value: 'Save' },
  { label: 'Quote', value: 'Quote' },
];

const InvoiceSelector = ({ value, onChange }) => (
  <XStack
    backgroundColor={theme.colors.gray[1]}
    justifyContent="flex-start"
    gap={5}
    marginVertical={8}
    paddingHorizontal={4}
    alignItems="center"
  >
    {INVOICE_TYPES.map(type => {
      const isSelected = value === type.value;
      return (
        <StyledButton
          key={type.value}
          borderRadius={8}
          borderColor={isSelected ? theme.colors.gray[800] : theme.colors.gray[400]}
          backgroundColor={isSelected ? theme.colors.gray[800] : theme.colors.gray[1]}
          onPress={() => onChange('invoice_type', type.value)}
        >
          <StyledText
            paddingHorizontal={10}
            paddingVertical={5}
            fontSize={theme.fontSize.small}
            color={isSelected ? theme.colors.gray[1] : theme.colors.gray[800]}
          >
            {type.label}
          </StyledText>
        </StyledButton>
      );
    })}
  </XStack>
);

export default InvoiceSelector;