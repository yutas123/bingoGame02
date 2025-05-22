// src/composables/useEffects.ts
import { ref } from 'vue';
import type { VocaloidSong } from '../type';
import { useAudioControl } from './useAudioControl';

export function useEffects() {
  // 音声制御の状態を取得
  const { isMuted } = useAudioControl('Effects');
  // エフェクト関連の状態
  const showKnowEffect = ref(false);
  const showDontKnowEffect = ref(false);
  const currentKnowComment = ref('');
  const currentSongForEffect = ref<VocaloidSong | null>(null);
  // VocaloidSong | null は、この変数が「VocaloidSong型のデータ」または「null」のどちらかを格納できることを示しています
  
  // 効果音
  const knowSound = ref(null as HTMLAudioElement | null);
  const dontKnowSound = ref(null as HTMLAudioElement | null);
  
  // 知ってる！コメントのリスト
  const knowComments = [
    'testText01',
    'testText02',
    'testText03',
    'testText04',
    'testText05',
    'testText06',
    'testText07'
  ];
  
  // 効果音の初期化
  const initSounds = () => {
    try {
      knowSound.value = new Audio('/sounds/know.mp3');
      dontKnowSound.value = new Audio('/sounds/dont-know.mp3');
    } catch (e) {
    }
  };
  
  // 「知ってる！」エフェクトの表示
  const displayKnowEffect = (song: VocaloidSong) => {
    
    // ランダムなコメントを選択
    currentKnowComment.value = knowComments[Math.floor(Math.random() * knowComments.length)];
    currentSongForEffect.value = song;
    
    // エフェクトを表示
    // showKnowEffect.value = true;
    
    // 効果音を再生（ミュート状態に応じて）
    if (knowSound.value && !isMuted.value) {
      knowSound.value.play().catch(err => {
        console.error('効果音再生エラー:', err);
      });
    }
    
    // エフェクトを一定時間後に非表示
    setTimeout(() => {
      showKnowEffect.value = false;
    }, 1000);
  };
  
  // 「知らない！」エフェクトの表示
  const displayDontKnowEffect = (song: VocaloidSong) => {
    currentSongForEffect.value = song;
        
    // エフェクトを表示
    // showDontKnowEffect.value = true;
    
    // 効果音を再生（ミュート状態に応じて）
    if (dontKnowSound.value && !isMuted.value) {
      dontKnowSound.value.play().catch(err => {
        console.error('効果音再生エラー:', err);
      });
    }
    
    // エフェクトを一定時間後に非表示
    setTimeout(() => {
      showDontKnowEffect.value = false;
    }, 1000);
  };
  
  return {
    showKnowEffect,
    showDontKnowEffect,
    currentKnowComment,
    currentSongForEffect,
    knowComments,
    initSounds,
    displayKnowEffect,
    displayDontKnowEffect
  };
}
