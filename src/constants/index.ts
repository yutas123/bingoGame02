// アニメーション関連の定数
export const ANIMATION = {
  CARD_SWIPE_THRESHOLD: 70, // カードをスワイプと判定する最小距離（px）
  CARD_SWIPE_DURATION: 200, // カードのスワイプアニメーション時間（ms）
  CARD_TARGET_X: 2000, // カードが画面外に移動する距離（px）
  CARD_MAX_FALL_DISTANCE: 500, // カードの最大落下距離（px）
  CARD_ROTATION_FACTOR: 0.1, // ドラッグ時の回転係数
  CARD_FINAL_ROTATION: 60, // 最終的な回転角度（度）
  RESULT_DELAY: 300, // 結果画面への遷移遅延（ms）
  SWIPER_SPEED: 20000, // 背景Swiperのアニメーション速度（ms）
} as const;

// プリロード関連の定数
export const PRELOAD = {
  INITIAL_VIDEOS: 3, // 初期プリロードする動画数
  PROGRESS_INCREMENT: 5, // プログレスバーの増分（%）
  MAX_PROGRESS: 95, // 最大プログレス（%）
  COMPLETE_DELAY: 500, // 完了時の遅延（ms）
  TIMEOUT: 10000, // タイムアウト時間（ms）
} as const;

// スタイル関連の定数
export const STYLES = {
  CARD_SCALE: 0.95, // 2枚目のカードのスケール
  CARD_TRANSLATE_Y: 10, // 2枚目のカードのY軸移動量（px）
  CARD_OPACITY: 0.8, // 2枚目のカードの透明度
  CARD_BLUR: 1, // 2枚目のカードのぼかし量（px）
} as const;

// その他の定数
export const TOTAL_QUESTIONS = 49; // 診断で使用する曲数
export const DEFAULT_VIDEO_PATH = '/src/assets/movie/kyukura.mp4'; // デフォルト動画パス
