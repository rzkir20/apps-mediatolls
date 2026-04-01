import React, { useEffect, useState } from "react";

import * as Clipboard from "expo-clipboard";

import * as Haptics from "expo-haptics";

import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { BANK_GUIDES, GOPAY_NUMBER } from "@/lib/data";

import { bottomSheet, socialPalette } from "@/lib/pallate";

const EWALLETS = [
  "GOPAY",
  "OVO",
  "DANA",
  "LINKAJA",
  "GCASH",
  "SHOPEEPAY",
] as const;

type GuideTab = "bank" | "ewallet";

export type DialogDonasiProps = {
  visible: boolean;
  onRequestClose: () => void;
};

export function DialogDonasi({ visible, onRequestClose }: DialogDonasiProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [guideTab, setGuideTab] = useState<GuideTab>("bank");

  useEffect(() => {
    if (visible) setGuideTab("bank");
  }, [visible]);

  const copyGopayNumber = async () => {
    await Clipboard.setStringAsync(GOPAY_NUMBER);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const guideScrollMaxH = Math.min(windowHeight * 0.78, 640);
  const modalPadTop = Math.max(insets.top, 12);
  const modalPadBottom = Math.max(insets.bottom, 16);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
      statusBarTranslucent
      hardwareAccelerated
      presentationStyle={Platform.OS === "ios" ? "overFullScreen" : undefined}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: bottomSheet.backdrop,
          paddingTop: modalPadTop,
          paddingBottom: modalPadBottom,
        }}
      >
        <Pressable
          accessibilityRole="button"
          style={StyleSheet.absoluteFillObject}
          onPress={onRequestClose}
        />
        <View
          pointerEvents="box-none"
          style={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: 20,
          }}
        >
          <View
            className="rounded-[28px] border w-full max-w-md self-center"
            style={{
              borderColor: "rgba(255,255,255,0.12)",
              backgroundColor: socialPalette.cardFrom,
              maxHeight: guideScrollMaxH + 72 + 64,
              overflow: "hidden",
            }}
          >
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-white/10">
              <Text className="text-lg font-extrabold text-white">
                Panduan Transfer
              </Text>
              <Pressable
                onPress={onRequestClose}
                hitSlop={12}
                className="p-1 active:opacity-70"
              >
                <IconSymbol
                  name="xmark"
                  size={24}
                  color={socialPalette.accent}
                />
              </Pressable>
            </View>

            <View className="px-5 pt-4 pb-2">
              <View className="flex-row p-1 rounded-2xl bg-white/5 border border-white/10">
                {(
                  [
                    { key: "bank" as const, label: "Bank" },
                    { key: "ewallet" as const, label: "E-Wallet" },
                  ] as const
                ).map(({ key, label }) => {
                  const active = guideTab === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setGuideTab(key)}
                      className="flex-1 py-2.5 rounded-[14px] items-center justify-center active:opacity-90"
                      style={
                        active
                          ? {
                              backgroundColor: socialPalette.accentFaint,
                              borderWidth: 1,
                              borderColor: socialPalette.accentGlowMidStrong,
                            }
                          : undefined
                      }
                    >
                      <Text
                        className={`text-[11px] font-black uppercase tracking-[0.12em] ${
                          active ? "text-white" : "text-social-slate-500"
                        }`}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              bounces={false}
              nestedScrollEnabled
              style={{ height: guideScrollMaxH }}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 4,
                paddingBottom: 24,
              }}
            >
              <View className="flex flex-col gap-4 pt-1">
                {guideTab === "bank" ? (
                  <>
                    <Text className="text-social-accent text-[10px] font-black uppercase tracking-[0.2em]">
                      Transfer ke GoPay
                    </Text>

                    <View className="rounded-[22px] border border-white/10 bg-white/5 overflow-hidden">
                      {BANK_GUIDES.map((guide, i) => (
                        <View
                          key={guide.id}
                          className={`px-4 flex flex-col gap-2 py-4 ${
                            i > 0 ? "border-t border-white/10" : ""
                          }`}
                        >
                          <Text className="text-sm font-bold text-white mb-3">
                            {guide.title}
                          </Text>
                          {guide.steps.map((step, si) => (
                            <View key={si} className="mb-2.5 last:mb-0">
                              <Text className="text-base leading-5 text-social-slate-500">
                                {si + 1}. {step.text}
                              </Text>
                              {step.highlightNumber ? (
                                <View className="flex-row justify-between bg-white p-2 rounded-md items-center gap-2 mt-2 ml-1">
                                  <Text
                                    className="text-base font-black"
                                    selectable
                                  >
                                    {GOPAY_NUMBER}
                                  </Text>
                                  <Pressable
                                    onPress={copyGopayNumber}
                                    hitSlop={8}
                                    className="flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/15 bg-white/5 active:opacity-80"
                                  >
                                    <IconSymbol
                                      name="doc.on.clipboard"
                                      size={15}
                                      color={socialPalette.accent}
                                    />
                                    <Text className="text-[10px] font-black uppercase tracking-wider">
                                      Salin
                                    </Text>
                                  </Pressable>
                                </View>
                              ) : null}
                            </View>
                          ))}
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <>
                    <Text className="text-social-accent text-[10px] font-black uppercase tracking-[0.2em]">
                      E-Wallet yang didukung
                    </Text>

                    <View className="rounded-[22px] border border-white/10 bg-white/5 overflow-hidden">
                      {EWALLETS.map((name, i) => (
                        <View
                          key={name}
                          className={`flex-row items-center px-4 py-3.5 ${
                            i > 0 ? "border-t border-white/10" : ""
                          }`}
                        >
                          <View
                            className="w-8 h-8 rounded-xl items-center justify-center mr-3 border"
                            style={{
                              backgroundColor: socialPalette.accentFaint,
                              borderColor: socialPalette.accentGlowMidStrong,
                            }}
                          >
                            <Text className="text-[10px] font-black text-social-accent">
                              {i + 1}
                            </Text>
                          </View>
                          <Text className="flex-1 text-sm font-bold text-white tracking-wide">
                            {name}
                          </Text>
                          <IconSymbol
                            name="checkmark"
                            size={16}
                            color={socialPalette.accent}
                          />
                        </View>
                      ))}
                    </View>

                    <View className="p-5 rounded-[22px] border border-white/10 bg-white/5">
                      <Text className="text-base font-black uppercase tracking-[0.15em] text-white mb-3">
                        Langkah di E-Wallet
                      </Text>

                      <Text className="text-base leading-6 text-social-slate-500">
                        1. Buka aplikasi E-Wallet Anda (mis. GoPay:{" "}
                        <Text
                          className="text-social-accent font-bold"
                          selectable
                        >
                          {GOPAY_NUMBER}
                        </Text>
                        ).{"\n"}
                        2. Klik Bayar / Pay / Scan.{"\n"}
                        3. Scan QR code dan konfirmasi nominal donasi.
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}
