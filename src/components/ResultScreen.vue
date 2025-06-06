<template>
  <div class="result-screen">
    <div class="result-card">
      <div class="result-header">
        <h2 class="result-title">診断結果</h2>
        <div class="result-decoration"></div>
      </div>
      
      <div class="result-type">
        <h3 class="type-title">あなたのタイプは…</h3>
        <div class="type-result-container">
          <div class="type-result">{{ resultType.name }}</div>
          <div class="type-badge">{{ resultType.id }}</div>
        </div>
        
        <div class="type-description-wrap">
          <p class="type-description" v-for="(line, index) in resultType.description" :key="index">{{ line }}</p>
        </div>
      </div>
    
    <!-- 時代別カバー率 -->
    <div class="era-stats-section">
      <div class="era-stats-grid">
        <div v-for="(stat, era) in eraStats" :key="era" class="era-stat-item">
          <div class="era-name">{{ eraNames[era] }}</div>
          <div class="circle-progress" :class="era">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" class="circle-bg" />
              <circle cx="50" cy="50" r="45" class="circle-progress-path" 
                :style="{ 'stroke-dasharray': `${stat.rate * 2.83}, 283` }" />
            </svg>
            <div class="percentage">{{ Math.round(stat.rate) }}%</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 7×7のボックスレイアウト -->
      <div class="song-grid">
        <div 
          v-for="song in vocaloidSongs" 
          :key="song.id" 
          class="song-box"
          :class="{ 'known-song': knownSongs.includes(song.id) }"
        >
          <div class="song-box-content">
            <img v-if="knownSongs.includes(song.id)" 
                 :src="getSongThumbnail(song)" 
                 :alt="song.title"
                 class="song-thumbnail">
            <div v-else class="unknown-song-overlay"></div>
          </div>
        </div>
      </div>

      <div class="result-stats">
        <div class="stats-item">
          <div class="stats-label">知ってる曲</div>
          <div class="stats-value">{{ knownSongs.length }}/{{ totalQuestions }}</div>
        </div>
        <div class="stats-item">
          <div class="stats-label">知識レベル</div>
          <div class="stats-value">{{ Math.round((knownSongs.length / totalQuestions) * 100) }}%</div>
        </div>
      </div>

      <!-- シェアボタンセクション -->
      <div class="share-section">
        <h3 class="share-title">結果をシェアする</h3>
        <div class="share-buttons">
          <!-- Xボタン -->
          <button @click="shareToTwitter" class="share-btn x-btn" aria-label="Xでシェア">
            <img src="../assets/img/X_Logo.svg" alt="X" class="share-icon">
          </button>
          
          <!-- Facebookボタン -->
          <button @click="shareToFacebook" class="share-btn facebook-btn" aria-label="Facebookでシェア">
            <img src="../assets/img/Facebook_Logo.png" alt="Facebook" class="share-icon">
          </button>
          
          <!-- LINEボタン -->
          <button @click="shareToLine" class="share-btn line-btn" aria-label="LINEでシェア">
            <img src="../assets/img/LINE_Logo.png" alt="LINE" class="share-icon">
          </button>
        </div>
      </div>

      <div class="restart-section">
        <button @click="$emit('resetDiagnosis')" class="restart-btn">もう一度診断する</button>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { vocaloidSongs } from '../data/songs';
import type { VocaloidSong } from '../type';

// propsの定義
const props = defineProps<{
  knownSongs: number[];
  totalQuestions: number;
  isMuted: boolean;
}>();

// emitsの定義
defineEmits<{
  (e: 'toggleMute'): void;
  (e: 'resetDiagnosis'): void;
}>();

// 楽曲のサムネイル画像パスを取得する関数
const getSongThumbnail = (song: VocaloidSong): string => {
  // videoPathから拡張子を変更してサムネイルパスを生成
  if (song.videoPath) {
    const thumbnailName = song.videoPath.replace('.mp4', '.jpg');
    return `/src/assets/img/thumbnails/${thumbnailName}`;
  }
  // videoPathがない場合はデフォルト画像
  return '/src/assets/img/thumbnail.jpg';
};

// 時代の日本語名マッピング
const eraNames: Record<string, string> = {
  dawn: '黎明期',
  boom: '第1次ブーム',
  gold: '黄金期',
  diserve: '多様化期',
  revival: '令和リバイバル',
  ai: '新世代'
};

// 総正答率の計算
const totalCorrectRate = computed(() => {
  return (props.knownSongs.length / props.totalQuestions) * 100;
});

// 各時代ごとの曲数とカバー率を計算
const eraStats = computed(() => {
  // 各時代ごとの統計情報を格納するオブジェクト
  const stats = {} as Record<string, { total: number; known: number; rate: number }>;
  
  // 各時代の初期化
  Object.keys(eraNames).forEach(era => {
    stats[era] = { total: 0, known: 0, rate: 0 };
  });
  
  // 全曲をループして各時代の曲数をカウント
  vocaloidSongs.forEach(song => {
    if (stats[song.era]) {
      stats[song.era].total++;
      
      // 知っている曲かどうかをチェック
      if (props.knownSongs.includes(song.id)) {
        stats[song.era].known++;
      }
    }
  });
  
  // 各時代のカバー率を計算
  Object.keys(stats).forEach(era => {
    if (stats[era].total > 0) {
      stats[era].rate = (stats[era].known / stats[era].total) * 100;
    }
  });
  
  return stats;
});

// 全時代の平均カバー率
const averageEraRate = computed(() => {
  const rates = Object.values(eraStats.value).map(stat => stat.rate);
  return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
});

// 最もカバー率が高い時代を取得
const highestEra = computed(() => {
  let maxRate = 0;
  let maxEra = '';
  
  Object.entries(eraStats.value).forEach(([era, stat]) => {
    if (stat.rate > maxRate) {
      maxRate = stat.rate;
      maxEra = era;
    }
  });
  
  return { era: maxEra, rate: maxRate, name: eraNames[maxEra as keyof typeof eraNames] };
});

// 特定の時代が他と比べて+20%以上のカバー率を持つかチェック
const hasFocusEra = computed(() => {
  const highestRate = highestEra.value.rate;
  const otherEras = Object.entries(eraStats.value)
    .filter(([era]) => era !== highestEra.value.era)
    .map(([_, stat]) => stat.rate);
  
  // 他の時代の最高カバー率
  const secondHighestRate = Math.max(...otherEras);
  
  return highestRate - secondHighestRate >= 20;
});

// 特定の時代が80%以上のカバー率を持ち、他が平均未満かチェック
const hasDeepEra = computed(() => {
  let deepEra = '';
  let isDeep = false;
  
  Object.entries(eraStats.value).forEach(([era, stat]) => {
    if (stat.rate >= 80) {
      // 他の時代が平均未満かチェック
      const otherErasAverage = Object.entries(eraStats.value)
        .filter(([e]) => e !== era)
        .map(([_, s]) => s.rate)
        .reduce((sum, rate) => sum + rate, 0) / 5; // 他の5時代の平均
      
      const otherErasBelowAverage = Object.entries(eraStats.value)
        .filter(([e]) => e !== era)
        .every(([_, s]) => s.rate < otherErasAverage);
      
      if (otherErasBelowAverage) {
        deepEra = era;
        isDeep = true;
      }
    }
  });
  
  return { isDeep, era: deepEra, name: eraNames[deepEra as keyof typeof eraNames] };
});

// 全時代で60%以上のカバー率があるかチェック
const hasAllRoundCoverage = computed(() => {
  return Object.values(eraStats.value).every(stat => stat.rate >= 60);
});

// シェア機能の関数
const getShareText = () => {
  return `ボカロ診断の結果：${resultType.value.name}です。${highestEra.value.name}が得意です！ #ボカロ診断`;
};

const shareToTwitter = () => {
  const text = encodeURIComponent(getShareText());
  const url = encodeURIComponent(window.location.href);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
};

const shareToFacebook = () => {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
};

const shareToLine = () => {
  const text = encodeURIComponent(getShareText());
  const url = encodeURIComponent(window.location.href);
  window.open(`https://social-plugins.line.me/lineit/share?text=${text}&url=${url}`, '_blank');
};

// 結果タイプの判定
const resultType = computed(() => {
  // 1. expert（マニアタイプ）: 総正答率 ≥ 80% かつ 全6時期で60%以上
  if (totalCorrectRate.value >= 80 && hasAllRoundCoverage.value) {
    return {
      id: 'expert',
      name: 'マニアタイプ',
      description: ['どの時代も高水準で網羅。', 'もはやボカロの語り部かもしれません。']
    };
  }
  
  // 2. deep（深掘り探究タイプ）: 任意の1時期で正答率が80%以上、かつ他は平均未満
  if (hasDeepEra.value.isDeep) {
    return {
      id: 'deep',
      name: '深掘り探究タイプ',
      description: ['知っているだけでなく、しっかり掘り下げてきた実感があります。']
    };
  }
  
  // 3. focus（○○期フォーカスタイプ）: 任意の1時期で他と比べてカバー率が+20%以上
  if (hasFocusEra.value) {
    return {
      id: 'focus',
      name: `${highestEra.value.name}フォーカスタイプ`,
      description: ['ある時代にグッと響くものがあるようですね。', '芯のある好みが光ります。']
    };
  }
  
  // 4. allround（まんべんなくタイプ）: 全6時期でカバー率 ≥ 60%
  if (hasAllRoundCoverage.value) {
    return {
      id: 'allround',
      name: 'まんべんなくタイプ',
      description: ['どの時代もバランスよく押さえています。', '幅広い視点をお持ちです。']
    };
  }
  
  // 5. newcomer（ビギナータイプ）: 総正答率 ≤ 20%（上記のいずれにも当てはまらない場合も含む）
  return {
    id: 'newcomer',
    name: 'ビギナータイプ',
    description: ['ボカロの入り口に立ったばかり。', 'これからの出会いが楽しみですね。']
  };
});
</script>

<style scoped>
/* 結果画面のスタイル */
.result-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.8s ease-out;
}

.result-card {
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04);
  padding: 40px 30px 30px;
  width: 100%;
  max-width: 800px;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

/* ヘッダー部分の新しいスタイル */
.result-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.result-title {
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ff6b9d, #ff9d6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 15px;
  animation: slideInDown 0.6s ease-out 0.2s both;
}

.result-decoration {
  width: 60px;
  height: 4px;
  background: linear-gradient(135deg, #ff6b9d, #ff9d6b);
  border-radius: 2px;
  margin: 0 auto;
  animation: expandWidth 0.8s ease-out 0.4s both;
}

/* アニメーション定義 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes expandWidth {
  from {
    width: 0;
  }
  to {
    width: 60px;
  }
}

/* 7×7のグリッドレイアウト */
.song-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 30px;
}

.song-box {
  aspect-ratio: 1 / 1;
  background-image: url('/src/assets/img/thumbnail.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  border-radius: 5px;
  overflow: hidden;
}

.song-box-content {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  position: relative;
}

/* 知ってる曲の画像スタイル */
.song-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

/* 知らない曲の灰色オーバーレイ */
.unknown-song-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(128, 128, 128, 0.7);
  border-radius: 4px;
}

/* シェアボタンのスタイル */
.share-section {
  margin: 20px 0 30px;
  text-align: center;
}

.share-title {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 15px;
}

.share-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.share-btn {
  width: 45px;
  height: 45px;
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  padding: 0;
}

.share-btn.facebook-btn img,.share-btn.line-btn img{
  width: 45px;
  height: 45px;
}

.share-icon {
  width: 22px;
  object-fit: contain;
}

  

.share-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.x-btn {
  background-color: #000000;
}

/* レスポンシブ対応 */
@media (max-width: 480px) {
  .era-stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  
  .circle-progress {
    width: 70px;
    height: 70px;
  }
  
  .percentage {
    font-size: 1rem;
  }
  
  .era-name {
    font-size: 0.8rem;
    margin-bottom: 5px;
  }
  
  .share-buttons {
    gap: 15px;
  }
  
  .share-btn {
    width: 45px;
    height: 45px;
  }
}

.result-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
}

.stats-item {
  text-align: center;
}

.stats-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.stats-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #FFCC00;
}

.share-section {
  margin: 20px 0 30px;
  text-align: center;
}

.share-title {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 15px;
}

.share-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.share-btn {
  width: 45px;
  height: 45px;
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  padding: 0;
}

.share-btn.facebook-btn img,.share-btn.line-btn img{
  width: 45px;
  height: 45px;
}

.share-icon {
  width: 22px;
  object-fit: contain;
}

.share-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.x-btn {
  background-color: #000000;
}

.restart-section {
  display: flex;
  justify-content: center;
}

.restart-btn {
  background-color: #222;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.restart-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
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

/* 結果画面の音量ボタン */
.result-volume-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

/* タイプ結果のスタイル */
.result-type {
  text-align: center;
  margin-bottom: 40px;
  animation: slideInUp 0.8s ease-out 0.6s both;
}

.type-title {
  font-size: 1.1rem;
  margin-bottom: 20px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.type-result-container {
  position: relative;
  margin-bottom: 30px;
}

.type-result {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ff6b9d, #ff9d6b, #ff79a7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 15px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.type-badge {
  display: inline-block;
  background: linear-gradient(135deg, #ff6b9d, #ff9d6b);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
  margin-top: 10px;
}

.type-description-wrap {
  max-width: 600px;
  margin: 0 auto;
}

.type-description {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.7;
  margin-bottom: 8px;
  opacity: 0.9;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 時代別カバー率のスタイル */
.era-stats-section {
  margin: 30px 0 40px;
  animation: slideInUp 0.8s ease-out 0.8s both;
}

.era-stats-title {
  font-size: 1.3rem;
  color: #333;
  text-align: center;
  margin-bottom: 25px;
  font-weight: 600;
}

.era-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  padding: 0 10px;
}

.era-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease;
}

.era-stat-item:hover {
  transform: translateY(-5px);
}

.era-name {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 12px;
  text-align: center;
  white-space: nowrap;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.circle-progress {
  position: relative;
  width: 110px;
  height: 110px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  transition: all 0.3s ease;
}

.era-stat-item:hover .circle-progress {
  transform: scale(1.05);
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15));
}

.circle-bg {
  fill: none;
  stroke: #f5f5f5;
  stroke-width: 6;
}

.circle-progress-path {
  fill: none;
  stroke-width: 6;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: center;
  transition: stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.6rem;
  font-weight: 700;
  color: #333;
}

/* 各時代の色 - より洗練されたカラーパレット */
.dawn .circle-progress-path { stroke: #667eea; }
.dawn .percentage { color: #667eea; }

.boom .circle-progress-path { stroke: #f093fb; }
.boom .percentage { color: #f093fb; }

.gold .circle-progress-path { stroke: #ffecd2; stroke: #fcb69f; }
.gold .percentage { color: #fcb69f; }

.diserve .circle-progress-path { stroke: #a8edea; }
.diserve .percentage { color: #a8edea; }

.revival .circle-progress-path { stroke: #d299c2; }
.revival .percentage { color: #d299c2; }

.ai .circle-progress-path { stroke: #89f7fe; }
.ai .percentage { color: #89f7fe; }

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .era-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .circle-progress {
    width: 100px;
    height: 100px;
  }
  
  .percentage {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .era-stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  
  .circle-progress {
    width: 70px;
    height: 70px;
  }
  
  .percentage {
    font-size: 1rem;
  }
  
  .era-name {
    font-size: 0.8rem;
    margin-bottom: 5px;
  }
}

@media (max-width: 340px) {
  .era-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
