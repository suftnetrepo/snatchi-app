/* eslint-disable prettier/prettier */
import { CommonActions } from "@react-navigation/native";

const resetStackInTab = (navigator, tabName, newRouteName, params) => {
  const { dispatch } = navigator;
  const resetAction = CommonActions.reset({
    index: 0,
    routes: [{ name: tabName }],
  });
  dispatch(resetAction);
  navigator.navigate(tabName, {
    screen: newRouteName,
    params: params,
  });
};

export { resetStackInTab }