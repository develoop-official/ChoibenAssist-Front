'use client';

import { css } from '../../styled-system/css';

export default function SupabaseSetupNotice() {
  return (
    <div className={css({
      position: 'fixed',
      top: '4',
      right: '4',
      zIndex: 1000,
      maxW: 'md',
      bg: 'yellow.50',
      border: '1px solid',
      borderColor: 'yellow.200',
      rounded: 'lg',
      p: '4',
      shadow: 'lg'
    })}>
      <div className={css({
        display: 'flex',
        alignItems: 'flex-start',
        gap: '3'
      })}>
        <div className={css({
          w: '5',
          h: '5',
          bg: 'yellow.400',
          rounded: 'full',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          mt: '0.5'
        })}>
          <span className={css({
            fontSize: 'xs',
            color: 'white',
            fontWeight: 'bold'
          })}>
            ⚠️
          </span>
        </div>

        <div className={css({
          flex: '1'
        })}>
          <h3 className={css({
            fontSize: 'sm',
            fontWeight: 'bold',
            color: 'yellow.800',
            mb: '1'
          })}>
            Supabase設定が必要です
          </h3>

          <p className={css({
            fontSize: 'xs',
            color: 'yellow.700',
            mb: '2',
            lineHeight: 'relaxed'
          })}>
            認証機能を使用するには、Supabaseの環境変数を設定してください。
          </p>

          <div className={css({
            fontSize: 'xs',
            color: 'yellow.700',
            spaceY: '1'
          })}>
            <p>1. プロジェクトルートに<code className={css({ bg: 'yellow.100', px: '1', rounded: 'sm' })}>.env.local</code>ファイルを作成</p>
            <p>2. 以下の環境変数を設定：</p>
            <pre className={css({
              bg: 'yellow.100',
              p: '2',
              rounded: 'sm',
              fontSize: 'xs',
              overflow: 'auto'
            })}>
{`NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`}
            </pre>
            <p>3. 開発サーバーを再起動</p>
          </div>

          <p className={css({
            fontSize: 'xs',
            color: 'yellow.600',
            mt: '2'
          })}>
            詳細は<code className={css({ bg: 'yellow.100', px: '1', rounded: 'sm' })}>SUPABASE_SETUP.md</code>を参照してください。
          </p>
        </div>
      </div>
    </div>
  );
}
