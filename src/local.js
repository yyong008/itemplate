import { exec } from "child_process";
import * as p from "@clack/prompts";
import chalk from "chalk";
import fs from "node:fs";
import { editorOptions } from "./utils/editor-options.js";

export async function mainLocal() {
  console.clear();

  warning();
  p.intro(chalk.bgCyan(chalk.black("从（本地）模板创建一个项目")));
  let qGroupCommon = {
    template_name: () =>
      p.text({
        message: "项目模板（github）",
        placeholder: "yyong008/remix-antd-admin",
        initialValue: "yyong008/remix-antd-admin",
        validate(value) {
          if (value.length === 0) return `Value is required!`;
        },
      }),
    download: () =>
      p.confirm({
        message: "下载：模板项目/目标空白项目",
        initialValue: true,
      }),
    install: () =>
      p.confirm({
        message: "需要安装依赖吗?",
        initialValue: true,
      }),
    editor: () =>
      p.select({
        message: "选择一个趁手编辑器吧?",
        initialValues: ["code"],
        options: editorOptions,
      }),
    open: (...args) => {
      let currentEditor;
      let choiceEditor = args[0].results.editor;
      editorOptions.forEach((e) => {
        if (e.value === choiceEditor) {
          currentEditor = e.label;
        }
      });

      return p.confirm({
        message: `Open with ${currentEditor}?`,
        initialValue: true,
      });
    },
  };

  let qGroup = {};

  if (getCurrentDirIsEmpty() || hasGitFolder()) {
    qGroup = {
      init_git: () =>
        p.confirm({
          message: "是否需要初始化 git ",
          placeholder: "",
          initialValue: true,
        }),
      ...qGroupCommon,
    };
  } else {
    qGroup = {
      ...qGroupCommon,
    };
  }

  const project = await p.group(qGroup, {
    onCancel: () => {
      p.cancel("Operation cancelled.");
      process.exit(0);
    },
  });
  const s = p.spinner();

  if (project.init_git) {
    await initGit(s);
  }

  await cloneTemplateFromAddr(s, project.template_name);

  if (project.install) {
    s.start(`开始使用 pnpm 安装依赖`);
    await useExecCwd(`pnpm install`);
    s.stop(`使用 pnpm 安装依赖结束`);
  }

  if (project.open) {
    await openEditor(s, project.editor);
  }

  p.outro(`🚀🚀🚀 完成！`);
}

async function cloneTemplateFromAddr(s, template_name) {
  s.start(`开始克隆模板 ${template_name} 项目`);
  await useExecCwd(`degit ${template_name} --force`);
  s.stop(`克隆模板 ${template_name} 项目结束`);
}

function warning() {
  console.log();
  console.log(`${chalk.red("注意：")}"请确保全局安装了 git/degit"`);
  console.log();
}

function useExecCwd(shell, cwd) {
  return new Promise((res, rej) => {
    if (cwd) {
      exec(
        shell,
        { cwd: typeof cwd === "object" ? cwd.cwd : cwd },
        (err, stdout, stderr) => {
          if (err) {
            rej(err);
          } else {
            res({
              stdout,
              stderr,
            });
          }
        }
      );
    } else {
      exec(shell, (err, stdout, stderr) => {
        if (err) {
          rej(err);
        } else {
          res({
            stdout,
            stderr,
          });
        }
      });
    }
  });
}

async function openEditor(s, editor) {
  s.start("打开编辑器");
  await useExecCwd(`${editor} .`);
  s.stop("打开编辑器");
}

function getCurrentDirIsEmpty() {
  const currentDirPath = process.cwd();
  return fs.readdirSync(currentDirPath).length === 0;
}

function hasGitFolder() {
  const currentDirPath = process.cwd();
  return fs.existsSync(`${currentDirPath}/.git`);
}

async function initGit(s) {
  s.start(`开始 git 初始化项目`);
  await useExecCwd(`git init`);
  s.stop(`git 初始化完成`);
}
