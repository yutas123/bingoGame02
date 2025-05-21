// src/utils/achievements.ts
import type { VocaloidSong } from '../type';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export function calculateAchievements(selectedSongs: number[], allSongs: VocaloidSong[]): Achievement[] {
  // 選択された曲の詳細情報を取得
  const selectedSongDetails = allSongs.filter(song => selectedSongs.includes(song.id));
  
  // ボーカリスト別のカウント
  const vocalistCount: Record<string, number> = {};
  selectedSongDetails.forEach(song => {
    const vocalists = song.vocalist.split('・');
    vocalists.forEach(vocalist => {
      vocalistCount[vocalist] = (vocalistCount[vocalist] || 0) + 1;
    });
  });
  
  // プロデューサー別のカウント
  const producerCount: Record<string, number> = {};
  selectedSongDetails.forEach(song => {
    producerCount[song.producer] = (producerCount[song.producer] || 0) + 1;
  });
  
  // 年代別のカウント
  const eraCount: Record<string, number> = {};
  selectedSongDetails.forEach(song => {
    eraCount[song.era] = (eraCount[song.era] || 0) + 1;
  });
  
  // 年代別の総数
  const eraTotalCount: Record<string, number> = {};
  allSongs.forEach(song => {
    eraTotalCount[song.era] = (eraTotalCount[song.era] || 0) + 1;
  });
  
  // 実績リスト
  const achievements: Achievement[] = [
    // 基本実績
    {
      id: 'first_steps',
      title: 'ボカロ入門',
      description: '最初の曲を選択した',
      icon: '🎵',
      unlocked: selectedSongs.length > 0,
    },
    {
      id: 'getting_there',
      title: 'だんだん詳しくなってきた',
      description: '10曲以上知っている',
      icon: '🎧',
      unlocked: selectedSongs.length >= 10,
      progress: Math.min(selectedSongs.length, 10),
      maxProgress: 10
    },
    {
      id: 'vocaloid_fan',
      title: 'ボカロ通',
      description: '25曲以上知っている',
      icon: '🎤',
      unlocked: selectedSongs.length >= 25,
      progress: Math.min(selectedSongs.length, 25),
      maxProgress: 25
    },
    {
      id: 'vocaloid_master',
      title: 'ボカロマスター',
      description: '50曲以上知っている',
      icon: '👑',
      unlocked: selectedSongs.length >= 50,
      progress: Math.min(selectedSongs.length, 50),
      maxProgress: 50
    },
    {
      id: 'vocaloid_legend',
      title: 'ボカロレジェンド',
      description: '75曲以上知っている',
      icon: '🏆',
      unlocked: selectedSongs.length >= 75,
      progress: Math.min(selectedSongs.length, 75),
      maxProgress: 75
    },
    {
      id: 'complete_collection',
      title: 'コンプリート',
      description: 'すべての曲を知っている',
      icon: '💯',
      unlocked: selectedSongs.length === allSongs.length,
      progress: selectedSongs.length,
      maxProgress: allSongs.length
    },
    
    // ボーカリスト実績
    {
      id: 'miku_fan',
      title: 'ミクファン',
      description: '初音ミクの曲を10曲以上知っている',
      icon: '💙',
      unlocked: (vocalistCount['初音ミク'] || 0) >= 10,
      progress: Math.min(vocalistCount['初音ミク'] || 0, 10),
      maxProgress: 10
    },
    {
      id: 'rin_len_fan',
      title: 'リン・レン推し',
      description: '鏡音リン・レンの曲を5曲以上知っている',
      icon: '💛',
      unlocked: (vocalistCount['鏡音リン'] || 0) + (vocalistCount['鏡音レン'] || 0) >= 5,
      progress: Math.min((vocalistCount['鏡音リン'] || 0) + (vocalistCount['鏡音レン'] || 0), 5),
      maxProgress: 5
    },
    {
      id: 'luka_fan',
      title: 'ルカ推し',
      description: '巡音ルカの曲を3曲以上知っている',
      icon: '💗',
      unlocked: (vocalistCount['巡音ルカ'] || 0) >= 3,
      progress: Math.min(vocalistCount['巡音ルカ'] || 0, 3),
      maxProgress: 3
    },
    {
      id: 'gumi_fan',
      title: 'GUMI推し',
      description: 'GUMIの曲を5曲以上知っている',
      icon: '💚',
      unlocked: (vocalistCount['GUMI'] || 0) >= 5,
      progress: Math.min(vocalistCount['GUMI'] || 0, 5),
      maxProgress: 5
    },
    
    // プロデューサー実績
    {
      id: 'ryo_fan',
      title: 'ryo/supercell通',
      description: 'ryoの曲を3曲以上知っている',
      icon: '🌟',
      unlocked: (producerCount['ryo'] || 0) >= 3,
      progress: Math.min(producerCount['ryo'] || 0, 3),
      maxProgress: 3
    },
    {
      id: 'deco27_fan',
      title: 'DECO*27ファン',
      description: 'DECO*27の曲を3曲以上知っている',
      icon: '🎹',
      unlocked: (producerCount['DECO*27'] || 0) >= 3,
      progress: Math.min(producerCount['DECO*27'] || 0, 3),
      maxProgress: 3
    },
    {
      id: 'hachi_fan',
      title: 'ハチ/米津玄師リスナー',
      description: 'ハチの曲を3曲以上知っている',
      icon: '🐝',
      unlocked: (producerCount['ハチ'] || 0) >= 3,
      progress: Math.min(producerCount['ハチ'] || 0, 3),
      maxProgress: 3
    },
    {
      id: 'jin_fan',
      title: 'じん/自然の敵P通',
      description: 'じんの曲を3曲以上知っている',
      icon: '👁️',
      unlocked: (producerCount['じん'] || 0) >= 3,
      progress: Math.min(producerCount['じん'] || 0, 3),
      maxProgress: 3
    },
    
    // 時代実績
    {
      id: 'dawn_expert',
      title: '黎明期マスター',
      description: '黎明期(2007-2009)の曲を10曲以上知っている',
      icon: '🌅',
      unlocked: (eraCount['dawn'] || 0) >= 10,
      progress: Math.min(eraCount['dawn'] || 0, 10),
      maxProgress: 10
    },
    {
      id: 'first_boom_expert',
      title: '第一次ブーム通',
      description: '第一次ブーム(2010-2012)の曲を10曲以上知っている',
      icon: '📈',
      unlocked: (eraCount['firstBoom'] || 0) >= 10,
      progress: Math.min(eraCount['firstBoom'] || 0, 10),
      maxProgress: 10
    },
    {
      id: 'golden_expert',
      title: '全盛期リスナー',
      description: '全盛期(2013-2015)の曲を10曲以上知っている',
      icon: '✨',
      unlocked: (eraCount['golden'] || 0) >= 10,
      progress: Math.min(eraCount['golden'] || 0, 10),
      maxProgress: 10
    },
    {
      id: 'modern_expert',
      title: '現代ボカロ通',
      description: '現代(2019-)の曲を5曲以上知っている',
      icon: '🚀',
      unlocked: (eraCount['modern'] || 0) >= 5,
      progress: Math.min(eraCount['modern'] || 0, 5),
      maxProgress: 5
    },
    
    // 特殊実績
    {
      id: 'era_master',
      title: '時代を超えるリスナー',
      description: 'すべての時代から曲を知っている',
      icon: '⏳',
      unlocked: Object.keys(eraTotalCount).every(era => (eraCount[era] || 0) > 0),
    },
    {
      id: 'old_school',
      title: 'オールドスクール',
      description: '黎明期と第一次ブームの曲が全体の75%以上',
      icon: '🕰️',
      unlocked: ((eraCount['dawn'] || 0) + (eraCount['firstBoom'] || 0)) / selectedSongs.length >= 0.75 && selectedSongs.length >= 10,
    },
    {
      id: 'trendsetter',
      title: 'トレンドセッター',
      description: '成熟期と現代の曲が全体の75%以上',
      icon: '📱',
      unlocked: ((eraCount['mature'] || 0) + (eraCount['modern'] || 0)) / selectedSongs.length >= 0.75 && selectedSongs.length >= 10,
    }
  ];
  
  return achievements;
}
