import {Box} from '@gluestack-ui/themed';

const Cycle = ({width, height, children, ...rest}) => (
  <Box
    bg="$gray1"
    borderColor="$gray300"
    borderWidth={1}
    width={width}
    height={height}
    justifyContent="center"
    alignItems="center"
    borderRadius={100}
    {...rest}>
    {children}
  </Box>
);

export {Cycle};
