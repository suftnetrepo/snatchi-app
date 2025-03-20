/* eslint-disable prettier/prettier */
/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import React, { forwardRef, ComponentType } from "react";
import { ViewStyle, TextStyle, ImageStyle } from "react-native";

type Style = ViewStyle | TextStyle | ImageStyle;

interface StyledOptions {
    base?: Style;
    variants?: {
        [key: string]: {
            [variant: string]: Style | ((selected: string, options: any) => Style);
        } | ((selected: string, options: any) => Style);
    };
}

const styled = <P extends object>(
    Component: ComponentType<P>,
    { base, variants }: StyledOptions = {}
) => {
    return forwardRef<any, P>((props, ref) => {
        const styles: Style = { ...(base || {}) };
        const options = props as Record<string, any>;

        if (variants) {
            Object.keys(variants).forEach((category) => {
                const variantSelected = options[category];
                const variantValue = variants[category];

                if (typeof variantValue === "function") {
                    const style = variantValue(variantSelected, options);
                    if (style) {
                        Object.assign(styles, style);
                    }
                } else if (variantValue && variantValue[variantSelected]) {
                    const value = variantValue[variantSelected];
                    Object.assign(
                        styles,
                        typeof value === "function" ? value(variantSelected, options) : value
                    );
                }
            });
        }

        return <Component {...props} style={styles} ref={ref} />;
    });
};

export { styled };
