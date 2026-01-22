// English translations
export default {
    // Commands
    commands: {
        "edit-gitignore": "Edit .gitignore",
        "open-git-view": "Open source control view",
        "open-commit-sidebar": "Open commit sidebar",
        "open-history-view": "Open history view",
        "open-diff-view": "Open diff view",
        "stage-current-file": "Stage current file",
        "unstage-current-file": "Unstage current file",
        "commit": "Commit",
        "commit-push": "Commit and push",
        "commit-and-sync": "Commit and sync",
        "commit-amend": "Commit amend",
        "push": "Push",
        "pull": "Pull",
        "switch-branch": "Switch branch",
        "switch-remote-branch": "Switch to remote branch",
        "create-branch": "Create new branch",
        "delete-branch": "Delete branch",
        "discard-all": "Discard all changes",
        "initialize-repo": "Initialize repository",
        "clone-repo": "Clone repository",
        "list-changed-files": "List changed files",
        "edit-remotes": "Edit remotes",
        "remove-remote": "Remove remote",
        "set-upstream-branch": "Set upstream branch",
        "pause-autosync": "Pause automatic sync",
        "resume-autosync": "Resume automatic sync",
        "toggle-line-author": "Toggle line author information",
        "stage-hunk": "Stage hunk",
        "unstage-hunk": "Unstage hunk",
        "reset-hunk": "Reset hunk",
        "preview-hunk": "Preview hunk",
        "go-to-next-hunk": "Go to next hunk",
        "go-to-prev-hunk": "Go to previous hunk",
        "open-file-on-github": "Open file on GitHub",
        "open-file-history-on-github": "Open file history on GitHub",
    },

    // Notice messages
    notices: {
        "git-not-ready": "Git is not ready. Please wait for initialization or check settings.",
        "no-changes-to-commit": "No changes to commit",
        "no-commits-to-push": "No commits to push",
        "pull-everything-up-to-date": "Pull: Everything is up-to-date",
        "pushed-files": "Pushed {{count}} {{file}} to remote",
        "pulled-files": "Pulled {{count}} {{file}} from remote",
        "committed-files": "Committed{{roughly}} {{count}} {{file}}",
        "initialized-repo": "Initialized new repo",
        "cloned-repo": "Cloning new repo into \"{{dir}}\"",
        "cloned-repo-success": "Cloned new repo.",
        "restart-obsidian": "Please restart Obsidian",
        "switched-branch": "Switched to {{branch}}",
        "created-branch": "Created new branch {{branch}}",
        "deleted-branch": "Deleted branch {{branch}}",
        "branch-not-merged": "This branch isn't merged into HEAD. Force delete?",
        "set-upstream": "Set upstream branch to {{branch}}",
        "fetched-remote": "Fetched from remote",
        "conflicts-detected": "You have conflicts in {{count}} {{file}}",
        "cannot-push-conflicts": "Cannot push. You have conflicts in {{count}} {{file}}",
        "aborted": "Aborted",
        "auto-backup-paused": "Automatic routines are currently paused.",
        "auto-backup-resumed": "Automatic routines resumed",
        "automaticsCurrentlyPaused": "Automatic routines are currently paused.",
        "auto-backup-message": "Auto backup: Please enter a custom commit message. Leave empty to abort",
        "cannot-run-git": "Cannot run git command. Trying to run: '{{gitPath}}'.",
        "no-valid-repo": "Can't find a valid git repository. Please create one via the given command or clone an existing repo.",
        "going-offline": "Git: Going into offline mode. Future network errors will no longer be displayed.",
        "already-offline": "Encountered network error, but already in offline mode",
        "file-too-big": "File {{file}} is too big ({{size}} MB). Please use Git LFS.",
        "copy-debug-info": "Debug information copied to clipboard. May contain sensitive information!",
        "no-upstream-branch": "No upstream branch is set. Please select one.",
        "aborted-no-upstream": "Aborted. No upstream-branch is set!",
        "no-repository-found": "No repository found",
        "deleted-repository": "Successfully deleted repository. Reloading plugin...",
        "discarded-tracked-files": "Discarded all changes in tracked files.",
        "discarded-all-files": "Discarded all files.",
        "paused-automatic": "Paused automatic routines.",
        "resumed-automatic": "Resumed automatic routines.",
        "aborted-clone": "Aborted clone",
        "invalid-depth": "Invalid depth. Aborting clone.",
        "cloning-repo": "Cloning new repo into \"{{dir}}\"",
        "not-using-github": "It seems like you are not using GitHub",
        "auth-failed": "Authentication failed. Please try with different credentials",
        "status-taking-long": "This takes longer: Getting status",
        "initializing-clone": "Initializing clone",
        "initializing-pull": "Initializing pull",
        "initializing-push": "Initializing push",
        "initializing-fetch": "Initializing fetch",
        "base-path-not-exist": "ObsidianGit: Base path does not exist",
        "running-command": "Running '{{command}}'...",
    },

    // Modals
    modals: {
        commit: {
            title: "Commit message",
            placeholder: "Commit message",
        },
        branch: {
            title: "Select branch",
            placeholder: "Select or create branch",
        },
        remote: {
            title: "Remote URL",
            placeholder: "Enter remote URL",
        },
        "remote-branch": {
            title: "Select remote branch",
            placeholder: "Select or create a new remote branch by typing its name and selecting it",
        },
        auth: {
            "username-placeholder": "Specify your username",
            "password-placeholder": "Specify your password/personal access token",
            "response-placeholder": "Enter a response to the message.",
            "response-long": "Enter a response to the message.",
        },
        clone: {
            "url-placeholder": "Enter remote URL",
            "dir-placeholder": "Enter directory for clone. It needs to be empty or not existent.",
            "depth-placeholder": "Specify depth of clone. Leave empty for full clone.",
            "vault-root": "Vault Root",
            "contains-conflict-dir": "Does your remote repo contain a {{configDir}} directory at the root?",
            "delete-config-warning": "To avoid conflicts, the local {{configDir}} directory needs to be deleted.",
            "delete-config-confirm": "DELETE ALL YOUR LOCAL CONFIG AND PLUGINS",
            "abort-clone": "Abort clone",
            "invalid-depth": "Invalid depth. Aborting clone.",
        },
        discard: {
            title: "Discard changes",
            "content-discard": "Discard",
            "content-delete": "Delete",
            "description-discard": "Discard changes of {{count}} changed {{file}}?",
            "description-delete": "Delete {{count}} untracked {{file}}?",
            "description-both": "Discard changes of {{discardCount}} changed {{file}} and delete {{deleteCount}} untracked {{file}}?",
            cancel: "Cancel",
        },
        ignore: {
            title: "Edit .gitignore",
        },
        "changed-files": {
            title: "Changed files",
            "no-changes": "No changes",
        },
    },

    // Settings
    settings: {
        language: {
            name: "Language / 语言",
            desc: "Select the plugin interface language. Restart Obsidian for changes to take full effect.",
            auto: "Auto (Follow system)",
            "restart-notice": "Language settings changed. It's recommended to restart Obsidian for changes to take full effect.",
        },
        heading: {
            automatic: "Automatic",
            "commit-message": "Commit message",
            pull: "Pull",
            "commit-and-sync": "Commit-and-sync",
            "hunk-management": "Hunk management",
            "line-author": "Line author information",
            "history-view": "History view",
            "source-control-view": "Source control view",
            miscellaneous: "Miscellaneous",
            "commit-author": "Commit author",
            authentication: "Authentication/commit author",
            advanced: "Advanced",
            support: "Support",
            "basic-settings": "🌐 Basic Settings",
            "git-status": "⚠️ Git Status",
            "automation-settings": "🔄 Automation Settings",
            "commit-settings": "💾 Commit Settings",
            "view-settings": "👁️ View Settings",
            "debug-info": "🐛 Debug Info",
            "quick-start-guide": "🚀 Quick Start Guide",
            "usage-tips": "💡 Usage Tips",
        },
        "git-not-ready": {
            text: "Git is not ready. When all settings are correct you can configure commit-sync, etc.",
        },
        "split-timers": {
            name: "Split timers for automatic commit and sync",
            desc: "Enable to use one interval for commit and another for sync.",
        },
        "auto-save-interval": {
            name: "Auto {{commitOrSync}} interval (minutes)",
            desc: "{{action}} changes every X minutes. Set to 0 (default) to disable. (See below setting for further configuration!)",
            "action-commit": "Commit",
            "action-commit-and-sync": "Commit and sync",
        },
        "auto-backup-after-file-change": {
            name: "Auto {{commitOrSync}} after stopping file edits",
            desc: "Requires the {{commitOrSync}} interval not to be 0. If turned on, do auto {{commitOrSync}} every {{minutes}} after stopping file edits. This also prevents auto {{commitOrSync}} while editing a file. If turned off, it's independent from the last file edit.",
        },
        "auto-backup-after-latest-commit": {
            name: "Auto {{commitOrSync}} after latest commit",
            desc: "If turned on, sets last auto {{commitOrSync}} timestamp to the latest commit timestamp. This reduces the frequency of auto {{commitOrSync}} when doing manual commits.",
        },
        "auto-push-interval": {
            name: "Auto push interval (minutes)",
            desc: "Push commits every X minutes. Set to 0 (default) to disable.",
        },
        "auto-pull-interval": {
            name: "Auto pull interval (minutes)",
            desc: "Pull changes every X minutes. Set to 0 (default) to disable.",
        },
        "auto-commit-staged": {
            name: "Auto {{commitOrSync}} only staged files",
            desc: "If turned on, only staged files are committed on {{commitOrSync}}. If turned off, all changed files are committed.",
        },
        "custom-message-on-auto-backup": {
            name: "Specify custom commit message on auto {{commitOrSync}}",
            desc: "You will get a pop up to specify your message.",
        },
        "auto-commit-message": {
            name: "Commit message on auto {{commitOrSync}}",
            desc: "Available placeholders: {{date}} (see below), {{hostname}} (see below), {{numFiles}} (number of changed files in the commit) and {{files}} (changed files in commit message).",
        },
        "commit-message": {
            name: "Commit message on manual commit",
            desc: "Available placeholders: {{date}} (see below), {{hostname}} (see below), {{numFiles}} (number of changed files in the commit) and {{files}} (changed files in commit message).",
        },
        "commit-message-script": {
            name: "Commit message script",
            desc: "A script that is run using 'sh -c' to generate the commit message. May be used to generate commit messages using AI tools. Available placeholders: {{hostname}}, {{date}}.",
        },
        "date-placeholder": {
            name: "{{date}} placeholder format",
            desc: "Specify custom date format. E.g. \"{{format}}\". See <a href=\"https://momentjs.com\">Moment.js</a> for more formats.",
        },
        "hostname-placeholder": {
            name: "{{hostname}} placeholder replacement",
            desc: "Specify custom hostname for every device.",
        },
        "preview-commit-message": {
            name: "Preview commit message",
            button: "Preview",
        },
        "list-filenames-in-message-body": {
            name: "List filenames affected by commit in the commit body",
        },
        "merge-strategy": {
            name: "Merge strategy",
            desc: "Decide how to integrate commits from your remote branch into your local branch.",
            options: {
                merge: "Merge",
                rebase: "Rebase",
                reset: "Other sync service (Only updates the HEAD without touching the working directory)",
            },
        },
        "merge-strategy-on-conflicts": {
            name: "Merge strategy on conflicts",
            desc: "Decide how to solve conflicts when pulling remote changes. This can be used to favor your local changes or the remote changes automatically.",
            options: {
                none: "None (git default)",
                ours: "Our changes",
                theirs: "Their changes",
            },
        },
        "pull-on-startup": {
            name: "Pull on startup",
            desc: "Automatically pull commits when Obsidian starts.",
        },
        "auto-pull-on-boot": {
            name: "Auto pull on boot",
            desc: "Automatically pull commits when Obsidian starts.",
        },
        "push-on-commit-and-sync": {
            name: "Push on commit-and-sync",
            desc: "Most of the time you want to push after committing. Turning this off turns a commit-and-sync action into commit {{pullText}} only. It will still be called commit-and-sync.",
        },
        "pull-on-commit-and-sync": {
            name: "Pull on commit-and-sync",
            desc: "On commit-and-sync, pull commits as well. Turning this off turns a commit-and-sync action into commit {{pushText}} only.",
        },
        "and-pull": "and pull",
        "and-push": "and push",
        "hunk-management-desc": "Hunks are sections of grouped line changes right in your editor.",
        signs: {
            name: "Signs",
            desc: "This allows you to see your changes right in your editor via colored markers and stage/reset/preview individual hunks.",
        },
        "hunk-commands": {
            name: "Hunk commands",
            desc: "Adds commands to stage/reset individual Git diff hunks and navigate between them via 'Go to next/prev hunk' commands.",
        },
        "status-bar-changes": {
            name: "Status bar with summary of line changes",
        },
        "line-author-show": {
            name: "Show commit authoring information next to each line",
            desc: "<a href=\"{{link}}\">Feature guide and quick examples</a></br>The commit hash, author name and authoring date can all be individually toggled.</br>Hide everything, to only show the age-colored sidebar.",
            "only-available-desktop": "Only available on desktop currently.",
        },
        "line-author-follow-movement": {
            name: "Follow movement and copies across files and commits",
            desc: "By default (deactivated), each line only shows the newest commit where it was changed.<br/>With <i>same commit</i>, cut-copy-paste-ing of text is followed within the same commit and the original commit of authoring will be shown.<br/>With <i>all commits</i>, cut-copy-paste-ing text inbetween multiple commits will be detected.<br/>It uses <a href=\"https://git-scm.com/docs/git-blame\">git-blame</a> and for matches (at least {{length}} characters) within the same (or all) commit(s), <em>the originating</em> commit's information is shown.",
            options: {
                inactive: "Do not follow (default)",
                "same-commit": "Follow within same commit",
                "all-commits": "Follow within all commits (maybe slow)",
            },
        },
        "line-author-show-commit-hash": {
            name: "Show commit hash",
        },
        "line-author-author-display": {
            name: "Author name display",
            desc: "If and how the author is displayed",
            options: {
                hide: "Hide",
                initials: "Initials (default)",
                "first name": "First name",
                "last name": "Last name",
                full: "Full name",
            },
        },
        "line-author-date-display": {
            name: "Authoring date display",
            desc: "If and how the date and time of authoring the line is displayed",
            options: {
                hide: "Hide",
                date: "Date (default)",
                datetime: "Date and time",
                "natural language": "Natural language",
                custom: "Custom",
            },
        },
        "line-author-date-custom-format": {
            name: "Custom authoring date format",
            desc: "<a href=\"{{link}}\">Format string</a> to display the authoring date.</br>Currently: {{current}}",
        },
        "line-author-date-timezone": {
            name: "Authoring date display timezone",
            desc: "The time-zone in which the authoring date should be shown. Either your local time-zone (default), the author's time-zone during commit creation or <a href=\"https://en.wikipedia.org/wiki/UTC%C2%B100:00\">UTC±00:00</a>.",
            options: {
                "viewer-local": "My local (default)",
                "author-local": "Author's local",
                utc0000: "UTC+0000/Z",
            },
        },
        "line-author-oldest-age": {
            name: "Oldest age in coloring",
            desc: "The oldest age in the line author coloring. Everything older will have the same color.</br>Smallest valid age is \"1d\". Currently: {{current}}",
        },
        "line-author-color-newest": {
            name: "Color for newest commits",
        },
        "line-author-color-oldest": {
            name: "Color for oldest ({{age}} or older) commits",
        },
        "line-author-text-color": {
            name: "Text color",
            desc: "The CSS color of the gutter text.<br/>It is highly recommended to use <a href=\"https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties\">CSS variables</a> defined by themes (e.g. <pre style=\"display:inline\">var(--text-muted)</pre> or <pre style=\"display:inline\">var(--text-on-accent)</pre>, because they automatically adapt to theme changes.<br/>See: <a href=\"https://github.com/obsidian-community/obsidian-theme-template/blob/main/obsidian.css\">List of available CSS variables in Obsidian<a/>",
        },
        "line-author-ignore-whitespace": {
            name: "Ignore whitespace and newlines in changes",
            desc: "Whitespace and newlines are interpreted as part of the document and in changes by default (hence not ignored). This makes the last line being shown as 'changed' when a new subsequent line is added, even if the previously last line's text is the same.<br>If you don't care about purely-whitespace changes (e.g. list nesting / quote indentation changes), then activating this will provide more meaningful change detection.",
        },
        "color-preview": {
            desc: "Supports 'rgb(r,g,b)', 'hsl(h,s,l)', hex (#) and named colors (e.g. 'black', 'purple'). Color preview: {{preview}}",
        },
        "show-author-in-history-view": {
            name: "Show Author",
            desc: "Show the author of the commit in the history view.",
            options: {
                hide: "Hide",
                full: "Full",
                initials: "Initials",
            },
        },
        "show-date-in-history-view": {
            name: "Show Date",
            desc: "Show the date of the commit in the history view. The {{date}} placeholder format is used to display the date.",
        },
        "history-view": {
            name: "History view",
        },
        "date-in-history-view": {
            name: "Show Date in History View",
            desc: "Show the date of the commit in the history view. The {{date}} placeholder format is used to display the date.",
        },
        "commit-date-format": {
            name: "Commit Date Format",
            desc: "Format string for displaying commit dates. E.g. \"YYYY-MM-DD HH:mm:ss\". See <a href=\"https://momentjs.com/docs/#/parsing/string-format/\">Moment.js</a> for more formats.",
        },
        "source-control-view": {
            name: "Source control view",
        },
        "tree-structure": {
            name: "Tree Structure",
            desc: "Use tree structure to display files in the source control view instead of a flat list.",
        },
        "refresh-source-control": {
            name: "Automatically refresh source control view on file changes",
            desc: "On slower machines this may cause lags. If so, just disable this option.",
        },
        "refresh-source-control-timer": {
            name: "Source control view refresh interval",
            desc: "Milliseconds to wait after file change before refreshing the Source Control View.",
        },
        "diff-view-style": {
            name: "Diff view style",
            desc: "Set the style for the diff view. Note that the actual diff in \"Split\" mode is not generated by Git, but the editor itself instead so it may differ from the diff generated by Git. One advantage of this is that you can edit the text in that view.",
            options: {
                split: "Split",
                git_unified: "Unified",
            },
        },
        "diff-style": {
            name: "Diff style",
            desc: "Set the style for the diff view.",
            unified: "Unified",
            split: "Split",
        },
        "commit-and-sync-desc": "Configure detailed settings for commit-and-sync operations.",
        "disable-popups": {
            name: "Disable informative notifications",
            desc: "Disable informative notifications for git operations to minimize distraction (refer to status bar for updates).",
        },
        "disable-error-notices": {
            name: "Disable error notifications",
            desc: "Disable error notifications of any kind to minimize distraction (refer to status bar for updates).",
        },
        "hide-no-changes-notices": {
            name: "Hide notifications for no changes",
            desc: "Don't show notifications when there are no changes to commit or push.",
        },
        "show-status-bar": {
            name: "Show status bar",
            desc: "Obsidian must be restarted for the changes to take affect.",
        },
        "file-menu-integration": {
            name: "File menu integration",
            desc: "Add \"Stage\", \"Unstage\" and \"Add to .gitignore\" actions to the file menu.",
        },
        "show-branch-status-bar": {
            name: "Show branch status bar",
            desc: "Obsidian must be restarted for the changes to take affect.",
        },
        "show-changed-files-count": {
            name: "Show the count of modified files in the status bar",
        },
        username: {
            name: "Username on your git server. E.g. your username on GitHub",
        },
        password: {
            name: "Password/Personal access token",
            desc: "Type in your password. You won't be able to see it again.",
        },
        "author-name": {
            name: "Author name for commit",
        },
        "author-email": {
            name: "Author email for commit",
        },
        "update-submodules": {
            name: "Update submodules",
            desc: "\"Commit-and-sync\" and \"pull\" takes care of submodules. Missing features: Conflicted files, count of pulled/pushed/committed files. Tracking branch needs to be set for each submodule.",
        },
        "submodule-recurse-checkout": {
            name: "Submodule recurse checkout/switch",
            desc: "Whenever a checkout happens on the root repository, recurse the checkout on the submodules (if the branches exist).",
        },
        "custom-git-path": {
            name: "Custom Git binary path",
            desc: "Specify the path to the Git binary/executable. Git should already be in your PATH. Should only be necessary for a custom Git installation.",
        },
        "additional-env-vars": {
            name: "Additional environment variables",
            desc: "Use each line for a new environment variable in the format KEY=VALUE.",
        },
        "additional-path": {
            name: "Additional PATH environment variable paths",
            desc: "Use each line for one path",
        },
        "reload-env-vars": {
            name: "Reload with new environment variables",
            desc: "Removing previously added environment variables will not take effect until Obsidian is restarted.",
            button: "Reload",
        },
        "custom-base-path": {
            name: "Custom base path (Git repository path)",
            desc: "Sets the relative path to the vault from which the Git binary should be executed. Mostly used to set the path to the Git repository, which is only required if the Git repository is below the vault root directory. Use \"\\\\\" instead of \"/\" on Windows.",
        },
        "custom-git-dir": {
            name: "Custom Git directory path (Instead of '.git')",
            desc: "Corresponds to the GIT_DIR environment variable. Requires restart of Obsidian to take effect. Use \"\\\\\" instead of \"/\" on Windows.",
        },
        "disable-on-device": {
            name: "Disable on this device",
            desc: "Disables the plugin on this device. This setting is not synced.",
        },
        "advanced-desc": "These settings usually don't need to be changed, but may be required for special setups.",
        "restart-notice": "Obsidian must be restarted for the changes to take affect.",
        donate: {
            name: "Donate",
            desc: "If you like this Plugin, consider donating to support continued development.",
        },
        "copy-debug-info": {
            button: "Copy Debug Information",
        },
        "debugging-info": {
            text: "Debugging and logging:\nYou can always see the logs of this and every other plugin by opening the console with",
        },
        "quick-actions": {
            "open-source-control": {
                title: "Open Source Control",
                desc: "View file changes and commits",
            },
            "open-history": {
                title: "Open History",
                desc: "Browse commit history",
            },
            "open-diff": {
                title: "Open Diff View",
                desc: "View file differences",
            },
            "commit-now": {
                title: "Commit Now",
                desc: "Commit current changes",
            },
        },
        "usage-tips": {
            mobile: "📱 On mobile, use batch commits to avoid committing too many files at once",
            auto: "⚡ Auto-sync runs in the background, no manual operation needed",
            history: "🔄 Regularly check history to understand code changes",
            debug: "🛠️ If you encounter issues, use the debug info button for details",
        },
        "action-failed": "Action failed, please check Git status",
        "device-indicator": {
            desktop: {
                icon: "💻",
                text: "Desktop Device",
                desc: "Full feature support",
            },
            tablet: {
                icon: "📱",
                text: "Tablet Device",
                desc: "Optimized multitasking",
            },
            mobile: {
                icon: "📱",
                text: "Mobile Device",
                desc: "Streamlined interface",
            },
        },
    },

    // File menu
    "file-menu": {
        stage: "Git: Stage",
        unstage: "Git: Unstage",
        "add-to-gitignore": "Git: Add to .gitignore",
        "open-in-default-app": "Open in default app",
        "show-in-explorer": "Show in system explorer",
    },

    // Views
    views: {
        "source-control": {
            title: "Source Control",
            "commit-message-placeholder": "Commit message",
            "commit-button": "Commit",
            "commit-and-push-button": "Commit and push",
            "stage-all": "Stage all",
            "unstage-all": "Unstage all",
            "changes-title": "Changes",
            "staged-title": "Staged",
            refresh: "Refresh",
            "no-changes": "No changes",
        },
        history: {
            title: "History",
            "no-commits": "No commits",
            "loading": "Loading...",
        },
        diff: {
            title: "Diff View",
            "no-diff": "No diff",
        },
        commit: {
            title: "Git Commit",
            placeholder: "Enter commit message...",
            staged: "Staged",
            unstaged: "Unstaged",
            "unstage-all": "Unstage all",
            "stage-all": "Stage all",
        },
    },

    // Status bar
    statusBar: {
        "last-update": "Last update: {{time}}",
        "checking-repo": "Checking repository...",
        "initializing": "Initializing...",
        "up-to-date": "Up to date",
        "changes": "{{count}} changes",
        conflict: "Conflict",
        "offline-mode": "Offline mode",
    },

    // Conflict file
    conflict: {
        title: "# Conflicts",
        instructions: "Please resolve them and commit them using the commands `Git: Commit all changes` followed by `Git: Push`",
        "auto-delete": "(This file will automatically be deleted before commit)",
        "available-below": "[[#Additional Instructions]] available below file list",
        "additional-instructions": "# Additional Instructions",
        "use-source-mode": "I strongly recommend to use \"Source mode\" for viewing the conflicted files. For simple conflicts, in each file listed above replace every occurrence of the following text blocks with the desired text.",
        "conflict-block": "<<<<<<< HEAD\n    File changes in local repository\n=======\n    File changes in remote repository\n>>>>>>> origin/main",
    },

    // Miscellaneous
    misc: {
        file: "file",
        files: "files",
        roughly: " approx.",
        refresh: "Refresh",
        "toggle-tree-list-view": "Toggle tree/list view",
        clear: "Clear",
        "commit-and-sync": "Commit & Sync",
        "commit-template": "Commit template",
        "use-commit-template": "Use commit template",
        "amend-commit": "Amend last commit",
        "unpushed-commits": "Unpushed commits",
    },
};
