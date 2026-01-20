// 简体中文翻译
export default {
    // 命令
    commands: {
        "edit-gitignore": "编辑 .gitignore",
        "open-git-view": "打开源代码管理视图",
        "open-history-view": "打开历史记录视图",
        "open-diff-view": "打开差异视图",
        "stage-current-file": "暂存当前文件",
        "unstage-current-file": "取消暂存当前文件",
        "commit": "提交",
        "commit-push": "提交并推送",
        "commit-amend": "修改上次提交",
        "push": "推送",
        "pull": "拉取",
        "switch-branch": "切换分支",
        "switch-remote-branch": "切换到远程分支",
        "create-branch": "创建新分支",
        "delete-branch": "删除分支",
        "discard-all": "放弃所有更改",
        "initialize-repo": "初始化仓库",
        "clone-repo": "克隆仓库",
        "list-changed-files": "列出已更改的文件",
        "edit-remotes": "编辑远程仓库",
        "remove-remote": "删除远程仓库",
        "set-upstream-branch": "设置上游分支",
        "pause-autosync": "暂停自动同步",
        "resume-autosync": "恢复自动同步",
        "toggle-line-author": "切换行作者信息",
        "stage-hunk": "暂存差异块",
        "unstage-hunk": "取消暂存差异块",
        "reset-hunk": "重置差异块",
        "preview-hunk": "预览差异块",
        "go-to-next-hunk": "跳到下一个差异块",
        "go-to-prev-hunk": "跳到上一个差异块",
        "open-file-on-github": "在 GitHub 上打开文件",
        "open-file-history-on-github": "在 GitHub 上打开文件历史",
    },

    // 通知消息
    notices: {
        "git-not-ready": "Git 未就绪。请等待初始化完成或检查设置。",
        "no-changes-to-commit": "没有要提交的更改",
        "no-commits-to-push": "没有要推送的提交",
        "pull-everything-up-to-date": "拉取: 一切都是最新的",
        "pushed-files": "已推送 {{count}} 个{{file}}到远程",
        "pulled-files": "从远程拉取了 {{count}} 个{{file}}",
        "committed-files": "已提交{{roughly}} {{count}} 个{{file}}",
        "initialized-repo": "已初始化新仓库",
        "cloned-repo": "正在将新仓库克隆到 \"{{dir}}\"",
        "cloned-repo-success": "已克隆新仓库。",
        "restart-obsidian": "请重新启动 Obsidian",
        "switched-branch": "已切换到 {{branch}}",
        "created-branch": "已创建新分支 {{branch}}",
        "deleted-branch": "已删除分支 {{branch}}",
        "branch-not-merged": "此分支尚未合并到 HEAD。是否强制删除？",
        "set-upstream": "已将上游分支设置为 {{branch}}",
        "fetched-remote": "从远程获取",
        "conflicts-detected": "您在 {{count}} 个{{file}}中存在冲突",
        "cannot-push-conflicts": "无法推送。您在 {{count}} 个{{file}}中存在冲突",
        "aborted": "已中止",
        "auto-backup-paused": "自动备份当前已暂停",
        "auto-backup-resumed": "自动备份已恢复",
        "automaticsCurrentlyPaused": "自动例程当前已暂停。",
        "auto-backup-message": "自动备份：请输入自定义提交消息。留空则中止",
        "cannot-run-git": "无法运行 git 命令。尝试运行：'{{gitPath}}'。",
        "no-valid-repo": "找不到有效的 git 仓库。请通过给定命令创建一个或克隆现有仓库。",
        "going-offline": "Git: 进入离线模式。将不再显示未来的网络错误。",
        "already-offline": "遇到网络错误，但已处于离线模式",
        "file-too-big": "文件 {{file}} 太大（{{size}} MB）。请使用 Git LFS。",
        "copy-debug-info": "调试信息已复制到剪贴板。可能包含敏感信息！",
        "no-upstream-branch": "未设置上游分支。请选择一个。",
        "aborted-no-upstream": "已中止。未设置上游分支！",
    },

    // 对话框
    modals: {
        commit: {
            title: "提交消息",
            placeholder: "提交消息",
        },
        branch: {
            title: "选择分支",
            placeholder: "选择或创建分支",
        },
        remote: {
            title: "远程 URL",
            placeholder: "输入远程 URL",
        },
        "remote-branch": {
            title: "选择远程分支",
            placeholder: "选择或创建新的远程分支（输入其名称并选择）",
        },
        clone: {
            "url-placeholder": "输入远程 URL",
            "dir-placeholder": "输入克隆目录。需要为空或不存在。",
            "depth-placeholder": "指定克隆深度。留空表示完整克隆。",
            "vault-root": "Vault 根目录",
            "contains-conflict-dir": "您的远程仓库是否在根目录包含 {{configDir}} 目录？",
            "delete-config-warning": "为避免冲突，需要删除本地 {{configDir}} 目录。",
            "delete-config-confirm": "删除所有本地配置和插件",
            "abort-clone": "中止克隆",
            "invalid-depth": "深度无效。正在中止克隆。",
        },
        discard: {
            title: "放弃更改",
            "content-discard": "放弃",
            "content-delete": "删除",
            "description-discard": "放弃 {{count}} 个已更改{{file}}的更改？",
            "description-delete": "删除 {{count}} 个未跟踪{{file}}？",
            "description-both": "放弃 {{discardCount}} 个已更改{{file}}的更改并删除 {{deleteCount}} 个未跟踪{{file}}？",
            cancel: "取消",
        },
        ignore: {
            title: "编辑 .gitignore",
        },
        "changed-files": {
            title: "已更改的文件",
            "no-changes": "没有更改",
        },
    },

    // 设置
    settings: {
        language: {
            name: "语言 / Language",
            desc: "选择插件界面语言。需要重新启动 Obsidian 以完全应用更改。",
            auto: "自动（跟随系统）",
            "restart-notice": "已更改语言设置。建议重新启动 Obsidian 以完全应用更改。",
        },
        heading: {
            automatic: "自动",
            "commit-message": "提交消息",
            pull: "拉取",
            "commit-and-sync": "提交并同步",
            "hunk-management": "差异块管理",
            "line-author": "行作者信息",
            "history-view": "历史记录视图",
            "source-control-view": "源代码管理视图",
            miscellaneous: "杂项",
            "commit-author": "提交作者",
            authentication: "身份验证/提交作者",
            advanced: "高级",
            support: "支持",
        },
        "git-not-ready": {
            text: "Git 未就绪。当所有设置正确后，您可以配置提交同步等功能。",
        },
        "split-timers": {
            name: "拆分自动提交和同步的计时器",
            desc: "启用后，为提交和同步使用不同的间隔。",
        },
        "auto-save-interval": {
            name: "自动{{commitOrSync}}间隔（分钟）",
            desc: "每 X 分钟{{action}}更改。设置为 0（默认）禁用。（请参阅下面的设置以进行进一步配置！）",
            "action-commit": "提交",
            "action-commit-and-sync": "提交并同步",
        },
        "auto-backup-after-file-change": {
            name: "停止文件编辑后自动{{commitOrSync}}",
            desc: "需要{{commitOrSync}}间隔不为 0。如果打开，在停止文件编辑后的 {{minutes}} 进行自动{{commitOrSync}}。这还可以防止在编辑文件时自动{{commitOrSync}}。如果关闭，则与最后一次文件编辑无关。",
        },
        "auto-backup-after-latest-commit": {
            name: "最新提交后自动{{commitOrSync}}",
            desc: "如果打开，将最后一次自动{{commitOrSync}}时间戳设置为最新提交时间戳。这在进行手动提交时会降低自动{{commitOrSync}}的频率。",
        },
        "auto-push-interval": {
            name: "自动推送间隔（分钟）",
            desc: "每 X 分钟推送提交。设置为 0（默认）禁用。",
        },
        "auto-pull-interval": {
            name: "自动拉取间隔（分钟）",
            desc: "每 X 分钟拉取更改。设置为 0（默认）禁用。",
        },
        "auto-commit-staged": {
            name: "自动{{commitOrSync}}仅暂存的文件",
            desc: "如果打开，在{{commitOrSync}}时仅提交暂存的文件。如果关闭，提交所有更改的文件。",
        },
        "custom-message-on-auto-backup": {
            name: "在自动{{commitOrSync}}时指定自定义提交消息",
            desc: "您将收到一个弹出窗口来指定消息。",
        },
        "auto-commit-message": {
            name: "自动{{commitOrSync}}时的提交消息",
            desc: "可用占位符：{{date}}（见下文）、{{hostname}}（见下文）、{{numFiles}}（提交中更改的文件数）和 {{files}}（提交消息中更改的文件）。",
        },
        "commit-message": {
            name: "手动提交时的提交消息",
            desc: "可用占位符：{{date}}（见下文）、{{hostname}}（见下文）、{{numFiles}}（提交中更改的文件数）和 {{files}}（提交消息中更改的文件）。",
        },
        "commit-message-script": {
            name: "提交消息脚本",
            desc: "使用 'sh -c' 运行的脚本，用于生成提交消息。可用于使用 AI 工具生成提交消息。可用占位符：{{hostname}}、{{date}}。",
        },
        "date-placeholder": {
            name: "{{date}} 占位符格式",
            desc: "指定自定义日期格式。例如 \"{{format}}\"。请参阅 <a href=\"https://momentjs.com\">Moment.js</a> 了解更多格式。",
        },
        "hostname-placeholder": {
            name: "{{hostname}} 占位符替换",
            desc: "为每个设备指定自定义主机名。",
        },
        "preview-commit-message": {
            name: "预览提交消息",
            button: "预览",
        },
        "list-filenames-in-message-body": {
            name: "在提交正文中列出受提交影响的文件名",
        },
        "merge-strategy": {
            name: "合并策略",
            desc: "决定如何将远程分支的提交整合到本地分支。",
            options: {
                merge: "合并",
                rebase: "变基",
                reset: "其他同步服务（仅更新 HEAD 而不触及工作目录）",
            },
        },
        "merge-strategy-on-conflicts": {
            name: "冲突时的合并策略",
            desc: "决定在拉取远程更改时如何解决冲突。这可用于自动支持您的本地更改或远程更改。",
            options: {
                none: "无（git 默认）",
                ours: "我们的更改",
                theirs: "他们的更改",
            },
        },
        "pull-on-startup": {
            name: "启动时拉取",
            desc: "Obsidian 启动时自动拉取提交。",
        },
        "push-on-commit-and-sync": {
            name: "提交并同步时推送",
            desc: "大多数情况下，您希望在提交后推送。关闭此选项会将提交并同步操作变为仅提交{{pullText}}。它仍将被称为提交并同步。",
        },
        "pull-on-commit-and-sync": {
            name: "提交并同步时拉取",
            desc: "在提交并同步时，也拉取提交。关闭此选项会将提交并同步操作变为仅提交{{pushText}}。",
        },
        "and-pull": "和拉取",
        "and-push": "和推送",
        "hunk-management-desc": "差异块是编辑器中分组的行更改部分。",
        signs: {
            name: "标记",
            desc: "这允许您通过彩色标记直接在编辑器中查看更改，并暂存/重置/预览各个差异块。",
        },
        "hunk-commands": {
            name: "差异块命令",
            desc: "添加命令以暂存/重置单个 Git 差异块，并通过'跳到下一个/上一个差异块'命令在它们之间导航。",
        },
        "status-bar-changes": {
            name: "包含行更改摘要的状态栏",
        },
        "line-author-show": {
            name: "在每行旁边显示提交作者信息",
            desc: "<a href=\"{{link}}\">功能指南和快速示例</a></br>可以单独切换提交哈希、作者姓名和作者日期。</br>隐藏所有内容，仅显示年龄彩色侧边栏。",
            "only-available-desktop": "目前仅在桌面端可用。",
        },
        "line-author-follow-movement": {
            name: "跟踪跨文件和提交的移动和复制",
            desc: "默认情况下（停用），每行仅显示更改它的最新提交。<br/>使用<i>相同提交</i>，将在同一提交中跟踪文本的剪切-复制-粘贴，并显示原始作者提交。<br/>使用<i>所有提交</i>，将检测在多个提交之间剪切-复制-粘贴文本。<br/>它使用 <a href=\"https://git-scm.com/docs/git-blame\">git-blame</a>，对于同一（或所有）提交中的匹配（至少 {{length}} 个字符），将显示<em>原始</em>提交的信息。",
            options: {
                inactive: "不跟踪（默认）",
                "same-commit": "在同一提交中跟踪",
                "all-commits": "在所有提交中跟踪（可能较慢）",
            },
        },
        "line-author-show-commit-hash": {
            name: "显示提交哈希",
        },
        "line-author-author-display": {
            name: "作者姓名显示",
            desc: "是否以及如何显示作者",
            options: {
                hide: "隐藏",
                initials: "首字母（默认）",
                "first name": "名字",
                "last name": "姓氏",
                full: "全名",
            },
        },
        "line-author-date-display": {
            name: "作者日期显示",
            desc: "是否以及如何显示撰写该行的日期和时间",
            options: {
                hide: "隐藏",
                date: "日期（默认）",
                datetime: "日期和时间",
                "natural language": "自然语言",
                custom: "自定义",
            },
        },
        "line-author-date-custom-format": {
            name: "自定义作者日期格式",
            desc: "<a href=\"{{link}}\">格式字符串</a>以显示作者日期。</br>当前：{{current}}",
        },
        "line-author-date-timezone": {
            name: "作者日期显示时区",
            desc: "显示作者日期的时区。可以是您的本地时区（默认）、作者在提交创建期间的时区或 <a href=\"https://en.wikipedia.org/wiki/UTC%C2%B100:00\">UTC±00:00</a>。",
            options: {
                "viewer-local": "我的本地（默认）",
                "author-local": "作者的本地",
                utc0000: "UTC+0000/Z",
            },
        },
        "line-author-oldest-age": {
            name: "着色中的最早年龄",
            desc: "行作者着色中的最早年龄。更早的所有内容将具有相同的颜色。</br>最小有效年龄为 \"1d\"。当前：{{current}}",
        },
        "line-author-color-newest": {
            name: "最新提交的颜色",
        },
        "line-author-color-oldest": {
            name: "最早（{{age}} 或更早）提交的颜色",
        },
        "line-author-text-color": {
            name: "文本颜色",
            desc: "侧栏文本的 CSS 颜色。<br/>强烈建议使用主题定义的 <a href=\"https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties\">CSS 变量</a>（例如 <pre style=\"display:inline\">var(--text-muted)</pre> 或 <pre style=\"display:inline\">var(--text-on-accent)</pre>，因为它们会自动适应主题更改。<br/>请参阅：<a href=\"https://github.com/obsidian-community/obsidian-theme-template/blob/main/obsidian.css\">Obsidian 中可用的 CSS 变量列表<a/>",
        },
        "line-author-ignore-whitespace": {
            name: "在更改中忽略空格和换行符",
            desc: "默认情况下（因此不忽略），空格和换行符被解释为文档和更改的一部分。这使得当添加新的后续行时，最后一行显示为'已更改'，即使先前最后一行的文本相同。<br>如果您不关心纯空格更改（例如列表嵌套/引用缩进更改），那么激活此功能将提供更有意义的更改检测。",
        },
        "color-preview": {
            desc: "支持 'rgb(r,g,b)'、'hsl(h,s,l)'、十六进制 (#) 和命名颜色（例如 'black'、'purple'）。颜色预览：{{preview}}",
        },
        "show-author-in-history-view": {
            name: "显示作者",
            desc: "在历史记录视图中显示提交的作者。",
            options: {
                hide: "隐藏",
                full: "完整",
                initials: "首字母",
            },
        },
        "show-date-in-history-view": {
            name: "显示日期",
            desc: "在历史记录视图中显示提交的日期。使用 {{date}} 占位符格式显示日期。",
        },
        "refresh-source-control": {
            name: "文件更改时自动刷新源代码管理视图",
            desc: "在较慢的机器上，这可能会导致延迟。如果是这样，只需禁用此选项。",
        },
        "refresh-source-control-timer": {
            name: "源代码管理视图刷新间隔",
            desc: "文件更改后刷新源代码管理视图之前等待的毫秒数。",
        },
        "diff-view-style": {
            name: "差异视图样式",
            desc: "设置差异视图的样式。请注意，\"拆分\"模式下的实际差异不是由 Git 生成的，而是由编辑器本身生成的，因此可能与 Git 生成的差异不同。这样做的一个优点是您可以在该视图中编辑文本。",
            options: {
                split: "拆分",
                git_unified: "统一",
            },
        },
        "disable-popups": {
            name: "禁用信息性通知",
            desc: "禁用 git 操作的信息性通知以最小化干扰（请参阅状态栏以获取更新）。",
        },
        "disable-error-notices": {
            name: "禁用错误通知",
            desc: "禁用任何类型的错误通知以最小化干扰（请参阅状态栏以获取更新）。",
        },
        "hide-no-changes-notices": {
            name: "隐藏无更改的通知",
            desc: "当没有要提交或推送的更改时，不显示通知。",
        },
        "show-status-bar": {
            name: "显示状态栏",
            desc: "必须重新启动 Obsidian 才能使更改生效。",
        },
        "file-menu-integration": {
            name: "文件菜单集成",
            desc: "将\"暂存\"、\"取消暂存\"和\"添加到 .gitignore\"操作添加到文件菜单。",
        },
        "show-branch-status-bar": {
            name: "显示分支状态栏",
            desc: "必须重新启动 Obsidian 才能使更改生效。",
        },
        "show-changed-files-count": {
            name: "在状态栏中显示已修改文件的计数",
        },
        username: {
            name: "git 服务器上的用户名。例如您在 GitHub 上的用户名",
        },
        password: {
            name: "密码/个人访问令牌",
            desc: "输入您的密码。您将无法再次看到它。",
        },
        "author-name": {
            name: "提交的作者姓名",
        },
        "author-email": {
            name: "提交的作者电子邮件",
        },
        "update-submodules": {
            name: "更新子模块",
            desc: "\"提交并同步\"和\"拉取\"会处理子模块。缺少的功能：冲突文件、已拉取/已推送/已提交文件的计数。需要为每个子模块设置跟踪分支。",
        },
        "submodule-recurse-checkout": {
            name: "子模块递归检出/切换",
            desc: "每当根仓库发生检出时，在子模块上递归检出（如果分支存在）。",
        },
        "custom-git-path": {
            name: "自定义 Git 二进制路径",
            desc: "指定 Git 二进制/可执行文件的路径。Git 应该已经在您的 PATH 中。仅对于自定义 Git 安装才有必要。",
        },
        "additional-env-vars": {
            name: "额外的环境变量",
            desc: "每行使用 KEY=VALUE 格式的新环境变量。",
        },
        "additional-path": {
            name: "额外的 PATH 环境变量路径",
            desc: "每行一个路径",
        },
        "reload-env-vars": {
            name: "使用新环境变量重新加载",
            desc: "删除先前添加的环境变量在重新启动 Obsidian 之前不会生效。",
            button: "重新加载",
        },
        "custom-base-path": {
            name: "自定义基本路径（Git 仓库路径）",
            desc: "设置从 vault 到应执行 Git 二进制文件的相对路径。主要用于设置 Git 仓库的路径，仅当 Git 仓库位于 vault 根目录下方时才需要。在 Windows 上使用 \"\\\\\" 而不是 \"/\"。",
        },
        "custom-git-dir": {
            name: "自定义 Git 目录路径（而不是 '.git'）",
            desc: "对应于 GIT_DIR 环境变量。需要重新启动 Obsidian 才能生效。在 Windows 上使用 \"\\\\\" 而不是 \"/\"。",
        },
        "disable-on-device": {
            name: "在此设备上禁用",
            desc: "在此设备上禁用插件。此设置不同步。",
        },
        "advanced-desc": "这些设置通常不需要更改，但可能对于特殊设置是必需的。",
        "restart-notice": "必须重新启动 Obsidian 才能使更改生效。",
        donate: {
            name: "捐赠",
            desc: "如果您喜欢这个插件，请考虑捐赠以支持持续开发。",
        },
        "copy-debug-info": {
            button: "复制调试信息",
        },
        "debugging-info": {
            text: "调试和日志记录：\n您可以随时通过打开控制台查看此插件和其他所有插件的日志",
        },
    },

    // 文件菜单
    "file-menu": {
        stage: "Git: 暂存",
        unstage: "Git: 取消暂存",
        "add-to-gitignore": "Git: 添加到 .gitignore",
        "open-in-default-app": "用默认应用打开",
        "show-in-explorer": "在系统资源管理器中显示",
    },

    // 视图
    views: {
        "source-control": {
            title: "源代码管理",
            "commit-message-placeholder": "提交消息",
            "commit-button": "提交",
            "commit-and-push-button": "提交并推送",
            "stage-all": "全部暂存",
            "unstage-all": "全部取消暂存",
            "changes-title": "更改",
            "staged-title": "已暂存",
            refresh: "刷新",
            "no-changes": "没有更改",
        },
        history: {
            title: "历史记录",
            "no-commits": "没有提交",
            "loading": "正在加载...",
        },
        diff: {
            title: "差异视图",
            "no-diff": "没有差异",
        },
    },

    // 状态栏
    statusBar: {
        "last-update": "最后更新：{{time}}",
        "checking-repo": "正在检查仓库...",
        "initializing": "正在初始化...",
        "up-to-date": "最新",
        "changes": "{{count}} 个更改",
        conflict: "冲突",
        "offline-mode": "离线模式",
    },

    // 冲突文件
    conflict: {
        title: "# 冲突",
        instructions: "请解决它们并使用命令 `Git: 提交所有更改` 后跟 `Git: 推送` 提交它们",
        "auto-delete": "（此文件将在提交前自动删除）",
        "available-below": "[[#其他说明]] 可在文件列表下方获得",
        "additional-instructions": "# 其他说明",
        "use-source-mode": "我强烈建议使用\"源代码模式\"查看冲突文件。对于简单的冲突，在上面列出的每个文件中，用所需的文本替换以下文本块的每个出现。",
        "conflict-block": "<<<<<<< HEAD\n    本地仓库中的文件更改\n=======\n    远程仓库中的文件更改\n>>>>>>> origin/main",
    },

    // 其他
    misc: {
        file: "文件",
        files: "文件",
        roughly: " 大约",
    },
};
