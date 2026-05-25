
import { styled } from 'fluent-styles';
import { theme } from '../../utils/theme';
import { View } from 'react-native';

const StyledStack = styled(View, {
    base: {
        flexDirection: 'row'
    },
    variants: {
         borderLeftColor: (color = theme.colors.gray[6800]) => {           
            return {
                borderLeftColor: color,
                borderLeftWidth: 4,
                borderTopColor: theme.colors.gray[300],
                borderRightColor: theme.colors.gray[300],
                borderBottomColor: theme.colors.gray[300],
                borderTopWidth: 1,
                borderRightWidth: 1,
                borderBottomWidth: 1, }
        },
        status: {
            '0': {
                borderLeftColor: theme.colors.red[400],
                borderLeftWidth: 4,
                borderTopColor: theme.colors.gray[300],
                borderRightColor: theme.colors.gray[300],
                borderBottomColor: theme.colors.gray[300],
                borderTopWidth: 1,
                borderRightWidth: 1,
                borderBottomWidth: 1,
            },
            '1': {
                borderLeftColor: theme.colors.teal[500],
                borderLeftWidth: 4,
                borderTopColor: theme.colors.gray[300],
                borderRightColor: theme.colors.gray[300],
                borderBottomColor: theme.colors.gray[300],
                borderTopWidth: 1,
                borderRightWidth: 1,
                borderBottomWidth: 1,

            },
        },
        occupied: {
            '0': {
                borderLeftColor: theme.colors.orange[700],
                borderLeftWidth: 4,
                borderTopColor: theme.colors.gray[300],
                borderRightColor: theme.colors.gray[300],
                borderBottomColor: theme.colors.gray[300],
                borderTopWidth: 1,
                borderRightWidth: 1,
                borderBottomWidth: 1,
            },
            '1': {
                borderLeftColor: theme.colors.teal[700],
                borderLeftWidth: 4,
                borderTopColor: theme.colors.gray[300],
                borderRightColor: theme.colors.gray[300],
                borderBottomColor: theme.colors.gray[300],
                borderTopWidth: 1,
                borderRightWidth: 1,
                borderBottomWidth: 1,

            },
            transparent :{
                true :{
                    backgroundColor: '#000',
                    borderColor: '#000', // Optional: to visualize the view boundaries
                }
            }
        },

    }
})

export { StyledStack }