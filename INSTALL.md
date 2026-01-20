# 📦 Obsidian Git 中文版 - 安装指南

## 🚀 方法一：自动安装（推荐）⭐

### Windows 用户

1. **修改安装脚本**

打开 `安装到Obsidian.bat`，修改第 8 行的路径：

```batch
set "VAULT_PATH=C:\Users\你的用户名\Documents\我的笔记库"
```

改为你的实际 Obsidian vault 路径，例如：
```batch
set "VAULT_PATH=D:\Obsidian\MyVault"
```

2. **运行脚本**

双击运行 `安装到Obsidian.bat`

3. **启用插件**

- 打开 Obsidian
- 进入 设置 → 社区插件
- 找到 "Git 中文版" 并启用
- 在插件设置中选择 "简体中文"
- 重启 Obsidian

---

## 📂 方法二：手动安装

### 步骤 1: 找到插件目录

你的 Obsidian vault 插件目录路径：

**Windows**:
```
C:\Users\你的用户名\你的笔记库\.obsidian\plugins\
```

**macOS**:
```
/Users/你的用户名/你的笔记库/.obsidian/plugins/
```

**Linux**:
```
/home/你的用户名/你的笔记库/.obsidian/plugins/
```

### 步骤 2: 创建插件文件夹

在 `plugins` 目录下创建文件夹：
```
obsidian-git-zh
```

完整路径示例：
```
你的笔记库/.obsidian/plugins/obsidian-git-zh/
```

### 步骤 3: 复制文件

将以下 3 个文件复制到插件文件夹：

```
✅ main.js          (必需)
✅ manifest.json    (必需)
✅ styles.css       (必需)
```

**从哪里复制**：
- 如果已构建：从项目根目录复制
- 如果从 GitHub 下载：从 Release 页面下载

**目标位置**：
```
你的笔记库/
└── .obsidian/
    └── plugins/
        └── obsidian-git-zh/
            ├── main.js
            ├── manifest.json
            └── styles.css
```

### 步骤 4: 启用插件

1. 打开 Obsidian
2. 进入 **设置** (⚙️)
3. 选择 **社区插件**
4. 如果是第一次使用，关闭 **安全模式**
5. 点击 **刷新** 或重启 Obsidian
6. 在已安装插件列表中找到 **Git 中文版**
7. 点击切换按钮**启用**插件

### 步骤 5: 配置语言

1. 在社区插件列表中，点击 "Git 中文版" 右侧的⚙️图标
2. 在设置页面顶部找到 **语言 / Language**
3. 选择 **简体中文**
4. **建议重启 Obsidian** 以完全应用更改

---

## 🌐 方法三：从 GitHub 安装

### 下载 Release 版本

1. 访问 [Releases 页面](https://github.com/lyl224459/obsidian-git-zh/releases)
2. 下载最新版本的文件：
   - `main.js`
   - `manifest.json`
   - `styles.css`
3. 按照"方法二"的步骤 2-5 操作

### 克隆仓库自己构建

```bash
# 1. 克隆仓库
git clone https://github.com/lyl224459/obsidian-git-zh.git
cd obsidian-git-zh

# 2. 安装依赖
pnpm install

# 3. 构建
pnpm run build

# 4. 复制文件到 Obsidian 插件目录
# (按照方法二的步骤操作)
```

---

## 📍 如何找到你的 Vault 路径

### 在 Obsidian 中查看

1. 打开 Obsidian
2. 打开 **设置** → **关于**
3. 查看 **当前 vault** 路径
4. 在该路径下找到 `.obsidian/plugins/` 目录

### 如果 .obsidian 文件夹不可见

**Windows**:
- 在文件资源管理器中，点击 **查看** → 勾选 **隐藏的项目**

**macOS**:
- 在 Finder 中按 `Cmd + Shift + .` 显示隐藏文件

**Linux**:
- 在文件管理器中按 `Ctrl + H` 显示隐藏文件

---

## ✅ 验证安装

### 检查文件是否正确

确认以下文件存在：
```
你的笔记库/.obsidian/plugins/obsidian-git-zh/
├── main.js        (约 742 KB)
├── manifest.json  (约 0.5 KB)
└── styles.css     (约 10 KB)
```

### 测试功能

1. **打开命令面板** (`Ctrl/Cmd + P`)
2. 输入 `Git`，应该看到中文命令：
   ```
   Git: 提交
   Git: 拉取
   Git: 推送
   Git: 打开源代码管理视图
   ```

3. **检查设置**
   - 设置 → Obsidian Git
   - 顶部应该有 "语言 / Language" 选项
   - 选择 "简体中文"

4. **查看界面**
   - 命令应显示中文
   - 设置项应显示中文
   - 通知消息应显示中文

---

## 🔧 故障排除

### 问题1: 插件列表中看不到插件

**解决方案**:
1. 确认文件路径正确
2. 确认 3 个文件都已复制
3. 重启 Obsidian
4. 在设置中点击"重新加载插件"

### 问题2: 插件无法启用

**可能原因**:
- main.js 文件损坏或不完整
- manifest.json 格式错误

**解决方案**:
```bash
# 重新构建
cd f:\AAA_my_Object\obsidian-git
pnpm run build:clean

# 检查文件大小
ls -lh main.js manifest.json styles.css
```

### 问题3: 界面仍显示英文

**解决方案**:
1. 打开插件设置
2. 找到顶部的 "语言 / Language" 选项
3. 选择 "简体中文"
4. **重启 Obsidian**（重要！）

### 问题4: 插件报错

**检查**:
1. 确认 Obsidian 版本 >= 1.4.0
2. 查看控制台错误 (`Ctrl/Cmd + Shift + I`)
3. 确认 Git 已安装并在 PATH 中

---

## 🎯 完整安装示例

### Windows 完整流程

```powershell
# 1. 找到你的 vault 路径
$vaultPath = "D:\Obsidian\MyVault"

# 2. 创建插件目录
$pluginPath = "$vaultPath\.obsidian\plugins\obsidian-git-zh"
New-Item -ItemType Directory -Force -Path $pluginPath

# 3. 复制文件
Copy-Item "f:\AAA_my_Object\obsidian-git\main.js" $pluginPath
Copy-Item "f:\AAA_my_Object\obsidian-git\manifest.json" $pluginPath
Copy-Item "f:\AAA_my_Object\obsidian-git\styles.css" $pluginPath

# 4. 验证
Get-ChildItem $pluginPath
```

### macOS/Linux 完整流程

```bash
# 1. 设置路径变量
VAULT_PATH="$HOME/Documents/MyVault"
PLUGIN_PATH="$VAULT_PATH/.obsidian/plugins/obsidian-git-zh"

# 2. 创建目录
mkdir -p "$PLUGIN_PATH"

# 3. 复制文件
cp /path/to/obsidian-git/main.js "$PLUGIN_PATH/"
cp /path/to/obsidian-git/manifest.json "$PLUGIN_PATH/"
cp /path/to/obsidian-git/styles.css "$PLUGIN_PATH/"

# 4. 验证
ls -lh "$PLUGIN_PATH"
```

---

## 📱 移动端安装

### Android

1. 使用文件管理器（如 Solid Explorer）
2. 导航到你的 vault 目录
3. 进入 `.obsidian/plugins/`
4. 创建 `obsidian-git-zh` 文件夹
5. 复制 3 个文件到该文件夹
6. 重启 Obsidian

### iOS

1. 使用 Files 应用
2. 找到 Obsidian vault（iCloud 或本地）
3. 显示隐藏文件
4. 进入 `.obsidian/plugins/`
5. 创建 `obsidian-git-zh` 文件夹
6. 复制 3 个文件
7. 重启 Obsidian

⚠️ **注意**: 移动端 Git 功能非常不稳定，建议仅在桌面端使用。

---

## 🎨 首次使用配置

### 基础配置

1. **设置语言**
   - 设置 → Obsidian Git → 语言 / Language → 简体中文

2. **配置 Git**（如果还没有）
   - 确保你的 vault 已初始化为 Git 仓库
   - 命令：`Git: 初始化仓库`

3. **设置远程仓库**（可选）
   - 命令：`Git: 编辑远程仓库`
   - 或命令：`Git: 克隆仓库`

4. **配置自动备份**（可选）
   - 设置 → Obsidian Git → 自动
   - 设置自动提交间隔（如：30 分钟）
   - 设置自动推送间隔（如：60 分钟）

### 推荐设置

```
✅ 启动时拉取: 开启
✅ 显示状态栏: 开启
✅ 显示分支状态栏: 开启
✅ 自动提交间隔: 30 分钟
✅ 自动推送间隔: 60 分钟
```

---

## 📚 快速使用指南

### 常用命令

打开命令面板 (`Ctrl/Cmd + P`)，输入：

```
Git: 提交并推送          # 一键提交并同步
Git: 拉取                # 从远程拉取更新
Git: 打开源代码管理视图  # 查看更改
Git: 切换分支            # 切换 Git 分支
```

### 推荐工作流

1. **启动** - Obsidian 自动拉取最新更改
2. **编辑** - 正常编辑笔记
3. **同步** - 每 30 分钟自动提交
4. **推送** - 每 60 分钟自动推送到远程

---

## 🔗 更多资源

- [使用指南](CHINESE_VERSION.md) - 详细的功能说明
- [汉化说明](LOCALIZATION_CN.md) - 技术实现细节
- [构建文档](BUILD.md) - 如何自己构建
- [原版文档](docs/Start%20here.md) - 完整功能文档

---

## 💡 提示

### 开发者测试

如果你是开发者想要测试：

```bash
# 1. 开启开发模式
cd f:\AAA_my_Object\obsidian-git
pnpm run dev

# 2. 创建软链接（而不是复制）
# Windows (需要管理员权限)
mklink /D "你的vault\.obsidian\plugins\obsidian-git-zh" "f:\AAA_my_Object\obsidian-git"

# macOS/Linux
ln -s /path/to/obsidian-git ~/.obsidian/plugins/obsidian-git-zh

# 3. 在 Obsidian 中重新加载插件即可看到实时更新
```

### 多 Vault 安装

如果你有多个笔记库：

1. 运行安装脚本多次，每次修改 `VAULT_PATH`
2. 或者手动复制到每个 vault 的插件目录

---

## ✅ 安装完成检查清单

安装完成后确认：

- [ ] 文件已复制到正确位置
- [ ] Obsidian 能看到插件
- [ ] 插件已启用
- [ ] 语言设置为简体中文
- [ ] 命令面板显示中文命令
- [ ] 设置页面显示中文
- [ ] 通知消息显示中文
- [ ] 已重启 Obsidian

---

**准备好了吗？运行 `安装到Obsidian.bat` 开始安装！** 🚀
