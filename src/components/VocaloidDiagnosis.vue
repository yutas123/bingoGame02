<template>
  <div class="ContentsWrapper vocalog-bg">  
    <!-- スタート画面 -->
    <div v-if="currentStep === 'start'" class="start-screen">
      <div class="shinyu-bg">
        <swiper
          :modules="[Autoplay]"
          :slides-per-view="1"
          :space-between="0"
          :loop="true"
          :autoplay="{
            delay: 0,
            disableOnInteraction: false,
            reverseDirection: false
          }"
          :speed="20000"
          class="title-swiper"
        >
          <swiper-slide v-for="n in 5" :key="n">
            <img src="/img/title_bg.svg" alt="Background" class="title-bg-img"/>
          </swiper-slide>
        </swiper>
      
        <swiper
          :modules="[Autoplay]"
          :slides-per-view="1"
          :space-between="0"
          :loop="true"
          :autoplay="{
            delay: 0,
            disableOnInteraction: false,
            reverseDirection: true
          }"
          :speed="20000"
          class="title-swiper"
        >
          <swiper-slide v-for="n in 5" :key="n">
            <img src="/img/title_bg.svg" alt="Background" class="title-bg-img"/>
          </swiper-slide>
        </swiper>
      

        <swiper
          :modules="[Autoplay]"
          :slides-per-view="1"
          :space-between="0"
          :loop="true"
          :autoplay="{
            delay: 0,
            disableOnInteraction: false,
            reverseDirection: false
          }"
          :speed="20000"
          class="title-swiper"
        >
          <swiper-slide v-for="n in 5" :key="n">
            <img src="/img/title_bg.svg" alt="Background" class="title-bg-img" />
          </swiper-slide>
        </swiper>
    
        <swiper
          :modules="[Autoplay]"
          :slides-per-view="1"
          :space-between="0"
          :loop="true"
          :autoplay="{
            delay: 0,
            disableOnInteraction: false,
            reverseDirection: true
          }"
          :speed="20000"
          class="title-swiper"
        >
          <swiper-slide v-for="n in 5" :key="n">
            <img src="/img/title_bg.svg" alt="Background" class="title-bg-img" />
          </swiper-slide>
        </swiper>
      </div>
      
      <div class="swipe-card-container">
        <!-- スワイプSVGを下に配置 -->
        <div class="swipe-animation">
          <Vue3Lottie
            :animationData="swipeAnimation"
            :height="220"
            :width="220"
            :loop="true"
            :autoPlay="true"
          />
        </div>
        
        <!-- カードを上に重ねて配置 -->
        <div class="card">
        </div>
      </div>
      
      <div class="percentage">{{ Math.round(loadingProgress) }}<span class="percent-symbol">%</span></div>
      <div class="percentage-underline-container">
        <div class="percentage-underline" :style="{ width: `${loadingProgress}%` }"></div>
      </div>
      
      <p class="start-description">
        ボカロ曲を「知ってる」か「知らない」か答えて、<br>あなたのタイプを診断しよう！
      </p>
      
      <button @click="() => { preloadedVideos.forEach(v => v.remove()); startDiagnosis(); }" class="start-btn">
        START
        <span class="arrow-icon">→</span>
      </button>
      
      <!-- 音声に関する注意書き -->
      <p class="audio-notice">
        ※このサイトは「音声」が流れます。<br>周りの環境や音量にご注意ください！
      </p>
      
      <!-- 音量ボタン（グローバル設定） -->
      <button @click="toggleMute" class="volume-btn" title="音声設定（全体に適用されます）">
        <img v-if="isMuted" src="/img/volume_off.svg" alt="ミュート" class="volume-icon">
        <img v-else src="/img/volume_on.svg" alt="音量オン" class="volume-icon">
        <span class="volume-tooltip">音量設定</span>
      </button>
    </div>
    
    <!-- 診断画面 -->
    <div v-else-if="currentStep === 'diagnosis'" class="diagnosis-screen">
      <div class="diagnosis-screen-header">
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${(answeredCount / totalQuestions) * 100}%` }"></div>
          </div>
          <div class="progress-text">{{ answeredCount }}/{{ totalQuestions }}曲</div>
          <!-- 音量ボタン（グローバル設定） -->
          <button @click="toggleMute" class="volume-btn" title="音声設定（全体に適用されます）">
            <img v-if="isMuted" src="/img/volume_off.svg" alt="ミュート" class="volume-icon">
            <img v-else src="/img/volume_on.svg" alt="音量オン" class="volume-icon">
            <span class="volume-tooltip">音量設定</span>
          </button>
        </div>
        
        <div class="swipe-indicators">
          <div class="swipe-left">
            <span class="indicator-icon">🙂‍↔️</span>
            <span class="indicator-text">知らない</span>
          </div>
          <div class="swipe-right">
            <span class="indicator-text">知ってる</span>
            <span class="indicator-icon">🙂‍↕️</span>
          </div>
        </div>
      </div>
      
      <div class="tinder-container">
        <div 
          class="tinder-card"
          v-for="(song, index) in visibleCards" 
          :key="song.id"
          :class="{ 'top-card': index === 0 }"
          :style="getCardStyle(index)"
          @mousedown="startDrag"
          @mousemove="onDrag"
          @mouseup="endDrag"
          @mouseleave="endDrag"
          @touchstart="startDrag"
          @touchmove="onDrag"
          @touchend="endDrag"
        >
        <video 
          class="thumbnail-video" 
          :ref="el => setVideoRef(el, index)"
          loop
          playsinline
          webkit-playsinline
          preload="auto"
          :poster="getVideoPath(song)"
          :style="{ visibility: index <= 2 ? 'visible' : 'hidden' }"
          :volume="0.1"
        >
        <source :src="`${getVideoPath(song)}#t=${song.startTime ?? 0.1}`" type="video/mp4">
        </video>
        <div class="song-info">
          <h2 class="song-title">{{ song.title }}</h2>
          <p class="song-producer">{{ song.producer }}</p>
          <p class="song-year">{{ song.year }}年</p>
        </div>
        </div>
      </div>
      
      <!-- 知ってる！エフェクト -->
      <div v-if="showKnowEffect" class="know-effect">
        <div class="effect-content">
          <div class="effect-stamp">知ってる！</div>
          <div class="effect-comment">{{ currentKnowComment }}</div>
        </div>
      </div>
      
      <!-- 知らない！エフェクト -->
      <div v-if="showDontKnowEffect" class="dont-know-effect">
        <div class="effect-content">
          <div class="effect-stamp">知らない！</div>
        </div>
      </div>
      
      <!-- 進捗コメント -->
      <div v-if="showProgressComment" class="progress-comment" :class="{ 'animating': isAnimating }">
        <div class="progress-comment-content">
          <div class="progress-comment-text">{{ currentProgressComment }}</div>
        </div>
      </div>
      
      
      <div class="padded-content">
        <div class="manual-buttons">
          <button type="button" @click="rejectCard" class="dont-know-btn">
            <span class="btn-icon">🙂‍↔️</span> 知らない！
          </button>
          <button type="button" @click="acceptCard" class="know-btn">
            知ってる！<span class="btn-icon">🙂‍↕️</span>
          </button>
        </div>
        <!-- デバッグ用ボタン -->
        <!-- <div class="debug-button-container">
          <button type="button" @click="debugAllKnown" class="debug-btn">
            デバッグ：全て知ってる
          </button>
        </div> -->
      </div>
    </div>
    
    <!-- 結果画面 -->
    <ResultScreen 
      v-else-if="currentStep === 'result'"
      :knownSongs="knownSongs"
      :totalQuestions="totalQuestions"
      :isMuted="isMuted"
      @toggleMute="toggleMute"
      @resetDiagnosis="resetDiagnosis"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import 'animate.css';
import { Vue3Lottie } from 'vue3-lottie';
import swipeAnimation from '../assets/lottie/swipe.json';
// Swiperのインポート
// @ts-ignore
import { Swiper, SwiperSlide } from 'swiper/vue';
// @ts-ignore
import { Autoplay } from 'swiper/modules';
// @ts-ignore
import 'swiper/css';

// 結果画面コンポーネントをインポート
import ResultScreen from './ResultScreen.vue';

// 型定義をインポート
import type { VocaloidSong } from '../type';
import { vocaloidSongs } from '../data/songs';

// composablesをインポート
import { useDiagnosisState } from '../composables/useDiagnosisState';
import { useDiagnosisLogic } from '../composables/useDiagnosisLogic';
import { useTinderCards } from '../composables/useTinderCards';
import { useEffects } from '../composables/useEffects';
import { useAudioControl } from '../composables/useAudioControl';
import { useProgressComments } from '../composables/useProgressComments';

// 状態を取得
const { 
  currentStep, 
  answeredSongs, 
  knownSongs, 
  currentSongIndex,
  diagnosisSongs,
  remainingSongs,
  answeredCount,
  totalQuestions,
  currentSong
} = useDiagnosisState();
// 分割代入で取得しているのは関数の「戻り値」ですが、
// 関数自体の「実行」は全てのコードを実行します


// 診断ロジック
const { 
  startDiagnosis, 
  resetDiagnosis 
} = useDiagnosisLogic(
  currentStep, 
  answeredSongs, 
  knownSongs, 
  currentSongIndex, 
  diagnosisSongs,
  totalQuestions
);

// エフェクト関連
const {
  showKnowEffect,
  showDontKnowEffect,
  currentKnowComment,
  initSounds,
  displayKnowEffect,
  displayDontKnowEffect
} = useEffects();

// 音声制御関連
const { toggleMute, isMuted } = useAudioControl('VocaloidDiagnosis');

// 進捗コメント関連
const {
  showProgressComment,
  currentProgressComment,
  isAnimating,
  displayProgressComment
} = useProgressComments();

// Tinderカード関連
const {
  visibleCards,
  getCardStyle,
  startDrag,
  onDrag,
  endDrag,
  rejectCard,
  acceptCard,
  setVideoRef,
  controlVideos
} = useTinderCards(
  currentStep, 
  answeredSongs, 
  knownSongs, 
  diagnosisSongs,
  remainingSongs,
  currentSongIndex,
  currentSong,
  totalQuestions,
  { displayKnowEffect, displayDontKnowEffect }
);

// 動画パスを取得する関数
const getVideoPath = (song: VocaloidSong) => {
  // 曲に動画パスが指定されている場合はそれを使用
  if (song.videoPath) {
    return `/movies/${song.videoPath}`;
  }
  
  // 指定がない場合は時代区分に基づいてデフォルト動画を割り当て
  switch (song.era) {
    case 'dawn':
    case 'boom':
      return '/movies/uchiage.mp4';
    case 'gold':
    case 'diserve':
      return '/movies/kyukura.mp4';
    case 'revival':
    case 'ai':
      return '/movies/goodbye.mp4';
    default:
      return '/movies/kyukura.mp4'; // フォールバック
  }
};

// 読み込み進捗を管理する変数
const loadingProgress = ref(0);

// 動画のプリロード用の配列
const preloadedVideos = ref<HTMLVideoElement[]>([]);

// 最初の3曲の動画をプリロードする関数
const preloadInitialVideos = () => {
  // 読み込み進捗を0にリセット
  loadingProgress.value = 0;
  
  // 既存のプリロード済み動画をクリア
  preloadedVideos.value.forEach(video => {
    video.remove();
  });
  preloadedVideos.value = [];

  // 最初の3曲を取得
  const initialSongs = vocaloidSongs.slice(0, 3);
  
  // 読み込み進捗の計算用
  const totalVideos = initialSongs.filter(song => song.videoPath).length;
  let loadedVideos = 0;
  
  // 各曲の動画をプリロード
  initialSongs.forEach((song) => {
    if (song.videoPath) {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.style.display = 'none';
      video.src = `/movies/${song.videoPath}#t=${song.startTime ?? 0.1}`;
      
      // ロード状態をログ出力
      video.addEventListener('loadstart', () => {
        console.log(`プリロード開始: ${song.title}`);
        // 読み込み開始時に少し進捗を進める
        loadingProgress.value += 5;
      });
      
      video.addEventListener('canplay', () => {
        console.log(`プリロード完了: ${song.title}`);
        // 動画が再生可能になったら進捗を更新
        loadedVideos++;
        // 各動画の読み込み完了で進捗を更新（最大95%まで）
        loadingProgress.value = Math.min(95, (loadedVideos / totalVideos) * 95);
        
        // すべての動画がロードされたら100%にする
        if (loadedVideos === totalVideos) {
          // 少し遅延を入れて100%にする（視覚効果のため）
          setTimeout(() => {
            loadingProgress.value = 100;
          }, 500);
        }
      });
      
      video.addEventListener('error', (e) => {
        console.error(`プリロードエラー: ${song.title}`, e);
        // エラー時も進捗を進める（ユーザー体験のため）
        loadedVideos++;
        loadingProgress.value = Math.min(95, (loadedVideos / totalVideos) * 95);
        
        // すべての動画の処理が完了したら100%にする
        if (loadedVideos === totalVideos) {
          setTimeout(() => {
            loadingProgress.value = 100;
          }, 500);
        }
      });

      // load()メソッドを呼び出してロードを開始
      video.load();
      
      // 配列に追加
      preloadedVideos.value.push(video);
      
      // bodyに追加（非表示）
      document.body.appendChild(video);
    }
  });
  
  // 動画がない場合や読み込みが遅い場合のフォールバック
  // 10秒後に強制的に100%にする
  setTimeout(() => {
    loadingProgress.value = 100;
  }, 10000);
};

// デバッグ用：全ての曲を「知ってる」としてマークし、結果画面に遷移する関数
// const debugAllKnown = () => {
//   // 全ての曲のIDを取得
//   const allSongIds = diagnosisSongs.value.map(song => song.id);
  
//   // 全ての曲を回答済みとしてマーク
//   answeredSongs.value = [...allSongIds];
  
//   // 全ての曲を「知ってる」としてマーク
//   knownSongs.value = [...allSongIds];
  
//   // 結果画面に遷移
//   currentStep.value = 'result';
// };

// 進捗コメントの監視
watch(() => answeredSongs.value.length, (newCount) => {
  // 診断中のみ進捗コメントを表示
  if (currentStep.value === 'diagnosis' && newCount > 0) {
    displayProgressComment(newCount);
  }
});

// ページロード時の処理
onMounted(() => {
  // 効果音の初期化
  initSounds();
  
  // 初期状態をスタート画面に設定
  currentStep.value = 'start';
  
  // 通常の処理
  // スタート画面で最初の3曲をプリロード
  if (currentStep.value === 'start') {
    preloadInitialVideos();
  }
  // 診断画面が表示されたら動画の再生制御を行う
  else if (currentStep.value === 'diagnosis') {
    controlVideos();
  }
});
</script>

<style scoped>
/* スタート画面の背景 */
.vocalog-bg {
  background-color: #FFF;
  position: relative;
}

/* 背景に薄く繰り返し表示されるSHINYUタイトル */
.shinyu-bg {
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 均等に配置 */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0; /* .start-screenの子要素内での最背面 */
  pointer-events: none;
  overflow: hidden;
  gap: 0; /* コンポーネント間の余白をなくす */
}

/* Swiperコンテナのスタイル */
.swiper-container {
  width: 100%;
}

/* Swiperスライダーのスタイル */
.title-swiper {
  width: 100%;
  /* height: calc(100vh / 4); */
  flex: 1 1 0%;
  margin: 0;
  padding: 0;
}

/* スライド内の画像のスタイル */
.title-bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* containからcoverに変更して、画像が全体を覆うようにする */
  margin: 0;
  padding: 0;
}

/* Swiperのナビゲーションとページネーションを非表示 */
:deep(.swiper-button-next),
:deep(.swiper-button-prev),
:deep(.swiper-pagination) {
  display: none !important;
}

/* Swiperのスライドスタイル */
:deep(.swiper-slide) {
  opacity: 1;
  z-index: 1;
  margin: 0;
  padding: 0;
}

/* Swiperのコンテナスタイル */
:deep(.swiper) {
  overflow: visible;
  margin: 0;
  padding: 0;
}

/* Swiperのラッパースタイル */
:deep(.swiper-wrapper) {
  transition-timing-function: linear !important;
  margin: 0;
  padding: 0;
}

/* キャラクター画像の背景円 */
.circle-bg {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: #FFCC00;
  z-index: 1; /* .shinyu-bgよりも前面 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* キャラクター画像 */
.start-image {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 50px auto 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1; /* .shinyu-bgよりも前面 */
}

.character-image {
  width: 250px;
  height: auto;
  position: relative;
  z-index: 2; /* .circle-bgよりも前面 */
  border-radius: 50%;
}

/* 100%表示 */
.percentage {
  font-size: 4rem;
  font-weight: bold;
  color: #FFCC00;
  text-align: center;
  margin-bottom: 5px;
  position: relative;
  display: inline-block;
  width: 100%;
  z-index: 1; /* .shinyu-bgよりも前面 */
}

.percent-symbol {
  font-size: 2rem;
  position: relative;
  top: 1.2rem;
  vertical-align: super;
}

.percentage-underline-container {
  width: 150px;
  height: 3px;
  background-color: rgba(255, 204, 0, 0.3);
  margin: 0 auto 20px;
  z-index: 1;
  position: relative;
  overflow: hidden;
}

.percentage-underline {
  height: 100%;
  background-color: #FFCC00;
  position: absolute;
  left: 0;
  top: 0;
  transition: width 0.3s ease-out;
}

/* 説明文 */
.start-description {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 0.8rem;
  line-height: 1.6;
  position: relative;
  z-index: 1; /* .shinyu-bgよりも前面 */
}

/* スタートボタン */
.start-btn {
  background-color: #222;
  color: white;
  border: none;
  padding: 15px 60px;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1; /* .shinyu-bgよりも前面 */
}

.arrow-icon {
  margin-left: 10px;
  font-size: 1.2rem;
}

.start-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
}

/* 音声に関する注意書き */
.audio-notice {
  text-align: center;
  color: #686868;
  line-height: 1.6;
  font-size: 0.8rem;
  margin-top: 10px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

/* 音量ボタンの位置調整 */
.volume-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.3);
}

.thumbnail-image {
  width: 100%;
  height: auto;
  height: 200px;
  border-radius: 30px 30px 0 0;
  object-fit: cover;
  display: block;
  margin-bottom: 10px;
}

.start-image {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px auto;
  max-width: 300px;
}

.thumbnail-video {
  width: 100%;
  border-radius: 30px 30px 0 0;
  /* レイアウトシフトを防ぐため */
  aspect-ratio: 16 / 9;
  background-color: #000;
}

/* Tinderスタイルのカードスワイプ用スタイル */
.tinder-container {
  position: relative;
  width: 100%;
  height: 400px;
  max-width: 360px;
  margin: 0 auto;
}

.tinder-card {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  touch-action: none;
  will-change: transform;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-radius: 30px;
  box-shadow: rgb(237 237 237 / 60%) 0px 5px 20px;
  /* box-shadow: rgba(186, 231, 254, 0.6) 0px 5px 20px; */
  background-color: #fff;
  transform-origin: center center;
}

.tinder-card:nth-child(1) {
  z-index: 2;
}

.tinder-card:nth-child(2) {
  z-index: 1;
  transform: scale(0.95) translateY(10px);
  opacity: 0.8;
  filter: blur(1px);
}

.song-info {
  padding: 20px;
  flex-grow: 1;
}

.song-title {
  font-size: 1.2rem;
}

.song-producer {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.song-year {
  font-size: 0.7rem;
  color: #999;
}
/* 音量ボタンのスタイル */
.volume-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  margin-left: 10px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  transition: background-color 0.3s;
  position: absolute;
}

.volume-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* 音量ボタンのツールチップ */
.volume-tooltip {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.volume-btn:hover .volume-tooltip {
  opacity: 1;
}

/* 音量アイコンのスタイル */
.volume-icon {
  width: 24px;
  height: 24px;
}

/* スタート画面の音量ボタン */
.diagnosis-header .volume-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

/* 診断画面の音量ボタン */
.progress-bar-container .volume-btn {
  position: absolute;
  right: 10px;
  top: 10px;
}

/* 結果画面の音量ボタン */
.result-volume-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

/* デバッグボタンのスタイル */
.debug-button-container {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.debug-btn {
  background-color: #ff6b6b;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.debug-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* 800px以下のときに「知ってる」「知らない」ボタンを非表示にする */
@media (max-width: 800px) {
  .manual-buttons {
    display: none;
  }
}

/* スワイプカードコンテナのスタイル */
.swipe-card-container {
  position: relative;
  width: 100%;
  max-width: 280px;
  margin-bottom: 45px;
  /* padding-top: 10px; SVGの位置調整用 */
  z-index: 1;
}

/* スワイプアニメーション部分 */
.swipe-animation {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  width: 220px;
  height: 220px;
}

/* カードのスタイル */
.card {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  padding: 20px;
  z-index: 2;
  height: 240px;
}

/* カードコンテンツ部分 */
.card-content {
  width: 100%;
  text-align: center;
}

/* スワイプ指示部分 */
.swipe-instruction {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 0 10px;
}

/* スワイプ方向 */
.swipe-direction {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #555;
}

/* 左方向 */
.swipe-direction.left {
  color: #ff4b4b; /* 色を鮮明に */
}

/* 右方向 */
.swipe-direction.right {
  color: #00c2a8; /* 色を鮮明に */
}

/* 方向アイコン */
.direction-icon {
  font-size: 1.3rem; /* サイズを大きく */
  font-weight: bold;
  margin: 0 5px;
}

/* 方向テキスト */
.direction-text {
  font-weight: bold;
  font-size: 1rem; /* サイズを大きく */
}

/* スワイプ説明 */
.swipe-description {
  font-size: 0.9rem;
  color: #666;
  margin-top: 5px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
}

/* 進捗コメントのスタイル */
.progress-comment {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.progress-comment.animating {
  opacity: 1;
}

.progress-comment-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  text-align: center;
  animation: progressCommentBounce 0.6s ease-out;
}

.progress-comment-text {
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

@keyframes progressCommentBounce {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* レスポンシブ対応 */
@media (max-width: 480px) {
  .progress-comment-content {
    padding: 15px 25px;
  }
  
  .progress-comment-text {
    font-size: 1.2rem;
  }
}
</style>
