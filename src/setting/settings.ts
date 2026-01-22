import type { App, RGB } from "obsidian";
import {
    Notice,
    Platform,
    PluginSettingTab,
    Setting,
} from "obsidian";
import type { ObsidianGitPlugin } from "../types";
import { DEFAULT_SETTINGS } from "src/constants";
import type ObsidianGit from "src/main";
import { t, setLocale } from "src/i18n";
import {
    addDeviceIndicator,
    addCustomStyles,
    addQuickStartGuide,
    refreshDisplayWithDelay,
} from "./settingsUtils";
import {
    configureLineAuthorShowStatus,
    lineAuthorSettingHandler,
    beforeSaveSettings,
} from "./settingsLineAuthor";
import {
    createColorSetting,
    refreshColorSettingsName,
    refreshColorSettingsDesc,
} from "./settingsColor";
import { createGitSettingsSections } from "./settingsSections";

const FORMAT_STRING_REFERENCE_URL =
    "https://momentjs.com/docs/#/parsing/string-format/";

export class ObsidianGitSettingsTab extends PluginSettingTab {
    lineAuthorColorSettings: Map<"oldest" | "newest", Setting> = new Map();
    constructor(
        app: App,
        private plugin: ObsidianGit
    ) {
        super(app, plugin);
    }

    private get settings() {
        return this.plugin.settings;
    }


    display(): void {
        const { containerEl } = this;
        const plugin: ObsidianGit = this.plugin;

        let commitOrSync: string;
        if (plugin.settings.differentIntervalCommitAndPush) {
            commitOrSync = "commit";
        } else {
            commitOrSync = "commit-and-sync";
        }

        const gitReady = plugin.gitReady;
        const deviceType = (plugin as ObsidianGitPlugin).deviceType;
        const isMobileOrTablet = deviceType !== 'desktop';

        containerEl.empty();
        
        // 添加自定义样式
        addCustomStyles(containerEl);

        // 添加设备类型指示器
        addDeviceIndicator(containerEl, deviceType);

        // 语言设置 - 始终显示
        const languageSection = containerEl.createDiv("git-settings-section");
        languageSection.createEl("h3", { text: t("settings.heading.basic-settings") });

        new Setting(languageSection)
            .setName(t("settings.language.name"))
            .setDesc(t("settings.language.desc"))
            .addDropdown((dropdown) => {
                dropdown.addOption("auto", t("settings.language.auto"));
                dropdown.addOption("en", "English");
                dropdown.addOption("zh-CN", "简体中文");
                
                dropdown.setValue(plugin.settings.language || "auto");
                dropdown.onChange(async (value) => {
                    plugin.settings.language = value;
                    await plugin.saveSettings();
                    
                    // 立即应用语言更改
                    if (value === "auto") {
                        setLocale(window.moment.locale());
                    } else {
                        setLocale(value);
                    }
                    
                    // 刷新设置页面以显示翻译
                    this.display();
                    
                    new Notice(t("settings.language.restart-notice"));
                });
            });
        
        if (!gitReady) {
            const gitNotReadySection = containerEl.createDiv("git-settings-section");
            gitNotReadySection.createEl("h3", { text: t("settings.heading.git-status") });

            gitNotReadySection.createEl("p", {
                text: t("settings.git-not-ready.text"),
                attr: { style: "color: var(--text-muted); margin-bottom: 20px;" }
            });
            return;
        }

        // Git 设置分组
        createGitSettingsSections(containerEl, plugin, commitOrSync, isMobileOrTablet);

        // 添加快速入门指南
        addQuickStartGuide(containerEl, plugin, isMobileOrTablet);
    }


    /**
     * Ensure, that certain last shown values are persistent in the settings.
     *
     * Necessary for the line author info gutter context menus.
     */
    public beforeSaveSettings() {
        const laSettings = this.settings.lineAuthor;
        if (laSettings.authorDisplay !== "hide") {
            laSettings.lastShownAuthorDisplay = laSettings.authorDisplay;
        }
        if (laSettings.dateTimeFormatOptions !== "hide") {
            laSettings.lastShownDateTimeFormatOptions =
                laSettings.dateTimeFormatOptions;
        }
    }
}

export function pickColor(
    which: "oldest" | "newest",
    las: LineAuthorSettings
): RGB {
    return which === "oldest" ? las.colorOld : las.colorNew;
}

export function parseColoringMaxAgeDuration(
    durationString: string
): ReturnType<typeof window.moment.duration> | undefined {
    // https://momentjs.com/docs/#/durations/creating/
    const duration = window.moment.duration(
        "P" + durationString.toUpperCase()
    );
    return duration.isValid() && duration.asDays() && duration.asDays() >= 1
        ? duration
        : undefined;
}
