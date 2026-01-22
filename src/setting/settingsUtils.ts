import { Notice, Platform, Setting } from "obsidian";
import type { TextComponent, TextAreaComponent } from "obsidian";
import type ObsidianGit from "src/main";
import type { ObsidianGitSettings } from "src/types";
import { DEFAULT_SETTINGS } from "src/constants";
import { SimpleGit } from "src/gitManager/simpleGit";
import type { ObsidianGitPlugin } from "../types";
import { t } from "src/i18n";

/**
 * 设置工具方法
 * 这些方法被 ObsidianGitSettingsTab 类使用
 */

export function addDeviceIndicator(containerEl: Element, deviceType: string): void {
    const indicator = containerEl.createDiv("git-device-indicator");

    const deviceInfo = (() => {
        switch (deviceType) {
            case 'tablet':
                return {
                    icon: t("settings.device-indicator.tablet.icon"),
                    text: t("settings.device-indicator.tablet.text"),
                    desc: t("settings.device-indicator.tablet.desc"),
                };
            case 'mobile':
                return {
                    icon: t("settings.device-indicator.mobile.icon"),
                    text: t("settings.device-indicator.mobile.text"),
                    desc: t("settings.device-indicator.mobile.desc"),
                };
            default:
                return {
                    icon: t("settings.device-indicator.desktop.icon"),
                    text: t("settings.device-indicator.desktop.text"),
                    desc: t("settings.device-indicator.desktop.desc"),
                };
        }
    })();

    indicator.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; padding: 12px; background: var(--background-secondary); border-radius: 8px; margin-bottom: 20px;">
            <span style="font-size: 20px;">${deviceInfo.icon}</span>
            <div>
                <div style="font-weight: bold; color: var(--text-normal);">${deviceInfo.text}</div>
                <div style="font-size: 12px; color: var(--text-muted);">${deviceInfo.desc}</div>
            </div>
        </div>
    `;
}

export function addCustomStyles(containerEl: Element): void {
    const style = containerEl.createEl("style");
    style.textContent = `
        .git-settings-section {
            margin-bottom: 2em;
            padding: 1.5em;
            background: var(--background-primary);
            border: 1px solid var(--background-modifier-border);
            border-radius: 8px;
        }

        .git-settings-section h3 {
            margin-top: 0;
            margin-bottom: 1em;
            font-size: 1.2em;
            font-weight: 600;
            color: var(--text-accent);
        }

        .git-settings-section h4 {
            color: var(--text-accent);
            font-size: 1.1em;
            font-weight: 600;
        }

        .git-device-indicator {
            margin-bottom: 1.5em;
        }

        .setting-item-description {
            color: var(--text-muted);
            font-size: 0.9em;
            margin-top: 0.25em;
        }

        /* 移动端优化 */
        @media (max-width: 768px) {
            .git-settings-section {
                padding: 1em;
                margin-bottom: 1.5em;
            }

            .git-settings-section h3 {
                font-size: 1.1em;
            }
        }

        /* 平板优化 */
        @media (min-width: 769px) and (max-width: 1024px) {
            .git-settings-section {
                padding: 1.2em;
            }
        }

        /* 快速操作样式 */
        .git-guide-section {
            background: linear-gradient(135deg, var(--background-primary) 0%, var(--background-secondary) 100%);
            border: 1px solid var(--interactive-accent);
        }

        .git-quick-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 12px;
            margin-bottom: 2em;
        }

        .git-quick-action-btn {
            transition: all 0.15s ease;
        }

        .git-quick-action-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .git-tips-section ul {
            list-style-type: none;
            padding-left: 0;
        }

        .git-tips-section li {
            position: relative;
            padding-left: 1.5em;
        }

        .git-tips-section li:before {
            content: "💡";
            position: absolute;
            left: 0;
            top: 0;
        }

        /* 移动端快速操作优化 */
        @media (max-width: 768px) {
            .git-quick-actions {
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
            }

            .git-quick-action-btn {
                padding: 8px !important;
                min-height: 80px;
            }

            .git-quick-action-btn span:first-child {
                font-size: 18px !important;
            }

            .git-quick-action-btn span:nth-child(2) {
                font-size: 11px !important;
            }

            .git-quick-action-btn span:nth-child(3) {
                font-size: 9px !important;
            }
        }

        /* 平板端快速操作优化 */
        @media (min-width: 769px) and (max-width: 1024px) {
            .git-quick-actions {
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }
        }
    `;
}

export function addQuickStartGuide(
    containerEl: Element,
    plugin: ObsidianGit,
    isMobileOrTablet: boolean
): void {
    const guideSection = containerEl.createDiv("git-settings-section git-guide-section");
    guideSection.createEl("h3", {
        text: t("settings.heading.quick-start-guide")
    });

    // 快速操作按钮
    const quickActions = guideSection.createDiv("git-quick-actions");

    const actions = [
        {
            icon: "📁",
            title: t("settings.quick-actions.open-source-control.title"),
            desc: t("settings.quick-actions.open-source-control.desc"),
            action: () => plugin.app.commands.executeCommandById("obsidian-git-zh:open-source-control-view")
        },
        {
            icon: "📜",
            title: t("settings.quick-actions.open-history.title"),
            desc: t("settings.quick-actions.open-history.desc"),
            action: () => plugin.app.commands.executeCommandById("obsidian-git-zh:open-history-view")
        },
        {
            icon: "🔍",
            title: t("settings.quick-actions.open-diff.title"),
            desc: t("settings.quick-actions.open-diff.desc"),
            action: () => plugin.app.commands.executeCommandById("obsidian-git-zh:open-diff-view")
        },
        {
            icon: "⚡",
            title: t("settings.quick-actions.commit-now.title"),
            desc: t("settings.quick-actions.commit-now.desc"),
            action: () => plugin.app.commands.executeCommandById("obsidian-git-zh:commit")
        }
    ];

    actions.forEach(action => {
        const actionBtn = quickActions.createEl("button", {
            cls: "git-quick-action-btn",
            attr: {
                title: action.desc,
                style: "display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px; border: 1px solid var(--background-modifier-border); border-radius: 8px; background: var(--background-primary); cursor: pointer; transition: all 0.15s ease;"
            }
        });

        actionBtn.innerHTML = `
            <span style="font-size: 20px;">${action.icon}</span>
            <span style="font-size: 12px; font-weight: 500; color: var(--text-normal);">${action.title}</span>
            <span style="font-size: 10px; color: var(--text-muted); text-align: center;">${action.desc}</span>
        `;

        actionBtn.addEventListener("click", () => {
            try {
                action.action();
            } catch (e) {
                console.error("Failed to execute action:", e);
                new Notice(t("settings.action-failed"), 3000);
            }
        });

        // 添加悬停效果
        actionBtn.addEventListener("mouseenter", () => {
            actionBtn.style.background = "var(--background-modifier-hover)";
            actionBtn.style.borderColor = "var(--interactive-accent)";
        });

        actionBtn.addEventListener("mouseleave", () => {
            actionBtn.style.background = "var(--background-primary)";
            actionBtn.style.borderColor = "var(--background-modifier-border)";
        });
    });

    // 使用提示
    const tipsSection = guideSection.createDiv("git-tips-section");
    const tipsTitle = tipsSection.createEl("h4", {
        text: t("settings.heading.usage-tips")
    });
    tipsTitle.style.margin = "1.5em 0 0.5em 0";

    const tips = [
        t("settings.usage-tips.mobile"),
        t("settings.usage-tips.auto"),
        t("settings.usage-tips.history"),
        t("settings.usage-tips.debug")
    ];

    const tipsList = tipsSection.createEl("ul", {
        attr: { style: "margin: 0; padding-left: 1.5em;" }
    });

    tips.forEach(tip => {
        tipsList.createEl("li", {
            text: tip,
            attr: { style: "margin-bottom: 0.5em; color: var(--text-muted); font-size: 0.9em;" }
        });
    });
}

export function getDebugInfo(plugin: ObsidianGit): string {
    const debugInfo = {
        version: plugin.manifest.version,
        settings: plugin.settings,
        gitManager: plugin.gitManager instanceof SimpleGit ? "SimpleGit" : "IsomorphicGit",
        deviceType: (plugin as ObsidianGitPlugin).deviceType || "desktop",
        automaticsEnabled: plugin.automaticsManager?.isEnabled() || false,
    };

    return JSON.stringify(debugInfo, null, 2);
}

export function setNonDefaultValue(
    plugin: ObsidianGit,
    {
        settingsProperty,
        text,
    }: {
        settingsProperty: keyof ObsidianGitSettings;
        text: TextComponent | TextAreaComponent;
    }
): void {
    const storedValue = plugin.settings[settingsProperty];
    const defaultValue = DEFAULT_SETTINGS[settingsProperty];

    if (defaultValue !== storedValue) {
        // Doesn't add "" to saved strings
        if (
            typeof storedValue === "string" ||
            typeof storedValue === "number" ||
            typeof storedValue === "boolean"
        ) {
            text.setValue(String(storedValue));
        } else {
            text.setValue(JSON.stringify(storedValue));
        }
    }
}

export function mayDisableSetting(setting: Setting, disable: boolean) {
    if (disable) {
        setting.setDisabled(disable);
        setting.setClass("obsidian-git-disabled");
    }
}
