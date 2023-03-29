# itpls

> 一个用模板填充空 git 项目的 cli 工具

- [en doc](./README.md)

## 依赖

| 包名  | 说明         |
| ----- | ------------ |
| git   | 代码管理工具 |
| degit | 代码下载工具 |

## 设计动机

有时候我们需要给一个空的 git 项目添加一些模板文件。这些模板文件都托管在一些如 github/gitlab 等品平台上，我们想要快速的开始一个项目，可以直接使用这两个模板, itpls 就是这么一个工具，用于在空项目于中填写模板文件并且能够安装依赖自动编辑器打开的 cli 工具。

## 用法

```sh
pnpm install itpls -g

cd your_target_dir

## starter commander
itpls create
```

1. 填写空的 github 完整 git 地址
2. 填写 degit 需要的模板文件名: `<github_your_name>/<github_projectname>`
3. 其他的默认选择

注意：目前由于 git clone 会创建一个新的文件夹, itpls 的工作目录是当前新的文件夹。

## 提示

未来 cli 的功能可能会有所改动，但是核心不会改变。
