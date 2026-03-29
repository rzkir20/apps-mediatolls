import * as React from "react";

import { Modal, Pressable, Text, View, type ViewStyle } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";

export type DialogProps = {
  visible: boolean;
  onRequestClose?: () => void;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  animationType?: "none" | "slide" | "fade";
  showCloseButton?: boolean;
  contentStyle?: ViewStyle;
  height?: ViewStyle["height"];
};

export function Dialog({
  visible,
  onRequestClose,
  title,
  children,
  footer,
  animationType = "fade",
  showCloseButton = true,
  contentStyle,
  height,
}: DialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onRequestClose}
    >
      <View className="flex-1 bg-black/80 items-center justify-center px-5">
        <View
          className="w-full rounded-3xl overflow-hidden border border-white/10 bg-black"
          style={[{ height: height ?? "70%" }, contentStyle]}
        >
          {(!!title || showCloseButton) && (
            <View className="flex-row items-center justify-between px-4 py-3 bg-white/5">
              <Text className="text-white font-extrabold tracking-tight">
                {title ?? ""}
              </Text>
              {showCloseButton && (
                <Pressable
                  onPress={onRequestClose}
                  className="w-9 h-9 rounded-full items-center justify-center bg-white/5 border border-white/10 active:opacity-80"
                >
                  <IconSymbol name="xmark" size={18} color="#fff" />
                </Pressable>
              )}
            </View>
          )}

          <View className="w-full flex-1 bg-black">{children}</View>

          {!!footer && <View className="bg-black">{footer}</View>}
        </View>
      </View>
    </Modal>
  );
}
