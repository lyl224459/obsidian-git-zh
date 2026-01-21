import type { App, RGB, TextComponent } from "obsidian";
import {
    Notice,
    Platform,
    PluginSettingTab,
    Setting,
    TextAreaComponent,
} from "obsidian";
import {
    DATE_TIME_FORMAT_SECONDS,
    DEFAULT_SETTINGS,
    GIT_LINE_AUTHORING_MOVEMENT_DETECTION_MINIMAL_LENGTH,
} from "src/constants";
import { IsomorphicGit } from "src/gitManager/isomorphicGit";
import { SimpleGit } from "src/gitManager/simpleGit";
import { previewColor } from "src/editor/lineAuthor/lineAuthorProvider";
import type {
    LineAuthorDateTimeFormatOptions,
    LineAuthorDisplay,
    LineAuthorFollowMovement,
    LineAuthorSettings,
    LineAuthorTimezoneOption,
} from "src/editor/lineAuthor/model";
import type ObsidianGit from "src/main";
import type {
    ObsidianGitSettings,
    MergeStrategy,
    ShowAuthorInHistoryView,
    SyncMethod,
} from "src/types";
import { convertToRgb, formatMinutes, rgbToString } from "src/utils";
import { t, setLocale } from "src/i18n";

const FORMAT_STRING_REFERENCE_URL =
    "https://momentjs.com/docs/#/parsing/string-format/";
const LINE_AUTHOR_FEATURE_WIKI_LINK =
    "https://publish.obsidian.md/git-doc/Line+Authoring";

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

        containerEl.empty();
        
        // 语言设置
        new Setting(containerEl)
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
            containerEl.createEl("p", {
                text: t("settings.git-not-ready.text"),
            });
            containerEl.createEl("br");
        }

        let setting: Setting;
        if (gitReady) {
            new Setting(containerEl).setName(t("settings.heading.automatic")).setHeading();
            new Setting(containerEl)
                .setName(t("settings.split-timers.name"))
                .setDesc(t("settings.split-timers.desc"))
                .addToggle((toggle) =>
                    toggle
                        .setValue(
                            plugin.settings.differentIntervalCommitAndPush
                        )
                        .onChange(async (value) => {
                            plugin.settings.differentIntervalCommitAndPush =
                                value;
                            await plugin.saveSettings();
                            plugin.automaticsManager.reload("commit", "push");
                            this.refreshDisplayWithDelay();
                        })
                );

            new Setting(containerEl)
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
                    this.setNonDefaultValue({
                        text,
                        settingsProperty: "autoSaveInterval",
                    });
                    text.setPlaceholder(
                        String(DEFAULT_SETTINGS.autoSaveInterval)
                    );
                    text.onChange(async (value) => {
                        if (value !== "") {
                            plugin.settings.autoSaveInterval = Number(value);
                        } else {
                            plugin.settings.autoSaveInterval =
                                DEFAULT_SETTINGS.autoSaveInterval;
                        }
                        await plugin.saveSettings();
                        plugin.automaticsManager.reload("commit");
                    });
                });

            setting = new Setting(containerEl)
                .setName(t("settings.auto-backup-after-file-change.name", { commitOrSync }))
                .setDesc(
                    t("settings.auto-backup-after-file-change.desc", {
                        commitOrSync,
                        minutes: formatMinutes(plugin.settings.autoSaveInterval)
                    })
                )
                .addToggle((toggle) =>
                    toggle
                        .setValue(plugin.settings.autoBackupAfterFileChange)
                        .onChange(async (value) => {
                            plugin.settings.autoBackupAfterFileChange = value;
                            this.refreshDisplayWithDelay();

                            await plugin.saveSettings();
                            plugin.automaticsManager.reload("commit");
                        })
                );
            this.mayDisableSetting(
                setting,
                plugin.settings.setLastSaveToLastCommit
            );

            setting = new Setting(containerEl)
                .setName(t("settings.auto-backup-after-latest-commit.name", { commitOrSync }))
                .setDesc(
                    t("settings.auto-backup-after-latest-commit.desc", { commitOrSync })
                )
                .addToggle((toggle) =>
                    toggle
                        .setValue(plugin.settings.setLastSaveToLastCommit)
                        .onChange(async (value) => {
                            plugin.settings.setLastSaveToLastCommit = value;
                            await plugin.saveSettings();
                            plugin.automaticsManager.reload("commit");
                            this.refreshDisplayWithDelay();
                        })
                );
            this.mayDisableSetting(
                setting,
                plugin.settings.autoBackupAfterFileChange
            );

            setting = new Setting(containerEl)
                .setName(t("settings.auto-push-interval.name"))
                .setDesc(t("settings.auto-push-interval.desc"))
                .addText((text) => {
                    text.inputEl.type = "number";
                    this.setNonDefaultValue({
                        text,
                        settingsProperty: "autoPushInterval",
                    });
                    text.setPlaceholder(
                        String(DEFAULT_SETTINGS.autoPushInterval)
                    );
                    text.onChange(async (value) => {
                        if (value !== "") {
                            plugin.settings.autoPushInterval = Number(value);
                        } else {
                            plugin.settings.autoPushInterval =
                                DEFAULT_SETTINGS.autoPushInterval;
                        }
                        await plugin.saveSettings();
                        plugin.automaticsManager.reload("push");
                    });
                });
            this.mayDisableSetting(
                setting,
                !plugin.settings.differentIntervalCommitAndPush
            );

            new Setting(containerEl)
                .setName(t("settings.auto-pull-interval.name"))
                .setDesc(t("settings.auto-pull-interval.desc"))
                .addText((text) => {
                    text.inputEl.type = "number";
                    this.setNonDefaultValue({
                        text,
                        settingsProperty: "autoPullInterval",
                    });
                    text.setPlaceholder(
                        String(DEFAULT_SETTINGS.autoPullInterval)
                    );
                    text.onChange(async (value) => {
                        if (value !== "") {
                            plugin.settings.autoPullInterval = Number(value);
                        } else {
                            plugin.settings.autoPullInterval =
                                DEFAULT_SETTINGS.autoPullInterval;
                        }
                        await plugin.saveSettings();
                        plugin.automaticsManager.reload("pull");
                    });
                });

            new Setting(containerEl)
                .setName(t("settings.auto-commit-staged.name", { commitOrSync }))
                .setDesc(t("settings.auto-commit-staged.desc", { commitOrSync }))
                .addToggle((toggle) =>
                    toggle
                        .setValue(plugin.settings.autoCommitOnlyStaged)
                        .onChange(async (value) => {
                            plugin.settings.autoCommitOnlyStaged = value;
                            await plugin.saveSettings();
                        })
                );

            new Setting(containerEl)
                .setName(
                    t("settings.custom-message-on-auto-backup.name", { commitOrSync })
                )
                .setDesc(t("settings.custom-message-on-auto-backup.desc"))
                .addToggle((toggle) =>
                    toggle
                        .setValue(plugin.settings.customMessageOnAutoBackup)
                        .onChange(async (value) => {
                            plugin.settings.customMessageOnAutoBackup = value;
                            await plugin.saveSettings();
                            this.refreshDisplayWithDelay();
                        })
                );

            setting = new Setting(containerEl)
                .setName(t("settings.auto-commit-message.name", { commitOrSync }))
                .setDesc(t("settings.auto-commit-message.desc"))
                .addTextArea((text) => {
                    text.setPlaceholder(
                        DEFAULT_SETTINGS.autoCommitMessage
                    ).onChange(async (value) => {
                        if (value === "") {
                            plugin.settings.autoCommitMessage =
                                DEFAULT_SETTINGS.autoCommitMessage;
                        } else {
                            plugin.settings.autoCommitMessage = value;
                        }
                        await plugin.saveSettings();
                    });
                    this.setNonDefaultValue({
                        text,
                        settingsProperty: "autoCommitMessage",
                    });
                });
            this.mayDisableSetting(
                setting,
                plugin.settings.customMessageOnAutoBackup
            );

            new Setting(containerEl).setName(t("settings.heading.commit-message")).setHeading();

            new Setting(containerEl)
                .setName(t("settings.commit-message.name"))
                .setDesc(t("settings.commit-message.desc"))
                .addTextArea((text) => {
                    text.setPlaceholder(
                        DEFAULT_SETTINGS.commitMessage
                    ).onChange(async (value) => {
                        if (value === "") {
                            plugin.settings.commitMessage =
                                DEFAULT_SETTINGS.commitMessage;
                        } else {
                            plugin.settings.commitMessage = value;
                        }
                        await plugin.saveSettings();
                    });
                    this.setNonDefaultValue({
                        text,
                        settingsProperty: "commitMessage",
                    });
                });

            new Setting(containerEl)
                .setName(t("settings.commit-message-script.name"))
                .setDesc(t("settings.commit-message-script.desc"))
                .addText((text) => {
                    text.onChange(async (value) => {
                        if (value === "") {
                            plugin.settings.commitMessageScript =
                                DEFAULT_SETTINGS.commitMessageScript;
                        } else {
                            plugin.settings.commitMessageScript = value;
                        }
                        await plugin.saveSettings();
                    });
                    this.setNonDefaultValue({
                        text,
                        settingsProperty: "commitMessageScript",
                    });
                });

            const datePlaceholderSetting = new Setting(containerEl)
                .setName(t("settings.date-placeholder.name"))
                .addMomentFormat((text) =>
                    text
                        .setDefaultFormat(plugin.settings.commitDateFormat)
                        .setValue(plugin.settings.commitDateFormat)
                        .onChange(async (value) => {
                            plugin.settings.commitDateFormat = value;
                            await plugin.saveSettings();
                        })
                );
            datePlaceholderSetting.descEl.innerHTML = t("settings.date-placeholder.desc", {
                format: DATE_TIME_FORMAT_SECONDS
            });

            new Setting(containerEl)
                .setName(t("settings.hostname-placeholder.name"))
                .setDesc(t("settings.hostname-placeholder.desc"))
                .addText((text) =>
                    text
                        .setValue(plugin.localStorage.getHostname() ?? "")
                        .onChange((value) => {
                            plugin.localStorage.setHostname(value);
                        })
                );

            new Setting(containerEl)
                .setName(t("settings.preview-commit-message.name"))
                .addButton((button) =>
                    button.setButtonText(t("settings.preview-commit-message.button")).onClick(async () => {
                        const commitMessagePreview =
                            await plugin.gitManager.formatCommitMessage(
                                plugin.settings.commitMessage
                            );
                        new Notice(`${commitMessagePreview}`);
                    })
                );

            new Setting(containerEl)
                .setName(t("settings.list-filenames-in-message-body"))
                .addToggle((toggle) =>
                    toggle
                        .setValue(plugin.settings.listChangedFilesInMessageBody)
                        .onChange(async (value) => {
                            plugin.settings.listChangedFilesInMessageBody =
                                value;
                            await plugin.saveSettings();
                        })
                );

            new Setting(containerEl).setName(t("settings.heading.pull")).setHeading();

            if (plugin.gitManager instanceof SimpleGit)
                new Setting(containerEl)
                    .setName(t("settings.merge-strategy.name"))
                    .setDesc(t("settings.merge-strategy.desc"))
                    .addDropdown((dropdown) => {
                        const options: Record<SyncMethod, string> = {
                            merge: t("settings.merge-strategy.options.merge"),
                            rebase: t("settings.merge-strategy.options.rebase"),
                            reset: t("settings.merge-strategy.options.reset"),
                        };
                        dropdown.addOptions(options);
                        dropdown.setValue(plugin.settings.syncMethod);

                dropdown.onChange(async (value) => {
                    plugin.settings.syncMethod = value as SyncMethod;
                            await plugin.saveSettings();
                        });
                    });

            new Setting(containerEl)
                .setName(t("settings.merge-strategy-on-conflicts.name"))
                .setDesc(t("settings.merge-strategy-on-conflicts.desc"))
                .addDropdown((dropdown) => {
                    const options: Record<MergeStrategy, string> = {
                        none: t("settings.merge-strategy-on-conflicts.options.none"),
                        ours: t("settings.merge-strategy-on-conflicts.options.ours"),
                        theirs: t("settings.merge-strategy-on-conflicts.options.theirs"),
                    };
                    dropdown.addOptions(options);
                    dropdown.setValue(plugin.settings.mergeStrategy);

                dropdown.onChange(async (value) => {
                    plugin.settings.mergeStrategy = value as MergeStrategy;
                        await plugin.saveSettings();
                    });
                });

            new Setting(containerEl)
                .setName(t("settings.pull-on-startup.name"))
                .setDesc(t("settings.pull-on-startup.desc"))
                .addToggle((toggle) =>
                    toggle
                        .setValue(plugin.settings.autoPullOnBoot)
                        .onChange(async (value) => {
                            plugin.settings.autoPullOnBoot = value;
                            await plugin.saveSettings();
                        })
                );

            new Setting(containerEl)
                .setName(t("settings.heading.commit-and-sync"))
                .setDesc(
                    t("settings.commit-and-sync-desc")
                )
                .setHeading();

            setting = new Setting(containerEl)
                .setName(t("settings.push-on-commit-and-sync.name"))
                .setDesc(
                    t("settings.push-on-commit-and-sync.desc", {
                        pullText: plugin.settings.pullBeforePush ? t("settings.and-pull") : ""
                    })
                )
                .addToggle((toggle) =>
                    toggle
                        .setValue(!plugin.settings.disablePush)
                        .onChange(async (value) => {
                            plugin.settings.disablePush = !value;
                            this.refreshDisplayWithDelay();
                            await plugin.saveSettings();
                        })
                );

            new Setting(containerEl)
                .setName(t("settings.pull-on-commit-and-sync.name"))
                .setDesc(
                    t("settings.pull-on-commit-and-sync.desc", {
                        pushText: plugin.settings.disablePush ? "" : t("settings.and-push")
                    })
                )
                .addToggle((toggle) =>
                    toggle
                        .setValue(plugin.settings.pullBeforePush)
                        .onChange(async (value) => {
                            plugin.settings.pullBeforePush = value;
                            this.refreshDisplayWithDelay();
                            await plugin.saveSettings();
                        })
                );

            if (plugin.gitManager instanceof SimpleGit) {
                new Setting(containerEl)
                    .setName(t("settings.heading.hunk-management"))
                    .setDesc(
                        t("settings.hunk-management-desc")
                    )
                    .setHeading();

                new Setting(containerEl)
                    .setName(t("settings.signs.name"))
                    .setDesc(t("settings.signs.desc"))
                    .addToggle((toggle) =>
                        toggle
                            .setValue(plugin.settings.hunks.showSigns)
                            .onChange(async (value) => {
                                plugin.settings.hunks.showSigns = value;
                                await plugin.saveSettings();
                                plugin.editorIntegration.refreshSignsSettings();
                            })
                    );

                new Setting(containerEl)
                    .setName(t("settings.hunk-commands.name"))
                    .setDesc(t("settings.hunk-commands.desc"))
                    .addToggle((toggle) =>
                        toggle
                            .setValue(plugin.settings.hunks.hunkCommands)
                            .onChange(async (value) => {
                                plugin.settings.hunks.hunkCommands = value;
                                await plugin.saveSettings();

                                plugin.editorIntegration.refreshSignsSettings();
                            })
                    );

                new Setting(containerEl)
                    .setName(t("settings.status-bar-changes"))
                    .addDropdown((toggle) =>
                        toggle
                            .addOptions({
                                disabled: "Disabled",
                                colored: "Colored",
                                monochrome: "Monochrome",
                            })
                            .setValue(plugin.settings.hunks.statusBar)
                            .onChange(async (value) => {
                                plugin.settings.hunks.statusBar =
                                    value as ObsidianGitSettings["hunks"]["statusBar"];
                                await plugin.saveSettings();
                                plugin.editorIntegration.refreshSignsSettings();
                            })
                    );

                new Setting(containerEl)
                    .setName(t("settings.heading.line-author"))
                    .setHeading();

                this.addLineAuthorInfoSettings();
            }
        }

        new Setting(containerEl).setName(t("settings.heading.history-view")).setHeading();

        new Setting(containerEl)
            .setName(t("settings.show-author-in-history-view.name"))
            .setDesc(t("settings.show-author-in-history-view.desc"))
            .addDropdown((dropdown) => {
                const options: Record<ShowAuthorInHistoryView, string> = {
                    hide: t("settings.show-author-in-history-view.options.hide"),
                    full: t("settings.show-author-in-history-view.options.full"),
                    initials: t("settings.show-author-in-history-view.options.initials"),
                };
                dropdown.addOptions(options);
                dropdown.setValue(plugin.settings.authorInHistoryView);
                dropdown.onChange(async (value) => {
                    plugin.settings.authorInHistoryView =
                        value as ShowAuthorInHistoryView;
                    await plugin.saveSettings();
                    await plugin.refresh();
                });
            });

        new Setting(containerEl)
            .setName(t("settings.show-date-in-history-view.name"))
            .setDesc(t("settings.show-date-in-history-view.desc"))
            .addToggle((toggle) =>
                toggle
                    .setValue(plugin.settings.dateInHistoryView)
                    .onChange(async (value) => {
                        plugin.settings.dateInHistoryView = value;
                        await plugin.saveSettings();
                        await plugin.refresh();
                    })
            );

        new Setting(containerEl).setName(t("settings.heading.source-control-view")).setHeading();

        new Setting(containerEl)
            .setName(t("settings.refresh-source-control.name"))
            .setDesc(t("settings.refresh-source-control.desc"))
            .addToggle((toggle) =>
                toggle
                    .setValue(plugin.settings.refreshSourceControl)
                    .onChange(async (value) => {
                        plugin.settings.refreshSourceControl = value;
                        await plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName(t("settings.refresh-source-control-timer.name"))
            .setDesc(t("settings.refresh-source-control-timer.desc"))
            .addText((text) => {
                const MIN_SOURCE_CONTROL_REFRESH_INTERVAL = 500;
                text.inputEl.type = "number";
                this.setNonDefaultValue({
                    text,
                    settingsProperty: "refreshSourceControlTimer",
                });
                text.setPlaceholder(
                    String(DEFAULT_SETTINGS.refreshSourceControlTimer)
                );
                text.onChange(async (value) => {
                    // Without this check, if the textbox is empty or the input is invalid, MIN_SOURCE_CONTROL_REFRESH_INTERVAL would be saved instead of saving the default value.
                    if (value !== "" && Number.isInteger(Number(value))) {
                        plugin.settings.refreshSourceControlTimer = Math.max(
                            Number(value),
                            MIN_SOURCE_CONTROL_REFRESH_INTERVAL
                        );
                    } else {
                        plugin.settings.refreshSourceControlTimer =
                            DEFAULT_SETTINGS.refreshSourceControlTimer;
                    }
                    await plugin.saveSettings();
                    plugin.setRefreshDebouncer();
                });
            });
        new Setting(containerEl).setName(t("settings.heading.miscellaneous")).setHeading();

        if (plugin.gitManager instanceof SimpleGit) {
            new Setting(containerEl)
                .setName(t("settings.diff-view-style.name"))
                .setDesc(t("settings.diff-view-style.desc"))
                .addDropdown((dropdown) => {
                    const options: Record<
                        ObsidianGitSettings["diffStyle"],
                        string
                    > = {
                        split: t("settings.diff-view-style.options.split"),
                        git_unified: t("settings.diff-view-style.options.git_unified"),
                    };
                    dropdown.addOptions(options);
                    dropdown.setValue(plugin.settings.diffStyle);
                    dropdown.onChange(async (value) => {
                        plugin.settings.diffStyle =
                            value as ObsidianGitSettings["diffStyle"];
                        await plugin.saveSettings();
                    });
                });
        }

        new Setting(containerEl)
            .setName(t("settings.disable-popups.name"))
            .setDesc(t("settings.disable-popups.desc"))
            .addToggle((toggle) =>
                toggle
                    .setValue(plugin.settings.disablePopups)
                    .onChange(async (value) => {
                        plugin.settings.disablePopups = value;
                        this.refreshDisplayWithDelay();
                        await plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName(t("settings.disable-error-notices.name"))
            .setDesc(t("settings.disable-error-notices.desc"))
            .addToggle((toggle) =>
                toggle
                    .setValue(!plugin.settings.showErrorNotices)
                    .onChange(async (value) => {
                        plugin.settings.showErrorNotices = !value;
                        await plugin.saveSettings();
                    })
            );

        if (!plugin.settings.disablePopups)
            new Setting(containerEl)
                .setName(t("settings.hide-no-changes-notices.name"))
                .setDesc(
                    "Don't show notifications when there are no changes to commit or push."
                )
                .addToggle((toggle) =>
                    toggle
                        .setValue(plugin.settings.disablePopupsForNoChanges)
                        .onChange(async (value) => {
                            plugin.settings.disablePopupsForNoChanges = value;
                            await plugin.saveSettings();
                        })
                );

        new Setting(containerEl)
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

        new Setting(containerEl)
            .setName(t("settings.file-menu-integration.name"))
            .setDesc(t("settings.file-menu-integration.desc"))
            .addToggle((toggle) =>
                toggle
                    .setValue(plugin.settings.showFileMenu)
                    .onChange(async (value) => {
                        plugin.settings.showFileMenu = value;
                        await plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
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

        new Setting(containerEl)
            .setName(t("settings.show-changed-files-count"))
            .addToggle((toggle) =>
                toggle
                    .setValue(plugin.settings.changedFilesInStatusBar)
                    .onChange(async (value) => {
                        plugin.settings.changedFilesInStatusBar = value;
                        await plugin.saveSettings();
                    })
            );

        if (plugin.gitManager instanceof IsomorphicGit) {
            new Setting(containerEl)
                .setName(t("settings.heading.authentication"))
                .setHeading();
        } else {
            new Setting(containerEl).setName(t("settings.heading.commit-author")).setHeading();
        }

        if (plugin.gitManager instanceof IsomorphicGit)
            new Setting(containerEl)
                .setName(t("settings.username.name"))
                .addText((cb) => {
                    cb.setValue(plugin.localStorage.getUsername() ?? "");
                    cb.onChange((value) => {
                        plugin.localStorage.setUsername(value);
                    });
                });

        if (plugin.gitManager instanceof IsomorphicGit)
            new Setting(containerEl)
                .setName(t("settings.password.name"))
                .setDesc(t("settings.password.desc"))
                .addText((cb) => {
                    cb.inputEl.autocapitalize = "off";
                    cb.inputEl.autocomplete = "off";
                    cb.inputEl.spellcheck = false;
                    cb.onChange((value) => {
                        plugin.localStorage.setPassword(value);
                    });
                });

        if (plugin.gitReady)
            new Setting(containerEl)
                .setName(t("settings.author-name"))
                .addText(async (cb) => {
                    cb.setValue(
                        (await plugin.gitManager.getConfig("user.name")) ?? ""
                    );
                    cb.onChange(async (value) => {
                        await plugin.gitManager.setConfig(
                            "user.name",
                            value == "" ? undefined : value
                        );
                    });
                });

        if (plugin.gitReady)
            new Setting(containerEl)
                .setName(t("settings.author-email"))
                .addText(async (cb) => {
                    cb.setValue(
                        (await plugin.gitManager.getConfig("user.email")) ?? ""
                    );
                    cb.onChange(async (value) => {
                        await plugin.gitManager.setConfig(
                            "user.email",
                            value == "" ? undefined : value
                        );
                    });
                });

        new Setting(containerEl)
            .setName(t("settings.heading.advanced"))
            .setDesc(t("settings.advanced-desc"))
            .setHeading();

        if (plugin.gitManager instanceof SimpleGit) {
            new Setting(containerEl)
                .setName(t("settings.update-submodules.name"))
                .setDesc(t("settings.update-submodules.desc"))
                .addToggle((toggle) =>
                    toggle
                        .setValue(plugin.settings.updateSubmodules)
                        .onChange(async (value) => {
                            plugin.settings.updateSubmodules = value;
                            await plugin.saveSettings();
                        })
                );
            if (plugin.settings.updateSubmodules) {
                new Setting(containerEl)
                    .setName(t("settings.submodule-recurse-checkout.name"))
                    .setDesc(t("settings.submodule-recurse-checkout.desc"))
                    .addToggle((toggle) =>
                        toggle
                            .setValue(plugin.settings.submoduleRecurseCheckout)
                            .onChange(async (value) => {
                                plugin.settings.submoduleRecurseCheckout =
                                    value;
                                await plugin.saveSettings();
                            })
                    );
            }
        }

        if (plugin.gitManager instanceof SimpleGit)
            new Setting(containerEl)
                .setName(t("settings.custom-git-path.name"))
                .setDesc(t("settings.custom-git-path.desc"))
                .addText((cb) => {
                    cb.setValue(plugin.localStorage.getGitPath() ?? "");
                    cb.setPlaceholder("git");
                    cb.onChange((value) => {
                        plugin.localStorage.setGitPath(value);
                        plugin.gitManager
                            .updateGitPath(value || "git")
                            .catch((e) => plugin.displayError(e));
                    });
                });

        if (plugin.gitManager instanceof SimpleGit)
            new Setting(containerEl)
                .setName(t("settings.additional-env-vars.name"))
                .setDesc(t("settings.additional-env-vars.desc"))
                .addTextArea((cb) => {
                    cb.setPlaceholder("GIT_DIR=/path/to/git/dir");
                    cb.setValue(plugin.localStorage.getEnvVars().join("\n"));
                    cb.onChange((value) => {
                        plugin.localStorage.setEnvVars(value.split("\n"));
                    });
                });

        if (plugin.gitManager instanceof SimpleGit)
            new Setting(containerEl)
                .setName(t("settings.additional-path.name"))
                .setDesc(t("settings.additional-path.desc"))
                .addTextArea((cb) => {
                    cb.setValue(plugin.localStorage.getPATHPaths().join("\n"));
                    cb.onChange((value) => {
                        plugin.localStorage.setPATHPaths(value.split("\n"));
                    });
                });
        if (plugin.gitManager instanceof SimpleGit)
            new Setting(containerEl)
                .setName(t("settings.reload-env-vars.name"))
                .setDesc(t("settings.reload-env-vars.desc"))
                .addButton((cb) => {
                    cb.setButtonText(t("settings.reload-env-vars.button"));
                    cb.setCta();
                    cb.onClick(async () => {
                        await (plugin.gitManager as SimpleGit).setGitInstance();
                    });
                });

        new Setting(containerEl)
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

        new Setting(containerEl)
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

        new Setting(containerEl)
            .setName(t("settings.disable-on-device.name"))
            .setDesc(t("settings.disable-on-device.desc"))
            .addToggle((toggle) =>
                toggle
                    .setValue(plugin.localStorage.getPluginDisabled())
                    .onChange((value) => {
                        plugin.localStorage.setPluginDisabled(value);
                        if (value) {
                            plugin.unloadPlugin();
                        } else {
                            plugin
                                .init({ fromReload: true })
                                .catch((e) => plugin.displayError(e));
                        }
                        new Notice(t("settings.restart-notice"));
                    })
            );

        new Setting(containerEl).setName(t("settings.heading.support")).setHeading();
        new Setting(containerEl)
            .setName(t("settings.donate.name"))
            .setDesc(t("settings.donate.desc"))
            .addButton((bt) => {
                bt.buttonEl.outerHTML =
                    "<a href='https://ko-fi.com/F1F195IQ5' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://cdn.ko-fi.com/cdn/kofi3.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>";
            });

        const debugDiv = containerEl.createDiv();
        debugDiv.setAttr("align", "center");
        debugDiv.setAttr("style", "margin: var(--size-4-2)");

        const debugButton = debugDiv.createEl("button");
        debugButton.setText(t("settings.copy-debug-info.button"));
        debugButton.onclick = async () => {
            await window.navigator.clipboard.writeText(
                JSON.stringify(
                    {
                        settings: this.plugin.settings,
                        pluginVersion: this.plugin.manifest.version,
                    },
                    null,
                    4
                )
            );
            new Notice(t("notices.copy-debug-info"));
        };

        if (Platform.isDesktopApp) {
            const info = containerEl.createDiv();
            info.setAttr("align", "center");
            info.setText(t("settings.debugging-info.text"));
            const keys = containerEl.createDiv();
            keys.setAttr("align", "center");
            keys.addClass("obsidian-git-shortcuts");
            if (Platform.isMacOS === true) {
                keys.createEl("kbd", { text: "CMD (⌘) + OPTION (⌥) + I" });
            } else {
                keys.createEl("kbd", { text: "CTRL + SHIFT + I" });
            }
        }
    }

    mayDisableSetting(setting: Setting, disable: boolean) {
        if (disable) {
            setting.setDisabled(disable);
            setting.setClass("obsidian-git-disabled");
        }
    }

    public configureLineAuthorShowStatus(show: boolean) {
        this.settings.lineAuthor.show = show;
        void this.plugin.saveSettings();

        if (show) this.plugin.editorIntegration.activateLineAuthoring();
        else this.plugin.editorIntegration.deactiveLineAuthoring();
    }

    /**
     * Persists the setting {@link key} with value {@link value} and
     * refreshes the line author info views.
     */
    public async lineAuthorSettingHandler<
        K extends keyof ObsidianGitSettings["lineAuthor"],
    >(key: K, value: ObsidianGitSettings["lineAuthor"][K]): Promise<void> {
        this.settings.lineAuthor[key] = value;
        await this.plugin.saveSettings();
        this.plugin.editorIntegration.lineAuthoringFeature.refreshLineAuthorViews();
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

    private addLineAuthorInfoSettings() {
        const baseLineAuthorInfoSetting = new Setting(this.containerEl).setName(
            t("settings.line-author-show.name")
        );

        if (
            !this.plugin.editorIntegration.lineAuthoringFeature.isAvailableOnCurrentPlatform()
        ) {
            baseLineAuthorInfoSetting
                .setDesc(t("settings.line-author-show.only-available-desktop"))
                .setDisabled(true);
        }

        baseLineAuthorInfoSetting.descEl.innerHTML = t("settings.line-author-show.desc", {
            link: LINE_AUTHOR_FEATURE_WIKI_LINK
        });

        baseLineAuthorInfoSetting.addToggle((toggle) =>
            toggle.setValue(this.settings.lineAuthor.show).onChange((value) => {
                this.configureLineAuthorShowStatus(value);
                this.refreshDisplayWithDelay();
            })
        );

        if (this.settings.lineAuthor.show) {
            const trackMovement = new Setting(this.containerEl)
                .setName(t("settings.line-author-follow-movement.name"))
                .setDesc("")
                .addDropdown((dropdown) => {
                    dropdown.addOptions(<
                        Record<LineAuthorFollowMovement, string>
                    >{
                        inactive: t("settings.line-author-follow-movement.options.inactive"),
                        "same-commit": t("settings.line-author-follow-movement.options.same-commit"),
                        "all-commits": t("settings.line-author-follow-movement.options.all-commits"),
                    });
                    dropdown.setValue(this.settings.lineAuthor.followMovement);
                    dropdown.onChange((value) =>
                        this.lineAuthorSettingHandler(
                            "followMovement",
                            value as LineAuthorFollowMovement
                        )
                    );
                });
            trackMovement.descEl.innerHTML = t("settings.line-author-follow-movement.desc", {
                length: GIT_LINE_AUTHORING_MOVEMENT_DETECTION_MINIMAL_LENGTH
            });

            new Setting(this.containerEl)
                .setName(t("settings.line-author-show-commit-hash.name"))
                .addToggle((tgl) => {
                    tgl.setValue(this.settings.lineAuthor.showCommitHash);
                    tgl.onChange((value: boolean) =>
                        this.lineAuthorSettingHandler("showCommitHash", value)
                    );
                });

            new Setting(this.containerEl)
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
                    dropdown.setValue(this.settings.lineAuthor.authorDisplay);

                    dropdown.onChange(async (value) =>
                        this.lineAuthorSettingHandler(
                            "authorDisplay",
                            value as LineAuthorDisplay
                        )
                    );
                });

            new Setting(this.containerEl)
                .setName(t("settings.line-author-date-display.name"))
                .setDesc(t("settings.line-author-date-display.desc"))
                .addDropdown((dropdown) => {
                    const options: Record<
                        LineAuthorDateTimeFormatOptions,
                        string
                    > = {
                        hide: t("settings.line-author-date-display.options.hide"),
                        date: t("settings.line-author-date-display.options.date"),
                        datetime: t("settings.line-author-date-display.options.datetime"),
                        "natural language": t("settings.line-author-date-display.options.natural language"),
                        custom: t("settings.line-author-date-display.options.custom"),
                    };
                    dropdown.addOptions(options);
                    dropdown.setValue(
                        this.settings.lineAuthor.dateTimeFormatOptions
                    );

                    dropdown.onChange(async (value) => {
                        await this.lineAuthorSettingHandler(
                            "dateTimeFormatOptions",
                            value as LineAuthorDateTimeFormatOptions
                        );
                        this.refreshDisplayWithDelay();
                    });
                });

            if (this.settings.lineAuthor.dateTimeFormatOptions === "custom") {
                const dateTimeFormatCustomStringSetting = new Setting(
                    this.containerEl
                );

                dateTimeFormatCustomStringSetting
                    .setName(t("settings.line-author-date-custom-format.name"))
                    .addText((cb) => {
                        cb.setValue(
                            this.settings.lineAuthor.dateTimeFormatCustomString
                        );
                        cb.setPlaceholder("YYYY-MM-DD HH:mm");

                        cb.onChange(async (value) => {
                            await this.lineAuthorSettingHandler(
                                "dateTimeFormatCustomString",
                                value
                            );
                            dateTimeFormatCustomStringSetting.descEl.innerHTML =
                                this.previewCustomDateTimeDescriptionHtml(
                                    value
                                );
                        });
                    });

                dateTimeFormatCustomStringSetting.descEl.innerHTML =
                    this.previewCustomDateTimeDescriptionHtml(
                        this.settings.lineAuthor.dateTimeFormatCustomString
                    );
            }

            new Setting(this.containerEl)
                .setName(t("settings.line-author-date-timezone.name"))
                .addDropdown((dropdown) => {
                    const options: Record<LineAuthorTimezoneOption, string> = {
                        "viewer-local": t("settings.line-author-date-timezone.options.viewer-local"),
                        "author-local": t("settings.line-author-date-timezone.options.author-local"),
                        utc0000: t("settings.line-author-date-timezone.options.utc0000"),
                    };
                    dropdown.addOptions(options);
                    dropdown.setValue(
                        this.settings.lineAuthor.dateTimeTimezone
                    );

                    dropdown.onChange(async (value) =>
                        this.lineAuthorSettingHandler(
                            "dateTimeTimezone",
                            value as LineAuthorTimezoneOption
                        )
                    );
                }).descEl.innerHTML = t("settings.line-author-date-timezone.desc");

            const oldestAgeSetting = new Setting(this.containerEl).setName(
                t("settings.line-author-oldest-age.name")
            );

            oldestAgeSetting.descEl.innerHTML =
                this.previewOldestAgeDescriptionHtml(
                    this.settings.lineAuthor.coloringMaxAge
                )[0];

            oldestAgeSetting.addText((text) => {
                text.setPlaceholder("1y");
                text.setValue(this.settings.lineAuthor.coloringMaxAge);
                text.onChange(async (value) => {
                    const [preview, valid] =
                        this.previewOldestAgeDescriptionHtml(value);
                    oldestAgeSetting.descEl.innerHTML = preview;
                    if (valid) {
                        await this.lineAuthorSettingHandler(
                            "coloringMaxAge",
                            value
                        );
                        this.refreshColorSettingsName("oldest");
                    }
                });
            });

            this.createColorSetting("newest");
            this.createColorSetting("oldest");

            new Setting(this.containerEl)
                .setName(t("settings.line-author-text-color.name"))
                .addText((field) => {
                    field.setValue(this.settings.lineAuthor.textColorCss);
                    field.onChange(async (value) => {
                        await this.lineAuthorSettingHandler(
                            "textColorCss",
                            value
                        );
                    });
                }).descEl.innerHTML = t("settings.line-author-text-color.desc");

            new Setting(this.containerEl)
                .setName(t("settings.line-author-ignore-whitespace.name"))
                .addToggle((tgl) => {
                    tgl.setValue(this.settings.lineAuthor.ignoreWhitespace);
                    tgl.onChange((value) =>
                        this.lineAuthorSettingHandler("ignoreWhitespace", value)
                    );
                }).descEl.innerHTML = t("settings.line-author-ignore-whitespace.desc");
        }
    }

    private createColorSetting(which: "oldest" | "newest") {
        const setting = new Setting(this.containerEl)
            .setName("")
            .addText((text) => {
                const color = pickColor(which, this.settings.lineAuthor);
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
                        await this.lineAuthorSettingHandler(key, rgb);
                    }
                    this.refreshColorSettingsDesc(which, rgb);
                });
            });
        this.lineAuthorColorSettings.set(which, setting);

        this.refreshColorSettingsName(which);
        this.refreshColorSettingsDesc(
            which,
            pickColor(which, this.settings.lineAuthor)
        );
    }

    private refreshColorSettingsName(which: "oldest" | "newest") {
        const settingsDom = this.lineAuthorColorSettings.get(which);
        if (settingsDom) {
            const whichDescriber =
                which === "oldest"
                    ? `oldest (${this.settings.lineAuthor.coloringMaxAge} or older)`
                    : "newest";
            settingsDom.nameEl.innerText = `Color for ${whichDescriber} commits`;
        }
    }

    private refreshColorSettingsDesc(which: "oldest" | "newest", rgb?: RGB) {
        const settingsDom = this.lineAuthorColorSettings.get(which);
        if (settingsDom) {
            settingsDom.descEl.innerHTML = this.colorSettingPreviewDescHtml(
                which,
                this.settings.lineAuthor,
                rgb !== undefined
            );
        }
    }

    private colorSettingPreviewDescHtml(
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

    private previewCustomDateTimeDescriptionHtml(
        dateTimeFormatCustomString: string
    ) {
        const formattedDateTime = window
            .moment()
            .format(dateTimeFormatCustomString);
        return `<a href="${FORMAT_STRING_REFERENCE_URL}">Format string</a> to display the authoring date.</br>Currently: ${formattedDateTime}`;
    }

    private previewOldestAgeDescriptionHtml(coloringMaxAge: string) {
        const duration = parseColoringMaxAgeDuration(coloringMaxAge);
        const durationString =
            duration !== undefined ? `${duration.asDays()} days` : "invalid!";
        return [
            `The oldest age in the line author coloring. Everything older will have the same color.
            </br>Smallest valid age is "1d". Currently: ${durationString}`,
            duration,
        ] as const;
    }

    /**
     * Sets the value in the textbox for a given setting only if the saved value differs from the default value.
     * If the saved value is the default value, it probably wasn't defined by the user, so it's better to display it as a placeholder.
     */
    private setNonDefaultValue({
        settingsProperty,
        text,
    }: {
        settingsProperty: keyof ObsidianGitSettings;
        text: TextComponent | TextAreaComponent;
    }): void {
        const storedValue = this.plugin.settings[settingsProperty];
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

    /**
     * Delays the update of the settings UI.
     * Used when the user toggles one of the settings that control enabled states of other settings. Delaying the update
     * allows most of the toggle animation to run, instead of abruptly jumping between enabled/disabled states.
     */
    private refreshDisplayWithDelay(timeout = 80): void {
        setTimeout(() => this.display(), timeout);
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
