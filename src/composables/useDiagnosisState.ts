// src/composables/useDiagnosisState.ts
import { ref, computed } from 'vue';
import type { VocaloidSong } from '../type';
import { vocaloidSongs } from '../data/songs';

export function useDiagnosisState() {
  // 基本的な状態
  const currentStep = ref<'start' | 'diagnosis' | 'result'>('start');
  const answeredSongs = ref<number[]>([]);

  // ref() 関数を呼び出し
  // その関数に空の配列 [] を初期値として渡し
  // その配列は将来的に数値(number)だけを含むように型指定(<number[]>)されている
  const knownSongs = ref<number[]>([]);
  const currentSongIndex = ref(0);
  const totalQuestions = 49; // 診断で使用する曲数
  
  // 診断に使用する曲
  const diagnosisSongs = ref<VocaloidSong[]>([]);
  // 残りの曲のリスト
  const remainingSongs = ref<VocaloidSong[]>([]);
  // 計算された状態
  const answeredCount = computed(() => answeredSongs.value.length);
  
  // 現在の曲
  const currentSong = computed(() => 
    remainingSongs.value[currentSongIndex.value] || null
  );

  //「現在の曲」を自動計算するプロパティを作成します。
  //この計算は以下のルールで行われます：

  //もし「診断用の曲リストが空」または「現在の曲番号が曲リストの範囲外」の場合は、
  //安全のため、空のオブジェクトをボカロ曲として返します。
  //それ以外の場合は、
  //診断用の曲リストから、現在の曲番号に対応する曲を返します。
  
  // 時代ラベル
  const eraLabels = {
    dawn: '黎明期 (2007-2009)',
    firstBoom: '第一次ブーム (2010-2012)',
    golden: '全盛期 (2013-2015)',
    mature: '成熟期 (2016-2018)',
    modern: '現代 (2019-)'
  };
  
  return {
    // 状態をエクスポート
    currentStep,
    answeredSongs,
    knownSongs,
    currentSongIndex,
    totalQuestions,
    diagnosisSongs,
    remainingSongs,
    answeredCount,
    currentSong,
    eraLabels
  };
}
