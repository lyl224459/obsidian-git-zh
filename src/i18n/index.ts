import { moment } from "obsidian";
import en from "./locales/en";
import zhCN from "./locales/zh-cn";

type Translation = typeof en;
type TranslationKey = string;

// 可用的语言环境
const locales: Record<string, Translation> = {
    en: en,
    "zh-CN": zhCN,
    "zh-cn": zhCN,
    zh: zhCN,
};

let currentLocale = "en";

/**
 * 初始化 i18n 系统
 * 自动检测系统语言或使用提供的区域设置
 */
export function initI18n(locale?: string): void {
    if (locale && locales[locale]) {
        currentLocale = locale;
    } else {
        // 尝试检测系统语言
        const systemLocale = moment.locale();
        if (locales[systemLocale]) {
            currentLocale = systemLocale;
        } else if (systemLocale.startsWith("zh")) {
            currentLocale = "zh-CN";
        }
    }
}

/**
 * 从嵌套对象获取值
 */
function getNestedValue(obj: unknown, path: string): unknown {
    return path.split(".").reduce((current: any, key) => current?.[key], obj);
}

/**
 * 替换字符串中的变量
 * 例如: "Hello {{name}}" with { name: "World" } => "Hello World"
 */
function interpolate(template: string, variables?: Record<string, string | number>): string {
    if (!variables) return template;
    
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] !== undefined ? String(variables[key]) : match;
    });
}

/**
 * 获取翻译文本
 * @param key - 翻译键（支持点符号表示嵌套，例如 "commands.commit"）
 * @param variables - 用于插值的变量对象
 * @returns 翻译的文本或键本身（如果未找到翻译）
 */
export function t(key: TranslationKey, variables?: Record<string, string | number>): string {
    const translation = locales[currentLocale] || locales.en;
    const value = getNestedValue(translation, key);
    
    if (value === undefined) {
        console.warn(`Translation not found for key: ${key}`);
        return key;
    }
    
    if (typeof value !== "string") {
        console.warn(`Translation value is not a string for key: ${key}`);
        return key;
    }
    
    return interpolate(value, variables);
}

/**
 * 获取当前区域设置
 */
export function getCurrentLocale(): string {
    return currentLocale;
}

/**
 * 设置当前区域设置
 */
export function setLocale(locale: string): boolean {
    if (locales[locale]) {
        currentLocale = locale;
        return true;
    }
    return false;
}

/**
 * 获取所有可用的区域设置
 */
export function getAvailableLocales(): string[] {
    return Object.keys(locales);
}

// 导出类型以供其他文件使用
export type { Translation, TranslationKey };
