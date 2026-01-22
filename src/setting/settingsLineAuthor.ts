import { Setting } from "obsidian";
import type {
    LineAuthorDateTimeFormatOptions,
    LineAuthorDisplay,
    LineAuthorFollowMovement,
} from "src/editor/lineAuthor/model";
import type { ObsidianGitSettings } from "src/types";
import { GIT_LINE_AUTHORING_MOVEMENT_DETECTION_MINIMAL_LENGTH } from "src/constants";
import { t } from "src/i18n";
import type ObsidianGit from "src/main";

/**
 * 行作者相关设置方法
 * 这些方法被 ObsidianGitSettingsTab 类使用
 */

export function configureLineAuthorShowStatus(
    plugin: ObsidianGit,
    show: boolean
): void {
    plugin.settings.lineAuthor.show = show;
    void plugin.saveSettings();

    if (show) plugin.editorIntegration.activateLineAuthoring();
    else plugin.editorIntegration.deactiveLineAuthoring();
}

export async function lineAuthorSettingHandler<
    K extends keyof ObsidianGitSettings["lineAuthor"],
>(
    plugin: ObsidianGit,
    key: K,
    value: ObsidianGitSettings["lineAuthor"][K]
): Promise<void> {
    plugin.settings.lineAuthor[key] = value;
    await plugin.saveSettings();
    plugin.editorIntegration.lineAuthoringFeature.refreshLineAuthorViews();
}

export function addLineAuthorInfoSettings(
    containerEl: Element,
    plugin: ObsidianGit
): void {
    const baseLineAuthorInfoSetting = new Setting(containerEl).setName(
        t("settings.line-author-show.name")
    );

    if (
        !plugin.editorIntegration.lineAuthoringFeature.isAvailableOnCurrentPlatform()
    ) {
        baseLineAuthorInfoSetting
            .setDesc(t("settings.line-author-show.only-available-desktop"))
            .setDisabled(true);
    }

    baseLineAuthorInfoSetting.descEl.innerHTML = t("settings.line-author-show.desc", {
        show: plugin.settings.lineAuthor.show ? t("settings.line-author-show.show") : t("settings.line-author-show.hide")
    });

    baseLineAuthorInfoSetting.addToggle((tgl) => {
        tgl.setValue(plugin.settings.lineAuthor.show).onChange((value) =>
            configureLineAuthorShowStatus(plugin, value)
        );
    });

    new Setting(containerEl)
        .setName(t("settings.line-author-date-display.name"))
        .setDesc(t("settings.line-author-date-display.desc"))
        .addDropdown((dropdown) => {
            const options: Record<
                LineAuthorDateTimeFormatOptions,
                string
            > = {
                hide: t("settings.line-author-date-display.options.hide"),
                "relative time": t("settings.line-author-date-display.options.relative time"),
                "absolute time": t("settings.line-author-date-display.options.absolute time"),
                "relative and absolute time": t("settings.line-author-date-display.options.relative and absolute time"),
                "custom format": t("settings.line-author-date-display.options.custom format"),
            };
            dropdown.addOptions(options);
            dropdown.setValue(plugin.settings.lineAuthor.dateTimeFormatOptions);

            dropdown.onChange(async (value) =>
                await lineAuthorSettingHandler(
                    plugin,
                    "dateTimeFormatOptions",
                    value as LineAuthorDateTimeFormatOptions
                )
            );
        });

    new Setting(containerEl)
        .setName(t("settings.line-author-author-display.name"))
        .setDesc(t("settings.line-author-author-display.desc"))
        .addDropdown((dropdown) => {
            const options: Record<LineAuthorDisplay, string> = {
                hide: t("settings.line-author-author-display.options.hide"),
                initials: t("settings.line-author-author-display.options.initials"),
                "first name": t("settings.line-author-author-display.options.first name"),
                "last name": t("settings.line-author-author-display.options.last name"),
                full: t("settings.line-author-author-display.options.full"),
            };
            dropdown.addOptions(options);
            dropdown.setValue(plugin.settings.lineAuthor.authorDisplay);

            dropdown.onChange(async (value) =>
                lineAuthorSettingHandler(
                    plugin,
                    "authorDisplay",
                    value as LineAuthorDisplay
                )
            );
        });

    new Setting(containerEl)
        .setName(t("settings.line-author-follow-movement.name"))
        .setDesc(t("settings.line-author-follow-movement.desc", {
            length: GIT_LINE_AUTHORING_MOVEMENT_DETECTION_MINIMAL_LENGTH
        }))
        .addDropdown((dropdown) => {
            const options: Record<LineAuthorFollowMovement, string> = {
                none: t("settings.line-author-follow-movement.options.none"),
                all: t("settings.line-author-follow-movement.options.all"),
                newest: t("settings.line-author-follow-movement.options.newest"),
            };
            dropdown.addOptions(options);
            dropdown.setValue(plugin.settings.lineAuthor.followMovement);
            dropdown.onChange((value) =>
                lineAuthorSettingHandler(
                    plugin,
                    "followMovement",
                    value as LineAuthorFollowMovement
                )
            );
        });

    new Setting(containerEl)
        .setName(t("settings.line-author-show-commit-hash.name"))
        .setDesc(t("settings.line-author-show-commit-hash.desc"))
        .addToggle((tgl) => {
            tgl.setValue(plugin.settings.lineAuthor.showCommitHash);
            tgl.onChange((value: boolean) =>
                lineAuthorSettingHandler(plugin, "showCommitHash", value)
            );
        });
}

export function beforeSaveSettings(plugin: ObsidianGit): void {
    const laSettings = plugin.settings.lineAuthor;
    if (laSettings.authorDisplay !== "hide") {
        laSettings.lastShownAuthorDisplay = laSettings.authorDisplay;
    }
    if (laSettings.dateTimeFormatOptions !== "hide") {
        laSettings.lastShownDateTimeFormatOptions =
            laSettings.dateTimeFormatOptions;
    }
}
