import { View, ViewStyle } from 'react-native';
import { styled } from '../../utils/styled';

/**
 * Stack-specific layout variants for flex direction
 * Supports dual-level customization:
 * - Variant level: horizontal={[true, { gap: 10 }]}
 * - Component level: horizontal={true} gap={15}
 */

/**
 * Base Stack component - flexible layout container
 * Default: neutral layout (no flex direction preset)
 * Use horizontal or vertical variants to set flex direction
 */
const Stack = styled(View, {
    base: {
        position: 'relative',
    },
    variants: {
        vertical: {
            true: {
                flexDirection: 'column',
            },
            false: {},
        },
        horizontal: {
            true: {
                flexDirection: 'row',
            },
            false: {},
        },
    },
});

const XStack = styled(View, {
    base: {
        position: 'relative',
        flexDirection: 'row',
    }
});

const YStack = styled(View, {
    base: {
        position: 'relative',
        flexDirection: 'column',
    }
});

export { Stack, XStack, YStack };
