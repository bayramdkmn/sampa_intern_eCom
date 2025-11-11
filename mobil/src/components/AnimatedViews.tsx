import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";

interface FadeInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  duration = 600,
  delay = 0,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: fadeAnim }]}>
      {children}
    </Animated.View>
  );
};

interface SlideInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  from?: "left" | "right" | "top" | "bottom";
  style?: ViewStyle;
}

export const SlideInView: React.FC<SlideInViewProps> = ({
  children,
  duration = 500,
  delay = 0,
  from = "bottom",
  style,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getTransform = () => {
    const distance = 50;
    switch (from) {
      case "left":
        return {
          translateX: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-distance, 0],
          }),
        };
      case "right":
        return {
          translateX: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [distance, 0],
          }),
        };
      case "top":
        return {
          translateY: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-distance, 0],
          }),
        };
      case "bottom":
      default:
        return {
          translateY: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [distance, 0],
          }),
        };
    }
  };

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [getTransform()],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface ScaleInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

export const ScaleInView: React.FC<ScaleInViewProps> = ({
  children,
  duration = 400,
  delay = 0,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [
            {
              scale: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  animationType?: "fade" | "slide" | "scale";
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  staggerDelay = 100,
  animationType = "slide",
}) => {
  const AnimationComponent =
    animationType === "fade"
      ? FadeInView
      : animationType === "scale"
      ? ScaleInView
      : SlideInView;

  return (
    <>
      {React.Children.map(children, (child, index) => (
        <AnimationComponent key={index} delay={index * staggerDelay}>
          {child}
        </AnimationComponent>
      ))}
    </>
  );
};
