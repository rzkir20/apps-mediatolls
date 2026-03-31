import { Pressable, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { socialPalette } from "@/lib/pallate";

export function SupportedFormatCards({
  cards,
  onPressCard,
  containerClassName,
  cardClassName,
  iconBgClassName,
}: SupportedFormatCardsProps) {
  return (
    <View className={containerClassName ?? "flex-row flex-wrap gap-3 mb-3"}>
      {cards.map((card) => {
        const isFullWidth = !!card.fullWidth;
        const widthClassName = isFullWidth ? "w-full" : "w-[48%]";

        const commonClassName = `flex-row items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 ${
          cardClassName ?? ""
        }`;

        const content = (
          <>
            <View
              className={`w-8 h-8 rounded-lg items-center justify-center ${
                iconBgClassName ?? "bg-social-accent-faint"
              }`}
            >
              <IconSymbol
                name={card.icon}
                size={20}
                color={socialPalette.accent}
              />
            </View>

            <View className="flex-1 min-w-0">
              <Text className="text-xs font-bold text-white" numberOfLines={1}>
                {card.title}
              </Text>
              <Text className="text-[10px] text-social-slate-500 mt-0.5">
                {card.sub}
              </Text>
            </View>
          </>
        );

        if (onPressCard) {
          return (
            <Pressable
              key={`${card.title}-${card.sub}`}
              onPress={() => onPressCard(card)}
              className={`${widthClassName} ${commonClassName} active:opacity-90`}
            >
              {content}
            </Pressable>
          );
        }

        return (
          <View
            key={`${card.title}-${card.sub}`}
            className={`${widthClassName} ${commonClassName}`}
          >
            {content}
          </View>
        );
      })}
    </View>
  );
}
