import * as React from "react";

import { LinearGradient } from "expo-linear-gradient";

import { Modal, Pressable, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { socialPalette } from "@/lib/pallate";

function sizeTextToLabel(sizeText?: string) {
  if (!sizeText) return "";
  return sizeText.trim().toUpperCase();
}

type ConfettiSpec = {
  left: `${number}%`;
  top: `${number}%`;
  color: string;
};

const CONFETTI_ITEMS: ConfettiSpec[] = [
  { left: "10%", top: "5%", color: socialPalette.accent },
  { left: "30%", top: "16%", color: socialPalette.accentEnd },
  { left: "50%", top: "8%", color: socialPalette.slate500 },
  { left: "70%", top: "14%", color: socialPalette.accent },
  { left: "90%", top: "10%", color: socialPalette.accentEnd },
  { left: "15%", top: "22%", color: socialPalette.slate500 },
];

export function DownloadSuccessModal({
  visible,
  title,
  message,
  fileName,
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
  const hasSecondary = !!secondaryActionLabel && !!onSecondaryAction;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View className="flex-1 bg-[#05060f]/80 items-center justify-center px-6 relative overflow-hidden">
        <View
          style={{
            position: "absolute",
            top: "22%",
            left: "18%",
            width: 220,
            height: 220,
            borderRadius: 999,
            backgroundColor: socialPalette.accentGlowSoft,
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: "20%",
            right: "15%",
            width: 220,
            height: 220,
            borderRadius: 999,
            backgroundColor: socialPalette.accentGlowMidSoft,
          }}
        />

        {CONFETTI_ITEMS.map((c, idx) => (
          <View
            key={`${c.left}-${idx}`}
            style={{
              position: "absolute",
              left: c.left,
              top: c.top,
              width: 8,
              height: 8,
              borderRadius: 2,
              backgroundColor: c.color,
              opacity: 0.9,
            }}
          />
        ))}

        <View className="w-full max-w-sm rounded-[32px] border border-white/10 bg-white/[0.04] p-8 items-center">
          <Pressable
            onPress={onRequestClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full items-center justify-center bg-white/5 active:opacity-80"
          >
            <IconSymbol name="xmark" size={18} color="rgba(255,255,255,0.70)" />
          </Pressable>

          <View className="mb-8 relative items-center">
            <LinearGradient
              colors={[socialPalette.accent, socialPalette.accentEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 96,
                height: 96,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol name="checkmark" size={52} color="#fff" />
            </LinearGradient>
            <View className="absolute -bottom-2 -right-2 px-3 py-1 bg-white rounded-full">
              <Text className="text-[10px] font-black tracking-tight uppercase text-black">
                100%
              </Text>
            </View>
          </View>

          <Text className="text-[32px] leading-9 font-extrabold tracking-tight text-white">
            {title ?? "Selesai!"}
          </Text>
          <Text className="text-sm text-social-slate-400 font-medium text-center leading-relaxed mt-2 mb-8">
            {message ?? "Media berhasil diunduh ke galeri perangkat Anda."}
          </Text>

          <View className="w-full p-4 rounded-3xl bg-white/[0.03] border border-white/5 flex-row items-center gap-3 mb-8">
            <View className="w-14 h-14 rounded-2xl bg-white/10 items-center justify-center">
              <IconSymbol name="movie" size={24} color={socialPalette.accent} />
            </View>
            <View className="flex-1 min-w-0">
              <Text className="text-sm font-bold text-white" numberOfLines={1}>
                {fileName || "MediaTools_File.mp4"}
              </Text>
              <View className="flex-row items-center gap-2 mt-1">
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

          <View className="w-full flex-row items-center justify-between px-1 mb-8">
            <View className="items-center flex-1">
              <Text className="text-[9px] font-black uppercase tracking-widest text-social-slate-500 mb-1">
                Kecepatan
              </Text>
              <Text className="text-xs font-bold text-white">
                {speedText ?? "--"}
              </Text>
            </View>
            <View className="w-px h-6 bg-white/10" />
            <View className="items-center flex-1">
              <Text className="text-[9px] font-black uppercase tracking-widest text-social-slate-500 mb-1">
                Waktu
              </Text>
              <Text className="text-xs font-bold text-white">
                {durationText ?? "--"}
              </Text>
            </View>
            <View className="w-px h-6 bg-white/10" />
            <View className="items-center flex-1">
              <Text className="text-[9px] font-black uppercase tracking-widest text-social-slate-500 mb-1">
                Format
              </Text>
              <Text className="text-xs font-bold text-white uppercase">
                {formatText ?? "MP4"}
              </Text>
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
                  paddingHorizontal: 16,
                }}
              >
                <Text className="text-xs font-black uppercase tracking-[3px] text-white">
                  {primaryActionLabel ?? "Buka File"}
                </Text>
              </LinearGradient>
            </Pressable>

            {hasSecondary ? (
              <Pressable
                onPress={onSecondaryAction}
                className="w-full min-h-[52px] rounded-2xl bg-white/5 border border-white/10 px-4 flex-row items-center justify-center gap-2 active:opacity-90"
              >
                <Text className="text-xs font-black uppercase tracking-[3px] text-white">
                  {secondaryActionLabel}
                </Text>
                <IconSymbol name="share" size={16} color="#fff" />
              </Pressable>
            ) : null}
          </View>
        </View>

        <Pressable
          onPress={onBack}
          className="absolute bottom-8 px-4 py-2 active:opacity-80"
        >
          <Text className="text-[11px] font-bold uppercase tracking-[4px] text-social-slate-500">
            {backLabel ?? "Kembali ke Beranda"}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}
