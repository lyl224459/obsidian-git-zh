import { Notice, Platform, Setting } from "obsidian";
import type ObsidianGit from "src/main";
import type { ObsidianGitPlugin } from "../types";
import { DEFAULT_SETTINGS } from "src/constants";
import { t } from "src/i18n";
import { setNonDefaultValue, mayDisableSetting } from "./settingsUtils";
import { addLineAuthorInfoSettings } from "./settingsLineAuthor";

/**
 * 设置分组创建方法
 * 这些方法被 ObsidianGitSettingsTab 类使用
 */

export function createAutomationSection(
    containerEl: Element,
    plugin: ObsidianGit,
    commitOrSync: string,
    isMobileOrTablet: boolean
): void {
    const section = containerEl.createDiv("git-settings-section");
    section.createEl("h3", {
        text: t("settings.heading.automation-settings")
    });

    // 分离定时器设置
    new Setting(section)
        .setName(t("settings.split-timers.name"))
        .setDesc(t("settings.split-timers.desc"))
        .addToggle((toggle) =>
            toggle
                .setValue(plugin.settings.differentIntervalCommitAndPush)
                .onChange(async (value) => {
                    plugin.settings.differentIntervalCommitAndPush = value;
                    await plugin.saveSettings();
                    plugin.automaticsManager.reload("commit", "push");
                    // refreshDisplayWithDelay will be called from the main class
                })
        );

    // 自动保存间隔
    new Setting(section)
        .setName(t("settings.auto-save-interval.name", { commitOrSync }))
        .setDesc(
            t("settings.auto-save-interval.desc", {
                action: plugin.settings.differentIntervalCommitAndPush
                    ? t("settings.auto-save-interval.action-commit")
                    : t("settings.auto-save-interval.action-commit-and-sync")
            })
        )
        .addText((text) => {
            text.inputEl.type = "number";
            setNonDefaultValue(plugin, {
                text,
                settingsProperty: "autoSaveInterval",
            });
            text.setPlaceholder(String(DEFAULT_SETTINGS.autoSaveInterval));
            text.onChange(async (value) => {
                if (value !== "") {
                    plugin.settings.autoSaveInterval = Number(value);
                } else {
                    plugin.settings.autoSaveInterval = DEFAULT_SETTINGS.autoSaveInterval;
                }
                await plugin.saveSettings();
                plugin.automaticsManager.reload("commit");
            });
        });

    // 自动推送间隔
    new Setting(section)
        .setName(t("settings.auto-push-interval.name"))
        .setDesc(t("settings.auto-push-interval.desc"))
        .addText((text) => {
            text.inputEl.type = "number";
            setNonDefaultValue(plugin, {
                text,
                settingsProperty: "autoPushInterval",
            });
            text.setPlaceholder(String(DEFAULT_SETTINGS.autoPushInterval));
            text.onChange(async (value) => {
                if (value !== "") {
                    plugin.settings.autoPushInterval = Number(value);
                } else {
                    plugin.settings.autoPushInterval = DEFAULT_SETTINGS.autoPushInterval;
                }
                await plugin.saveSettings();
                plugin.automaticsManager.reload("push");
            });
        });

    // 自动拉取间隔
    new Setting(section)
        .setName(t("settings.auto-pull-interval.name"))
        .setDesc(t("settings.auto-pull-interval.desc"))
        .addText((text) => {
            text.inputEl.type = "number";
            setNonDefaultValue(plugin, {
                text,
                settingsProperty: "autoPullInterval",
            });
            text.setPlaceholder(String(DEFAULT_SETTINGS.autoPullInterval));
            text.onChange(async (value) => {
                if (value !== "") {
                    plugin.settings.autoPullInterval = Number(value);
                } else {
                    plugin.settings.autoPullInterval = DEFAULT_SETTINGS.autoPullInterval;
                }
                await plugin.saveSettings();
                plugin.automaticsManager.reload("pull");
            });
        });

    // 其他自动化设置只在桌面设备上显示
    if (!isMobileOrTablet) {
        // 启动时自动拉取
        new Setting(section)
            .setName(t("settings.auto-pull-on-boot.name"))
            .setDesc(t("settings.auto-pull-on-boot.desc"))
            .addToggle((toggle) =>
                toggle
                    .setValue(plugin.settings.autoPullOnBoot)
                    .onChange(async (value) => {
                        plugin.settings.autoPullOnBoot = value;
                        await plugin.saveSettings();
                    })
            );

        // 文件变更后自动备份
        const autoBackupSetting = new Setting(section)
            .setName(t("settings.auto-backup-after-file-change.name"))
            .setDesc(t("settings.auto-backup-after-file-change.desc"))
            .addToggle((toggle) =>
                toggle
                    .setValue(plugin.settings.autoBackupAfterFileChange)
                    .onChange(async (value) => {
                        plugin.settings.autoBackupAfterFileChange = value;
                        await plugin.saveSettings();
                        plugin.automaticsManager.reload("commit");
                    })
            );
        mayDisableSetting(
            autoBackupSetting,
            plugin.settings.autoBackupAfterFileChange
        );
    }
}

export function createCommitSection(containerEl: Element, plugin: ObsidianGit): void {
    const section = containerEl.createDiv("git-settings-section");
    section.createEl("h3", {
        text: t("settings.heading.commit-settings")
    });

    // 提交消息模板
    new Setting(section)
        .setName(t("settings.commit-message.name"))
        .setDesc(t("settings.commit-message.desc"))
        .addTextArea((cb) => {
            cb.setValue(plugin.settings.commitMessage);
            cb.onChange(async (value) => {
                plugin.settings.commitMessage = value;
                await plugin.saveSettings();
            });
        });

    // 提交作者信息
    if (!Platform.isMobileApp) {
        new Setting(section)
            .setName(t("settings.author-name.name"))
            .setDesc(t("settings.author-name.desc"))
            .addText((text) => {
                text.setValue(plugin.settings.authorName || "");
                text.setPlaceholder("Your Name");
                text.onChange(async (value) => {
                    plugin.settings.authorName = value;
                    await plugin.saveSettings();
                });
            });

        new Setting(section)
            .setName(t("settings.author-email.name"))
            .setDesc(t("settings.author-email.desc"))
            .addText((text) => {
                text.setValue(plugin.settings.authorEmail || "");
                text.setPlaceholder("your.email@example.com");
                text.onChange(async (value) => {
                    plugin.settings.authorEmail = value;
                    await plugin.saveSettings();
                });
            });
    }
}

export function createViewSection(
    containerEl: Element,
    plugin: ObsidianGit,
    isMobileOrTablet: boolean
): void {
    const section = containerEl.createDiv("git-settings-section");
    section.createEl("h3", {
        text: t("settings.heading.view-settings")
    });

    // 历史记录视图设置
    new Setting(section)
        .setName(t("settings.history-view.name"))
        .setHeading();

    new Setting(section)
        .setName(t("settings.date-in-history-view.name"))
        .setDesc(t("settings.date-in-history-view.desc"))
        .addToggle((toggle) =>
            toggle
                .setValue(plugin.settings.dateInHistoryView)
                .onChange(async (value) => {
                    plugin.settings.dateInHistoryView = value;
                    await plugin.saveSettings();
                })
        );

    new Setting(section)
        .setName(t("settings.commit-date-format.name"))
        .setDesc(t("settings.commit-date-format.desc"))
        .addText((text) => {
            text.setValue(plugin.settings.commitDateFormat);
            text.setPlaceholder("YYYY-MM-DD HH:mm:ss");
            text.onChange(async (value) => {
                plugin.settings.commitDateFormat = value;
                await plugin.saveSettings();
            });
        });

    // 源代码管理视图设置
    new Setting(section)
        .setName(t("settings.source-control-view.name"))
        .setHeading();

    new Setting(section)
        .setName(t("settings.tree-structure.name"))
        .setDesc(t("settings.tree-structure.desc"))
        .addToggle((toggle) =>
            toggle
                .setValue(plugin.settings.treeStructure)
                .onChange(async (value) => {
                    plugin.settings.treeStructure = value;
                    await plugin.saveSettings();
                })
        );

    // 只在桌面设备上显示高级视图设置
    if (!isMobileOrTablet) {
        new Setting(section)
            .setName(t("settings.show-status-bar.name"))
            .setDesc(t("settings.show-status-bar.desc"))
            .addToggle((toggle) =>
                toggle
                    .setValue(plugin.settings.showStatusBar)
                    .onChange(async (value) => {
                        plugin.settings.showStatusBar = value;
                        await plugin.saveSettings();
                    })
            );

        new Setting(section)
            .setName(t("settings.show-branch-status-bar.name"))
            .setDesc(t("settings.show-branch-status-bar.desc"))
            .addToggle((toggle) =>
                toggle
                    .setValue(plugin.settings.showBranchStatusBar)
                    .onChange(async (value) => {
                        plugin.settings.showBranchStatusBar = value;
                        await plugin.saveSettings();
                    })
            );

        // 行作者信息设置（仅桌面端）
        new Setting(section)
            .setName(t("settings.line-author-show.name"))
            .setHeading();

        addLineAuthorInfoSettings(section, plugin);
    }
}

export function createAdvancedSection(
    containerEl: Element,
    plugin: ObsidianGit
): void {
    const section = containerEl.createDiv("git-settings-section");
    section.createEl("h3", {
        text: t("settings.heading.advanced")
    });

    // 差异样式设置
    new Setting(section)
        .setName(t("settings.diff-style.name"))
        .setDesc(t("settings.diff-style.desc"))
        .addDropdown((dropdown) => {
            dropdown.addOption("git_unified", t("settings.diff-style.unified"));
            dropdown.addOption("split", t("settings.diff-style.split"));
            dropdown.setValue(plugin.settings.diffStyle);
            dropdown.onChange(async (value: "git_unified" | "split") => {
                plugin.settings.diffStyle = value;
                await plugin.saveSettings();
            });
        });

    // Git 目录设置
    new Setting(section)
        .setName(t("settings.custom-base-path.name"))
        .setDesc(t("settings.custom-base-path.desc"))
        .addText((cb) => {
            cb.setValue(plugin.settings.basePath);
            cb.setPlaceholder("directory/directory-with-git-repo");
            cb.onChange(async (value) => {
                plugin.settings.basePath = value;
                await plugin.saveSettings();
                plugin.gitManager
                    .updateBasePath(value || "")
                    .catch((e) => plugin.displayError(e));
            });
        });

    new Setting(section)
        .setName(t("settings.custom-git-dir.name"))
        .setDesc(t("settings.custom-git-dir.desc"))
        .addText((cb) => {
            cb.setValue(plugin.settings.gitDir);
            cb.setPlaceholder(".git");
            cb.onChange(async (value) => {
                plugin.settings.gitDir = value;
                await plugin.saveSettings();
            });
        });

    // 调试信息
    const debugSection = containerEl.createDiv("git-settings-section");
    debugSection.createEl("h3", {
        text: t("settings.heading.debug-info")
    });

    // 调试信息按钮
    new Setting(debugSection)
        .setName(t("settings.debugging-info.name"))
        .setDesc(t("settings.debugging-info.desc"))
        .addButton((button) =>
            button.setButtonText(t("settings.debugging-info.button")).onClick(async () => {
                const { getDebugInfo } = await import("./settingsUtils");
                const info = getDebugInfo(plugin);
                await navigator.clipboard.writeText(info);
                new Notice(t("notices.copy-debug-info"));
            })
        );
}

export function createMobileOptimizationSection(
    containerEl: Element,
    plugin: ObsidianGit
): void {
    if (!Platform.isMobileApp) {
        return;
    }

    const section = containerEl.createDiv("git-settings-section");
    section.createEl("h3", {
        text: t("settings.mobile-optimization.heading")
    });

    new Setting(section)
        .setName(t("settings.mobile-optimization.enable-optimization.name"))
        .setDesc(t("settings.mobile-optimization.enable-optimization.desc"))
        .addToggle((toggle) =>
            toggle
                .setValue(plugin.settings.mobileOptimizationsEnabled)
                .onChange(async (value) => {
                    plugin.settings.mobileOptimizationsEnabled = value;
                    await plugin.saveSettings();
                    if (value) {
                        new Notice(t("settings.mobile-optimization.notices.optimization-enabled"), 3000);
                    }
                })
        );

    new Setting(section)
        .setName(t("settings.mobile-optimization.history-count.name"))
        .setDesc(t("settings.mobile-optimization.history-count.desc"))
        .addText((text) => {
            text.inputEl.type = "number";
            text.setValue(String(plugin.settings.mobileHistoryViewCount));
            text.onChange(async (value) => {
                const numValue = parseInt(value);
                if (!isNaN(numValue) && numValue > 0) {
                    plugin.settings.mobileHistoryViewCount = numValue;
                    await plugin.saveSettings();
                }
            });
        });

    new Setting(section)
        .setName(t("settings.mobile-optimization.detect-performance.name"))
        .setDesc(t("settings.mobile-optimization.detect-performance.desc"))
        .addButton((button) =>
            button.setButtonText(t("settings.mobile-optimization.detect-performance.button")).onClick(async () => {
                await plugin.initializeMobileOptimizations();
                new Notice(t("settings.mobile-optimization.notices.performance-detected"), 3000);
            })
        );

    const deviceType = (plugin as unknown as ObsidianGitPlugin).deviceType;
    const deviceName = deviceType === 'tablet' ? t("settings.device-indicator.tablet.text") : t("settings.device-indicator.mobile.text");

    new Setting(section)
        .setName(t("settings.mobile-optimization.performance-stats.name", { deviceName }))
        .setDesc(t("settings.mobile-optimization.performance-stats.desc", { deviceName }))
        .addButton((button) =>
            button.setButtonText(t("settings.mobile-optimization.performance-stats.button")).onClick(() => {
                const stats = (plugin as unknown as ObsidianGitPlugin).getMobilePerformanceStats();
                const message = [
                    `📊 ${deviceName}端性能统计`,
                    `设备类型: ${deviceType}`,
                    `总操作次数: ${stats.totalOperations}`,
                    `平均响应时间: ${stats.averageTime}ms`,
                    `设备性能等级: ${stats.performanceProfile}`,
                    `仓库复杂度: ${stats.repositoryComplexity}`,
                    `缓存命中率: ${(stats.cacheHitRate * 100).toFixed(1)}%`,
                ].join('\n');

                new Notice(message, 8000);
            })
        );

    if (deviceType === 'tablet') {
        new Setting(section)
            .setName(t("settings.mobile-optimization.tablet-multitask.name"))
            .setDesc(t("settings.mobile-optimization.tablet-multitask.desc"))
            .addToggle((toggle) =>
                toggle
                    .setValue(plugin.settings.tabletMultitaskEnabled ?? true)
                    .onChange(async (value) => {
                        plugin.settings.tabletMultitaskEnabled = value;
                        await plugin.saveSettings();
                        const noticeText = value
                            ? t("settings.mobile-optimization.notices.multitask-enabled")
                            : t("settings.mobile-optimization.notices.multitask-disabled");
                        new Notice(noticeText, 2000);
                    })
            );
    }
}

export function createSupportSection(
    containerEl: Element,
    plugin: ObsidianGit
): void {
    const section = containerEl.createDiv("git-settings-section");
    section.createEl("h3", {
        text: t("settings.heading.support")
    });

    const debugDiv = section.createDiv();
    debugDiv.setAttr("align", "center");
    debugDiv.setAttr("style", "margin: var(--size-4-2)");

    const debugButton = debugDiv.createEl("button");
    debugButton.setText(t("settings.copy-debug-info.button"));
    debugButton.onclick = async () => {
        const { getDebugInfo } = await import("./settingsUtils");
        await window.navigator.clipboard.writeText(
            getDebugInfo(plugin)
        );
        new Notice(t("notices.copy-debug-info"));
    };

    if (Platform.isDesktopApp) {
        const info = section.createDiv();
        info.setAttr("align", "center");
        info.setText(t("settings.debugging-info.text"));
        const keys = section.createDiv();
        keys.setAttr("align", "center");
        keys.addClass("obsidian-git-shortcuts");
        if (Platform.isMacOS === true) {
            keys.createEl("kbd", { text: "CMD (⌘) + OPTION (⌥) + I" });
        } else {
            keys.createEl("kbd", { text: "CTRL + SHIFT + I" });
        }
    }
}

export function createGitSettingsSections(
    containerEl: Element,
    plugin: ObsidianGit,
    commitOrSync: string,
    isMobileOrTablet: boolean
): void {
    // 自动化设置
    createAutomationSection(containerEl, plugin, commitOrSync, isMobileOrTablet);

    // 提交设置
    createCommitSection(containerEl, plugin);

    // 视图设置
    createViewSection(containerEl, plugin, isMobileOrTablet);

    // 高级设置
    createAdvancedSection(containerEl, plugin);

    // 移动端优化设置
    createMobileOptimizationSection(containerEl, plugin);

    // 支持和调试信息
    createSupportSection(containerEl, plugin);
}