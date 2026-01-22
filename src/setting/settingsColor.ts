import type { RGB } from "obsidian";
import { Setting } from "obsidian";
import type { LineAuthorSettings } from "src/editor/lineAuthor/model";
import { DEFAULT_SETTINGS } from "src/constants";
import { previewColor } from "src/editor/lineAuthor/lineAuthorProvider";
import { convertToRgb, rgbToString } from "src/utils";
import { pickColor } from "./settingsHelpers";
import type ObsidianGit from "src/main";
import { lineAuthorSettingHandler } from "./settingsLineAuthor";

/**
 * 颜色设置相关方法
 * 这些方法被 ObsidianGitSettingsTab 类使用
 */

export function createColorSetting(
    containerEl: HTMLElement,
    plugin: ObsidianGit,
    lineAuthorColorSettings: Map<"oldest" | "newest", Setting>,
    which: "oldest" | "newest"
): void {
    const setting = new Setting(containerEl)
        .setName("")
        .addText((text) => {
            const color = pickColor(which, plugin.settings.lineAuthor);
            const defaultColor = pickColor(
                which,
                DEFAULT_SETTINGS.lineAuthor
            );
            text.setPlaceholder(rgbToString(defaultColor));
            text.setValue(rgbToString(color));
            text.onChange(async (colorNew) => {
                const rgb = convertToRgb(colorNew);
                if (rgb !== undefined) {
                    const key =
                        which === "newest" ? "colorNew" : "colorOld";
                    await lineAuthorSettingHandler(plugin, key, rgb);
                }
                refreshColorSettingsDesc(plugin, lineAuthorColorSettings, which, rgb);
            });
        });
    lineAuthorColorSettings.set(which, setting);

    refreshColorSettingsName(plugin, lineAuthorColorSettings, which);
    refreshColorSettingsDesc(
        plugin,
        lineAuthorColorSettings,
        which,
        pickColor(which, plugin.settings.lineAuthor)
    );
}

export function refreshColorSettingsName(
    plugin: ObsidianGit,
    lineAuthorColorSettings: Map<"oldest" | "newest", Setting>,
    which: "oldest" | "newest"
): void {
    const settingsDom = lineAuthorColorSettings.get(which);
    if (settingsDom) {
        const whichDescriber =
            which === "oldest"
                ? `oldest (${plugin.settings.lineAuthor.coloringMaxAge} or older)`
                : "newest";
        settingsDom.nameEl.innerText = `Color for ${whichDescriber} commits`;
    }
}

export function refreshColorSettingsDesc(
    plugin: ObsidianGit,
    lineAuthorColorSettings: Map<"oldest" | "newest", Setting>,
    which: "oldest" | "newest",
    rgb?: RGB
): void {
    const settingsDom = lineAuthorColorSettings.get(which);
    if (settingsDom) {
        settingsDom.descEl.innerHTML = colorSettingPreviewDescHtml(
            which,
            plugin.settings.lineAuthor,
            rgb !== undefined
        );
    }
}

export function colorSettingPreviewDescHtml(
    which: "oldest" | "newest",
    laSettings: LineAuthorSettings,
    colorIsValid: boolean
): string {
    const rgbStr = colorIsValid
        ? previewColor(which, laSettings)
        : `rgba(127,127,127,0.3)`;
    const today = window
        .moment.unix(window.moment.now() / 1000)
        .format("YYYY-MM-DD");
    const text = colorIsValid
        ? `abcdef Author Name ${today}`
        : "invalid color";
    const preview = `<div
        class="line-author-settings-preview"
        style="background-color: ${rgbStr}; width: 30ch;"
        >${text}</div>`;

    return `Supports 'rgb(r,g,b)', 'hsl(h,s,l)', hex (#) and
        named colors (e.g. 'black', 'purple'). Color preview: ${preview}`;
}
