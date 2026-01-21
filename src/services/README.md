# Services Layer

## 📚 概述

服务层为插件提供了清晰的职责分离和更好的代码组织。每个服务负责特定的功能领域。

## 🏗️ 架构

```
services/
├── types.ts                  # 服务层类型定义
├── BaseService.ts            # 基础服务类
├── GitOperationsService.ts   # Git 操作（commit, push, pull）
├── BranchService.ts          # 分支管理
├── FileService.ts            # 文件操作
└── index.ts                  # 导出入口
```

## 🎯 设计原则

### 1. 单一职责原则 (SRP)
每个服务只负责一个功能领域：
- `GitOperationsService` - Git 操作
- `BranchService` - 分支管理
- `FileService` - 文件操作

### 2. 类型安全
所有服务方法都使用强类型：
```typescript
// ✅ 好的 - 使用 Result 类型
async commit(options: CommitOptions): Promise<Result<GitOperationResult>>

// ❌ 坏的 - 返回类型不明确
async commit(options: any): Promise<any>
```

### 3. 错误处理
使用 `Result<T, E>` 模式处理成功和失败：
```typescript
const result = await gitService.commit(options);
if (result.success) {
    console.log(result.value);
} else {
    console.error(result.error);
}
```

## 📖 使用示例

### GitOperationsService

```typescript
const gitService = new GitOperationsService(plugin);

// Commit
const commitResult = await gitService.commit({
    message: "feat: add new feature",
    onlyStaged: false,
    amend: false,
});

if (commitResult.success) {
    console.log(`Committed ${commitResult.value.filesChanged} files`);
}

// Push
const pushResult = await gitService.push();

// Pull
const pullResult = await gitService.pull();
```

### BranchService

```typescript
const branchService = new BranchService(plugin);

// Switch branch
await branchService.switchBranch();

// Create branch
const createResult = await branchService.createBranch();

// Delete branch
const deleteResult = await branchService.deleteBranch();
```

### FileService

```typescript
const fileService = new FileService(plugin);

// Stage file
await fileService.stageFile(file);

// Unstage file
await fileService.unstageFile(file);

// Discard all changes
const discardResult = await fileService.discardAll();

// Add to .gitignore
await fileService.addToGitignore("path/to/file", false);
```

## 🔒 类型安全特性

### 1. 严格的选项接口
```typescript
interface CommitOptions {
    readonly message: string;
    readonly onlyStaged?: boolean;
    readonly amend?: boolean;
    readonly fromAuto?: boolean;
}
```

### 2. Result 类型
```typescript
type Result<T, E = Error> =
    | { success: true; value: T }
    | { success: false; error: E };
```

### 3. 操作结果接口
```typescript
interface GitOperationResult {
    filesChanged?: number;
    message?: string;
}
```

## 🧪 可测试性

服务层设计使测试更容易：

```typescript
// Mock plugin
const mockPlugin = {
    gitManager: mockGitManager,
    app: mockApp,
    // ...
};

// Create service with mock
const service = new GitOperationsService(mockPlugin as any);

// Test
const result = await service.commit({
    message: "test",
    onlyStaged: false,
});

expect(result.success).toBe(true);
```

## 🔄 迁移指南

### 从 main.ts 迁移到服务

**之前（main.ts）：**
```typescript
// 在 ObsidianGit 类中
async commit(options: any): Promise<boolean> {
    // 200+ 行代码
}
```

**之后（服务）：**
```typescript
// 在 main.ts 中
async commit(options: CommitOptions): Promise<boolean> {
    const result = await this.gitOperationsService.commit(options);
    return result.success;
}

// 或者直接调用服务
this.gitOperationsService.commit(options);
```

## 📊 优势

### 1. 代码组织
- ✅ 清晰的职责分离
- ✅ 更小的文件（每个服务 < 300 行）
- ✅ 更容易导航和理解

### 2. 类型安全
- ✅ 所有操作都有明确的类型
- ✅ 编译时错误检测
- ✅ 更好的 IDE 支持

### 3. 可维护性
- ✅ 单一职责，更容易修改
- ✅ 减少代码重复
- ✅ 更容易添加新功能

### 4. 可测试性
- ✅ 每个服务可以独立测试
- ✅ 容易 mock 依赖
- ✅ 更好的测试覆盖率

## 🚀 未来扩展

可以轻松添加更多服务：
- `RemoteService` - 远程仓库管理
- `ConflictService` - 冲突处理
- `RepositoryService` - 仓库初始化和克隆
- `HistoryService` - 历史记录管理

## 📝 最佳实践

1. **总是使用 Result 类型**：不要抛出异常，返回 Result
2. **保持服务纯净**：服务不应该直接操作 UI
3. **使用只读属性**：防止意外修改
4. **添加 JSDoc 注释**：帮助理解服务方法
5. **编写单元测试**：确保服务正常工作
