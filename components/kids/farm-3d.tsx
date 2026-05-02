/**
 * 🌾 KEVO'NUN 3D ÇİFTLİĞİ — Profesyonel 3D dünyası (2026 standart)
 *
 * Stack:
 *   • Three.js (geometri/materyal) — VANİLLA, drei yok
 *   • @react-three/fiber (React reconciler)
 *   • Prosedürel SkyDome (vertex color hemisphere)
 *   • Prosedürel polen (THREE.Points, custom)
 *   • PBR-lite (meshStandardMaterial + emissive)
 *
 * Hayvanlar artık tipe-özel:
 *   • Ga (inek)      → siyah-beyaz benekli + boynuz + pembe burun + 4 bacak + kuyruk
 *   • Pez (koyun)    → kabarık icosahedron yün + pembe yüz + 4 bacak
 *   • Mirîşk (tavuk) → küçük yuvarlak + kırmızı ibik + sarı gaga + kuyruk tüyü
 *   • Hesp (at)      → uzun gövde + yele + kuyruk + 4 ince bacak
 *   • Kûçik (köpek)  → kahve + sarkık kulak + sallayan kuyruk
 *   • Pisîk (kedi)   → gri + sivri kulak + ince kuyruk
 *
 * Dünya:
 *   • drei <Sky> — atmosferik gökyüzü (Rayleigh saçılma)
 *   • drei <Cloud> — volumetric bulut sprite'ları
 *   • drei <Sparkles> — altın polen parçacıkları (sihirli his)
 *   • drei <Float> — hayvanlar yumuşak süzülür
 *   • drei <mesh><boxGeometry args={[1,1,1]} /> — yumuşak hatlı ev/çit
 *   • Prosedürel çim dokusu (CanvasTexture, satranç desen + ot)
 *
 * Görev sistemi (4 mission), Kev NPC, baca dumanı, kuş sürüsü
 * önceki sürümle aynı, sadece görsel kalite uçurum farkı.
 */
import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, Easing,
} from "react-native-reanimated";

import { speakKurmanci, playFx } from "@/data/sound-fx";
import { KIDS_THEME, RADIUS, SHADOW, SPACING, TYPO } from "./design";
import { Confetti } from "./confetti";
import type { KidsCategory, KidsWord } from "@/data/kids-content";

const { height: SH } = Dimensions.get("window");

// =====================================================================
//  HAYVAN TİPLERİ (her birinin kendi 3D modeli)
// =====================================================================

type AnimalKind = "cow" | "sheep" | "chicken" | "horse" | "dog" | "cat";

const ANIMAL_KIND_BY_KU: Record<string, AnimalKind> = {
  "Ga": "cow",
  "Pez": "sheep",
  "Mirîşk": "chicken",
  "Hesp": "horse",
  "Kûçik": "dog",
  "Pisîk": "cat",
};

type Props = {
  category: KidsCategory;
  onClose: () => void;
  onXp: (xp: number) => void;
};

// =====================================================================
//  GÖREV TİPLERİ
// =====================================================================

type ZoneKey = "animals" | "fruits" | "vegetables" | "house";

type Mission = {
  id: string;
  zone: ZoneKey;
  emoji: string;
  titleKu: string;
  titleTr: string;
  hintTr: string;
  target: number;
  progress: number;
  xpReward: number;
  done: boolean;
};

const INITIAL_MISSIONS: Mission[] = [
  { id: "m1", zone: "animals",    emoji: "🐮", titleKu: "Heywanan bibîne", titleTr: "3 hayvana dokun",  hintTr: "Çayırdaki hayvanları say",      target: 3, progress: 0, xpReward: 15, done: false },
  { id: "m2", zone: "fruits",     emoji: "🍎", titleKu: "Mêwe bicive",     titleTr: "Meyveleri topla",  hintTr: "Batı bahçesindeki ağaçlara dokun", target: 3, progress: 0, xpReward: 20, done: false },
  { id: "m3", zone: "vegetables", emoji: "🥕", titleKu: "Sebze bibîne",     titleTr: "Sebzeleri tanı",   hintTr: "Doğu bahçesindeki sebzelere dokun", target: 3, progress: 0, xpReward: 20, done: false },
  { id: "m4", zone: "house",      emoji: "🏡", titleKu: "Bi Kev re biaxive", titleTr: "Kev'le konuş",   hintTr: "Çiftçi evine git, Kev seni bekliyor", target: 1, progress: 0, xpReward: 25, done: false },
];

// =====================================================================
//  PROSEDÜREL ÇİM DOKUSU
// =====================================================================

function makeGrassTexture(): THREE.CanvasTexture {
  // Native'de DOM canvas yok — basit veri-tabanlı doku üret
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const r = 0.5 + Math.random() * 0.5;
    // Yeşil tonlarında varyasyon
    data[i * 4 + 0] = Math.floor((90 + Math.random() * 40) * r);   // R
    data[i * 4 + 1] = Math.floor((150 + Math.random() * 60) * r);  // G
    data[i * 4 + 2] = Math.floor((50 + Math.random() * 30) * r);   // B
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.needsUpdate = true;
  return tex as unknown as THREE.CanvasTexture;
}

// =====================================================================
//  GÖKKUBBE — büyük iç-yüzlü küre, vertex renk gradyan (mavi → açık mavi)
// =====================================================================

function SkyDome() {
  const geom = useMemo(() => {
    const g = new THREE.SphereGeometry(60, 32, 16);
    // Vertex renkleri: tepeden tabana mavi gradyan
    const colors = new Float32Array(g.attributes.position.count * 3);
    const top = new THREE.Color("#1E88E5");
    const mid = new THREE.Color("#64B5F6");
    const bot = new THREE.Color("#E1F5FE");
    for (let i = 0; i < g.attributes.position.count; i++) {
      const y = g.attributes.position.getY(i);
      const t = Math.max(0, Math.min(1, (y + 60) / 120));
      let c: THREE.Color;
      if (t > 0.6) c = top.clone().lerp(mid, (1 - t) * 2.5);
      else if (t > 0.3) c = mid.clone().lerp(bot, (0.6 - t) * 3.3);
      else c = bot.clone();
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);
  return (
    <mesh geometry={geom}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} />
    </mesh>
  );
}

// =====================================================================
//  BULUT KÜMESİ — 4-küre yığını, gökyüzünde tur atan
// =====================================================================

function CloudCluster({ seed, height }: { seed: number; height: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.08 + seed;
    ref.current.position.x = Math.cos(t) * 9;
    ref.current.position.z = Math.sin(t) * 9;
    ref.current.position.y = height + Math.sin(t * 2) * 0.3;
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.9, 12, 12]} />
        <meshStandardMaterial color="#fff" transparent opacity={0.95} />
      </mesh>
      <mesh position={[0.85, 0.1, 0]}>
        <sphereGeometry args={[0.7, 12, 12]} />
        <meshStandardMaterial color="#fff" transparent opacity={0.95} />
      </mesh>
      <mesh position={[-0.8, 0.1, 0]}>
        <sphereGeometry args={[0.7, 12, 12]} />
        <meshStandardMaterial color="#fff" transparent opacity={0.95} />
      </mesh>
      <mesh position={[0.1, 0.5, 0]}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshStandardMaterial color="#fff" transparent opacity={0.95} />
      </mesh>
      <mesh position={[-0.3, 0.45, 0]}>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshStandardMaterial color="#fff" transparent opacity={0.95} />
      </mesh>
    </group>
  );
}

// =====================================================================
//  POLEN PARÇACIKLARI — THREE.Points, prosedürel uçuşan altın noktalar
// =====================================================================

function PollenParticles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = 1 + Math.random() * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xFFE082,
      size: 0.12,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
      depthWrite: false,
    });
    return { geometry: geo, material: mat };
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const pos = (ref.current.geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const yBase = 1 + ((i * 0.13) % 4);
      pos.setY(i, yBase + Math.sin(t * 0.5 + i) * 0.4);
      const x0 = ((i * 1.7) % 14) - 7;
      pos.setX(i, x0 + Math.cos(t * 0.3 + i) * 0.5);
    }
    pos.needsUpdate = true;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

// =====================================================================
//  TİPE-ÖZEL HAYVAN MODELLERİ
// =====================================================================

/** Standart bacak (silindir) */
function Leg({ x, z, color, height = 0.3 }: { x: number; z: number; color: string; height?: number }) {
  return (
    <mesh castShadow position={[x, height / 2, z]}>
      <cylinderGeometry args={[0.06, 0.07, height, 8]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}

/** İNEK (Ga) — siyah-beyaz benekli + boynuz + pembe meme */
function CowModel() {
  return (
    <group>
      {/* Vücut — kapsül gibi */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.32, 0.55, 8, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
      </mesh>
      {/* Siyah benekler */}
      <mesh position={[0.18, 0.55, 0.28]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#1C1C1C" roughness={0.6} />
      </mesh>
      <mesh position={[-0.2, 0.65, 0.2]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#1C1C1C" />
      </mesh>
      <mesh position={[0.05, 0.45, -0.3]}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial color="#1C1C1C" />
      </mesh>
      {/* Kafa */}
      <group position={[0, 0.7, 0.45]}>
        <mesh castShadow>
          <sphereGeometry args={[0.25, 20, 20]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
        </mesh>
        {/* Burun (pembe) */}
        <mesh position={[0, -0.05, 0.22]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#FF9999" roughness={0.4} />
        </mesh>
        {/* Burun delikleri */}
        <mesh position={[-0.04, -0.05, 0.3]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[0.04, -0.05, 0.3]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        {/* Gözler */}
        <mesh position={[-0.1, 0.1, 0.18]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[0.1, 0.1, 0.18]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        {/* Boynuzlar */}
        <mesh castShadow position={[-0.15, 0.22, 0]} rotation={[0, 0, -0.4]}>
          <coneGeometry args={[0.05, 0.18, 8]} />
          <meshStandardMaterial color="#E5C8A0" roughness={0.4} />
        </mesh>
        <mesh castShadow position={[0.15, 0.22, 0]} rotation={[0, 0, 0.4]}>
          <coneGeometry args={[0.05, 0.18, 8]} />
          <meshStandardMaterial color="#E5C8A0" roughness={0.4} />
        </mesh>
        {/* Kulaklar */}
        <mesh position={[-0.22, 0.15, -0.05]} rotation={[0, 0, -0.7]}>
          <coneGeometry args={[0.07, 0.13, 8]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.22, 0.15, -0.05]} rotation={[0, 0, 0.7]}>
          <coneGeometry args={[0.07, 0.13, 8]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      </group>
      {/* Bacaklar */}
      <Leg x={-0.18} z={0.22} color="#FFFFFF" />
      <Leg x={0.18} z={0.22} color="#FFFFFF" />
      <Leg x={-0.18} z={-0.22} color="#FFFFFF" />
      <Leg x={0.18} z={-0.22} color="#FFFFFF" />
      {/* Kuyruk */}
      <mesh position={[0, 0.45, -0.45]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.3, 6]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0, 0.32, -0.55]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#1C1C1C" />
      </mesh>
    </group>
  );
}

/** KOYUN (Pez) — kabarık beyaz yün + siyah yüz */
function SheepModel() {
  return (
    <group>
      {/* Yün gövdesi — icosahedron (kabarık görünür) */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color="#FAFAFA" roughness={0.95} />
      </mesh>
      {/* Ekstra yün topakları */}
      <mesh position={[0.25, 0.65, 0.25]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#FAFAFA" roughness={0.95} />
      </mesh>
      <mesh position={[-0.25, 0.6, 0.2]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.95} />
      </mesh>
      <mesh position={[0.1, 0.85, 0.05]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color="#FAFAFA" roughness={0.95} />
      </mesh>
      {/* Kafa (siyah) */}
      <group position={[0, 0.65, 0.45]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#2C2C2C" roughness={0.6} />
        </mesh>
        {/* Gözler */}
        <mesh position={[-0.07, 0.05, 0.13]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        <mesh position={[0.07, 0.05, 0.13]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        {/* Burun */}
        <mesh position={[0, -0.05, 0.16]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#1A1A1A" />
        </mesh>
        {/* Kulaklar */}
        <mesh position={[-0.18, 0.1, -0.02]} rotation={[0, 0, -0.6]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#2C2C2C" />
        </mesh>
        <mesh position={[0.18, 0.1, -0.02]} rotation={[0, 0, 0.6]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#2C2C2C" />
        </mesh>
      </group>
      {/* Bacaklar (siyah) */}
      <Leg x={-0.16} z={0.18} color="#2C2C2C" height={0.35} />
      <Leg x={0.16} z={0.18} color="#2C2C2C" height={0.35} />
      <Leg x={-0.16} z={-0.18} color="#2C2C2C" height={0.35} />
      <Leg x={0.16} z={-0.18} color="#2C2C2C" height={0.35} />
    </group>
  );
}

/** TAVUK (Mirîşk) — kırmızı ibik + sarı gaga + tüy */
function ChickenModel() {
  return (
    <group>
      {/* Vücut yumurta şekli */}
      <mesh castShadow position={[0, 0.45, 0]} scale={[1, 1.1, 1]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#FAFAFA" roughness={0.7} />
      </mesh>
      {/* Kafa */}
      <group position={[0, 0.75, 0.18]}>
        <mesh castShadow>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#FAFAFA" roughness={0.7} />
        </mesh>
        {/* İbik (kırmızı) */}
        <mesh castShadow position={[0, 0.16, 0]}>
          <coneGeometry args={[0.06, 0.12, 6]} />
          <meshStandardMaterial color="#E53935" roughness={0.5} />
        </mesh>
        <mesh position={[-0.06, 0.18, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#E53935" />
        </mesh>
        <mesh position={[0.06, 0.18, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#E53935" />
        </mesh>
        {/* Gaga (sarı) */}
        <mesh castShadow position={[0, -0.02, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.04, 0.1, 6]} />
          <meshStandardMaterial color="#FFB300" roughness={0.4} />
        </mesh>
        {/* Gözler */}
        <mesh position={[-0.07, 0.04, 0.1]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[0.07, 0.04, 0.1]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        {/* Sakal (kırmızı) */}
        <mesh position={[0, -0.08, 0.06]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#E53935" />
        </mesh>
      </group>
      {/* Kuyruk tüyü */}
      <mesh castShadow position={[0, 0.55, -0.3]} rotation={[Math.PI / 4, 0, 0]}>
        <coneGeometry args={[0.13, 0.3, 8]} />
        <meshStandardMaterial color="#1C1C1C" roughness={0.8} />
      </mesh>
      {/* Kanatlar */}
      <mesh position={[-0.28, 0.45, 0]} rotation={[0, 0, 0.2]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>
      <mesh position={[0.28, 0.45, 0]} rotation={[0, 0, -0.2]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>
      {/* Bacaklar (sarı, ince) */}
      <mesh castShadow position={[-0.1, 0.15, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.3, 6]} />
        <meshStandardMaterial color="#FFB300" />
      </mesh>
      <mesh castShadow position={[0.1, 0.15, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.3, 6]} />
        <meshStandardMaterial color="#FFB300" />
      </mesh>
    </group>
  );
}

/** AT (Hesp) — kahve gövde + yele + uzun bacaklar */
function HorseModel() {
  return (
    <group>
      {/* Vücut — daha uzun kapsül */}
      <mesh castShadow position={[0, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.3, 0.7, 8, 16]} />
        <meshStandardMaterial color="#6D4C41" roughness={0.6} />
      </mesh>
      {/* Boyun */}
      <mesh castShadow position={[0, 1.0, 0.45]} rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.5, 12]} />
        <meshStandardMaterial color="#6D4C41" roughness={0.6} />
      </mesh>
      {/* Kafa */}
      <group position={[0, 1.25, 0.7]}>
        <mesh castShadow rotation={[0.3, 0, 0]}>
          <capsuleGeometry args={[0.13, 0.25, 8, 12]} />
          <meshStandardMaterial color="#6D4C41" roughness={0.6} />
        </mesh>
        {/* Beyaz şerit */}
        <mesh position={[0, 0.1, 0.15]}>
          <boxGeometry args={[0.05, 0.2, 0.04]} />
          <meshStandardMaterial color="#FAFAFA" />
        </mesh>
        {/* Burun delikleri */}
        <mesh position={[-0.04, 0.05, 0.22]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[0.04, 0.05, 0.22]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        {/* Gözler */}
        <mesh position={[-0.1, 0.15, 0.05]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[0.1, 0.15, 0.05]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        {/* Kulaklar */}
        <mesh position={[-0.1, 0.28, -0.05]}>
          <coneGeometry args={[0.05, 0.13, 6]} />
          <meshStandardMaterial color="#6D4C41" />
        </mesh>
        <mesh position={[0.1, 0.28, -0.05]}>
          <coneGeometry args={[0.05, 0.13, 6]} />
          <meshStandardMaterial color="#6D4C41" />
        </mesh>
      </group>
      {/* Yele */}
      <mesh position={[0, 1.05, 0.3]} rotation={[Math.PI / 4, 0, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </mesh>
      {/* Bacaklar (4 uzun) */}
      <Leg x={-0.2} z={0.3} color="#3E2723" height={0.55} />
      <Leg x={0.2} z={0.3} color="#3E2723" height={0.55} />
      <Leg x={-0.2} z={-0.3} color="#3E2723" height={0.55} />
      <Leg x={0.2} z={-0.3} color="#3E2723" height={0.55} />
      {/* Kuyruk */}
      <mesh position={[0, 0.55, -0.5]}>
        <coneGeometry args={[0.08, 0.4, 6]} />
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** KÖPEK (Kûçik) — kahve, sarkık kulak, kısa bacaklar */
function DogModel() {
  return (
    <group>
      {/* Vücut */}
      <mesh castShadow position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.22, 0.45, 8, 12]} />
        <meshStandardMaterial color="#A0522D" roughness={0.65} />
      </mesh>
      {/* Beyaz göğüs */}
      <mesh position={[0, 0.4, 0.2]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#F5F5DC" roughness={0.7} />
      </mesh>
      {/* Kafa */}
      <group position={[0, 0.55, 0.4]}>
        <mesh castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#A0522D" roughness={0.65} />
        </mesh>
        {/* Burun */}
        <mesh position={[0, -0.05, 0.18]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#1A1A1A" />
        </mesh>
        {/* Gözler */}
        <mesh position={[-0.08, 0.05, 0.15]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[0.08, 0.05, 0.15]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        {/* Sarkık kulaklar */}
        <mesh position={[-0.18, 0.05, 0]} rotation={[0, 0, -0.3]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
        <mesh position={[0.18, 0.05, 0]} rotation={[0, 0, 0.3]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
      </group>
      <Leg x={-0.14} z={0.18} color="#A0522D" height={0.28} />
      <Leg x={0.14} z={0.18} color="#A0522D" height={0.28} />
      <Leg x={-0.14} z={-0.18} color="#A0522D" height={0.28} />
      <Leg x={0.14} z={-0.18} color="#A0522D" height={0.28} />
      {/* Kuyruk (yukarı kalkık) */}
      <mesh castShadow position={[0, 0.55, -0.35]} rotation={[-0.6, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.3, 6]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>
    </group>
  );
}

/** KEDİ (Pisîk) — gri, sivri kulak, ince kuyruk */
function CatModel() {
  return (
    <group>
      {/* Vücut */}
      <mesh castShadow position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.18, 0.4, 8, 12]} />
        <meshStandardMaterial color="#9E9E9E" roughness={0.55} />
      </mesh>
      {/* Çizgiler */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.05, 0.04, 0.4]} />
        <meshStandardMaterial color="#616161" />
      </mesh>
      {/* Kafa */}
      <group position={[0, 0.5, 0.32]}>
        <mesh castShadow>
          <sphereGeometry args={[0.17, 16, 16]} />
          <meshStandardMaterial color="#9E9E9E" roughness={0.55} />
        </mesh>
        {/* Burun (pembe) */}
        <mesh position={[0, -0.02, 0.15]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#FF80AB" />
        </mesh>
        {/* Gözler (yeşil) */}
        <mesh position={[-0.07, 0.05, 0.13]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#76FF03" emissive="#76FF03" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0.07, 0.05, 0.13]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#76FF03" emissive="#76FF03" emissiveIntensity={0.3} />
        </mesh>
        {/* Sivri kulaklar */}
        <mesh position={[-0.1, 0.18, 0]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.06, 0.14, 6]} />
          <meshStandardMaterial color="#9E9E9E" />
        </mesh>
        <mesh position={[0.1, 0.18, 0]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.06, 0.14, 6]} />
          <meshStandardMaterial color="#9E9E9E" />
        </mesh>
      </group>
      <Leg x={-0.12} z={0.16} color="#9E9E9E" height={0.25} />
      <Leg x={0.12} z={0.16} color="#9E9E9E" height={0.25} />
      <Leg x={-0.12} z={-0.16} color="#9E9E9E" height={0.25} />
      <Leg x={0.12} z={-0.16} color="#9E9E9E" height={0.25} />
      {/* Uzun kuyruk */}
      <mesh castShadow position={[0, 0.55, -0.35]} rotation={[-1.0, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.04, 0.45, 6]} />
        <meshStandardMaterial color="#9E9E9E" />
      </mesh>
    </group>
  );
}

/** Tıklanabilir, süzülen, tipe-özel hayvan wrapper */
function Animal3D({
  position, word, kind, onTap, idx,
}: {
  position: [number, number, number];
  word: KidsWord;
  kind: AnimalKind;
  onTap: (word: KidsWord) => void;
  idx: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    // Yumuşak otlama dönüşü + zıplama
    ref.current.rotation.y = Math.sin(t * 0.4 + idx) * 0.5;
    ref.current.position.y = position[1] + Math.abs(Math.sin(t * 1.8 + idx * 1.3)) * 0.12;
    ref.current.position.x = position[0] + Math.cos(t * 0.3 + idx * 2) * 0.12;
    ref.current.position.z = position[2] + Math.sin(t * 0.25 + idx * 1.5) * 0.12;
  });

  const Model =
    kind === "cow"     ? CowModel :
    kind === "sheep"   ? SheepModel :
    kind === "chicken" ? ChickenModel :
    kind === "horse"   ? HorseModel :
    kind === "dog"     ? DogModel :
    CatModel;

  return (
    <group
      ref={ref}
      position={position}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onTap(word);
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.18 : 1}
    >
      <Model />
    </group>
  );
}

// =====================================================================
//  MEYVE AĞACI — gerçekçi gövde + 3 yaprak öbeği + hangi meyve
// =====================================================================

function FruitTree3D({
  position, fruitColor, word, onTap, harvested,
}: {
  position: [number, number, number];
  fruitColor: string;
  word: KidsWord;
  onTap: (word: KidsWord) => void;
  harvested: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.7 + position[0]) * 0.04;
  });

  return (
    <group
      ref={ref}
      position={position}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (!harvested) onTap(word);
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered && !harvested ? 1.06 : 1}
    >
      {/* Gövde — eğri silindir benzeri, dokulu */}
      <mesh castShadow position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.18, 0.28, 1.4, 14]} />
        <meshStandardMaterial color="#5D3A1A" roughness={0.95} />
      </mesh>
      {/* Yaprak öbekleri — 3 farklı tonda büyük küre kümesi */}
      <mesh castShadow position={[-0.2, 1.6, 0.1]}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.3, 1.7, -0.1]}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color="#43A047" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 2.05, 0.15]}>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial color="#66BB6A" roughness={0.7} />
      </mesh>
      {/* Meyveler — sadece toplanmadıysa */}
      {!harvested && (
        <>
          {[
            [0.4, 1.5, 0.3],
            [-0.45, 1.7, 0.15],
            [0.15, 1.85, 0.4],
            [-0.25, 1.4, -0.25],
            [0.5, 1.95, -0.1],
          ].map((p, i) => (
            <mesh key={i} castShadow position={p as [number, number, number]}>
              <sphereGeometry args={[0.13, 14, 14]} />
              <meshStandardMaterial
                color={fruitColor}
                roughness={0.3}
                emissive={fruitColor}
                emissiveIntensity={0.15}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

// =====================================================================
//  SEBZE YATAĞI
// =====================================================================

function Vegetable3D({
  position, color, word, onTap, harvested,
}: {
  position: [number, number, number];
  color: string;
  word: KidsWord;
  onTap: (word: KidsWord) => void;
  harvested: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!ref.current) return;
    if (!harvested) {
      const t = state.clock.elapsedTime;
      const s = 1 + Math.sin(t * 1.5 + position[0]) * 0.04;
      ref.current.scale.set(s, s, s);
    }
  });

  return (
    <group
      ref={ref}
      position={position}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (!harvested) onTap(word);
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered && !harvested ? 1.12 : 1}
    >
      {/* Toprak yatağı (rounded box → daha doğal) */}
      <mesh position={[0, 0.11, 0]} castShadow receiveShadow><boxGeometry args={[1.3, 0.22, 1.3]} />
        <meshStandardMaterial color="#5D4037" roughness={0.95} />
      </mesh>
      {!harvested && (
        <>
          {/* Yapraklar */}
          <mesh castShadow position={[-0.3, 0.4, 0]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#2E7D32" roughness={0.7} />
          </mesh>
          <mesh castShadow position={[0.3, 0.4, 0]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#388E3C" roughness={0.7} />
          </mesh>
          <mesh castShadow position={[0, 0.4, -0.3]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#43A047" roughness={0.7} />
          </mesh>
          {/* Sebze (parlak küre) */}
          <mesh castShadow position={[0, 0.55, 0.2]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial
              color={color}
              roughness={0.25}
              emissive={color}
              emissiveIntensity={0.18}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

// =====================================================================
//  ÇİFTLİK EVİ — kırmızı çatı + tuğla doku + parlayan pencere
// =====================================================================

function Farmhouse3D({
  position, onTap,
}: {
  position: [number, number, number];
  onTap: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <group
      position={position}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onTap();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.04 : 1}
    >
      {/* Ana gövde (rounded) */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow><boxGeometry args={[2.2, 1.6, 1.7]} />
        <meshStandardMaterial color="#FFF3E0" roughness={0.85} />
      </mesh>
      {/* Çatı (üçgen prizma) */}
      <mesh castShadow position={[0, 1.95, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.55, 1.1, 4]} />
        <meshStandardMaterial color="#B71C1C" roughness={0.5} />
      </mesh>
      {/* Çatı kiremitleri (alt çizgi) */}
      <mesh position={[0, 1.45, 0]}>
        <torusGeometry args={[1.18, 0.04, 8, 24]} />
        <meshStandardMaterial color="#7F0000" />
      </mesh>
      {/* Kapı */}
      <mesh position={[0, 0.5, 0.86]}><boxGeometry args={[0.5, 0.95, 0.06]} />
        <meshStandardMaterial color="#5D3A1A" roughness={0.7} />
      </mesh>
      {/* Kapı tokmağı */}
      <mesh position={[0.18, 0.55, 0.92]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color="#FFC107" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Pencereler (parlayan camlar) */}
      <mesh position={[-0.7, 1.0, 0.86]}><boxGeometry args={[0.42, 0.42, 0.05]} />
        <meshStandardMaterial
          color="#90CAF9"
          emissive="#FFEB3B"
          emissiveIntensity={0.6}
        />
      </mesh>
      <mesh position={[0.7, 1.0, 0.86]}><boxGeometry args={[0.42, 0.42, 0.05]} />
        <meshStandardMaterial
          color="#90CAF9"
          emissive="#FFEB3B"
          emissiveIntensity={0.6}
        />
      </mesh>
      {/* Pencere çerçeve (haç) */}
      <mesh position={[-0.7, 1.0, 0.9]}>
        <boxGeometry args={[0.44, 0.04, 0.02]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
      <mesh position={[-0.7, 1.0, 0.9]}>
        <boxGeometry args={[0.04, 0.44, 0.02]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
      <mesh position={[0.7, 1.0, 0.9]}>
        <boxGeometry args={[0.44, 0.04, 0.02]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
      <mesh position={[0.7, 1.0, 0.9]}>
        <boxGeometry args={[0.04, 0.44, 0.02]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
      {/* Baca */}
      <mesh position={[0.55, 2.4, 0]} castShadow><boxGeometry args={[0.3, 0.7, 0.3]} />
        <meshStandardMaterial color="#7F0000" roughness={0.7} />
      </mesh>
    </group>
  );
}

// =====================================================================
//  BACA DUMANI — yukarı süzülen partiküller
// =====================================================================

function ChimneySmoke({ origin }: { origin: [number, number, number] }) {
  const refs = [
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
  ];
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.forEach((r, i) => {
      if (!r.current) return;
      const phase = (t * 0.5 + i * 0.4) % 2.5;
      r.current.position.y = origin[1] + phase * 1.6;
      r.current.position.x = origin[0] + Math.sin(t + i * 1.5) * 0.18;
      r.current.scale.setScalar(0.3 + phase * 0.5);
      const mat = r.current.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.max(0, 0.75 - phase * 0.32);
    });
  });
  return (
    <>
      {refs.map((r, i) => (
        <mesh key={i} ref={r} position={origin}>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#ECEFF1" transparent opacity={0.7} />
        </mesh>
      ))}
    </>
  );
}

// =====================================================================
//  KEV NPC — el sallayan çiftçi
// =====================================================================

function FarmerKev({
  position, onTap,
}: {
  position: [number, number, number];
  onTap: () => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = Math.sin(t * 0.5) * 0.2;
    ref.current.position.y = position[1] + Math.sin(t * 1.5) * 0.05;
    if (armRef.current) {
      armRef.current.rotation.z = -0.4 + Math.sin(t * 4) * 0.6;
    }
  });

  return (
    <group
      ref={ref}
      position={position}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onTap();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {/* Bacaklar */}
      <mesh castShadow position={[-0.12, 0.25, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 10]} />
        <meshStandardMaterial color="#1565C0" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.12, 0.25, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 10]} />
        <meshStandardMaterial color="#1565C0" roughness={0.7} />
      </mesh>
      {/* Vücut */}
      <mesh position={[0, 0.7, 0]} castShadow><boxGeometry args={[0.42, 0.5, 0.28]} />
        <meshStandardMaterial color="#FFC107" roughness={0.6} />
      </mesh>
      {/* Tulum kayışı */}
      <mesh position={[0, 0.85, 0.15]}>
        <boxGeometry args={[0.08, 0.4, 0.04]} />
        <meshStandardMaterial color="#1565C0" />
      </mesh>
      {/* Kafa */}
      <mesh castShadow position={[0, 1.08, 0]}>
        <sphereGeometry args={[0.19, 16, 16]} />
        <meshStandardMaterial color="#FFD7B5" roughness={0.5} />
      </mesh>
      {/* Saman şapka — torus + koni */}
      <mesh castShadow position={[0, 1.27, 0]}>
        <coneGeometry args={[0.28, 0.18, 14]} />
        <meshStandardMaterial color="#D7B377" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, 1.21, 0]}>
        <torusGeometry args={[0.32, 0.05, 8, 18]} />
        <meshStandardMaterial color="#D7B377" roughness={0.85} />
      </mesh>
      {/* Gözler */}
      <mesh position={[-0.06, 1.1, 0.17]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[0.06, 1.1, 0.17]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      {/* Gülen ağız */}
      <mesh position={[0, 1.0, 0.18]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.05, 0.012, 6, 12, Math.PI]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
      {/* Burun */}
      <mesh position={[0, 1.05, 0.19]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#FFB59E" />
      </mesh>
      {/* Sol kol — duruyor */}
      <mesh castShadow position={[-0.26, 0.7, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.45, 10]} />
        <meshStandardMaterial color="#FFC107" />
      </mesh>
      {/* Sağ kol — el sallıyor */}
      <mesh ref={armRef} castShadow position={[0.3, 0.92, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.45, 10]} />
        <meshStandardMaterial color="#FFC107" />
      </mesh>
    </group>
  );
}

// =====================================================================
//  ÇİT — yumuşak köşeli direkler
// =====================================================================

function Fence3D() {
  const positions: [number, number, number][] = [];
  const half = 7;
  for (let x = -half; x <= half; x++) {
    positions.push([x, 0, -half]);
    positions.push([x, 0, half]);
  }
  for (let z = -half; z <= half; z++) {
    positions.push([-half, 0, z]);
    positions.push([half, 0, z]);
  }
  return (
    <group>
      {positions.map((p, i) => (
        <mesh
          key={i}
          position={[p[0], 0.42, p[2]]}
          castShadow
        ><boxGeometry args={[0.12, 0.85, 0.12]} />
          <meshStandardMaterial color="#5D3A1A" roughness={0.9} />
        </mesh>
      ))}
      {/* Yatay tahta — kuzey/güney */}
      {[-half, half].map((z, i) => (
        <mesh key={`h-ns-${i}`} position={[0, 0.55, z]} castShadow>
          <boxGeometry args={[half * 2, 0.06, 0.05]} />
          <meshStandardMaterial color="#6D4226" roughness={0.85} />
        </mesh>
      ))}
      {[-half, half].map((x, i) => (
        <mesh key={`h-ew-${i}`} position={[x, 0.55, 0]} castShadow>
          <boxGeometry args={[0.05, 0.06, half * 2]} />
          <meshStandardMaterial color="#6D4226" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

// =====================================================================
//  KUŞ SÜRÜSÜ
// =====================================================================

function BirdFlock() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.18;
    ref.current.position.y = 5.5 + Math.sin(t * 0.5) * 0.5;
  });
  const birds = Array.from({ length: 6 }).map((_, i) => {
    const angle = (i / 6) * Math.PI * 0.5 - Math.PI * 0.25;
    return [Math.sin(angle) * 5, i * 0.15, Math.cos(angle) * 5] as [number, number, number];
  });
  return (
    <group ref={ref}>
      {birds.map((p, i) => (
        <Bird key={i} position={p} idx={i} />
      ))}
    </group>
  );
}

function Bird({ position, idx }: { position: [number, number, number]; idx: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.children.forEach((c, i) => {
      if (i === 1) c.rotation.z = Math.sin(t * 8 + idx) * 0.7;
      if (i === 2) c.rotation.z = -Math.sin(t * 8 + idx) * 0.7;
    });
  });
  return (
    <group ref={ref} position={position} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial color="#37474F" />
      </mesh>
      <mesh position={[0, 0, 0.18]}>
        <boxGeometry args={[0.02, 0.04, 0.36]} />
        <meshStandardMaterial color="#263238" />
      </mesh>
      <mesh position={[0, 0, -0.18]}>
        <boxGeometry args={[0.02, 0.04, 0.36]} />
        <meshStandardMaterial color="#263238" />
      </mesh>
    </group>
  );
}

// =====================================================================
//  KAMERA — sinematik yörünge + bölge zoomu
// =====================================================================

function CameraOrbit({ focusZone }: { focusZone: ZoneKey | null }) {
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.10;
    let cx = 0, cz = 0, cy = 4.5, r = 9;
    if (focusZone === "fruits")     { cx = -3.5; cz = 0; r = 7; cy = 3.5; }
    if (focusZone === "vegetables") { cx = 4; cz = 0; r = 7; cy = 3.5; }
    if (focusZone === "house")      { cx = 0; cz = -4; r = 7; cy = 3.8; }
    if (focusZone === "animals")    { cx = 0; cz = 0; r = 6; cy = 4; }
    state.camera.position.x = cx + Math.cos(t) * r;
    state.camera.position.z = cz + Math.sin(t) * r;
    state.camera.position.y = cy;
    state.camera.lookAt(cx, 0.5, cz);
  });
  return null;
}

// =====================================================================
//  GİRİŞ SPLASHI
// =====================================================================

function GameEntrySplash({ onDone }: { onDone: () => void }) {
  const progress = useSharedValue(0);
  const sunRotate = useSharedValue(0);
  const titleScale = useSharedValue(0.6);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    titleScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) });
    titleOpacity.value = withTiming(1, { duration: 600 });
    progress.value = withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.cubic) });
    sunRotate.value = withRepeat(withTiming(360, { duration: 4000, easing: Easing.linear }), -1, false);
    const t = setTimeout(() => onDone(), 2100);
    return () => clearTimeout(t);
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
    opacity: titleOpacity.value,
  }));
  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));
  const sunStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sunRotate.value}deg` }],
  }));

  return (
    <View style={splashStyles.root}>
      <View style={splashStyles.skyOverlay} />
      <View style={splashStyles.center}>
        <Animated.Text style={[splashStyles.bigSun, sunStyle]}>☀️</Animated.Text>
        <Animated.View style={titleStyle}>
          <Text style={splashStyles.title}>KEVO'NUN ÇİFTLİĞİ</Text>
          <Text style={splashStyles.subtitle}>Çiftlika Kev'o</Text>
        </Animated.View>
        <View style={splashStyles.barTrack}>
          <Animated.View style={[splashStyles.barFill, barStyle]} />
        </View>
        <Text style={splashStyles.loadingText}>3D dünya yükleniyor...</Text>
        <View style={splashStyles.iconRow}>
          <Text style={splashStyles.icon}>🐮</Text>
          <Text style={splashStyles.icon}>🌳</Text>
          <Text style={splashStyles.icon}>🌾</Text>
          <Text style={splashStyles.icon}>🏡</Text>
        </View>
      </View>
    </View>
  );
}

// =====================================================================
//  ANA SAHNE
// =====================================================================

export function Farm3D({ category, onClose, onXp }: Props) {
  const [phase, setPhase] = useState<"loading" | "playing">("loading");
  const [tappedAnimal, setTappedAnimal] = useState<KidsWord | null>(null);
  const [score, setScore] = useState(0);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [activeMissionId, setActiveMissionId] = useState<string>("m1");
  const [missionPanel, setMissionPanel] = useState(true);
  const [confettiOn, setConfettiOn] = useState(false);
  const [completedToast, setCompletedToast] = useState<Mission | null>(null);
  const [harvestedTrees, setHarvestedTrees] = useState<Set<string>>(new Set());
  const [harvestedVeg, setHarvestedVeg] = useState<Set<string>>(new Set());
  const [npcDialog, setNpcDialog] = useState(false);

  const grassTexture = useMemo(() => makeGrassTexture(), []);

  const activeMission = missions.find((m) => m.id === activeMissionId);
  const focusZone: ZoneKey | null = activeMission?.done ? null : (activeMission?.zone ?? null);

  const sceneAnimals = useMemo(() => {
    // Çiftlik kategorisinden 6 hayvan al — tipini Kürtçe ada göre belirle
    const animalCat = category.words.slice(0, 6);
    return animalCat.map((w, i) => {
      const angle = (i / 6) * Math.PI * 2;
      const r = 2.4;
      const kind = ANIMAL_KIND_BY_KU[w.ku] ?? (["cow", "sheep", "chicken", "horse", "dog", "cat"][i % 6] as AnimalKind);
      return {
        word: w,
        kind,
        position: [Math.cos(angle) * r, 0, Math.sin(angle) * r] as [number, number, number],
      };
    });
  }, [category]);

  const sceneFruits = useMemo(() => {
    const fruits: KidsWord[] = [
      { ku: "Sêv", tr: "Elma", emoji: "🍎" },
      { ku: "Tirî", tr: "Üzüm", emoji: "🍇" },
      { ku: "Hinar", tr: "Nar", emoji: "🍑" },
    ];
    const colors = ["#E53935", "#7B1FA2", "#C2185B"];
    return fruits.map((w, i) => ({
      word: w,
      position: [-4 - i * 0.3, 0, -2 + i * 1.8] as [number, number, number],
      color: colors[i],
    }));
  }, []);

  const sceneVeg = useMemo(() => {
    const veg: KidsWord[] = [
      { ku: "Firingî", tr: "Domates", emoji: "🍅" },
      { ku: "Gizêr", tr: "Havuç", emoji: "🥕" },
      { ku: "Şamî", tr: "Mısır", emoji: "🌽" },
    ];
    const colors = ["#E53935", "#FF6F00", "#FBC02D"];
    return veg.map((w, i) => ({
      word: w,
      position: [4 + (i % 2) * 1.4, 0, -2 + i * 1.7] as [number, number, number],
      color: colors[i],
    }));
  }, []);

  const updateMission = (zone: ZoneKey) => {
    setMissions((ms) => {
      const next = ms.map((m) => {
        if (m.zone !== zone || m.done) return m;
        const np = Math.min(m.target, m.progress + 1);
        const done = np >= m.target;
        if (done) {
          setTimeout(() => {
            setCompletedToast(m);
            setConfettiOn(true);
            playFx("celebrate");
            setScore((s) => s + m.xpReward);
            setTimeout(() => {
              setCompletedToast(null);
              setConfettiOn(false);
            }, 2500);
          }, 200);
        }
        return { ...m, progress: np, done };
      });
      const stillActive = next.find((m) => m.id === activeMissionId && !m.done);
      if (!stillActive) {
        const nextMission = next.find((m) => !m.done);
        if (nextMission) setActiveMissionId(nextMission.id);
      }
      return next;
    });
  };

  const handleAnimalTap = (word: KidsWord) => {
    setTappedAnimal(word);
    playFx("success");
    speakKurmanci(word.ku, "kid");
    updateMission("animals");
    setTimeout(() => setTappedAnimal(null), 2200);
  };

  const handleFruitTap = (word: KidsWord, key: string) => {
    if (harvestedTrees.has(key)) return;
    setHarvestedTrees((s) => new Set([...s, key]));
    setTappedAnimal(word);
    playFx("success");
    speakKurmanci(word.ku, "kid");
    updateMission("fruits");
    setTimeout(() => setTappedAnimal(null), 2200);
  };

  const handleVegTap = (word: KidsWord, key: string) => {
    if (harvestedVeg.has(key)) return;
    setHarvestedVeg((s) => new Set([...s, key]));
    setTappedAnimal(word);
    playFx("success");
    speakKurmanci(word.ku, "kid");
    updateMission("vegetables");
    setTimeout(() => setTappedAnimal(null), 2200);
  };

  const handleHouseTap = () => {
    setNpcDialog(true);
    playFx("tap");
    speakKurmanci("Tu xêr hatî, Kev li bende ye", "kid");
  };

  const handleKevTap = () => {
    setNpcDialog(true);
    playFx("success");
    speakKurmanci("Silav heval, çiftliğa min xweş e!", "kidSlow");
    updateMission("house");
  };

  if (phase === "loading") {
    return <GameEntrySplash onDone={() => setPhase("playing")} />;
  }

  return (
    <View style={styles.root}>
      <Canvas
        shadows
        camera={{ position: [0, 5, 9], fov: 55 }}
        style={StyleSheet.absoluteFillObject}
      >
        <SkyDome />
        <Suspense fallback={null}>
          <fog attach="fog" args={["#B8DEFF", 14, 32]} />

          {/* === IŞIKLAR === */}
          <ambientLight intensity={0.55} color="#FFF8E1" />
          <directionalLight
            castShadow
            position={[6, 12, 4]}
            intensity={1.6}
            color="#FFF5E1"
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={30}
            shadow-camera-left={-15}
            shadow-camera-right={15}
            shadow-camera-top={15}
            shadow-camera-bottom={-15}
          />
          <hemisphereLight args={["#87CEEB", "#A4D65E", 0.5]} />

          {/* === ZEMİN — prosedürel çim dokusu === */}
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[35, 35, 32, 32]} />
            <meshStandardMaterial map={grassTexture} roughness={0.95} />
          </mesh>

          {/* Bölge işaretçileri — meyve bölgesi (batı, parlak yeşil) */}
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[-4, 0.01, 0]}>
            <planeGeometry args={[3.5, 6]} />
            <meshStandardMaterial color="#9CCC65" roughness={0.9} transparent opacity={0.85} />
          </mesh>
          {/* sebze bölgesi (doğu, kahve toprak) */}
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[4.5, 0.01, 0]}>
            <planeGeometry args={[3.5, 6]} />
            <meshStandardMaterial color="#A1887F" roughness={0.95} transparent opacity={0.85} />
          </mesh>
          {/* yol (kahve patika) */}
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -3]}>
            <planeGeometry args={[1.5, 4]} />
            <meshStandardMaterial color="#BCAAA4" roughness={0.95} />
          </mesh>

          {/* === ÇİT === */}
          <Fence3D />

          {/* === HAYVANLAR === */}
          {sceneAnimals.map((a, i) => (
            <Animal3D
              key={`a-${i}`}
              position={a.position}
              kind={a.kind}
              word={a.word}
              idx={i}
              onTap={handleAnimalTap}
            />
          ))}

          {/* === MEYVE AĞAÇLARI === */}
          {sceneFruits.map((f, i) => {
            const key = `fruit-${i}`;
            return (
              <FruitTree3D
                key={key}
                position={f.position}
                fruitColor={f.color}
                word={f.word}
                onTap={(w) => handleFruitTap(w, key)}
                harvested={harvestedTrees.has(key)}
              />
            );
          })}

          {/* === SEBZE YATAKLARI === */}
          {sceneVeg.map((v, i) => {
            const key = `veg-${i}`;
            return (
              <Vegetable3D
                key={key}
                position={v.position}
                color={v.color}
                word={v.word}
                onTap={(w) => handleVegTap(w, key)}
                harvested={harvestedVeg.has(key)}
              />
            );
          })}

          {/* === EV + KEV === */}
          <Farmhouse3D position={[0, 0, -5]} onTap={handleHouseTap} />
          <ChimneySmoke origin={[0.55, 2.85, -5]} />
          <FarmerKev position={[1.7, 0, -3.6]} onTap={handleKevTap} />

          {/* === BULUTLAR (sphere cluster, prosedürel hareket) === */}
          <CloudCluster seed={0} height={6} />
          <CloudCluster seed={2.1} height={6.5} />
          <CloudCluster seed={4.2} height={6} />

          {/* === PARÇACIK SİSTEMİ — altın polen === */}
          <PollenParticles count={80} />

          {/* === KUŞ SÜRÜSÜ === */}
          <BirdFlock />

          {/* === KAMERA === */}
          <CameraOrbit focusZone={focusZone} />
        </Suspense>
      </Canvas>

      {/* === ÜST HUD === */}
      <View style={styles.hud}>
        <Pressable onPress={onClose} style={styles.hudBack}>
          <Text style={styles.hudBackText}>‹</Text>
        </Pressable>
        <View style={styles.hudCenter}>
          <Text style={styles.hudTitle}>🌾 Kevo'nun Çiftliği</Text>
          <Text style={styles.hudSub}>Çiftlika Kev'o · 3D dünyası</Text>
        </View>
        <View style={styles.hudScore}>
          <Text style={{ fontSize: 16 }}>⭐</Text>
          <Text style={styles.hudScoreText}>{score}</Text>
        </View>
      </View>

      {/* === AKTİF GÖREV ROZETİ === */}
      {activeMission && !activeMission.done && (
        <Pressable
          style={[styles.activeQuestBadge, SHADOW(KIDS_THEME.primary, "md")]}
          onPress={() => setMissionPanel((v) => !v)}
        >
          <View style={styles.questBadgeIcon}>
            <Text style={{ fontSize: 22 }}>{activeMission.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.questBadgeTitle}>{activeMission.titleTr}</Text>
            <Text style={styles.questBadgeKu}>{activeMission.titleKu}</Text>
            <View style={styles.questBar}>
              <View
                style={[
                  styles.questBarFill,
                  { width: `${(activeMission.progress / activeMission.target) * 100}%` },
                ]}
              />
            </View>
          </View>
          <View style={styles.questBadgeProgress}>
            <Text style={styles.questBadgeProgressText}>
              {activeMission.progress}/{activeMission.target}
            </Text>
          </View>
        </Pressable>
      )}

      {/* === GÖREV PANELİ === */}
      {missionPanel && (
        <View style={styles.questPanel}>
          <Text style={styles.questPanelTitle}>📋 Görevler</Text>
          {missions.map((m) => {
            const isActive = m.id === activeMissionId;
            return (
              <Pressable
                key={m.id}
                onPress={() => setActiveMissionId(m.id)}
                style={[
                  styles.questItem,
                  isActive && { backgroundColor: KIDS_THEME.yellowSoft, borderColor: KIDS_THEME.yellowDark },
                  m.done && { opacity: 0.55 },
                ]}
              >
                <Text style={{ fontSize: 18 }}>{m.done ? "✅" : m.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.questItemTitle,
                      m.done && { textDecorationLine: "line-through" },
                    ]}
                    numberOfLines={1}
                  >
                    {m.titleTr}
                  </Text>
                  <Text style={styles.questItemSub} numberOfLines={1}>
                    +{m.xpReward} XP · {m.progress}/{m.target}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* === TIKLANAN BALON === */}
      {tappedAnimal && (
        <View style={[styles.tapBubble, SHADOW(KIDS_THEME.primary, "lg")]}>
          <Text style={{ fontSize: 36 }}>{tappedAnimal.emoji}</Text>
          <View>
            <Text style={[styles.tapBubbleKu, { color: KIDS_THEME.primary }]}>
              {tappedAnimal.ku}
            </Text>
            <Text style={styles.tapBubbleTr}>{tappedAnimal.tr}</Text>
          </View>
        </View>
      )}

      {/* === GÖREV TAMAM TOAST === */}
      {completedToast && (
        <View style={[styles.completeToast, SHADOW(KIDS_THEME.greenDark, "glow")]}>
          <Text style={{ fontSize: 44 }}>🎉</Text>
          <Text style={styles.completeToastTitle}>Görev Tamam!</Text>
          <Text style={styles.completeToastKu}>{completedToast.titleKu}</Text>
          <View style={styles.completeToastBadge}>
            <Text style={styles.completeToastBadgeText}>+{completedToast.xpReward} XP</Text>
          </View>
        </View>
      )}

      {/* === KEV NPC === */}
      {npcDialog && (
        <Pressable style={styles.npcOverlay} onPress={() => setNpcDialog(false)}>
          <View style={[styles.npcCard, SHADOW(KIDS_THEME.yellowDark, "lg")]}>
            <View style={styles.npcAvatar}>
              <Text style={{ fontSize: 40 }}>👨‍🌾</Text>
            </View>
            <Text style={styles.npcName}>Kev (Çiftçi)</Text>
            <Text style={styles.npcDialogTr}>
              "Hoş geldin! Çiftliğimde 4 görev seni bekliyor. Hayvanlara dokun, meyveleri topla,
              sebzeleri tanı."
            </Text>
            <Text style={styles.npcDialogKu}>
              "Tu xêr hatî! Li çiftliğa min 4 erkên te hene."
            </Text>
            <Pressable
              style={[styles.npcCloseBtn, SHADOW(KIDS_THEME.primary, "md")]}
              onPress={() => setNpcDialog(false)}
            >
              <Text style={styles.npcCloseBtnText}>Tamam ✓</Text>
            </Pressable>
          </View>
        </Pressable>
      )}

      <Confetti visible={confettiOn} count={50} duration={2000} />

      {/* === ALT BAR === */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomStats}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{missions.filter((m) => m.done).length}/{missions.length}</Text>
            <Text style={styles.statLabel}>Görev</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{score}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
        </View>
        <Pressable
          onPress={() => {
            onXp(score);
            onClose();
          }}
          style={({ pressed }) => [
            styles.bottomBtn,
            { backgroundColor: KIDS_THEME.primary, opacity: pressed ? 0.9 : 1 },
            SHADOW(KIDS_THEME.primary, "md"),
          ]}
        >
          <Text style={styles.bottomBtnText}>Çiftlikten çık 🚪</Text>
        </Pressable>
      </View>
    </View>
  );
}

// =====================================================================
//  STYLES
// =====================================================================

const splashStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#1A237E" },
  skyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(33, 150, 243, 0.25)",
  },
  center: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: SPACING.huge,
  },
  bigSun: { fontSize: 84, marginBottom: SPACING.xl },
  title: {
    ...TYPO.hero, color: "#FFF", textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 8,
  },
  subtitle: {
    ...TYPO.h3, color: "#FFD54F", textAlign: "center",
    marginTop: 4, fontStyle: "italic",
  },
  barTrack: {
    width: "100%", height: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 999, overflow: "hidden",
    marginTop: SPACING.huge,
  },
  barFill: { height: "100%", backgroundColor: "#FFD54F", borderRadius: 999 },
  loadingText: { ...TYPO.body, color: "#FFF", marginTop: SPACING.md, letterSpacing: 1 },
  iconRow: { flexDirection: "row", gap: SPACING.lg, marginTop: SPACING.xl },
  icon: { fontSize: 36 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#87CEEB" },

  hud: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: SPACING.lg, paddingTop: 50, paddingBottom: SPACING.md,
    gap: SPACING.md,
  },
  hudBack: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center", justifyContent: "center",
    ...SHADOW("#000", "sm"),
  },
  hudBackText: { fontSize: 26, fontFamily: "Fredoka_700Bold", color: KIDS_THEME.ink },
  hudCenter: { flex: 1 },
  hudTitle: {
    ...TYPO.h2, color: "#fff",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
  },
  hudSub: {
    ...TYPO.caption, color: "rgba(255,255,255,0.95)",
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  hudScore: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: 14, ...SHADOW("#000", "sm"),
  },
  hudScoreText: { ...TYPO.h3, color: KIDS_THEME.yellowDark },

  activeQuestBadge: {
    position: "absolute", top: 110,
    left: SPACING.lg, right: 80,
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    backgroundColor: "rgba(255,255,255,0.97)",
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 2, borderColor: KIDS_THEME.primary,
  },
  questBadgeIcon: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    backgroundColor: KIDS_THEME.yellowSoft,
  },
  questBadgeTitle: { ...TYPO.h3, color: KIDS_THEME.ink },
  questBadgeKu: { ...TYPO.caption, color: KIDS_THEME.primary, fontStyle: "italic" },
  questBar: {
    height: 6, backgroundColor: KIDS_THEME.silver,
    borderRadius: 999, marginTop: 4, overflow: "hidden",
  },
  questBarFill: { height: "100%", backgroundColor: KIDS_THEME.green, borderRadius: 999 },
  questBadgeProgress: {
    backgroundColor: KIDS_THEME.green,
    paddingHorizontal: SPACING.sm, paddingVertical: 2,
    borderRadius: 10,
  },
  questBadgeProgressText: { ...TYPO.body, color: "#fff", fontSize: 12 },

  questPanel: {
    position: "absolute", right: SPACING.md, top: 200,
    width: 158,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: RADIUS.lg, padding: SPACING.sm, gap: 6,
    ...SHADOW("#000", "md"),
  },
  questPanelTitle: { ...TYPO.h3, color: KIDS_THEME.ink, marginBottom: 4 },
  questItem: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 8, paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: "transparent",
    backgroundColor: KIDS_THEME.bgSoft,
  },
  questItemTitle: { ...TYPO.body, color: KIDS_THEME.ink, fontSize: 12 },
  questItemSub: { ...TYPO.caption, color: KIDS_THEME.smoke, fontSize: 10 },

  tapBubble: {
    position: "absolute", bottom: 160, alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#fff",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 3, borderColor: KIDS_THEME.primary,
  },
  tapBubbleKu: { ...TYPO.h1 },
  tapBubbleTr: { ...TYPO.body, color: KIDS_THEME.smoke, marginTop: 2 },

  completeToast: {
    position: "absolute", top: SH * 0.35, alignSelf: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.xl,
    borderRadius: RADIUS.xl,
    alignItems: "center", gap: 8,
    borderWidth: 3, borderColor: KIDS_THEME.green,
  },
  completeToastTitle: { ...TYPO.h1, color: KIDS_THEME.greenDark },
  completeToastKu: { ...TYPO.body, color: KIDS_THEME.smoke, fontStyle: "italic" },
  completeToastBadge: {
    backgroundColor: KIDS_THEME.yellow,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: 999, marginTop: 8,
  },
  completeToastBadgeText: { ...TYPO.button, color: KIDS_THEME.ink },

  npcOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: SPACING.xl,
  },
  npcCard: {
    backgroundColor: "#FFF8E1",
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xxl,
    borderRadius: RADIUS.xl, alignItems: "center",
    borderWidth: 3, borderColor: KIDS_THEME.yellowDark,
    width: "100%", maxWidth: 360,
  },
  npcAvatar: {
    width: 80, height: 80, borderRadius: 999,
    backgroundColor: KIDS_THEME.yellowSoft,
    alignItems: "center", justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  npcName: { ...TYPO.h2, color: KIDS_THEME.yellowDark, marginBottom: SPACING.md },
  npcDialogTr: {
    ...TYPO.body, color: KIDS_THEME.ink, textAlign: "center",
    marginBottom: SPACING.sm, lineHeight: 22,
  },
  npcDialogKu: {
    ...TYPO.body, color: KIDS_THEME.primary, textAlign: "center",
    fontStyle: "italic", marginBottom: SPACING.lg,
  },
  npcCloseBtn: {
    backgroundColor: KIDS_THEME.primary,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
    borderRadius: RADIUS.pill,
  },
  npcCloseBtnText: { ...TYPO.button, color: "#fff" },

  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.md,
    paddingBottom: 28,
    backgroundColor: "rgba(255,255,255,0.94)",
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
  },
  bottomStats: { flexDirection: "row", gap: SPACING.sm },
  statBox: {
    backgroundColor: KIDS_THEME.bgSoft,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md, alignItems: "center",
    minWidth: 56,
  },
  statValue: { ...TYPO.h3, color: KIDS_THEME.ink },
  statLabel: { ...TYPO.caption, color: KIDS_THEME.smoke },
  bottomBtn: {
    flex: 1, paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl, alignItems: "center",
  },
  bottomBtnText: { ...TYPO.button, color: "#fff" },
});
