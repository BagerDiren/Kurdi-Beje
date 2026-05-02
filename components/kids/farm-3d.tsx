/**
 * 🌾 KEVO'NUN 3D ÇİFTLİĞİ — Three.js + react-three-fiber ile gerçek 3D dünyası
 *
 * Tasarım felsefesi:
 *   • "Bir oyuna girdim" hissi → giriş splash'ı + sinematik kamera
 *   • Katmanlı dünya → 4 farklı bölge (hayvan, meyve, sebze, ev)
 *   • Yaşayan dünya → bulutlar, kuşlar, baca dumanı, sallanan ağaçlar, otlayan hayvanlar
 *   • Görev sistemi → her bölgede mini-görev, ilerleme + ödül
 *   • Çocuk-dostu → büyük HUD, renkli, duyusal feedback (TTS + haptik + konfeti)
 *
 * Sahne kompozisyonu:
 *   ZON 1 (merkez)  → Hayvan çayırı (6 hayvan)
 *   ZON 2 (doğu)    → Sebze bahçesi (3 sebze yatağı)
 *   ZON 3 (batı)    → Meyve bahçesi (3 meyve ağacı)
 *   ZON 4 (kuzey)   → Çiftçi evi (baca + duman) + Kev NPC
 *
 * Ortam: gökyüzü, sis, güneş, sallanan bulutlar, uçan kuşlar.
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
  {
    id: "m1",
    zone: "animals",
    emoji: "🐮",
    titleKu: "Heywanan bibîne",
    titleTr: "3 hayvana dokun",
    hintTr: "Çayırdaki hayvanları say",
    target: 3,
    progress: 0,
    xpReward: 15,
    done: false,
  },
  {
    id: "m2",
    zone: "fruits",
    emoji: "🍎",
    titleKu: "Mêwe bicive",
    titleTr: "Meyveleri topla",
    hintTr: "Batı bahçesindeki ağaçlara dokun",
    target: 3,
    progress: 0,
    xpReward: 20,
    done: false,
  },
  {
    id: "m3",
    zone: "vegetables",
    emoji: "🥕",
    titleKu: "Sebze bibîne",
    titleTr: "Sebzeleri tanı",
    hintTr: "Doğu bahçesindeki sebzelere dokun",
    target: 3,
    progress: 0,
    xpReward: 20,
    done: false,
  },
  {
    id: "m4",
    zone: "house",
    emoji: "🏡",
    titleKu: "Bi Kev re biaxive",
    titleTr: "Kev'le konuş",
    hintTr: "Çiftçi evine git, Kev seni bekliyor",
    target: 1,
    progress: 0,
    xpReward: 25,
    done: false,
  },
];

// =====================================================================
//  YARDIMCI 3D BİLEŞENLER
// =====================================================================

/** Tıklanabilir 3D hayvan (küre vücut + kafa + göz + kulak + zıplama) */
function Animal3D({
  position, color, word, onTap, idx,
}: {
  position: [number, number, number];
  color: string;
  word: KidsWord;
  onTap: (word: KidsWord) => void;
  idx: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    // Yumuşak zıplama (her hayvan farklı faz)
    ref.current.position.y = position[1] + Math.sin(t * 2 + idx * 1.3) * 0.18;
    // Hafif yana sallanma (otlama hissi)
    ref.current.rotation.y = Math.sin(t * 0.6 + idx) * 0.4;
    ref.current.position.x = position[0] + Math.cos(t * 0.4 + idx * 2) * 0.08;
  });

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
      {/* Vücut */}
      <mesh castShadow position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Beyaz noktalar (inek deseni gibi) */}
      <mesh position={[0.3, 0.1, 0.35]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[-0.25, -0.1, 0.35]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      {/* Kafa */}
      <mesh castShadow position={[0, 0.55, 0.22]}>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      {/* Burun rengi */}
      <mesh position={[0, 0.5, 0.5]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#FF7B6F" />
      </mesh>
      {/* Gözler */}
      <mesh position={[-0.12, 0.65, 0.45]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[0.12, 0.65, 0.45]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      {/* Kulaklar */}
      <mesh position={[-0.24, 0.82, 0.1]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.1, 0.25, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.24, 0.82, 0.1]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[0.1, 0.25, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

/** Meyve ağacı — gövde + 3 yaprak konisi + 3-5 meyve */
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
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.7 + position[0]) * 0.05;
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
      scale={hovered && !harvested ? 1.08 : 1}
    >
      {/* Gövde */}
      <mesh castShadow position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.18, 0.25, 1.2, 12]} />
        <meshStandardMaterial color="#6B4226" roughness={0.9} />
      </mesh>
      {/* Yapraklar — 3 kademe koni */}
      <mesh castShadow position={[0, 1.5, 0]}>
        <coneGeometry args={[0.75, 0.9, 14]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 2.0, 0]}>
        <coneGeometry args={[0.6, 0.8, 14]} />
        <meshStandardMaterial color="#43A047" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 2.4, 0]}>
        <coneGeometry args={[0.4, 0.6, 14]} />
        <meshStandardMaterial color="#66BB6A" roughness={0.7} />
      </mesh>
      {/* Meyveler — sadece toplanmadıysa görün */}
      {!harvested && (
        <>
          <mesh position={[0.4, 1.4, 0.2]}>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial color={fruitColor} emissive={fruitColor} emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[-0.45, 1.6, 0.1]}>
            <sphereGeometry args={[0.13, 12, 12]} />
            <meshStandardMaterial color={fruitColor} emissive={fruitColor} emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[0.1, 1.8, 0.4]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color={fruitColor} emissive={fruitColor} emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[-0.2, 1.3, -0.3]}>
            <sphereGeometry args={[0.13, 12, 12]} />
            <meshStandardMaterial color={fruitColor} emissive={fruitColor} emissiveIntensity={0.2} />
          </mesh>
        </>
      )}
    </group>
  );
}

/** Sebze yatağı — kahve toprak küp + üstte yeşil yapraklar */
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
      // Sebze hafifçe büyür-küçülür (yaşıyor hissi)
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
      {/* Toprak yatağı */}
      <mesh receiveShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[1.2, 0.2, 1.2]} />
        <meshStandardMaterial color="#5D4037" roughness={0.95} />
      </mesh>
      {!harvested && (
        <>
          {/* Yapraklar */}
          <mesh castShadow position={[-0.3, 0.4, 0]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#2E7D32" />
          </mesh>
          <mesh castShadow position={[0.3, 0.4, 0]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#388E3C" />
          </mesh>
          <mesh castShadow position={[0, 0.4, -0.3]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#43A047" />
          </mesh>
          {/* Sebze (renkli küre — havuç/domates) */}
          <mesh castShadow position={[0, 0.55, 0.2]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
          </mesh>
        </>
      )}
    </group>
  );
}

/** Çiftçi evi — kutu + üçgen çatı + baca + kapı */
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
      {/* Ana gövde */}
      <mesh castShadow position={[0, 0.75, 0]}>
        <boxGeometry args={[2, 1.5, 1.6]} />
        <meshStandardMaterial color="#FFE0B2" roughness={0.85} />
      </mesh>
      {/* Çatı */}
      <mesh castShadow position={[0, 1.85, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.4, 1, 4]} />
        <meshStandardMaterial color="#C62828" roughness={0.7} />
      </mesh>
      {/* Kapı */}
      <mesh position={[0, 0.45, 0.81]}>
        <boxGeometry args={[0.4, 0.9, 0.05]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
      {/* Pencere */}
      <mesh position={[-0.6, 1.0, 0.81]}>
        <boxGeometry args={[0.35, 0.35, 0.05]} />
        <meshStandardMaterial color="#90CAF9" emissive="#FFEB3B" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.6, 1.0, 0.81]}>
        <boxGeometry args={[0.35, 0.35, 0.05]} />
        <meshStandardMaterial color="#90CAF9" emissive="#FFEB3B" emissiveIntensity={0.3} />
      </mesh>
      {/* Baca */}
      <mesh castShadow position={[0.5, 2.3, 0]}>
        <boxGeometry args={[0.25, 0.6, 0.25]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
    </group>
  );
}

/** Baca dumanı — yukarı yükselen + saydamlaşan küre dizisi */
function ChimneySmoke({ origin }: { origin: [number, number, number] }) {
  const refs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.forEach((r, i) => {
      if (!r.current) return;
      const phase = (t * 0.6 + i * 0.5) % 2;
      r.current.position.y = origin[1] + phase * 1.5;
      r.current.position.x = origin[0] + Math.sin(t + i) * 0.15;
      r.current.scale.setScalar(0.3 + phase * 0.4);
      const mat = r.current.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.max(0, 0.7 - phase * 0.35);
    });
  });
  return (
    <>
      {refs.map((r, i) => (
        <mesh key={i} ref={r} position={origin}>
          <sphereGeometry args={[0.2, 10, 10]} />
          <meshStandardMaterial color="#E0E0E0" transparent opacity={0.7} />
        </mesh>
      ))}
    </>
  );
}

/** Kev (çiftçi NPC) — küçük insan figürü, evin önünde */
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
      // El sallama
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
      {/* Bacaklar (mavi pantolon) */}
      <mesh castShadow position={[-0.12, 0.25, 0]}>
        <boxGeometry args={[0.16, 0.5, 0.16]} />
        <meshStandardMaterial color="#1565C0" />
      </mesh>
      <mesh castShadow position={[0.12, 0.25, 0]}>
        <boxGeometry args={[0.16, 0.5, 0.16]} />
        <meshStandardMaterial color="#1565C0" />
      </mesh>
      {/* Vücut (sarı tişört) */}
      <mesh castShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[0.4, 0.45, 0.25]} />
        <meshStandardMaterial color="#FFC107" />
      </mesh>
      {/* Kafa */}
      <mesh castShadow position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#FFCCBC" />
      </mesh>
      {/* Şapka (saman) */}
      <mesh castShadow position={[0, 1.22, 0]}>
        <coneGeometry args={[0.28, 0.18, 12]} />
        <meshStandardMaterial color="#D7B377" />
      </mesh>
      <mesh castShadow position={[0, 1.18, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.04, 16]} />
        <meshStandardMaterial color="#D7B377" />
      </mesh>
      {/* Gözler */}
      <mesh position={[-0.06, 1.07, 0.16]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[0.06, 1.07, 0.16]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      {/* Kollar — sağ kol el sallıyor */}
      <mesh castShadow position={[-0.24, 0.7, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#FFC107" />
      </mesh>
      <mesh
        ref={armRef}
        castShadow
        position={[0.28, 0.85, 0]}
      >
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#FFC107" />
      </mesh>
    </group>
  );
}

/** Çit — perimeter */
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
        <mesh key={i} position={[p[0], 0.4, p[2]]} castShadow>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color="#5D4037" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/** Bulut — hareket eden 4-küre yığını */
function Cloud3D({ seed, height }: { seed: number; height: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.15 + seed;
    // Yavaş gökyüzü turu
    ref.current.position.x = Math.cos(t) * 8;
    ref.current.position.z = Math.sin(t) * 8;
    ref.current.position.y = height + Math.sin(t * 2) * 0.2;
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.7, 12, 12]} />
        <meshStandardMaterial color="#fff" transparent opacity={0.95} />
      </mesh>
      <mesh position={[0.6, 0.1, 0]}>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshStandardMaterial color="#fff" transparent opacity={0.95} />
      </mesh>
      <mesh position={[-0.6, 0.1, 0]}>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshStandardMaterial color="#fff" transparent opacity={0.95} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.45, 12, 12]} />
        <meshStandardMaterial color="#fff" transparent opacity={0.95} />
      </mesh>
    </group>
  );
}

/** Kuş sürüsü — gökyüzünde uçan üçgenler */
function BirdFlock() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.2;
    ref.current.position.y = 5 + Math.sin(t * 0.5) * 0.5;
  });
  // 5 kuş, sıralı uçuş
  const birds = Array.from({ length: 5 }).map((_, i) => {
    const angle = (i / 5) * Math.PI * 0.4 - Math.PI * 0.2;
    return [Math.sin(angle) * 4, i * 0.1, Math.cos(angle) * 4] as [number, number, number];
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
    // Kanat çırpış (rotasyon ile)
    ref.current.children.forEach((c, i) => {
      if (i === 1) c.rotation.z = Math.sin(t * 8 + idx) * 0.6;
      if (i === 2) c.rotation.z = -Math.sin(t * 8 + idx) * 0.6;
    });
  });
  return (
    <group ref={ref} position={position} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#37474F" />
      </mesh>
      <mesh position={[0, 0, 0.15]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.02, 0.04, 0.3]} />
        <meshStandardMaterial color="#263238" />
      </mesh>
      <mesh position={[0, 0, -0.15]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.02, 0.04, 0.3]} />
        <meshStandardMaterial color="#263238" />
      </mesh>
    </group>
  );
}

/** Güneş — sarı parlayan küre, üstten yörünge */
function Sun3D() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.05;
    ref.current.position.x = Math.cos(t) * 12;
    ref.current.position.y = 6 + Math.sin(t) * 2;
    ref.current.position.z = Math.sin(t) * 12;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.8, 24, 24]} />
      <meshStandardMaterial color="#FFEB3B" emissive="#FFEB3B" emissiveIntensity={1.2} />
    </mesh>
  );
}

/** Kamera — sinematik yörünge + aktif bölge zoomu */
function CameraOrbit({ focusZone }: { focusZone: ZoneKey | null }) {
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.10;

    // Bölge merkezleri
    let cx = 0, cz = 0, cy = 4.5;
    let r = 9;
    if (focusZone === "fruits")     { cx = -3.5; cz = 0; r = 7; cy = 3.5; }
    if (focusZone === "vegetables") { cx = 3.5; cz = 0; r = 7; cy = 3.5; }
    if (focusZone === "house")      { cx = 0; cz = -4; r = 7; cy = 3.5; }
    if (focusZone === "animals")    { cx = 0; cz = 0; r = 6; cy = 4; }

    state.camera.position.x = cx + Math.cos(t) * r;
    state.camera.position.z = cz + Math.sin(t) * r;
    state.camera.position.y = cy;
    state.camera.lookAt(cx, 0.5, cz);
  });
  return null;
}

// =====================================================================
//  GİRİŞ SPLASHI — "Çiftliğe giriliyor..."
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
        <Text style={splashStyles.loadingText}>Çiftliğe giriliyor...</Text>
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

  const activeMission = missions.find((m) => m.id === activeMissionId);
  const focusZone: ZoneKey | null = activeMission?.done ? null : (activeMission?.zone ?? null);

  // Kategori → 6 hayvan üret
  const sceneAnimals = useMemo(() => {
    const animalCat = category.words.slice(0, 6);
    const colors = ["#F39C12", "#E91E63", "#9B59B6", "#3498DB", "#27AE60", "#E74C3C"];
    return animalCat.map((w, i) => {
      const angle = (i / 6) * Math.PI * 2;
      const r = 2.2;
      return {
        word: w,
        position: [Math.cos(angle) * r, 0.5, Math.sin(angle) * r] as [number, number, number],
        color: colors[i % colors.length],
      };
    });
  }, [category]);

  // Meyve ağaçları (batı, x negatif)
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

  // Sebzeler (doğu, x pozitif)
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

  // === MISSION YARDIMCILARI ===
  const updateMission = (zone: ZoneKey) => {
    setMissions((ms) => {
      const next = ms.map((m) => {
        if (m.zone !== zone || m.done) return m;
        const np = Math.min(m.target, m.progress + 1);
        const done = np >= m.target;
        if (done) {
          // Görev tamamlandı!
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
      // Sonraki aktif görevi otomatik seç
      const stillActive = next.find((m) => m.id === activeMissionId && !m.done);
      if (!stillActive) {
        const nextMission = next.find((m) => !m.done);
        if (nextMission) setActiveMissionId(nextMission.id);
      }
      return next;
    });
  };

  // === TIKLAMA HANDLER'LARI ===
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

  // ====== LOADING SPLASH ======
  if (phase === "loading") {
    return <GameEntrySplash onDone={() => setPhase("playing")} />;
  }

  // ====== ANA OYUN ======
  return (
    <View style={styles.root}>
      {/* === 3D CANVAS === */}
      <Canvas
        shadows
        camera={{ position: [0, 5, 9], fov: 55 }}
        style={StyleSheet.absoluteFillObject}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color("#87CEEB");
          scene.fog = new THREE.Fog("#A8D8F0", 10, 25);
        }}
      >
        <Suspense fallback={null}>
          {/* === IŞIKLAR === */}
          <ambientLight intensity={0.55} color="#FFF8E1" />
          <directionalLight
            castShadow
            position={[6, 10, 4]}
            intensity={1.3}
            color="#FFFAF0"
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={25}
            shadow-camera-left={-12}
            shadow-camera-right={12}
            shadow-camera-top={12}
            shadow-camera-bottom={-12}
          />
          <hemisphereLight args={["#87CEEB", "#A4D65E", 0.4]} />
          <Sun3D />

          {/* === ZEMİN === */}
          {/* Ana çim */}
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#7CB342" roughness={0.95} />
          </mesh>
          {/* Bölge işaretçileri (renkli alanlar) */}
          {/* Meyve bölgesi (batı) */}
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[-4, 0.01, 0]}>
            <planeGeometry args={[3.5, 6]} />
            <meshStandardMaterial color="#9CCC65" roughness={0.9} />
          </mesh>
          {/* Sebze bölgesi (doğu) */}
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[4.5, 0.01, 0]}>
            <planeGeometry args={[3.5, 6]} />
            <meshStandardMaterial color="#A1887F" roughness={0.95} />
          </mesh>
          {/* Yol — kıvrımlı kahve ızgara */}
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -3]}>
            <planeGeometry args={[1.5, 4]} />
            <meshStandardMaterial color="#BCAAA4" roughness={0.95} />
          </mesh>

          {/* === ÇİT === */}
          <Fence3D />

          {/* === HAYVANLAR (merkez) === */}
          {sceneAnimals.map((a, i) => (
            <Animal3D
              key={`a-${i}`}
              position={a.position}
              color={a.color}
              word={a.word}
              idx={i}
              onTap={handleAnimalTap}
            />
          ))}

          {/* === MEYVE AĞAÇLARI (batı) === */}
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

          {/* === SEBZE YATAKLARI (doğu) === */}
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

          {/* === EV + ÇİFTÇİ KEV === */}
          <Farmhouse3D position={[0, 0, -5]} onTap={handleHouseTap} />
          <ChimneySmoke origin={[0.5, 2.7, -5]} />
          <FarmerKev position={[1.6, 0, -3.8]} onTap={handleKevTap} />

          {/* === GÖKYÜZÜ DEKORU === */}
          <Cloud3D seed={0} height={5.2} />
          <Cloud3D seed={2.1} height={5.8} />
          <Cloud3D seed={4.5} height={5.4} />
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

      {/* === GÖREV PANELİ (sağda dikey) === */}
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

      {/* === KEV NPC DİYALOG === */}
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

      {/* === KONFETI === */}
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
  root: {
    flex: 1,
    backgroundColor: "#1A237E",
  },
  skyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(33, 150, 243, 0.25)",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.huge,
  },
  bigSun: {
    fontSize: 84,
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPO.hero,
    color: "#FFF",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  subtitle: {
    ...TYPO.h3,
    color: "#FFD54F",
    textAlign: "center",
    marginTop: 4,
    fontStyle: "italic",
  },
  barTrack: {
    width: "100%",
    height: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: SPACING.huge,
  },
  barFill: {
    height: "100%",
    backgroundColor: "#FFD54F",
    borderRadius: 999,
  },
  loadingText: {
    ...TYPO.body,
    color: "#FFF",
    marginTop: SPACING.md,
    letterSpacing: 1,
  },
  iconRow: {
    flexDirection: "row",
    gap: SPACING.lg,
    marginTop: SPACING.xl,
  },
  icon: { fontSize: 36 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#87CEEB" },

  hud: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.md,
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
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  hudSub: {
    ...TYPO.caption, color: "rgba(255,255,255,0.95)",
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  hudScore: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: 14,
    ...SHADOW("#000", "sm"),
  },
  hudScoreText: { ...TYPO.h3, color: KIDS_THEME.yellowDark },

  // === Aktif görev rozeti (üstte) ===
  activeQuestBadge: {
    position: "absolute",
    top: 110,
    left: SPACING.lg,
    right: 80,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: "rgba(255,255,255,0.97)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: KIDS_THEME.primary,
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
  questBarFill: {
    height: "100%", backgroundColor: KIDS_THEME.green, borderRadius: 999,
  },
  questBadgeProgress: {
    backgroundColor: KIDS_THEME.green,
    paddingHorizontal: SPACING.sm, paddingVertical: 2,
    borderRadius: 10,
  },
  questBadgeProgressText: { ...TYPO.body, color: "#fff", fontSize: 12 },

  // === Yan görev paneli ===
  questPanel: {
    position: "absolute",
    right: SPACING.md,
    top: 200,
    width: 158,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    gap: 6,
    ...SHADOW("#000", "md"),
  },
  questPanelTitle: { ...TYPO.h3, color: KIDS_THEME.ink, marginBottom: 4 },
  questItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: "transparent",
    backgroundColor: KIDS_THEME.bgSoft,
  },
  questItemTitle: { ...TYPO.body, color: KIDS_THEME.ink, fontSize: 12 },
  questItemSub: { ...TYPO.caption, color: KIDS_THEME.smoke, fontSize: 10 },

  // === Tıklanan kelime balonu ===
  tapBubble: {
    position: "absolute",
    bottom: 160, alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#fff",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 3, borderColor: KIDS_THEME.primary,
  },
  tapBubbleKu: { ...TYPO.h1 },
  tapBubbleTr: { ...TYPO.body, color: KIDS_THEME.smoke, marginTop: 2 },

  // === Görev tamamlandı toast ===
  completeToast: {
    position: "absolute",
    top: SH * 0.35, alignSelf: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.xl,
    borderRadius: RADIUS.xl,
    alignItems: "center",
    gap: 8,
    borderWidth: 3,
    borderColor: KIDS_THEME.green,
  },
  completeToastTitle: { ...TYPO.h1, color: KIDS_THEME.greenDark },
  completeToastKu: { ...TYPO.body, color: KIDS_THEME.smoke, fontStyle: "italic" },
  completeToastBadge: {
    backgroundColor: KIDS_THEME.yellow,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: 999,
    marginTop: 8,
  },
  completeToastBadgeText: { ...TYPO.button, color: KIDS_THEME.ink },

  // === NPC DIYALOG ===
  npcOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: SPACING.xl,
  },
  npcCard: {
    backgroundColor: "#FFF8E1",
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xxl,
    borderRadius: RADIUS.xl,
    alignItems: "center",
    borderWidth: 3, borderColor: KIDS_THEME.yellowDark,
    width: "100%",
    maxWidth: 360,
  },
  npcAvatar: {
    width: 80, height: 80, borderRadius: 999,
    backgroundColor: KIDS_THEME.yellowSoft,
    alignItems: "center", justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  npcName: { ...TYPO.h2, color: KIDS_THEME.yellowDark, marginBottom: SPACING.md },
  npcDialogTr: {
    ...TYPO.body, color: KIDS_THEME.ink,
    textAlign: "center", marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  npcDialogKu: {
    ...TYPO.body, color: KIDS_THEME.primary,
    textAlign: "center", fontStyle: "italic",
    marginBottom: SPACING.lg,
  },
  npcCloseBtn: {
    backgroundColor: KIDS_THEME.primary,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
    borderRadius: RADIUS.pill,
  },
  npcCloseBtnText: { ...TYPO.button, color: "#fff" },

  // === ALT BAR ===
  bottomBar: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.md,
    paddingBottom: 28,
    backgroundColor: "rgba(255,255,255,0.94)",
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  bottomStats: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  statBox: {
    backgroundColor: KIDS_THEME.bgSoft,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: "center",
    minWidth: 56,
  },
  statValue: { ...TYPO.h3, color: KIDS_THEME.ink },
  statLabel: { ...TYPO.caption, color: KIDS_THEME.smoke },
  bottomBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    alignItems: "center",
  },
  bottomBtnText: { ...TYPO.button, color: "#fff" },
});
