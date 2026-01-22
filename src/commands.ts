import { Notice, Platform, TFolder, WorkspaceLeaf } from "obsidian";
import { HISTORY_VIEW_CONFIG, SOURCE_CONTROL_VIEW_CONFIG } from "./constants";
import { SimpleGit } from "./gitManager/simpleGit";
import ObsidianGit from "./main";
import type { ObsidianGitPlugin } from "./types";
import { openHistoryInGitHub, openLineInGitHub } from "./openInGitHub";
import { ChangedFilesModal } from "./ui/modals/changedFilesModal";
import { GeneralModal } from "./ui/modals/generalModal";
import { IgnoreModal } from "./ui/modals/ignoreModal";
import { assertNever } from "./utils";
import { togglePreviewHunk } from "./editor/signs/tooltip";
import { t } from "./i18n";

export function addCommmands(plugin: ObsidianGit) {
    const app = plugin.app;
    const isMobile = Platform.isMobileApp;

    plugin.addCommand({
        id: "edit-gitignore",
        name: t("commands.edit-gitignore"),
        callback: async () => {
            const path = plugin.gitManager.getRelativeVaultPath(".gitignore");
            if (!(await app.vault.adapter.exists(path))) {
                await app.vault.adapter.write(path, "");
            }
            const content = await app.vault.adapter.read(path);
            const modal = new IgnoreModal(app, content);
            const res = await modal.openAndGetReslt();
            if (res !== undefined) {
                await app.vault.adapter.write(path, res);
                await plugin.refresh();
            }
        },
    });
    plugin.addCommand({
        id: "open-git-view",
        name: t("commands.open-git-view"),
        callback: async () => {
            const leafs = app.workspace.getLeavesOfType(
                SOURCE_CONTROL_VIEW_CONFIG.type
            );
            let leaf: WorkspaceLeaf;
            if (leafs.length === 0) {
                leaf =
                    app.workspace.getRightLeaf(false) ??
                    app.workspace.getLeaf();
                await leaf.setViewState({
                    type: SOURCE_CONTROL_VIEW_CONFIG.type,
                });
            } else {
                leaf = leafs.first()!;
            }
            await app.workspace.revealLeaf(leaf);

            // Is not needed for the first open, but allows to refresh the view
            // per hotkey even if already opened
            app.workspace.trigger("obsidian-git:refresh");
        },
    });
    plugin.addCommand({
        id: "open-history-view",
        name: t("commands.open-history-view"),
        callback: async () => {
            const leafs = app.workspace.getLeavesOfType(
                HISTORY_VIEW_CONFIG.type
            );
            let leaf: WorkspaceLeaf;
            if (leafs.length === 0) {
                leaf =
                    app.workspace.getRightLeaf(false) ??
                    app.workspace.getLeaf();
                await leaf.setViewState({
                    type: HISTORY_VIEW_CONFIG.type,
                });
            } else {
                leaf = leafs.first()!;
            }
            await app.workspace.revealLeaf(leaf);

            // Is not needed for the first open, but allows to refresh the view
            // per hotkey even if already opened
            app.workspace.trigger("obsidian-git:refresh");
        },
    });

    plugin.addCommand({
        id: "open-diff-view",
        name: t("commands.open-diff-view"),
        checkCallback: (checking) => {
            const file = app.workspace.getActiveFile();
            if (checking) {
                return file !== null;
            }
            const filePath = plugin.gitManager.getRelativeRepoPath(
                file!.path,
                true
            );
            plugin.tools.openDiff({
                aFile: filePath,
                aRef: "",
            });
            return true;
        },
    });

    plugin.addCommand({
        id: "view-file-on-github",
        name: t("commands.open-file-on-github"),
        editorCallback: (editor, { file }) => {
            if (file) {
                void openLineInGitHub(editor, file, plugin.gitManager);
            }
        },
    });

    plugin.addCommand({
        id: "view-history-on-github",
        name: t("commands.open-file-history-on-github"),
        editorCallback: (_, { file }) => {
            if (file) {
                void openHistoryInGitHub(file, plugin.gitManager);
            }
        },
    });

    plugin.addCommand({
        id: "pull",
        name: t("commands.pull"),
        callback: () => {
            if (isMobile) {
                // 移动端优化：显示进度提示
                new Notice("📱 正在拉取更新，这可能需要一些时间...", 3000);
            }
            plugin.promiseQueue.addTask(() => plugin.pullChangesFromRemote());
        },
    });

    plugin.addCommand({
        id: "fetch",
        name: "Fetch",
        callback: () => plugin.promiseQueue.addTask(() => plugin.fetch()),
    });

    plugin.addCommand({
        id: "switch-to-remote-branch",
        name: t("commands.switch-remote-branch"),
        callback: () =>
            plugin.promiseQueue.addTask(() => plugin.switchRemoteBranch()),
    });

    plugin.addCommand({
        id: "add-to-gitignore",
        name: "Add file to .gitignore",
        checkCallback: (checking) => {
            const file = app.workspace.getActiveFile();
            if (checking) {
                return file !== null;
            }
            plugin
                .addFileToGitignore(file!.path, file instanceof TFolder)
                .catch((e) => plugin.displayError(e));
            return true;
        },
    });

    plugin.addCommand({
        id: "push",
        name: t("commands.commit-push"),
        callback: () =>
            plugin.promiseQueue.addTask(() =>
                plugin.commitAndSync({ fromAutoBackup: false })
            ),
    });

    plugin.addCommand({
        id: "backup-and-close",
        name: "Commit-and-sync and then close Obsidian",
        callback: () =>
            plugin.promiseQueue.addTask(async () => {
                await plugin.commitAndSync({ fromAutoBackup: false });
                window.close();
            }),
    });

    plugin.addCommand({
        id: "commit-push-specified-message",
        name: "Commit-and-sync with specific message",
        callback: () =>
            plugin.promiseQueue.addTask(() =>
                plugin.commitAndSync({
                    fromAutoBackup: false,
                })
            ),
    });

    plugin.addCommand({
        id: "commit",
        name: t("commands.commit"),
        callback: () => {
            if (isMobile) {
                // 移动端优化：检查是否有大量文件变更
                plugin.getCachedStatus().then((status) => {
                    const totalChanges = status.changed.length + status.staged.length;
                    if (totalChanges > 20) {
                        new Notice(`⚠️ 发现 ${totalChanges} 个文件变更，移动端建议分批提交`, 5000);
                    }
                }).catch(console.error);
            }
            plugin.promiseQueue.addTask(() =>
                plugin.commit({ fromAuto: false })
            );
        },
    });

    plugin.addCommand({
        id: "commit-specified-message",
        name: "Commit all changes with specific message",
        callback: () =>
            plugin.promiseQueue.addTask(() =>
                plugin.commit({
                    fromAuto: false,
                })
            ),
    });

    plugin.addCommand({
        id: "commit-smart",
        name: t("commands.commit"),
        callback: () =>
            plugin.promiseQueue.addTask(async () => {
                const status = await plugin.updateCachedStatus();
                const onlyStaged = status.staged.length > 0;
                return plugin.commit({
                    fromAuto: false,
                    onlyStaged: onlyStaged,
                });
            }),
    });

    plugin.addCommand({
        id: "commit-staged",
        name: "Commit staged",
        checkCallback: function (checking) {
            // Don't show this command in command palette, because the
            // commit-smart command is more useful. Still provide this command
            // for hotkeys and automation.
            if (checking) return false;

            plugin.promiseQueue.addTask(async () => {
                return plugin.commit({
                    fromAuto: false,
                });
            });
            return true;
        },
    });

    if (Platform.isDesktopApp) {
        plugin.addCommand({
            id: "commit-amend-staged-specified-message",
            name: t("commands.commit-amend"),
            callback: () =>
                plugin.promiseQueue.addTask(() =>
                    plugin.commit({
                        fromAuto: false,
                        onlyStaged: true,
                        amend: true,
                    })
                ),
        });
    }

    plugin.addCommand({
        id: "commit-smart-specified-message",
        name: "Commit with specific message",
        callback: () =>
            plugin.promiseQueue.addTask(async () => {
                const status = await plugin.updateCachedStatus();
                const onlyStaged = status.staged.length > 0;
                return plugin.commit({
                    fromAuto: false,
                    onlyStaged: onlyStaged,
                });
            }),
    });

    plugin.addCommand({
        id: "commit-staged-specified-message",
        name: "Commit staged with specific message",
        checkCallback: function (checking) {
            // Same reason as for commit-staged
            if (checking) return false;
            plugin.promiseQueue.addTask(() =>
                plugin.commit({
                    fromAuto: false,
                    onlyStaged: true,
                })
            );
            return true;
        },
    });

    plugin.addCommand({
        id: "push2",
        name: t("commands.push"),
        callback: () => plugin.promiseQueue.addTask(() => plugin.push()),
    });

    plugin.addCommand({
        id: "stage-current-file",
        name: t("commands.stage-current-file"),
        checkCallback: (checking) => {
            const file = app.workspace.getActiveFile();
            if (checking) {
                return file !== null;
            }
            plugin.promiseQueue.addTask(() => plugin.stageFile(file!));
            return true;
        },
    });

    plugin.addCommand({
        id: "unstage-current-file",
        name: t("commands.unstage-current-file"),
        checkCallback: (checking) => {
            const file = app.workspace.getActiveFile();
            if (checking) {
                return file !== null;
            }
            plugin.promiseQueue.addTask(() => plugin.unstageFile(file!));
            return true;
        },
    });

    plugin.addCommand({
        id: "edit-remotes",
        name: t("commands.edit-remotes"),
        callback: () =>
            plugin.editRemotes().catch((e) => plugin.displayError(e)),
    });

    plugin.addCommand({
        id: "remove-remote",
        name: t("commands.remove-remote"),
        callback: () =>
            plugin.editRemotes().catch((e: unknown) => plugin.displayError(e)),
    });

    plugin.addCommand({
        id: "set-upstream-branch",
        name: t("commands.set-upstream-branch"),
        callback: () =>
            plugin.setUpstreamBranch().catch((e) => plugin.displayError(e)),
    });

    plugin.addCommand({
        id: "delete-repo",
        name: "CAUTION: Delete repository",
        callback: async () => {
            const repoExists = await app.vault.adapter.exists(
                `${plugin.settings.basePath}/.git`
            );
            if (repoExists) {
                const modal = new GeneralModal(plugin, {
                    options: ["NO", "YES"],
                    placeholder:
                        "Do you really want to delete the repository (.git directory)? plugin action cannot be undone.",
                    onlySelection: true,
                });
                const shouldDelete = (await modal.openAndGetResult()) === "YES";
                if (shouldDelete) {
                    await app.vault.adapter.rmdir(
                        `${plugin.settings.basePath}/.git`,
                        true
                    );
                    new Notice(t("notices.deleted-repository"));
                    plugin.unloadPlugin();
                    await plugin.init({ fromReload: true });
                }
            } else {
                new Notice(t("notices.no-repository-found"));
            }
        },
    });

    plugin.addCommand({
        id: "init-repo",
        name: t("commands.initialize-repo"),
        callback: () =>
            plugin.createNewRepo().catch((e) => plugin.displayError(e)),
    });

    plugin.addCommand({
        id: "clone-repo",
        name: t("commands.clone-repo"),
        callback: () =>
            plugin.cloneNewRepo().catch((e) => plugin.displayError(e)),
    });

    plugin.addCommand({
        id: "list-changed-files",
        name: t("commands.list-changed-files"),
        callback: async () => {
            if (!(await plugin.isAllInitialized())) return;

            try {
                const status = await plugin.updateCachedStatus();
                if (status.changed.length + status.staged.length > 500) {
                    plugin.displayError("Too many changes to display");
                    return;
                }

                new ChangedFilesModal(plugin, status.all).open();
            } catch (e) {
                plugin.displayError(e);
            }
        },
    });

    plugin.addCommand({
        id: "switch-branch",
        name: t("commands.switch-branch"),
        callback: () => {
            plugin.switchBranch().catch((e) => plugin.displayError(e));
        },
    });

    plugin.addCommand({
        id: "create-branch",
        name: t("commands.create-branch"),
        callback: () => {
            plugin.createBranch().catch((e) => plugin.displayError(e));
        },
    });

    plugin.addCommand({
        id: "delete-branch",
        name: t("commands.delete-branch"),
        callback: () => {
            plugin.deleteBranch().catch((e) => plugin.displayError(e));
        },
    });

    plugin.addCommand({
        id: "discard-all",
        name: t("commands.discard-all"),
        callback: async () => {
            const res = await plugin.discardAll();
            switch (res) {
                case "discard":
                    new Notice(t("notices.discarded-tracked-files"));
                    break;
                case "delete":
                    new Notice(t("notices.discarded-all-files"));
                    break;
                case false:
                    break;
                default:
                    assertNever(res);
            }
        },
    });

    plugin.addCommand({
        id: "pause-automatic-routines",
        name: "Pause/Resume automatic routines",
        callback: () => {
            const pause = !plugin.localStorage.getPausedAutomatics();
            plugin.localStorage.setPausedAutomatics(pause);
            if (pause) {
                plugin.automaticsManager.unload();
                new Notice(t("notices.paused-automatic"));
            } else {
                plugin.automaticsManager.reload("commit", "push", "pull");
                new Notice(t("notices.resumed-automatic"));
            }
        },
    });

    plugin.addCommand({
        id: "raw-command",
        name: "Raw command",
        checkCallback: (checking) => {
            const gitManager = plugin.gitManager;
            if (checking) {
                // only available on desktop
                return gitManager instanceof SimpleGit;
            }
            plugin.tools
                .runRawCommand()
                .catch((e) => plugin.displayError(e));
            return true;
        },
    });

    plugin.addCommand({
        id: "toggle-line-author-info",
        name: t("commands.toggle-line-author"),
        callback: () =>
            plugin.settingsTab?.configureLineAuthorShowStatus(
                !plugin.settings.lineAuthor.show
            ),
    });

    plugin.addCommand({
        id: "reset-hunk",
        name: t("commands.reset-hunk"),
        editorCheckCallback(checking, _, __) {
            if (checking) {
                return (
                    plugin.settings.hunks.hunkCommands &&
                    plugin.hunkActions.editor !== undefined
                );
            }

            plugin.hunkActions.resetHunk();
            return true;
        },
    });

    plugin.addCommand({
        id: "stage-hunk",
        name: t("commands.stage-hunk"),
        editorCheckCallback: (checking, _, __) => {
            if (checking) {
                return (
                    plugin.settings.hunks.hunkCommands &&
                    plugin.hunkActions.editor !== undefined
                );
            }
            plugin.promiseQueue.addTask(() => plugin.hunkActions.stageHunk());
            return true;
        },
    });

    plugin.addCommand({
        id: "preview-hunk",
        name: t("commands.preview-hunk"),
        editorCheckCallback: (checking, _, __) => {
            if (checking) {
                return (
                    plugin.settings.hunks.hunkCommands &&
                    plugin.hunkActions.editor !== undefined
                );
            }
            const editor = plugin.hunkActions.editor!.editor;
            togglePreviewHunk(editor);
            return true;
        },
    });

    plugin.addCommand({
        id: "next-hunk",
        name: t("commands.go-to-next-hunk"),
        editorCheckCallback: (checking, _, __) => {
            if (checking) {
                return (
                    plugin.settings.hunks.hunkCommands &&
                    plugin.hunkActions.editor !== undefined
                );
            }
            plugin.hunkActions.goToHunk("next");
            return true;
        },
    });

    plugin.addCommand({
        id: "prev-hunk",
        name: t("commands.go-to-prev-hunk"),
        editorCheckCallback: (checking, _, __) => {
            if (checking) {
                return (
                    plugin.settings.hunks.hunkCommands &&
                    plugin.hunkActions.editor !== undefined
                );
            }
            plugin.hunkActions.goToHunk("prev");
            return true;
        },
    });

    // 移动端和平板专用优化命令
    if (Platform.isMobileApp) {
        plugin.addCommand({
            id: "mobile-quick-sync",
            name: "📱 快速同步 (移动端优化)",
            callback: async () => {
                new Notice("🚀 开始快速同步...", 2000);

                try {
                    // 先检查状态
                    const status = await plugin.getCachedStatus();

                    if (status.changed.length === 0 && status.staged.length === 0) {
                        // 没有变更，直接拉取
                        plugin.promiseQueue.addTask(() => plugin.pullChangesFromRemote());
                        new Notice("✅ 已同步最新更改", 3000);
                    } else {
                        // 有变更，先提交再同步
                        const totalChanges = status.changed.length + status.staged.length;
                        new Notice(`📝 提交 ${totalChanges} 个文件变更...`, 2000);

                        const commitSuccess = await plugin.commit({
                            fromAuto: false,
                            commitMessage: `Mobile sync: ${new Date().toLocaleString()}`
                        });

                        if (commitSuccess) {
                            plugin.promiseQueue.addTask(() => plugin.push());
                            new Notice("✅ 提交并推送成功", 3000);
                        } else {
                            new Notice("❌ 提交失败，请检查文件状态", 5000);
                        }
                    }
                } catch (error) {
                    plugin.displayError(error);
                }
            },
        });

        plugin.addCommand({
            id: "mobile-batch-commit",
            name: "📱 批量提交 (移动端优化)",
            callback: async () => {
                try {
                    const status = await plugin.getCachedStatus();
                    const totalChanges = status.changed.length + status.staged.length;

                    if (totalChanges === 0) {
                        new Notice("ℹ️ 没有需要提交的更改", 3000);
                        return;
                    }

                    // 移动端分批提交策略
                    const batchSize = Math.min(totalChanges, 10); // 每批最多10个文件
                    new Notice(`📦 将分批提交 ${totalChanges} 个文件 (每批 ${batchSize} 个)...`, 3000);

                    // 第一步：分批暂存文件
                    let stagedCount = 0;
                    for (let i = 0; i < status.changed.length && stagedCount < batchSize; i++) {
                        const file = status.changed[i];
                        const abstractFile = plugin.app.vault.getAbstractFileByPath(file);
                        if (abstractFile && abstractFile instanceof TFile) {
                            const success = await plugin.stageFile(abstractFile);
                            if (success) stagedCount++;
                        }
                    }

                    if (stagedCount > 0) {
                        new Notice(`✅ 已暂存 ${stagedCount} 个文件，准备提交...`, 2000);

                        // 第二步：提交暂存的文件
                        const commitSuccess = await plugin.commit({
                            fromAuto: false,
                            onlyStaged: true,
                            commitMessage: `Mobile batch commit: ${stagedCount} files at ${new Date().toLocaleString()}`
                        });

                        if (commitSuccess) {
                            new Notice(`✅ 成功提交 ${stagedCount} 个文件`, 3000);
                        } else {
                            new Notice("❌ 提交失败", 5000);
                        }
                    } else {
                        new Notice("❌ 无法暂存文件，请检查文件状态", 5000);
                    }
                } catch (error) {
                    plugin.displayError(error);
                }
            },
        });

        plugin.addCommand({
            id: "mobile-cleanup",
            name: "🧹 移动端清理 (释放内存)",
            callback: () => {
                const deviceName = plugin.deviceType === 'tablet' ? '平板' : '移动';
                new Notice(`🧹 开始清理${deviceName}端缓存和优化内存...`, 2000);

                try {
                    // 清理缓存
                    plugin.mobileCache.status = null;
                    plugin.mobileCache.statusTimestamp = 0;

                    // 强制垃圾回收（如果可用）
                    if (window.gc) {
                        window.gc();
                    }

                    // 刷新所有视图
                    plugin.app.workspace.trigger("obsidian-git:refresh");

                    new Notice(`✅ ${deviceName}端清理完成，内存已优化`, 3000);
                } catch (error) {
                    plugin.displayError(error);
                }
            },
        });

        // 平板专用命令
        const deviceType = (plugin as ObsidianGitPlugin).deviceType;
        if (deviceType === 'tablet') {
            plugin.addCommand({
                id: "tablet-multitask",
                name: "📱 平板多任务模式 (开启多个视图)",
                callback: () => {
                    new Notice("📱 启用平板多任务模式...", 2000);

                    try {
                        // 在平板上可以同时打开更多视图
                        const leaves = plugin.app.workspace.getLeavesOfType("git-view");

                        if (leaves.length === 0) {
                            // 打开源代码管理视图
                            void plugin.app.workspace.getRightLeaf(false)?.setViewState({
                                type: "git-view",
                                active: true,
                            });
                        }

                        // 延迟一下再打开历史视图，避免冲突
                        setTimeout(() => {
                            const historyLeaves = plugin.app.workspace.getLeavesOfType("git-history-view");
                            if (historyLeaves.length === 0) {
                                void plugin.app.workspace.getRightLeaf(false)?.setViewState({
                                    type: "git-history-view",
                                    active: false, // 不激活，保持当前视图
                                });
                            }
                            new Notice("✅ 平板多任务模式已启用，可以同时查看多个Git视图", 3000);
                        }, 500);

                    } catch (error) {
                        plugin.displayError(error);
                        new Notice("❌ 启用多任务模式失败", 3000);
                    }
                },
            });
        }
    }
}
