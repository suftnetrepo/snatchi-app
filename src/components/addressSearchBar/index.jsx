import React, { useState } from 'react';
import {YStack, XStack, StyledOkDialog, StyledSpinner, StyledSpacer} from 'fluent-styles';
import {theme} from '../../utils/theme';
import {StyledSearchBar} from '../../components/searchBar';
import {useAddress} from '../../hooks/useAddress';
import StyledPickerSelect from '../../components/dropdown/StyledPickerSelect';

const AddressSearchBar = ({placeholder, handleSelectedAddress}) => {
  const {handleFetch, data, handleReset, loading, error} = useAddress();
  const [addresses, setAddresses] = useState([]);

  const onFindAddress = query => {
    handleFetch(query).then(data => {
      if (data) {
        setAddresses(
          data.map(item => ({
            label: item.display_name,
            value: item.place_id,
          })),
        );
      }
    });
  };

  const onHandleSelectedAddress = address => {
    const selected = data?.find(item => item.place_id === address);
    handleSelectedAddress(selected);
  };


  return (
    <YStack>
      <XStack backgroundColor={theme.colors.gray[1]}>
        <StyledSearchBar placeholder={placeholder} onPress={query => onFindAddress(query)} />
      </XStack>
      <StyledSpacer marginVertical={4} />
      <StyledPickerSelect
        items={addresses}
        placeholder="Select address suggestions"
        onChange={address => onHandleSelectedAddress(address)}
      />
      {loading && <StyledSpinner />}
      {error && (
        <StyledOkDialog
          title={error?.message}
          description="please try again"
          visible={true}
          onOk={() => {
            handleReset();
          }}
        />
      )}
    </YStack>
  );
};

export default AddressSearchBar;
