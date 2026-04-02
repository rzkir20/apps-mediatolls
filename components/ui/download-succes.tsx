import * as React from "react";

import { Image } from "expo-image";

import { LinearGradient } from "expo-linear-gradient";

import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";

import { useLanguage } from "@/context/LanguageContext";
import languageData from "@/lib/language.json";
import { bottomSheet, socialPalette } from "@/lib/pallate";

function sizeTextToLabel(sizeText?: string) {
  if (!sizeText) return "";
  return sizeText.trim().toUpperCase();
}

export function DownloadSuccessModal({
  visible,
  title,
  message,
  fileName,
  previewImageUri,
  previewOverlayIconName,
  sizeText,
  qualityText,
  speedText,
  durationText,
  formatText,
  primaryActionLabel,
  secondaryActionLabel,
  backLabel,
  onPrimaryAction,
  onSecondaryAction,
  onBack,
  onRequestClose,
}: DownloadSuccessModalProps) {
  const { language } = useLanguage();
  const copy = languageData.downloadSuccessModal[language];
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const hasSecondary = !!secondaryActionLabel && !!onSecondaryAction;
  const resolvedBackLabel =
    backLabel === "" ? null : (backLabel ?? copy.backToHome);
  const overlayIcon = (previewOverlayIconName ?? "movie") as IconSymbolName;
  const handleRequestClose = onRequestClose ?? (() => {});

  const maxScrollH = Math.min(windowHeight * 0.88, 720);
  const padV = Math.max(insets.top, 12) + 8;
  const padBottom = Math.max(insets.bottom, 16) + 8;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleRequestClose}
      statusBarTranslucent
      hardwareAccelerated
      presentationStyle={Platform.OS === "ios" ? "overFullScreen" : undefined}
    >
      <View
        className="flex-1 justify-center px-0"
        style={{
          backgroundColor: bottomSheet.backdrop,
          paddingTop: padV,
          paddingBottom: padBottom,
          paddingHorizontal: 20,
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 8,
          }}
          style={{ maxHeight: maxScrollH, alignSelf: "stretch" }}
        >
          <View
            className="w-full max-w-sm rounded-[36px] px-5 pt-8 pb-8 items-center"
            style={{
              backgroundColor: socialPalette.cardFrom,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
              zIndex: 2,
              elevation: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.45,
              shadowRadius: 24,
            }}
          >
            <Pressable
              onPress={handleRequestClose}
              hitSlop={8}
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full items-center justify-center active:opacity-80"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <IconSymbol
                name="xmark"
                size={18}
                color="rgba(255,255,255,0.9)"
              />
            </Pressable>

            <View className="mb-5 relative items-center">
              <LinearGradient
                colors={[socialPalette.accent, socialPalette.accentEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconSymbol name="checkmark" size={48} color="#fff" />
              </LinearGradient>
              <View
                className="absolute -bottom-1 -right-1 px-2.5 py-1 bg-white rounded-full"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3,
                  elevation: 3,
                }}
              >
                <Text className="text-[10px] font-black tracking-tight uppercase text-black">
                  100%
                </Text>
              </View>
            </View>

            <Text className="text-[26px] leading-8 font-extrabold tracking-tight text-white text-center px-2">
              {title ?? copy.doneTitle}
            </Text>
            <Text
              className="text-sm font-medium text-center leading-relaxed mt-2 mb-5 px-2"
              style={{ color: "rgba(226, 232, 240, 0.9)" }}
            >
              {message ?? copy.doneMessage}
            </Text>

            <View
              className="w-full rounded-2xl overflow-hidden mb-5"
              style={{
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                backgroundColor: "rgba(0,0,0,0.35)",
              }}
            >
              {previewImageUri ? (
                <View className="w-full relative bg-black/50">
                  <Image
                    source={{ uri: previewImageUri }}
                    style={{ width: "100%", aspectRatio: 16 / 9 }}
                    contentFit="cover"
                  />
                  <LinearGradient
                    colors={[
                      "rgba(0,0,0,0.75)",
                      "rgba(0,0,0,0.25)",
                      "transparent",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 0,
                      height: 88,
                    }}
                  />
                  <View className="absolute left-3 top-3 right-3">
                    <View className="flex-row items-center gap-2">
                      <IconSymbol name={overlayIcon} size={16} color="#fff" />
                      <Text
                        className="text-xs font-bold text-white shrink"
                        numberOfLines={1}
                        style={{
                          textShadowColor: "rgba(0,0,0,0.5)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 4,
                        }}
                      >
                        {fileName || copy.facebookVideo}
                      </Text>
                    </View>
                    {!!sizeText && (
                      <Text className="text-[10px] font-black uppercase text-social-accent mt-1.5">
                        {sizeTextToLabel(sizeText)}
                      </Text>
                    )}
                  </View>
                </View>
              ) : (
                <View className="flex-row items-center gap-3 p-4">
                  <View className="w-14 h-14 rounded-2xl bg-white/10 items-center justify-center">
                    <IconSymbol
                      name="movie"
                      size={24}
                      color={socialPalette.accent}
                    />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text
                      className="text-sm font-bold text-white"
                      numberOfLines={2}
                    >
                      {fileName || copy.defaultFileName}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1 flex-wrap">
                      {!!sizeText && (
                        <Text className="text-[10px] font-black uppercase text-social-accent">
                          {sizeTextToLabel(sizeText)}
                        </Text>
                      )}
                      {!!sizeText && !!qualityText && (
                        <View className="w-1 h-1 rounded-full bg-social-slate-600" />
                      )}
                      {!!qualityText && (
                        <Text className="text-[10px] font-black uppercase text-social-slate-500">
                          {qualityText}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              )}

              <View className="flex-row items-stretch border-t border-white/10 px-2 py-3.5">
                <View className="items-center flex-1 min-w-0 px-0.5">
                  <Text className="text-[9px] font-black uppercase tracking-widest text-social-slate-500 mb-1">
                    {copy.speed}
                  </Text>
                  <Text
                    className="text-xs font-bold text-white text-center"
                    numberOfLines={1}
                  >
                    {speedText ?? "--"}
                  </Text>
                </View>
                <View className="w-px bg-white/10 self-stretch" />
                <View className="items-center flex-1 min-w-0 px-0.5">
                  <Text className="text-[9px] font-black uppercase tracking-widest text-social-slate-500 mb-1">
                    {copy.time}
                  </Text>
                  <Text
                    className="text-xs font-bold text-white text-center"
                    numberOfLines={1}
                  >
                    {durationText ?? "--"}
                  </Text>
                </View>
                <View className="w-px bg-white/10 self-stretch" />
                <View className="items-center flex-1 min-w-0 px-0.5">
                  <Text className="text-[9px] font-black uppercase tracking-widest text-social-slate-500 mb-1">
                    {copy.format}
                  </Text>
                  <Text
                    className="text-xs font-bold text-white uppercase text-center"
                    numberOfLines={1}
                  >
                    {formatText ?? copy.defaultFormat}
                  </Text>
                </View>
              </View>
            </View>

            <View className="w-full flex flex-col gap-3">
              <Pressable
                onPress={onPrimaryAction}
                disabled={!onPrimaryAction}
                className="w-full rounded-2xl overflow-hidden active:opacity-90 disabled:opacity-50"
              >
                <LinearGradient
                  colors={[socialPalette.accent, socialPalette.accentEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    minHeight: 52,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 20,
                  }}
                >
                  <Text className="text-xs font-black uppercase tracking-[3px] text-white">
                    {primaryActionLabel ?? copy.openFile}
                  </Text>
                </LinearGradient>
              </Pressable>

              {hasSecondary ? (
                <Pressable
                  onPress={onSecondaryAction}
                  className="w-full min-h-[52px] rounded-2xl px-5 flex-row items-center justify-center gap-2 active:opacity-90"
                  style={{
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.14)",
                    backgroundColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <IconSymbol name="share" size={17} color="#fff" />
                  <Text className="text-xs font-black uppercase tracking-[3px] text-white">
                    {secondaryActionLabel}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </ScrollView>

        {onBack && resolvedBackLabel ? (
          <Pressable
            onPress={onBack}
            className="absolute bottom-8 px-4 py-2 active:opacity-80 self-center"
            style={{ zIndex: 2, elevation: 2 }}
          >
            <Text className="text-[11px] font-bold uppercase tracking-[4px] text-social-slate-500">
              {resolvedBackLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Modal>
  );
}
