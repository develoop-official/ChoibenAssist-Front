'use client';

import React, { useState, useEffect } from 'react';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';

interface HashtagSearchProps {
  onHashtagSelect: (_hashtag: string) => void;
  selectedHashtag?: string;
}

interface HashtagCount {
  hashtag: string;
  count: number;
}

export default function HashtagSearch({ onHashtagSelect, selectedHashtag }: HashtagSearchProps) {
  const [hashtags, setHashtags] = useState<HashtagCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPopularHashtags();
  }, []);

  const fetchPopularHashtags = async () => {
    try {
      setLoading(true);

      // 実際のデータベースからハッシュタグを取得
      const { data, error } = await supabase!
        .from('timeline_posts')
        .select('hashtags')
        .not('hashtags', 'is', null);

      if (error) {
        console.error('ハッシュタグ取得エラー:', error);
        // エラーの場合はダミーデータを使用
        const dummyHashtags: HashtagCount[] = [
          { hashtag: 'React', count: 15 },
          { hashtag: 'JavaScript', count: 12 },
          { hashtag: 'TypeScript', count: 8 },
          { hashtag: 'Next.js', count: 6 },
          { hashtag: 'プログラミング', count: 20 },
          { hashtag: '英語', count: 10 },
          { hashtag: '数学', count: 7 },
          { hashtag: '物理', count: 5 },
          { hashtag: '化学', count: 4 },
          { hashtag: '歴史', count: 3 }
        ];
        setHashtags(dummyHashtags);
        return;
      }

      // ハッシュタグを集計
      const hashtagCounts: { [key: string]: number } = {};

      (data || []).forEach(post => {
        if (post.hashtags && Array.isArray(post.hashtags)) {
          post.hashtags.forEach(tag => {
            if (tag) {
              hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
            }
          });
        }
      });

      // カウント順にソート
      const sortedHashtags: HashtagCount[] = Object.entries(hashtagCounts)
        .map(([hashtag, count]) => ({ hashtag, count }))
        .sort((a, b) => b.count - a.count);

      setHashtags(sortedHashtags);
    } catch (err) {
      console.error('ハッシュタグ取得エラー:', err);
      // エラーの場合はダミーデータを使用
      const dummyHashtags: HashtagCount[] = [
        { hashtag: 'React', count: 15 },
        { hashtag: 'JavaScript', count: 12 },
        { hashtag: 'TypeScript', count: 8 },
        { hashtag: 'Next.js', count: 6 },
        { hashtag: 'プログラミング', count: 20 },
        { hashtag: '英語', count: 10 },
        { hashtag: '数学', count: 7 },
        { hashtag: '物理', count: 5 },
        { hashtag: '化学', count: 4 },
        { hashtag: '歴史', count: 3 }
      ];
      setHashtags(dummyHashtags);
    } finally {
      setLoading(false);
    }
  };

  const filteredHashtags = hashtags.filter(tag =>
    tag.hashtag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleHashtagClick = (hashtag: string) => {
    if (selectedHashtag === hashtag) {
      // 同じハッシュタグをクリックした場合は選択解除
      onHashtagSelect('');
    } else {
      onHashtagSelect(hashtag);
    }
  };

  return (
    <div className={css({
      bg: 'white',
      rounded: 'lg',
      p: '4',
      shadow: 'md',
      border: '1px solid',
      borderColor: 'gray.200',
      mb: '6'
    })}>
      <h3 className={css({
        fontSize: 'lg',
        fontWeight: 'bold',
        color: 'gray.900',
        mb: '3'
      })}>
        🔍 ハッシュタグ検索
      </h3>

      {/* 検索バー */}
      <div className={css({ mb: '4' })}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ハッシュタグを検索..."
          className={css({
            w: 'full',
            p: '3',
            border: '1px solid',
            borderColor: 'gray.300',
            rounded: 'md',
            fontSize: 'sm',
            _focus: {
              outline: 'none',
              borderColor: 'blue.500',
              ring: '1px',
              ringColor: 'blue.200'
            }
          })}
        />
      </div>

      {/* 選択中のハッシュタグ */}
      {selectedHashtag && (
        <div className={css({
          mb: '4',
          p: '3',
          bg: 'blue.50',
          border: '1px solid',
          borderColor: 'blue.200',
          rounded: 'md'
        })}>
          <div className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          })}>
            <span className={css({
              fontSize: 'sm',
              fontWeight: 'medium',
              color: 'blue.700'
            })}>
              選択中: #{selectedHashtag}
            </span>
            <button
              onClick={() => onHashtagSelect('')}
              className={css({
                p: '1',
                color: 'blue.600',
                _hover: { color: 'blue.800' }
              })}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ハッシュタグ一覧 */}
      {loading ? (
        <div className={css({
          textAlign: 'center',
          py: '4',
          color: 'gray.500'
        })}>
          読み込み中...
        </div>
      ) : (
        <div className={css({
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2'
        })}>
          {filteredHashtags.length === 0 ? (
            <div className={css({
              w: 'full',
              textAlign: 'center',
              py: '4',
              color: 'gray.500',
              fontSize: 'sm'
            })}>
              {searchTerm ? '該当するハッシュタグが見つかりません' : 'ハッシュタグがありません'}
            </div>
          ) : (
            filteredHashtags.map(tag => (
              <button
                key={tag.hashtag}
                onClick={() => handleHashtagClick(tag.hashtag)}
                className={css({
                  px: '3',
                  py: '2',
                  rounded: 'full',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  ...(selectedHashtag === tag.hashtag
                    ? {
                        bg: 'blue.600',
                        color: 'white',
                        _hover: { bg: 'blue.700' }
                      }
                    : {
                        bg: 'gray.100',
                        color: 'gray.700',
                        border: '1px solid',
                        borderColor: 'gray.200',
                        _hover: { bg: 'gray.200' }
                      }
                  )
                })}
              >
                <span className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  #{tag.hashtag}
                  <span className={css({
                    fontSize: 'xs',
                    opacity: '0.8'
                  })}>
                    {tag.count}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {/* 人気ハッシュタグ */}
      {!searchTerm && hashtags.length > 0 && (
        <div className={css({
          mt: '4',
          pt: '4',
          borderTop: '1px solid',
          borderColor: 'gray.200'
        })}>
          <h4 className={css({
            fontSize: 'sm',
            fontWeight: 'bold',
            color: 'gray.700',
            mb: '2'
          })}>
            人気のハッシュタグ
          </h4>
          <div className={css({
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2'
          })}>
            {hashtags.slice(0, 5).map(tag => (
              <button
                key={tag.hashtag}
                onClick={() => handleHashtagClick(tag.hashtag)}
                className={css({
                  px: '2',
                  py: '1',
                  rounded: 'full',
                  fontSize: 'xs',
                  fontWeight: 'medium',
                  bg: 'yellow.100',
                  color: 'yellow.800',
                  border: '1px solid',
                  borderColor: 'yellow.200',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  _hover: { bg: 'yellow.200' }
                })}
              >
                #{tag.hashtag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
