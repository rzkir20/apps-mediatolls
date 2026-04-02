import React from "react";

import { LinearGradient } from "expo-linear-gradient";

import { Pressable, ScrollView, Text, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { socialPalette } from "@/lib/pallate";

import { useRouter } from "expo-router";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { useLanguage } from "@/context/LanguageContext";

import languageData from "@/lib/language.json";

const TESTIMONIALS = [
  {
    quote:
      '"Tool yang luar biasa! Sangat membantu pekerjaan konten kreator saya setiap hari."',
    name: "Bagus Satria",
    role: "Kreator Konten",
  },
  {
    quote:
      '"Gak nyangka ada aplikasi gratis sekeren ini. Saya donasi karena development-nya rajin update fitur baru."',
    name: "Dewi Lestari",
    role: "Digital Artist",
  },
  {
    quote:
      '"UI-nya clean banget, gampang dipakai bahkan buat pemula. Satu aplikasi bisa bantu banyak kebutuhan konten."',
    name: "Raka Pratama",
    role: "Freelance Designer",
  },
  {
    quote:
      '"Yang paling saya suka, fiturnya ringan tapi hasilnya tetap profesional. Workflow jadi jauh lebih cepat."',
    name: "Nadia Maharani",
    role: "Social Media Specialist",
  },
  {
    quote:
      '"Awalnya coba-coba, ternyata kepake terus setiap hari. Recommended banget buat UMKM yang mau naik level."',
    name: "Hendra Wibowo",
    role: "Owner UMKM",
  },
  {
    quote:
      '"Terima kasih tim developer! Aplikasi ini bantu saya maintain branding konten tanpa ribet."',
    name: "Aulia Safitri",
    role: "Brand Strategist",
  },
  {
    quote:
      '"Koleksi tool-nya lengkap dan update-nya konsisten. Semoga ke depannya ada lebih banyak template lagi."',
    name: "Fajar Nugroho",
    role: "Video Editor",
  },
  {
    quote:
      '"Setelah pakai ini, waktu produksi konten mingguan berkurang hampir setengah. Efisien banget."',
    name: "Maya Puspita",
    role: "Marketing Lead",
  },
  {
    quote:
      '"Beneran ngebantu banget buat bikin konten lebih konsisten. Proses dari ide sampai posting jadi lebih cepat."',
    name: "Yusuf Ramadhan",
    role: "Content Planner",
  },
  {
    quote:
      '"Template dan tools-nya kepake semua. Saya gak perlu lagi pindah-pindah aplikasi tiap hari."',
    name: "Sinta Melati",
    role: "Creative Producer",
  },
  {
    quote:
      '"Aplikasinya ringan di HP saya yang speknya biasa aja. Tetap lancar buat kerja harian."',
    name: "Rian Saputra",
    role: "Admin Sosial Media",
  },
  {
    quote:
      '"Suka banget karena tampilannya sederhana tapi fiturnya dalam. Belajar sendiri pun cepat paham."',
    name: "Fira Anindya",
    role: "Mahasiswa Komunikasi",
  },
  {
    quote:
      '"Saya pakai untuk tim kecil di kantor, hasilnya koordinasi konten jadi lebih rapi dan terarah."',
    name: "Dimas Ardiansyah",
    role: "Project Coordinator",
  },
  {
    quote:
      '"Untuk kebutuhan personal branding, aplikasi ini sangat membantu menjaga kualitas visual konten."',
    name: "Intan Permata",
    role: "Personal Branding Coach",
  },
  {
    quote:
      '"Fitur-fitur barunya relevan banget sama kebutuhan kreator lokal. Salut sama ritme update timnya."',
    name: "Galih Putra",
    role: "YouTube Creator",
  },
  {
    quote:
      '"Sebelumnya editing selalu molor, sekarang deadline mingguan bisa selesai lebih awal."',
    name: "Lina Oktavia",
    role: "Editor Konten",
  },
  {
    quote:
      '"User experience-nya enak, minim bug, dan dokumentasinya jelas. Cocok dipakai jangka panjang."',
    name: "Aditya Kurniawan",
    role: "UI Enthusiast",
  },
  {
    quote:
      '"Saya rekomendasikan ke teman-teman komunitas karena fiturnya praktis dan langsung bisa dipakai."',
    name: "Nisa Khairunnisa",
    role: "Community Manager",
  },
  {
    quote:
      '"Warna, layout, dan alurnya nyaman di mata. Kerja berjam-jam pun gak cepat capek."',
    name: "Arga Prakoso",
    role: "Visual Designer",
  },
  {
    quote:
      '"Fitur otomatisasinya jadi penyelamat saat jadwal posting lagi padat-padatnya."',
    name: "Putri Azzahra",
    role: "Campaign Specialist",
  },
  {
    quote:
      '"Aplikasi ini bikin saya lebih percaya diri buka jasa kelola media sosial untuk klien."',
    name: "Wahyu Firmansyah",
    role: "Freelancer",
  },
  {
    quote:
      '"Ngebantu banget saat brainstorming ide konten. Dari nol sampai publish terasa lebih terstruktur."',
    name: "Citra Lestari",
    role: "Content Writer",
  },
  {
    quote:
      '"Dari sisi performa oke, dari sisi fitur juga lengkap. Sulit cari alternatif yang seimbang seperti ini."',
    name: "Bima Rizaldi",
    role: "Growth Marketer",
  },
  {
    quote:
      '"Buat pemilik usaha kecil seperti saya, ini solusi yang hemat waktu dan hemat biaya."',
    name: "Retno Wulandari",
    role: "Pemilik Toko Online",
  },
  {
    quote:
      '"Integrasi workflow konten jadi lebih mulus. Tim bisa kolaborasi tanpa banyak miskomunikasi."',
    name: "Kevin Mahendra",
    role: "Team Lead Digital",
  },
  {
    quote:
      '"Setiap update terasa improve kualitas, bukan sekadar nambah fitur. Itu yang bikin saya tetap setia pakai."',
    name: "Nadira Putri",
    role: "Lifestyle Creator",
  },
  {
    quote:
      '"Dengan tools ini, saya bisa fokus ke ide kreatif tanpa kebanyakan mikirin hal teknis."',
    name: "Reza Alfarizi",
    role: "Script Writer",
  },
  {
    quote:
      '"Best app untuk kebutuhan konten cepat. Ringkas, rapi, dan hasilnya tetap terlihat premium."',
    name: "Selvi Anggraini",
    role: "Digital Entrepreneur",
  },
] as const;

export default function TestimonialsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  const copy = languageData.testimonials[language];

  return (
    <View className="flex-1 bg-social-bg">
      <View className="px-6 pt-4 pb-6 flex-row items-center gap-2">
        <Pressable
          onPress={() => router.push("/(tabs)/social")}
          className="w-10 h-10 rounded-full items-center justify-center"
          accessibilityRole="button"
        >
          <IconSymbol
            name="arrow.back"
            size={22}
            color="rgba(255,255,255,0.70)"
          />
        </Pressable>

        <Text className="text-xl font-cabinet font-extrabold tracking-tight text-white">
          {copy.backToSocial}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          <View className="flex-row items-center gap-3 mb-6">
            <View className="h-0.5 w-8 bg-social-accent" />
            <Text className="text-social-accent text-[11px] font-black uppercase tracking-[0.2em]">
              {copy.communityImpressions}
            </Text>
          </View>
          <View className="mb-6 flex-row items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <View className="flex-row items-center gap-2">
              <IconSymbol name="quote" size={16} color={socialPalette.accent} />
              <Text className="text-[11px] font-black uppercase tracking-[0.14em] text-social-slate-500">
                {copy.totalTestimonials}
              </Text>
            </View>
            <Text className="text-sm font-cabinet font-extrabold text-white">
              {TESTIMONIALS.length}
            </Text>
          </View>
          <View className="flex flex-col gap-4">
            {TESTIMONIALS.map((item, index) => (
              <View
                key={`${item.name}-${index}`}
                className="p-6 rounded-[30px] border border-white/10 bg-white/5"
              >
                <View className="mb-3">
                  <IconSymbol
                    name="quote.left"
                    size={18}
                    color="rgba(199, 124, 255, 0.95)"
                  />
                </View>
                <Text className="text-base italic leading-6 text-social-slate-500 mb-5">
                  {item.quote}
                </Text>
                <View className="flex-row items-center gap-3">
                  <LinearGradient
                    colors={[socialPalette.accent, socialPalette.accentEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ width: 42, height: 42, borderRadius: 14 }}
                  />
                  <View className="flex flex-col gap-1">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-sm text-white font-bold">
                        {item.name}
                      </Text>
                      <IconSymbol
                        name="user.verified"
                        size={14}
                        color="rgba(255,255,255,0.82)"
                      />
                    </View>
                    <Text className="text-[10px] text-social-slate-500 font-black uppercase tracking-[0.1em]">
                      {item.role}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
