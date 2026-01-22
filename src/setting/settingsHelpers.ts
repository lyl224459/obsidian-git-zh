import type { RGB } from "obsidian";
import type { LineAuthorSettings } from "src/editor/lineAuthor/model";

/**
 * 从行作者设置中获取颜色
 */
export function pickColor(
    which: "oldest" | "newest",
    las: LineAuthorSettings
): RGB {
    return which === "oldest" ? las.colorOld : las.colorNew;
}

/**
 * 解析颜色最大年龄持续时间字符串
 */
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
