/* eslint-disable prettier/prettier */
import { Platform } from 'react-native';

export const fontStyles = {
  crimson_text_bold: Platform.select({
    ios: 'CrimsonText-Bold', 
    android: 'crimson_text_bold', 
  }),
  crimson_text_italic: Platform.select({
    ios: 'CrimsonText-Italic', 
    android: 'crimson_text_italic', 
  }),
  crimson_text_regular: Platform.select({
    ios: 'CrimsonText-Regular', 
    android: 'crimson_text_regular', 
  }),
  Roboto_Regular: Platform.select({
    ios: 'Roboto-Regular', 
    android: 'Roboto-Regular', 
  }),
  Roboto_Italic: Platform.select({
    ios: 'Roboto-Italic', 
    android: 'Roboto-Italic', 
  }),
  Roboto_Bold: Platform.select({
    ios: 'Roboto-Bold', 
    android: 'Roboto-Bold', 
  }),
};


