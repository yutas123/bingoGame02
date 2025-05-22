import { ref } from 'vue';

export function useAudioControl() {
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
      console.log("fadeOut");
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
    console.log("fadeIn");
    return new Promise<void>((resolve) => {
      const targetVolume = 0.1;
      audio.volume = 0;
      // 再生前にミュート状態を設定
      audio.muted = isMuted.value;
      audio.play();

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
