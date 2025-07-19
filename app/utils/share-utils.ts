// シェア機能用のユーティリティ関数

export interface ShareData {
  title: string;
  text: string;
  url: string;
  hashtags?: string[];
}

/**
 * Web Share APIを使用してシェアする
 */
export const shareWithWebAPI = async (data: ShareData): Promise<boolean> => {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title: data.title,
      text: data.text,
      url: data.url
    });
    return true;
  } catch (error) {
    console.error('Web Share API エラー:', error);
    return false;
  }
};

/**
 * Twitterでシェアする
 */
export const shareOnTwitter = (data: ShareData): void => {
  const hashtags = data.hashtags?.map(tag => tag.replace(/[#\s]/g, '')).join(',') || '';
  const text = `${data.text} ${hashtags ? `#${hashtags}` : ''}`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(data.url)}`;

  window.open(url, '_blank', 'width=600,height=400');
};

/**
 * Google+でシェアする（Google+は終了しているため、Google検索でシェア）
 */
export const shareOnGoogle = (data: ShareData): void => {
  const url = `https://www.google.com/search?q=${encodeURIComponent(data.title + ' ' + data.text)}`;
  window.open(url, '_blank');
};

/**
 * Facebookでシェアする
 */
export const shareOnFacebook = (data: ShareData): void => {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`;
  window.open(url, '_blank', 'width=600,height=400');
};

/**
 * LinkedInでシェアする
 */
export const shareOnLinkedIn = (data: ShareData): void => {
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`;
  window.open(url, '_blank', 'width=600,height=400');
};

/**
 * メールでシェアする
 */
export const shareViaEmail = (data: ShareData): void => {
  const subject = encodeURIComponent(data.title);
  const body = encodeURIComponent(`${data.text}\n\n${data.url}`);
  const url = `mailto:?subject=${subject}&body=${body}`;
  window.location.href = url;
};

/**
 * クリップボードにコピーする
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // フォールバック: 古いブラウザ用
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  } catch (error) {
    console.error('クリップボードコピーエラー:', error);
    return false;
  }
};

/**
 * 投稿用のシェアデータを生成する
 */
export const createPostShareData = (post: {
  content: string;
  hashtags: string[];
  user_profile?: { username?: string; full_name?: string };
}, postUrl: string): ShareData => {
  const username = post.user_profile?.username || post.user_profile?.full_name || 'ユーザー';
  const title = `${username}の投稿 - ちょい勉`;
  const text = post.content;

  return {
    title,
    text,
    url: postUrl,
    hashtags: post.hashtags
  };
};
