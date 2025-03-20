/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-key */
/* eslint-disable prettier/prettier */
import React from 'react';
import {  StyledImage, YStack } from 'fluent-styles';
import Swiper from 'react-native-swiper';
import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

const images = [
    {
        title: "Image 1",
        url: require("../../../assets/img/vaccine_1.png")
    },
    {
        title: "Image 2",
        url: require("../../../assets/img/vaccine_4.png")
    },
    {
        title: "Image 3",
        url: require("../../../assets/img/vaccine_3.png")
    }
];

const Slider = () => {

    return (
        <YStack flex={2} marginBottom={8}>
            <Swiper
                height={200}
                showsButtons={false}
                autoplay={true}
                autoplayTimeout={2.5}
                showsPagination={true}
                dotStyle={styles.dot}
                activeDotStyle={styles.activeDot}
            >
                {images.map((image, index) => (
                    <StyledImage
                        key={index}
                        local={true}                     
                        borderRadius={1}
                        width={'100%'}
                        height={200}
                        source={image.url}                     
                    />
                ))}
            </Swiper>
        </YStack>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    wrapper: {
        width: width,
        height: 300,
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#9DD6EB',
    },
    image: {
        width: width * 0.8,
        height: 200,
        borderRadius: 10,
    },
    title: {
        color: '#000',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
    },
    dot: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        width: 10,
        height: 10,
        borderRadius: 5,
        margin: 3,
    },
    activeDot: {
        backgroundColor: '#fff',
        width: 12,
        height: 12,
        borderRadius: 6,
        margin: 3,
    },
});


export default Slider