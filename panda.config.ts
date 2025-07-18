import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./app/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          primary: {
            50: { value: '#FBFFE4' }, // 非常に薄い緑
            100: { value: '#F0F9E8' }, // 薄い緑
            200: { value: '#E1F3D1' }, // より薄い緑
            300: { value: '#C8E6B5' }, // 淡い緑
            400: { value: '#B3D8A8' }, // 指定された優しい緑
            500: { value: '#9BC995' }, // 中間の緑
            600: { value: '#7FB582' }, // やや濃い緑
            700: { value: '#5A9F6F' }, // 濃い緑
            800: { value: '#3D8D7A' }, // 指定された青っぽい緑
            900: { value: '#2D6B5D' }, // 最も濃い緑
          },
          // 学習に関連したカテゴリ色も緑系に統一
          accent: {
            math: { value: '#7FB582' },     // 数学 - やや濃い緑
            english: { value: '#9BC995' },  // 英語 - 中間の緑
            science: { value: '#5A9F6F' },  // 理科 - 濃い緑
            social: { value: '#3D8D7A' },   // 社会 - 青っぽい緑
            programming: { value: '#2D6B5D' }, // プログラミング - 最も濃い緑
            other: { value: '#B3D8A8' },    // その他 - 優しい緑
          },
          // セマンティックカラー
          success: {
            50: { value: '#FBFFE4' },
            100: { value: '#F0F9E8' },
            500: { value: '#7FB582' },
            600: { value: '#5A9F6F' },
            700: { value: '#3D8D7A' },
          }
        },
        spacing: {
          card: { value: '1.5rem' },
          cardLg: { value: '2rem' },
        },
        radii: {
          card: { value: '1rem' },
          cardLg: { value: '1.5rem' },
        }
      }
    },
  },

  // CSS output configuration
  outdir: "styled-system",
});
