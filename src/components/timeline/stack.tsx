
import { View, ViewProps, ViewStyle } from 'react-native';
import { styled } from '../../utils/styled';

/**
 * Stack-specific layout variants for flex direction
 * Supports dual-level customization:
 * - Variant level: horizontal={[true, { gap: 10 }]}
 * - Component level: horizontal={true} gap={15}
 */
type StackVariants = {
    horizontal?: boolean | [boolean, ViewStyle];
    vertical?: boolean | [boolean, ViewStyle];
};

type StackProps = StackVariants & ViewProps & ViewStyle;

/**
 * Base Stack component - flexible layout container
 * Default: neutral layout (no flex direction preset)
 * Use horizontal or vertical variants to set flex direction
 */
const Stack = styled<StackProps>(View, {
    base: {
        position: 'relative',
    } as ViewStyle,
    variants: {
        vertical: {
            true: {
                flexDirection: 'column',
            } as ViewStyle,
            false: {} as ViewStyle,
        },
        horizontal: {
            true: {
                flexDirection: 'row',
            } as ViewStyle,
            false: {} as ViewStyle,
        },
    } as any
});

const XStack = styled<Omit<StackProps, 'vertical' | 'horizontal'>>(View, {
    base: {
        position: 'relative',
         flexDirection: 'row',
    } as ViewStyle
});

const YStack = styled<Omit<StackProps, 'vertical' | 'horizontal'>>(View, {
    base: {
        position: 'relative',
         flexDirection: 'column',
    } as ViewStyle
});

export {  Stack, XStack, YStack };
export type { StackProps };