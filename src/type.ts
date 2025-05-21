// VocaloidSong型の定義
export interface VocaloidSong {
  id: number;
  title: string;
  producer: string;
  year: number;
  youtubeId?: string; // 試聴用（著作権に注意）
  era: 'dawn' | 'boom' | 'gold' | 'diserve' | 'revival' | 'ai'; // 時代区分
  videoPath?: string; // 動画ファイルへのパス（オプショナル）
  startTime?: number; // 動画の開始秒数（オプショナル）
}
