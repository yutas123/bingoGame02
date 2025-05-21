// src/composables/useDiagnosisLogic.ts
import type { Ref } from 'vue';
import type { VocaloidSong } from '../type';
import { vocaloidSongs } from '../data/songs';

export function useDiagnosisLogic(
  currentStep: Ref<'start' | 'diagnosis' | 'result'>,
  answeredSongs: Ref<number[]>,
  knownSongs: Ref<number[]>,
  currentSongIndex: Ref<number>,
  diagnosisSongs: Ref<VocaloidSong[]>,
  totalQuestions: number = 15
) {
  // 診断開始
  const startDiagnosis = () => {    
    // 診断用の曲をシャッフルして選択
    const shuffled = [...vocaloidSongs];
    // Fisher-Yatesシャッフルアルゴリズムを使用
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // 要素を入れ替え
    }
    diagnosisSongs.value = shuffled.slice(0, totalQuestions);
    
    // 状態のリセット（初期化）
    currentSongIndex.value = 0;
    answeredSongs.value = [];
    knownSongs.value = [];
    
    // 診断画面に移行
    currentStep.value = 'diagnosis';
  };
  
  // 診断のリセット
  const resetDiagnosis = () => {
    currentStep.value = 'start';
  };
  
  return {
    startDiagnosis,
    resetDiagnosis
  };
}
