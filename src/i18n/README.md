# Obsidian Git 国际化 (i18n) 系统

## 概述

此插件已实现完整的国际化支持，允许用户选择不同的语言界面。

## 已支持的语言

- 英语 (en)
- 简体中文 (zh-CN / zh-cn / zh)

## 如何使用

国际化系统会在插件加载时自动初始化，并根据系统语言自动选择合适的语言。

### 在代码中使用翻译

```typescript
import { t } from "src/i18n";

// 基本用法
const message = t("notices.no-changes-to-commit");
// 输出（中文）: "没有要提交的更改"
// 输出（英文）: "No changes to commit"

// 带变量插值
const message = t("notices.pushed-files", {
    count: 5,
    file: "files"
});
// 输出（中文）: "已推送 5 个files到远程"
// 输出（英文）: "Pushed 5 files to remote"

// 嵌套键
const commandName = t("commands.edit-gitignore");
// 输出（中文）: "编辑 .gitignore"
// 输出（英文）: "Edit .gitignore"
```

### 变量插值

使用 `{{variableName}}` 语法在翻译字符串中插入变量：

```typescript
// 翻译文件中
"pushed-files": "已推送 {{count}} 个{{file}}到远程"

// 代码中
t("notices.pushed-files", { count: 3, file: "文件" })
// 输出: "已推送 3 个文件到远程"
```

## 添加新语言

### 1. 创建新的语言文件

在 `src/i18n/locales/` 目录下创建新的语言文件，例如 `ja.ts`（日语）：

```typescript
// ja.ts
export default {
    commands: {
        "edit-gitignore": ".gitignoreを編集",
        "open-git-view": "ソース管理ビューを開く",
        // ... 其他翻译
    },
    // ... 其他部分
};
```

### 2. 在 i18n/index.ts 中注册新语言

```typescript
import ja from "./locales/ja";

const locales: Record<string, Translation> = {
    en: en,
    "zh-CN": zhCN,
    "zh-cn": zhCN,
    zh: zhCN,
    ja: ja,  // 添加新语言
};
```

## 翻译键结构

翻译键按照功能分组：

- `commands.*` - 命令名称
- `notices.*` - 通知消息
- `modals.*` - 对话框文本
- `settings.*` - 设置页面
- `file-menu.*` - 文件菜单
- `views.*` - 视图相关
- `statusBar.*` - 状态栏
- `conflict.*` - 冲突文件
- `misc.*` - 其他

## API

### initI18n(locale?: string)

初始化i18n系统。

```typescript
import { initI18n } from "src/i18n";

// 自动检测系统语言
initI18n();

// 或指定语言
initI18n("zh-CN");
```

### t(key: string, variables?: Record<string, any>): string

获取翻译文本。

```typescript
import { t } from "src/i18n";

const text = t("notices.no-changes-to-commit");
const textWithVars = t("notices.pushed-files", { count: 5, file: "files" });
```

### setLocale(locale: string): boolean

设置当前语言。

```typescript
import { setLocale } from "src/i18n";

setLocale("zh-CN"); // 返回 true 如果成功
```

### getCurrentLocale(): string

获取当前语言代码。

```typescript
import { getCurrentLocale } from "src/i18n";

const current = getCurrentLocale(); // 返回 "zh-CN" 或 "en" 等
```

### getAvailableLocales(): string[]

获取所有可用的语言列表。

```typescript
import { getAvailableLocales } from "src/i18n";

const locales = getAvailableLocales(); // 返回 ["en", "zh-CN", "zh-cn", "zh"]
```

## 贡献翻译

欢迎贡献新的语言翻译！请按照以下步骤：

1. Fork 项目
2. 创建新的语言文件（参考 `en.ts` 或 `zh-cn.ts`）
3. 在 `index.ts` 中注册新语言
4. 提交 Pull Request

## 注意事项

- 翻译键使用点符号表示嵌套结构（如 `commands.commit`）
- 变量使用双花括号语法（如 `{{count}}`）
- 所有翻译字符串都应该是完整的句子或短语
- 保持翻译简洁明了，符合目标语言的习惯
