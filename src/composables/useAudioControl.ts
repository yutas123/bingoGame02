import { ref } from 'vue';

// シングルトンインスタンスを保持する変数
let instance: ReturnType<typeof createAudioControl> | null = null;

// 実際の実装を行う内部関数
function createAudioControl(name = 'singleton') {
  console.log(`useAudioControl "${name}" インスタンス作成`);
  
  // ローカルストレージからミュート状態を読み込む
  const loadMuteState = () => {
    const savedState = localStorage.getItem('vocaloidDiagnosis_isMuted');
    return savedState === 'true';
  };
  
  // 音量のON/OFF状態を管理（ローカルストレージから初期値を取得）
  const isMuted = ref(loadMuteState());
  
  // 音量をON/OFFするトグル関数
  const toggleMute = () => {
    isMuted.value = !isMuted.value;
    console.log(`シングルトンインスタンスの isMuted.value: ${isMuted.value}`);
    
    // すべての動画と音声要素に適用
    document.querySelectorAll('video, audio').forEach(element => {
      if (element instanceof HTMLVideoElement || element instanceof HTMLAudioElement) {
        element.muted = isMuted.value;
      }
    });
    
    // ミュート状態をローカルストレージに保存
    localStorage.setItem('vocaloidDiagnosis_isMuted', isMuted.value.toString());
    
    console.log(`音量が${isMuted.value ? 'OFF' : 'ON'}になりました`);
  };
  
  // 現在の音量状態を取得
  const getMuteState = () => isMuted.value;
  
  // フェードアウトの実装
  const fadeOut = async (audio: HTMLVideoElement, duration: number = 150) => {
    return new Promise<void>((resolve) => {
      const startVolume = audio.volume;
      console.log(`シングルトンインスタンスのfadeOut実行 isMuted.value: ${isMuted.value}`);
      const startTime = performance.now();

      const updateVolume = () => {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 音量を徐々に下げる
        audio.volume = startVolume * (1 - progress);

        if (progress < 1) {
          requestAnimationFrame(updateVolume);
        } else {
          audio.pause();
          audio.volume = startVolume; // 音量を元に戻す
          resolve();
        }
      };

      requestAnimationFrame(updateVolume);
    });
  };

  // フェードインの実装
  const fadeIn = async (audio: HTMLVideoElement, duration: number = 150) => {
    console.log(`シングルトンインスタンスのfadeIn開始時 isMuted.value: ${isMuted.value}`);
    return new Promise<void>((resolve) => {
      const targetVolume = 0.1;
      audio.volume = 0;
      console.log(`シングルトンインスタンスのfadeIn play前 isMuted.value: ${isMuted.value}`);
      
      // 再生開始
      audio.play().then(() => {
        // 再生開始後にアプリケーション全体のミュート設定を適用
        audio.muted = isMuted.value;
        console.log(`シングルトンインスタンスのfadeIn play後 isMuted.value: ${isMuted.value}`);
      }).catch(err => {
        console.error('動画再生エラー:', err);
      });

      const startTime = performance.now();

      const updateVolume = () => {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 音量を徐々に上げる
        audio.volume = targetVolume * progress;

        if (progress < 1) {
          requestAnimationFrame(updateVolume);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(updateVolume);
    });
  };

  return {
    fadeOut,
    fadeIn,
    toggleMute,
    getMuteState,
    isMuted
  };
}

// 外部に公開する関数（シングルトンを返す）
export function useAudioControl(name = 'caller') {
  // インスタンスがなければ作成、あれば既存のものを返す
  if (!instance) {
    console.log(`初回呼び出し: "${name}"からのリクエストでインスタンスを作成`);
    instance = createAudioControl();
  } else {
    console.log(`既存インスタンスを返します: "${name}"からの呼び出し`);
  }
  return instance;
}
