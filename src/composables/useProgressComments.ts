// src/composables/useProgressComments.ts
/**
 * 進捗コメント機能を提供するVue Composable
 * ユーザーが特定の節目に達した時にやる気を刺激するコメントを表示します
 */
import { ref } from 'vue';

/**
 * 進捗コメントの設定
 * 曲数とそれに対応するコメントのマッピング
 */
const PROGRESS_COMMENTS = {
  5: 'いい調子！',
  10: '10曲クリア！',
  15: 'もう半分近く！',
  25: '半分突破！',
  35: 'あと少し！',
  45: 'ラストスパート！'
} as const;

/**
 * 進捗コメント機能を提供するコンポーザブル関数
 */
export function useProgressComments() {
  // 進捗コメントの表示状態
  const showProgressComment = ref(false);
  
  // 現在表示中のコメント
  const currentProgressComment = ref('');
  
  // アニメーション状態
  const isAnimating = ref(false);
  
  /**
   * 指定された曲数が節目かどうかをチェック
   * @param count - 現在の回答済み曲数
   * @returns 節目の場合はコメント、そうでなければnull
   */
  const getProgressComment = (count: number): string | null => {
    return PROGRESS_COMMENTS[count as keyof typeof PROGRESS_COMMENTS] || null;
  };
  
  /**
   * 進捗コメントを表示する
   * @param count - 現在の回答済み曲数
   */
  const displayProgressComment = (count: number) => {
    console.log(`進捗コメントチェック: ${count}曲目`);
    const comment = getProgressComment(count);
    console.log(`取得したコメント: ${comment}`);
    
    if (comment) {
      console.log(`進捗コメント表示: ${comment}`);
      currentProgressComment.value = comment;
      showProgressComment.value = true;
      isAnimating.value = true;
      
      // 3秒後にコメントを非表示にする
      setTimeout(() => {
        hideProgressComment();
      }, 1000);
    }
  };
  
  /**
   * 進捗コメントを非表示にする
   */
  const hideProgressComment = () => {
    isAnimating.value = false;
    
    // フェードアウトアニメーション後に完全に非表示にする
    setTimeout(() => {
      showProgressComment.value = false;
      currentProgressComment.value = '';
    }, 300);
  };
  
  /**
   * 節目の曲数一覧を取得
   */
  const getMilestones = () => {
    return Object.keys(PROGRESS_COMMENTS).map(Number);
  };
  
  /**
   * 指定された曲数が節目かどうかを判定
   * @param count - チェックする曲数
   * @returns 節目の場合はtrue
   */
  const isMilestone = (count: number): boolean => {
    return count in PROGRESS_COMMENTS;
  };
  
  return {
    // 状態
    showProgressComment,
    currentProgressComment,
    isAnimating,
    
    // 関数
    displayProgressComment,
    hideProgressComment,
    getProgressComment,
    getMilestones,
    isMilestone
  };
}
