/**
 * PRACTICE RUNNER — yetişkin pratik mini-oyuncusu.
 *
 * Path'teki LessonPlayer'ın kısaltılmış sürümü.
 *   • 10 random egzersiz çalıştırır
 *   • Heart sistemi yok (pratik amaçlı)
 *   • Her doğruda +XP
 *   • Bittiğinde özet ekranı
 */
import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { speakKurmanci, playFx } from "@/data/sound-fx";
import { Confetti } from "@/components/kids/confetti";
import { DUO, DUO_RADIUS, DUO_SPACING, DUO_TYPO } from "./duo-tokens";
import { DuoButton, DuoChip } from "./duo-button";
import type { Exercise } from "@/data/duo-content";
import { shuffle } from "@/data/duo-content";

type Props = {
  title: string;
  subTitle: string;
  exercises: Exercise[];
  themeColor: string;
  onClose: () => void;
  onComplete: (xp: number) => void;
};

export function PracticeRunner({ title, subTitle, exercises, themeColor, onClose, onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<"playing" | "done">("playing");
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const total = exercises.length;
  const ex = exercises[idx];

  const next = (ok: boolean) => {
    if (ok) { setScore((s) => s + 10); playFx("success"); setFeedback("correct"); }
    else { playFx("fail"); setFeedback("wrong"); }
    setTimeout(() => {
      setFeedback("idle");
      if (idx + 1 >= total) { setPhase("done"); onComplete(score + (ok ? 10 : 0)); }
      else setIdx((i) => i + 1);
    }, 900);
  };

  if (phase === "done") {
    return (
      <View style={s.completeWrap}>
        <Confetti visible count={40} duration={2000} />
        <Text style={s.completeBig}>🎯</Text>
        <Text style={[s.completeTitle, { color: themeColor }]}>{title} Bitti!</Text>
        <Text style={s.completeSub}>{score / 10}/{total} doğru</Text>
        <View style={[s.xpBadge, { backgroundColor: themeColor }]}>
          <Text style={s.xpBadgeTxt}>+{score} XP</Text>
        </View>
        <View style={{ width: "80%", marginTop: DUO_SPACING.xl }}>
          <DuoButton label="DEVAM" onPress={onClose} />
        </View>
      </View>
    );
  }

  if (!ex) return null;

  return (
    <View style={s.root}>
      <View style={[s.header, { backgroundColor: themeColor }]}>
        <Pressable onPress={onClose} hitSlop={10}>
          <Text style={s.x}>✕</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>{title}</Text>
          <Text style={s.headerSub}>{subTitle} · {idx + 1}/{total}</Text>
        </View>
        <View style={s.scoreBox}>
          <Text style={s.scoreTxt}>⚡ {score}</Text>
        </View>
      </View>

      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${(idx / total) * 100}%`, backgroundColor: themeColor }]} />
      </View>

      <View style={s.body}>
        <ExerciseView ex={ex} onResult={next} />
      </View>

      {feedback !== "idle" && (
        <View style={[s.feedback, { backgroundColor: feedback === "correct" ? "#D7FFB8" : "#FFDFE0" }]}>
          <Text style={[s.feedbackTxt, { color: feedback === "correct" ? DUO.treeGreen : DUO.cardinalDark }]}>
            {feedback === "correct" ? "✓ Doğru!" : "✕ Yanlış"}
          </Text>
        </View>
      )}
    </View>
  );
}

// =====================================================================
//  Egzersiz görünümleri (sadeleştirilmiş — pratik için)
// =====================================================================

function ExerciseView({ ex, onResult }: { ex: Exercise; onResult: (ok: boolean) => void }) {
  if (ex.type === "match-pairs") return <MatchEx ex={ex} onResult={onResult} />;
  if (ex.type === "select-image") return <SelectEx ex={ex} onResult={onResult} />;
  if (ex.type === "fill-blank") return <FillEx ex={ex} onResult={onResult} />;
  if (ex.type === "translate-tr-ku") return <TranslateEx ex={ex} dir="tr-ku" onResult={onResult} />;
  if (ex.type === "translate-ku-tr") return <TranslateEx ex={ex} dir="ku-tr" onResult={onResult} />;
  if (ex.type === "tap-audio") return <TapAudioEx ex={ex} onResult={onResult} />;
  // Yeni kelime intro
  if (ex.type === "new-word") {
    return (
      <View style={s.newWordWrap}>
        <Text style={s.newWordEmoji}>{ex.emoji}</Text>
        <Text style={s.newWordKu}>{ex.ku}</Text>
        <Text style={s.newWordTr}>{ex.tr}</Text>
        <Pressable onPress={() => speakKurmanci(ex.ku, "kid")} style={s.audioMini}>
          <Text style={{ fontSize: 22 }}>🔊</Text>
        </Pressable>
        <View style={{ width: "100%", marginTop: DUO_SPACING.xl }}>
          <DuoButton label="DEVAM" onPress={() => onResult(true)} />
        </View>
      </View>
    );
  }
  return null;
}

function MatchEx({ ex, onResult }: { ex: Extract<Exercise, { type: "match-pairs" }>; onResult: (ok: boolean) => void }) {
  const [leftSel, setLeftSel] = useState<number | null>(null);
  const [rightSel, setRightSel] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const left = useMemo(() => ex.pairs.map((p, i) => ({ ...p, origIdx: i })), [ex]);
  const right = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ ...p, origIdx: i }))), [ex]);

  const tap = (side: "l" | "r", origIdx: number) => {
    if (matched.has(origIdx)) return;
    if (side === "l") {
      setLeftSel(origIdx);
      if (rightSel !== null) {
        if (rightSel === origIdx) {
          const ns = new Set([...matched, origIdx]);
          setMatched(ns); setLeftSel(null); setRightSel(null);
          if (ns.size === ex.pairs.length) setTimeout(() => onResult(true), 400);
        } else { setLeftSel(null); setRightSel(null); }
      }
    } else {
      setRightSel(origIdx);
      if (leftSel !== null) {
        if (leftSel === origIdx) {
          const ns = new Set([...matched, origIdx]);
          setMatched(ns); setLeftSel(null); setRightSel(null);
          if (ns.size === ex.pairs.length) setTimeout(() => onResult(true), 400);
        } else { setLeftSel(null); setRightSel(null); }
      }
    }
  };

  return (
    <View>
      <Text style={s.exTitle}>Eşleştir</Text>
      <View style={{ flexDirection: "row", gap: DUO_SPACING.md, marginTop: DUO_SPACING.md }}>
        <View style={{ flex: 1, gap: DUO_SPACING.sm }}>
          {left.map((it) => (
            <DuoChip
              key={it.origIdx}
              label={it.ku}
              onPress={() => tap("l", it.origIdx)}
              selected={leftSel === it.origIdx}
              correct={matched.has(it.origIdx)}
              disabled={matched.has(it.origIdx)}
            />
          ))}
        </View>
        <View style={{ flex: 1, gap: DUO_SPACING.sm }}>
          {right.map((it) => (
            <DuoChip
              key={`r-${it.origIdx}`}
              label={it.tr}
              onPress={() => tap("r", it.origIdx)}
              selected={rightSel === it.origIdx}
              correct={matched.has(it.origIdx)}
              disabled={matched.has(it.origIdx)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function SelectEx({ ex, onResult }: { ex: Extract<Exercise, { type: "select-image" }>; onResult: (ok: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const opts = useMemo(() => shuffle(ex.options.map((o, i) => ({ ...o, origIdx: i }))), [ex]);

  const pick = (origIdx: number) => {
    if (picked !== null) return;
    setPicked(origIdx);
    speakKurmanci(ex.ku, "kid");
    setTimeout(() => onResult(origIdx === ex.correctIdx), 700);
  };

  return (
    <View>
      <Text style={s.exTitle}>Hangisi "{ex.ku}"?</Text>
      <Pressable onPress={() => speakKurmanci(ex.ku, "kid")} style={s.bigAudio}>
        <Text style={{ fontSize: 28 }}>🔊 {ex.ku}</Text>
      </Pressable>
      <View style={s.gridWrap}>
        {opts.map((o) => {
          const isPicked = picked === o.origIdx;
          const isCorrect = picked !== null && o.origIdx === ex.correctIdx;
          let bg = DUO.snow, border = DUO.swan, bb = DUO.swan;
          if (isCorrect)                  { bg = "#D7FFB8"; border = DUO.green; bb = DUO.green; }
          else if (isPicked && !isCorrect){ bg = "#FFDFE0"; border = DUO.cardinal; bb = DUO.cardinal; }
          return (
            <Pressable
              key={o.origIdx}
              onPress={() => pick(o.origIdx)}
              style={({ pressed }) => [
                s.gridTile,
                { backgroundColor: bg, borderColor: border, borderBottomColor: bb, borderBottomWidth: pressed ? 2 : 4 },
              ]}
            >
              <Text style={{ fontSize: 56 }}>{o.emoji}</Text>
              <Text style={s.gridLabel}>{o.tr}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function FillEx({ ex, onResult }: { ex: Extract<Exercise, { type: "fill-blank" }>; onResult: (ok: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const opts = useMemo(() => shuffle(ex.options.map((w, i) => ({ word: w, origIdx: i }))), [ex]);

  const pick = (origIdx: number) => {
    if (picked !== null) return;
    setPicked(origIdx);
    setTimeout(() => onResult(origIdx === ex.correctIdx), 700);
  };

  return (
    <View>
      <Text style={s.exTitle}>Boşluğu doldur</Text>
      <Text style={s.exHint}>"{ex.trHint}"</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", paddingHorizontal: DUO_SPACING.md }}>
        <Text style={s.sentencePart}>{ex.sentenceParts[0]}</Text>
        <View style={s.blankSlot}>
          <Text style={[s.sentencePart, { color: picked !== null ? DUO.macawDark : DUO.swan }]}>
            {picked !== null ? ex.options[picked] : "____"}
          </Text>
        </View>
        <Text style={s.sentencePart}>{ex.sentenceParts[1]}</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: DUO_SPACING.sm, marginTop: DUO_SPACING.lg, paddingHorizontal: DUO_SPACING.md }}>
        {opts.map((o) => {
          const isPicked = picked === o.origIdx;
          const isCorrect = picked !== null && o.origIdx === ex.correctIdx;
          return (
            <DuoChip
              key={o.origIdx}
              label={o.word}
              onPress={() => pick(o.origIdx)}
              correct={isCorrect}
              wrong={isPicked && !isCorrect}
              disabled={picked !== null && !isPicked}
            />
          );
        })}
      </View>
    </View>
  );
}

function TranslateEx({
  ex, dir, onResult,
}: {
  ex: Extract<Exercise, { type: "translate-ku-tr" | "translate-tr-ku" }>;
  dir: "ku-tr" | "tr-ku";
  onResult: (ok: boolean) => void;
}) {
  const prompt = dir === "ku-tr" ? "Türkçeye çevir" : "Kürtçeye çevir";
  const hint = dir === "ku-tr" ? ex.sentenceKu : ex.sentenceTr;
  const correct = dir === "ku-tr" ? ex.sentenceTr : ex.sentenceKu;

  const [picked, setPicked] = useState<string[]>([]);
  const [bank, setBank] = useState<string[]>(() => shuffle(ex.words));
  const [done, setDone] = useState(false);

  const tapBank = (w: string, i: number) => {
    if (done) return;
    setPicked((p) => [...p, w]);
    setBank((b) => b.filter((_, idx) => idx !== i));
  };
  const tapPicked = (w: string, i: number) => {
    if (done) return;
    setBank((b) => [...b, w]);
    setPicked((p) => p.filter((_, idx) => idx !== i));
  };

  const check = () => {
    setDone(true);
    const userAns = picked.join(" ").replace(/[.,!?]/g, "").toLowerCase().trim();
    const corr = correct.replace(/[.,!?]/g, "").toLowerCase().trim();
    onResult(userAns === corr);
  };

  return (
    <View>
      <Text style={s.exTitle}>{prompt}</Text>
      <Text style={s.exHint}>"{hint}"</Text>
      <View style={s.pickedRow}>
        {picked.length === 0
          ? <Text style={s.empty}>Aşağıdan kelimelere dokun...</Text>
          : (
            <View style={s.chipsWrap}>
              {picked.map((w, i) => (
                <DuoChip key={`p-${i}`} label={w} onPress={() => tapPicked(w, i)} />
              ))}
            </View>
          )}
      </View>
      <View style={[s.bankWrap, { borderTopWidth: 1, borderTopColor: DUO.swan }]}>
        {bank.map((w, i) => (
          <DuoChip key={`b-${i}`} label={w} onPress={() => tapBank(w, i)} />
        ))}
      </View>
      <View style={{ paddingHorizontal: DUO_SPACING.md, marginTop: DUO_SPACING.lg }}>
        <DuoButton
          label="KONTROL ET"
          variant={picked.length === 0 ? "outline" : "green"}
          disabled={picked.length === 0}
          onPress={check}
        />
      </View>
    </View>
  );
}

function TapAudioEx({ ex, onResult }: { ex: Extract<Exercise, { type: "tap-audio" }>; onResult: (ok: boolean) => void }) {
  // tap-audio bir tür translate — kelimeleri sırala
  const [picked, setPicked] = useState<string[]>([]);
  const [bank, setBank] = useState<string[]>(() => shuffle(ex.words));
  const [done, setDone] = useState(false);

  return (
    <View>
      <Text style={s.exTitle}>Duyduğunu yaz</Text>
      <Pressable onPress={() => speakKurmanci(ex.audioKu, "kid")} style={s.bigAudio}>
        <Text style={{ fontSize: 32 }}>🔊</Text>
      </Pressable>
      {ex.trHint && <Text style={s.exHint}>"{ex.trHint}"</Text>}
      <View style={s.pickedRow}>
        {picked.length === 0
          ? <Text style={s.empty}>Aşağıdan kelimelere dokun...</Text>
          : (
            <View style={s.chipsWrap}>
              {picked.map((w, i) => (
                <DuoChip key={`p-${i}`} label={w} onPress={() => {
                  if (done) return;
                  setBank((b) => [...b, w]);
                  setPicked((p) => p.filter((_, idx) => idx !== i));
                }} />
              ))}
            </View>
          )}
      </View>
      <View style={[s.bankWrap, { borderTopWidth: 1, borderTopColor: DUO.swan }]}>
        {bank.map((w, i) => (
          <DuoChip key={`b-${i}`} label={w} onPress={() => {
            if (done) return;
            setPicked((p) => [...p, w]);
            setBank((b) => b.filter((_, idx) => idx !== i));
          }} />
        ))}
      </View>
      <View style={{ paddingHorizontal: DUO_SPACING.md, marginTop: DUO_SPACING.lg }}>
        <DuoButton
          label="KONTROL ET"
          variant={picked.length === 0 ? "outline" : "green"}
          disabled={picked.length === 0}
          onPress={() => {
            setDone(true);
            const u = picked.join(" ").replace(/[.,!?]/g, "").toLowerCase().trim();
            const c = ex.words.join(" ").replace(/[.,!?]/g, "").toLowerCase().trim();
            onResult(u === c);
          }}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DUO.snow },
  header: {
    flexDirection: "row", alignItems: "center", gap: DUO_SPACING.md,
    paddingTop: 50, paddingHorizontal: DUO_SPACING.lg, paddingBottom: DUO_SPACING.md,
  },
  x: { color: DUO.snow, fontSize: 26, fontFamily: "Fredoka_700Bold" },
  headerTitle: { ...DUO_TYPO.h2, color: DUO.snow },
  headerSub: { ...DUO_TYPO.caption, color: "rgba(255,255,255,0.85)" },
  scoreBox: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: DUO_SPACING.md, paddingVertical: 4,
    borderRadius: 999,
  },
  scoreTxt: { color: DUO.snow, ...DUO_TYPO.body, fontSize: 14 },
  barTrack: { height: 8, backgroundColor: DUO.swan },
  barFill: { height: "100%" },
  body: { flex: 1, padding: DUO_SPACING.lg },

  feedback: { padding: DUO_SPACING.md, alignItems: "center" },
  feedbackTxt: { ...DUO_TYPO.h2 },

  exTitle: { ...DUO_TYPO.h1, color: DUO.eel, marginBottom: 6 },
  exHint: { ...DUO_TYPO.body, color: DUO.wolf, fontStyle: "italic", marginBottom: DUO_SPACING.md },
  bigAudio: {
    alignSelf: "flex-start",
    backgroundColor: DUO.macaw,
    paddingHorizontal: DUO_SPACING.lg, paddingVertical: 12,
    borderRadius: DUO_RADIUS.md,
    borderBottomWidth: 4, borderBottomColor: DUO.macawDark,
    marginBottom: DUO_SPACING.md,
  },

  gridWrap: { flexDirection: "row", flexWrap: "wrap", gap: DUO_SPACING.md, marginTop: DUO_SPACING.md },
  gridTile: {
    width: "47%", aspectRatio: 1,
    borderWidth: 2, borderRadius: DUO_RADIUS.lg,
    alignItems: "center", justifyContent: "center", gap: DUO_SPACING.sm,
  },
  gridLabel: { ...DUO_TYPO.body, color: DUO.eel },

  sentencePart: { ...DUO_TYPO.h2, color: DUO.eel },
  blankSlot: {
    minWidth: 70, paddingHorizontal: DUO_SPACING.sm, paddingVertical: 4,
    borderBottomWidth: 2, borderBottomColor: DUO.swan,
    alignItems: "center", justifyContent: "center", marginHorizontal: 4,
  },

  pickedRow: { minHeight: 80, paddingTop: DUO_SPACING.md, paddingBottom: DUO_SPACING.sm },
  empty: { ...DUO_TYPO.body, color: DUO.hare, textAlign: "center" },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: DUO_SPACING.sm, paddingHorizontal: DUO_SPACING.md },
  bankWrap: {
    flexDirection: "row", flexWrap: "wrap", gap: DUO_SPACING.sm,
    paddingTop: DUO_SPACING.md, paddingHorizontal: DUO_SPACING.md,
  },

  newWordWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: DUO_SPACING.xl },
  newWordEmoji: { fontSize: 96, marginBottom: DUO_SPACING.md },
  newWordKu: { ...DUO_TYPO.hero, color: DUO.eel, marginBottom: 4 },
  newWordTr: { ...DUO_TYPO.h3, color: DUO.wolf, marginBottom: DUO_SPACING.lg },
  audioMini: {
    backgroundColor: DUO.macaw, paddingHorizontal: DUO_SPACING.lg, paddingVertical: 8,
    borderRadius: DUO_RADIUS.pill,
  },

  completeWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: DUO_SPACING.xl, backgroundColor: DUO.snow },
  completeBig: { fontSize: 84, marginBottom: DUO_SPACING.md },
  completeTitle: { ...DUO_TYPO.hero, textAlign: "center" },
  completeSub: { ...DUO_TYPO.body, color: DUO.wolf, marginTop: 4, marginBottom: DUO_SPACING.xl },
  xpBadge: {
    paddingHorizontal: DUO_SPACING.xl, paddingVertical: DUO_SPACING.md,
    borderRadius: DUO_RADIUS.md,
  },
  xpBadgeTxt: { ...DUO_TYPO.hero, color: DUO.snow, fontSize: 28 },
});
