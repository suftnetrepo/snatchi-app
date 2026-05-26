/**
 * TypeScript declarations for fluent-styles
 * Auto-generated type definitions for the fluent-styles library
 */

import { ReactNode, FC, ComponentType } from 'react';
import {
  ViewProps,
  TextProps,
  PressableProps,
  ImageProps,
  ScrollViewProps,
  FlatListProps,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';

declare module 'fluent-styles' {
  // Common styled component props
  interface StyledComponentProps {
    [key: string]: any;
  }

  // Styled Components
  export const StyledText: FC<TextProps & { children?: ReactNode }>;
  export const StyledPressable: FC<PressableProps & { children?: ReactNode }>;
  export const StyledView: FC<ViewProps & { children?: ReactNode }>;
  export const StyledScrollView: FC<ScrollViewProps & { children?: ReactNode }>;
  export const StyledButton: FC<
    PressableProps & {
      children?: ReactNode;
      onPress?: () => void;
      variant?: string;
      size?: string;
    }
  >;
  export const StyledImage: FC<ImageProps>;

  // Layout components
  export const StyledSafeAreaView: FC<ViewProps & { children?: ReactNode }>;
  export const StyledCard: FC<ViewProps & { children?: ReactNode }>;
  export const StyledContainer: FC<ViewProps & { children?: ReactNode }>;
  export const StyledRow: FC<ViewProps & { children?: ReactNode }>;
  export const StyledColumn: FC<ViewProps & { children?: ReactNode }>;
  export const StyledSpacer: FC<ViewProps & { size?: string | number }>;
  export const StyledStack: FC<ViewProps & { children?: ReactNode }>;

  // Dialog/Modal components
  export const StyledOkDialog: FC<{
    children?: ReactNode;
    visible?: boolean;
    onDismiss?: () => void;
    onOk?: () => void;
    title?: string;
    okText?: string;
    cancelText?: string;
  }>;

  // Input components
  export const StyledInput: FC<
    TextProps & {
      placeholder?: string;
      onChangeText?: (text: string) => void;
      value?: string;
      editable?: boolean;
    }
  >;
  export const StyledTextInput: FC<
    TextProps & {
      placeholder?: string;
      onChangeText?: (text: string) => void;
      value?: string;
    }
  >;

  // Info/Status components
  export const StyledBadge: FC<{
    children?: ReactNode;
    variant?: string;
    size?: string;
  }>;
  export const StyledSpinner: FC<{
    size?: string | number;
    color?: string;
    visible?: boolean;
  }>;
  export const StyledHeader: FC<{
    children?: ReactNode;
    title?: string;
    subtitle?: string;
    onBack?: () => void;
  }>;
  export const StyledCycle: FC<{
    children?: ReactNode;
    status?: string;
    variant?: string;
  }>;

  // List/Grid components
  export const StyledFlatList: FC<FlatListProps<any>>;
  export const StyledList: FC<{
    children?: ReactNode;
    data?: any[];
    renderItem?: (item: any) => ReactNode;
  }>;

  // Other components
  export const StyledModal: FC<{
    children?: ReactNode;
    visible?: boolean;
    onDismiss?: () => void;
    title?: string;
  }>;
  export const StyledDivider: FC<ViewProps>;
  export const StyledIcon: FC<ImageProps & { name?: string; size?: string | number }>;
  export const StyledAvatar: FC<
    ImageProps & {
      size?: string | number;
      source?: any;
    }
  >;
}
