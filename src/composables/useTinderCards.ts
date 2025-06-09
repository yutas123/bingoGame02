// src/composables/useTinderCards.ts
/**
 * このファイルはTinderのようなカードスワイプ機能を実装するVue Composableです。
 * ボーカロイド診断アプリで、ユーザーが曲を「知っている」か「知らない」かを
 * 右または左にスワイプして回答できる機能を提供します。
 */
import { ref, watch, nextTick, computed } from 'vue';
import type { Ref } from 'vue';
import type { VocaloidSong } from '../type';
import { useAudioControl } from './useAudioControl';
import { ANIMATION } from '../constants';

/**
 * Tinderのようなカードスワイプ機能を提供するコンポーザブル関数
 * 
 * @param currentStep - 現在のアプリの状態（開始画面、診断中、結果画面）
 * @param answeredSongs - ユーザーが回答した曲のID配列
 * @param knownSongs - ユーザーが「知っている」と回答した曲のID配列
 * @param diagnosisSongs - 診断に使用する曲の配列
 * @param totalQuestions - 診断で表示する質問（曲）の総数（デフォルト: 5）
 * @param effects - エフェクト表示用の関数を含むオブジェクト
 */
export function useTinderCards(
  currentStep: Ref<'start' | 'diagnosis' | 'result'>,
  answeredSongs: Ref<number[]>,
  knownSongs: Ref<number[]>,
  diagnosisSongs: Ref<VocaloidSong[]>,
  remainingSongs: Ref<VocaloidSong[]>,
  currentSongIndex: Ref<number>,
  currentSong: Ref<VocaloidSong | null>,
  totalQuestions: number = 49,
  effects: {
    displayKnowEffect: (song: VocaloidSong) => void;
    displayDontKnowEffect: (song: VocaloidSong) => void;
  }
) {
  // アニメーション中のイベント処理を防止するためのフラグ
  const isProcessing = ref(false);
  // ======= カード関連の状態管理 =======
  
  /**
   * 各カードの状態を管理する配列
   * カードの位置（X,Y座標）、回転角度、アニメーション状態などを保持します
   */
  const cardStates = ref<{
    offsetX: number;    // X軸方向の移動量（左右の移動）
    offsetY: number;    // Y軸方向の移動量（上下の移動）
    rotation: number;   // 回転角度（度数法）
    isLeaving: boolean; // カードが画面から離れる途中かどうか
  }[]>([]);
  // 小文字のref→実際の関数
  // 大文字のRef→型定義としてのRef
  
  // ======= 動画再生の制御 =======
  
  /**
   * カード内の動画要素への参照を保持する配列
   * HTMLVideoElementはブラウザの<video>要素を操作するためのインターフェースです
   */
  const videoRefs = ref<HTMLVideoElement[]>([]);
  
  /**
   * 動画要素への参照を設定する関数
   * Vueのテンプレートから呼び出され、各カードの動画要素を登録します
   * 
   * @param el - 動画要素またはnull（Vueのrefから取得される要素）
   * @param index - カードのインデックス
   */
  const setVideoRef = (el: any, index: number) => {
    if (el && el instanceof HTMLVideoElement) {
      // HTMLVideoElement型の場合のみ登録
      videoRefs.value[index] = el;
    }
  };
  
  /**
   * 動画の再生状態を制御する関数
   * 現在表示中のカードの動画だけを再生し、他は一時停止します
   */
  // 音声制御の初期化
  const { fadeOut, fadeIn, isMuted } = useAudioControl('TinderCards');

  const controlVideos = () => {
    videoRefs.value.forEach((video, index) => {
      if (!video) return;
      
      if (index === 0) {
        // 現在のカードの動画を再生（音声付き）
        const song = remainingSongs.value[currentSongIndex.value];
        if (song?.startTime) {
          video.currentTime = song.startTime;
        }
        
        // 音量状態に応じてミュート設定
        video.muted = isMuted.value;
        
        video.play().catch(err => {
          console.error('動画再生エラー:', err);
        });
      } else if (index >= 1 && index <= 2) {
        // 次の2つのカードの動画を準備
        const nextSong = remainingSongs.value[currentSongIndex.value + index];
        if (nextSong?.startTime) {
          video.currentTime = nextSong.startTime;
        }
        video.pause();
      } else {
        // その他のカードの動画は完全に停止
        video.pause();
        video.currentTime = 0;
      }
    });
  };
  
  // ======= ドラッグ操作の処理 =======
  
  /**
   * ドラッグ中かどうかのフラグ
   */
  const isDragging = ref(false);
  
  /**
   * ドラッグ開始時のX座標
   */
  const startX = ref(0);
  
  /**
   * ドラッグ開始時のY座標
   */
  const startY = ref(0);
  
  /**
   * 現在のX座標（リアクティブな値）
   */
  const currentClientX = ref(0);
  
  /**
   * 現在のY座標（リアクティブな値）
   */
  const currentClientY = ref(0);
  
  /**
   * カードの初期化関数
   * 診断開始時に呼び出され、カードの状態をリセットします
   */
  const initCards = () => {
    // 診断用の曲リストをコピーして残りの曲リストを初期化
    remainingSongs.value = [...diagnosisSongs.value];
    currentSongIndex.value = 0;
    
    // 各カードの状態を初期化
    cardStates.value = remainingSongs.value.map(() => ({
      offsetX: 0,      // X軸方向の移動量をゼロに
      offsetY: 0,      // Y軸方向の移動量をゼロに
      rotation: 0,     // 回転角度をゼロに
      isLeaving: false // 離れていくアニメーション状態をオフに
    }));
    
    // nextTickはDOMの更新後に処理を実行するVueの関数です
    // ここでは、DOMが更新された後に動画の制御を行います
    nextTick(() => {
      controlVideos();
    });
  };
  
  /**
   * ドラッグ開始時の処理
   * マウスまたはタッチの開始位置を記録します
   * 
   * @param event - マウスイベントまたはタッチイベント
   */
  const startDrag = (event: MouseEvent | TouchEvent) => {
    isDragging.value = true;
    
    // MouseEventとTouchEventを区別して座標を取得
    let clientX: number;
    let clientY: number;

    if ('touches' in event) {
      // 「eventオブジェクトの中にtouchesプロパティが存在するかどうか」
      // タッチデバイスの場合（スマートフォンやタブレット）
      // スマホの場合はTouchEvent オブジェクトが生成され、そのオブジェクトの中に「touches」プロパティが存在するので「event.touches」でアクセス
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      // マウスの場合（PC）
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    // ドラッグ開始位置を記録
    startX.value = clientX;
    startY.value = clientY;
  };
  
  /**
   * ドラッグ中の処理
   * カードの位置と回転を更新します
   * 
   * @param event - マウスイベントまたはタッチイベント
   */
  const onDrag = (event: MouseEvent | TouchEvent) => {
    // ドラッグ中でなければ何もしない
    if (!isDragging.value) return;
    
    // デフォルトのイベント処理を防止（スクロールなど）
    event.preventDefault();
    
    // 現在のカードの状態を取得
    const cardState = cardStates.value[currentSongIndex.value];
    if (!cardState) return;
    
    // MouseEventとTouchEventを区別して現在の座標を取得
    let clientX: number;
    let clientY: number;
    
    if ('touches' in event) {
      // タッチデバイスの場合
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      // マウスの場合
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    // リアクティブな値を更新
    currentClientX.value = clientX;
    currentClientY.value = clientY;
    
    // カードの位置と回転を更新
    // 開始位置からの差分を計算して移動量とする
    cardState.offsetX = clientX - startX.value;
    cardState.offsetY = clientY - startY.value;
    
    // X軸の移動量に比例して回転させる（自然な動きに見せるため）
    // 0.1は回転の強さを調整する係数
    cardState.rotation = cardState.offsetX * 0.1;

  };
  
  /**
   * ドラッグ終了時の処理
   * スワイプの方向と距離に基づいて、カードを受け入れるか拒否するかを決定します
   */
  const endDrag = () => {
    // ドラッグ中でなければ何もしない
    if (!isDragging.value) return;
    
    // 現在のカードの状態を取得
    const cardState = cardStates.value[currentSongIndex.value];
    if (!cardState) return;

    // スワイプの距離が閾値を超えているかチェック
    if (Math.abs(cardState.offsetX) > ANIMATION.CARD_SWIPE_THRESHOLD) {

      if (cardState.offsetX > 0) {
        // 右にスワイプした場合は「知ってる」と判定
        acceptCard();
      } else {
        // 左にスワイプした場合は「知らない」と判定
        rejectCard();
      }
    } else {
      // スワイプ距離が足りない場合は元の位置に戻す
      isDragging.value = false;
      cardState.offsetX = 0;
      cardState.offsetY = 0;
      cardState.rotation = 0;
    }
  };
  
  /**
   * 放物線アニメーションを実行する関数
   * カードが放物線を描いて落ちていくアニメーションを実現します
   * 
   * @param cardState - アニメーションするカードの状態
   * @param direction - スワイプ方向（'left'または'right'）
   * @param onComplete - アニメーション完了時のコールバック関数
   */
  const animateCardParabola = (
    cardState: { offsetX: number; offsetY: number; rotation: number; isLeaving: boolean },
    direction: 'left' | 'right',
    onComplete: () => void
  ) => {
    const startTime = Date.now();
    const duration = 200; // アニメーション時間（ミリ秒）- 500msから200msに短縮
    const initialRotation = cardState.rotation; // 現在の回転角度を保存
    
    // 方向に応じたパラメータ設定
    const targetX = direction === 'right' ? 2000 : -2000; //移動先のX座標
    const gravity = 1; // 重力係数（放物線の曲がり具合）
    
    // アニメーションフレーム関数
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // X軸の移動（線形）
      cardState.offsetX = targetX * progress;
      
      // Y軸の移動（放物線：y = gravity * x^2）
      // 最初は少し上昇してから落下する放物線
      const normalizedX = progress * 2 - 1; // -1から1の範囲に正規化
      cardState.offsetY = 500 * (gravity * normalizedX * normalizedX - 1.1); // 500は最大落下距離
      
      // 回転も更新
      cardState.rotation = initialRotation + (direction === 'right' ? 60 : -60) * progress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // アニメーション完了時のコールバック
        onComplete();
      }
    };
    
    // アニメーション開始
    cardState.isLeaving = true;
    requestAnimationFrame(animate);
  };

  /**
   * 「知らない」を選択した場合の処理
   * カードを左に放物線を描いてアニメーションさせて次のカードを表示します
   */
  const rejectCard = () => {
    // 処理中なら何もしない（連続実行を防止）
    if (isProcessing.value) return;
    
    // 現在の曲がなければ何もしない
    if (!currentSong.value) return;
    
    // 現在のカードの状態を取得
    const cardState = cardStates.value[currentSongIndex.value];
    if (!cardState) return;
    
    // 処理中フラグをONに
    isProcessing.value = true;

    // 回答を記録（「知らない」の場合はansweredSongsにのみ追加）
    answeredSongs.value.push(currentSong.value.id);
    
    // 「知らない」エフェクトを表示
    effects.displayDontKnowEffect(currentSong.value);
    
    // 放物線アニメーションを開始
    animateCardParabola(cardState, 'left', () => {
      // 現在の動画をフェードアウト（完了を待たない）
      const currentVideo = videoRefs.value[0];
      if (currentVideo) {
        fadeOut(currentVideo);
      }

      // 次の曲へインデックスを進める
      currentSongIndex.value++;

      // ドラッグ状態をリセット
      isDragging.value = false;
      
      // 動画制御を実行（インデックス更新後）
      nextTick(() => {
        controlVideos();
        // 次の動画をフェードイン（並行して実行）
        const nextVideo = videoRefs.value[0];
        if (nextVideo) {
          fadeIn(nextVideo);
        }
      });
      
      // 全ての曲に回答したら結果画面へ移動
      if (answeredSongs.value.length >= totalQuestions) {
        setTimeout(() => {
          currentStep.value = 'result';
        }, 300); // 1000msから300msに短縮
      }
      
      // 処理中フラグをOFFに（処理完了）
      isProcessing.value = false;
    });
  };
  
  /**
   * 「知ってる」を選択した場合の処理
   * カードを右に放物線を描いてアニメーションさせて次のカードを表示します
   */
  const acceptCard = () => {
    // 処理中なら何もしない（連続実行を防止）
    if (isProcessing.value) return;
    
    // 現在の曲がなければ何もしない
    if (!currentSong.value) return;
    
    // 現在のカードの状態を取得
    const cardState = cardStates.value[currentSongIndex.value];
    if (!cardState) return;
    
    // 処理中フラグをONに
    isProcessing.value = true;
    
    // 回答を記録（「知ってる」の場合はansweredSongsとknownSongsの両方に追加）
    answeredSongs.value.push(currentSong.value.id);
    knownSongs.value.push(currentSong.value.id);
    
    // 「知ってる」エフェクトを表示
    effects.displayKnowEffect(currentSong.value);
    
    // 放物線アニメーションを開始
    animateCardParabola(cardState, 'right', () => {
      // 現在の動画をフェードアウト（完了を待たない）
      const currentVideo = videoRefs.value[0];
      if (currentVideo) {
        fadeOut(currentVideo);
      }

      // 次の曲へインデックスを進める
      currentSongIndex.value++;
      
      // ドラッグ状態をリセット
      isDragging.value = false;
      
      // 動画制御を実行（インデックス更新後）
      nextTick(() => {
        controlVideos();
        // 次の動画をフェードイン（並行して実行）
        const nextVideo = videoRefs.value[0];
        if (nextVideo) {
          fadeIn(nextVideo);
        }
      });
      
      // 全ての曲に回答したら結果画面へ移動
      if (answeredSongs.value.length >= totalQuestions) {
        setTimeout(() => {
          currentStep.value = 'result';
        }, 300); // 1000msから300msに短縮
      }
      
      // 処理中フラグをOFFに（処理完了）
      isProcessing.value = false;
    });
  };
  
  /**
   * 表示するカードを計算するcomputed関数
   * 現在のカードと次の2枚（最大3枚）を返します
   */
  const visibleCards = computed(() => {
    const startIndex = currentSongIndex.value;

    // 最大3枚のカードを表示（現在のカードと次の2枚）
    const endIndex = Math.min(startIndex + 3, remainingSongs.value.length);

    return remainingSongs.value.slice(startIndex, endIndex);
    // 配列操作時は常に境界チェックを行うことが推奨されている
    // 特にTypeScriptでは、このような安全性を考慮したコーディングが推奨される
  });
  
  /**
   * カードのCSSスタイルを計算する関数
   * カードの位置、回転、トランジションなどのスタイルを返します
   * 
   * @param index - カードのインデックス（0が最前面のカード）
   * @returns カードに適用するCSSスタイルオブジェクト
   */
  const getCardStyle = (index: number) => {
    const state = cardStates.value[currentSongIndex.value + index];
    if (!state) {
      // 状態がない場合はデフォルトのスタイルを返す
      return {
        transform: 'translate(0px, 0px) rotate(0deg)',
        transition: 'transform 0.2s ease' // 0.5sから0.2sに短縮
      };
    }
    
    // isLeavingフラグがtrueの場合、カードを画面外に配置して見えなくする
    if (state.isLeaving) {
      return {
        transform: `translate(${state.offsetX}px, ${state.offsetY}px) rotate(${state.rotation}deg)`,
        transition: 'none',
        opacity: '1',
        pointerEvents: 'none' as const  // TypeScriptの型エラーを修正
      };
    }
    
    // 通常のカードスタイル
    return {
      // 位置と回転を設定
      transform: `translate(${state.offsetX}px, ${state.offsetY}px) rotate(${state.rotation}deg)`,
      
      // ドラッグ中の最前面カードはトランジションなし（即座に動く）
      // それ以外はスムーズなトランジションを適用
      transition: isDragging.value && index === 0 
        ? 'none'
        : 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // 0.5sから0.2sに短縮
      
      opacity: '1'
    };
  };
  
  /**
   * currentStepの変更を監視し、診断開始時にカードを初期化する
   * watchはVueの関数で、特定の値の変更を監視します
   */
  watch(() => currentStep.value, (newValue) => {
    if (newValue === 'diagnosis') {
      // 診断ステップに移行したらカードを初期化
      nextTick(() => {
        initCards();
      });
    }
  });
  
  /**
   * 中心からの距離を計算
   */
  const distanceFromCenter = computed(() => {
    // 画面の中心を計算（実際のアプリケーションでは適切な値に調整してください）
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // 中心からの距離を計算
    const dx = currentClientX.value - centerX;
    const dy = currentClientY.value - centerY;
    
    return Math.sqrt(dx * dx + dy * dy);
  });
  
  // コンポーネントから使用する関数や状態を返す
  return {
    visibleCards,      // 表示するカード
    isDragging,        // ドラッグ中かどうか
    getCardStyle,      // カードのスタイル計算関数
    startDrag,         // ドラッグ開始関数
    onDrag,            // ドラッグ中関数
    endDrag,           // ドラッグ終了関数
    rejectCard,        // 「知らない」選択関数
    acceptCard,        // 「知ってる」選択関数
    setVideoRef,       // 動画参照設定関数
    controlVideos,     // 動画制御関数
    currentClientX,    // 現在のX座標（リアクティブ）
    currentClientY,    // 現在のY座標（リアクティブ）
    distanceFromCenter // 中心からの距離（リアクティブ）
  };
}
