import React, { useCallback, useEffect, useRef } from "react";

import { BlurView } from "expo-blur";

import { bottomSheet } from "@/lib/pallate";

import {
  Animated,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
} from "react-native-gesture-handler";

export function BottomSheets({
  visible,
  onClose,
  title,
  children,
}: BottomSheetsProps) {
  const translateY = useRef(new Animated.Value(300)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;

  const resetPosition = useCallback(() => {
    Animated.spring(dragY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [dragY]);

  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onClose();
      }
    });
  }, [backdropOpacity, onClose, translateY]);

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationY: dragY,
        },
      },
    ],
    { useNativeDriver: true },
  );

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY } = event.nativeEvent;
      const shouldClose = translationY > 100;

      if (shouldClose) {
        closeSheet();
      } else {
        resetPosition();
      }
    }
  };

  useEffect(() => {
    if (visible) {
      // buka sheet dengan animasi
      translateY.setValue(300);
      dragY.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      translateY.setValue(300);
      dragY.setValue(0);
      backdropOpacity.setValue(0);
    }
  }, [visible, translateY, backdropOpacity, dragY]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.container}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.backdropWrapper}
          onPress={onClose}
        >
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity,
              },
            ]}
          />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [
                {
                  translateY: Animated.add(
                    translateY,
                    dragY.interpolate({
                      inputRange: [0, 300],
                      outputRange: [0, 300],
                      extrapolate: "clamp",
                    }),
                  ),
                },
              ],
            },
          ]}
        >
          <BlurView
            intensity={
              Platform.OS === "android"
                ? bottomSheet.blurIntensityAndroid
                : bottomSheet.blurIntensityIos
            }
            tint={bottomSheet.blurTint}
            style={styles.blurFill}
            experimentalBlurMethod={
              Platform.OS === "android" ? "dimezisBlurView" : undefined
            }
          />
          <View
            pointerEvents="none"
            className="absolute inset-0 bg-social-sheet-overlay"
          />
          <View style={styles.sheetContent}>
            <PanGestureHandler
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
            >
              <Animated.View>
                <View style={styles.dragHandleContainer}>
                  <View className="h-1 w-10 rounded-full bg-white/10" />
                </View>

                {title ? (
                  <View className="mb-3 border-b border-social-sheet-border pb-3">
                    <Text className="text-center text-xl font-semibold text-white">
                      {title}
                    </Text>
                  </View>
                ) : null}
              </Animated.View>
            </PanGestureHandler>

            {children}
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdropWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    flex: 1,
    backgroundColor: bottomSheet.backdrop,
  },
  sheet: {
    overflow: "hidden",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  blurFill: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
});
