import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      import: (await import("eslint-plugin-import")).default,
      // "filename-rules": (await import("eslint-plugin-filename-rules")).default,
    },
    rules: {
      // 開発ブランチ保護ルール
      "no-console": ["warn", { allow: ["warn", "error"] }],
      
      // コード品質ルール
      "prefer-const": "error",
      "no-var": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      
      // TypeScript固有ルール
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      
      // React/Next.jsルール
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "error",
      "react/jsx-key": "error",
      
      // Next.js 画像最適化ルール
      "@next/next/no-img-element": "error", // warningからerrorに変更
      
      // インポートルール
      "import/order": [
        "warn",
        {
          "groups": [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index"
          ],
          "newlines-between": "always",
          "alphabetize": {
            "order": "asc",
            "caseInsensitive": true
          }
        }
      ],
      
      // コメントルール
      "spaced-comment": ["error", "always"],
      
      // 空白・フォーマットルール
      "no-trailing-spaces": "error",
      "eol-last": "error",
      "no-multiple-empty-lines": ["error", { "max": 2 }],
      
      // セキュリティルール
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      
      // パフォーマンスルール
      "react/jsx-no-bind": [
        "warn",
        {
          "allowArrowFunctions": true,
          "allowBind": false,
          "ignoreRefs": true
        }
      ]
    }
  },
  {
    // 特定のファイルに対するルール
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off"
    }
  },
  {
    // 設定ファイルに対するルール
    files: ["**/*.config.*", "**/*.config.js", "**/*.config.mjs"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
];

export default eslintConfig;
