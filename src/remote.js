import { exec } from "child_process";
import * as p from "@clack/prompts";
import chalk from "chalk";
import { editorOptions } from "./utils/editor-options.js";

export async function mainRemote() {
  console.clear();

  warning();
  p.intro(chalk.bgCyan(chalk.black("从（远程）模板创建一个项目")));

  const project = await p.group(
    {
      project_addr: () =>
        p.text({
          message: "空项目",
          placeholder: "git@github.com:yyong008/tt.git",
          initialValue: "git@github.com:yyong008/tt.git",
          validate(value) {
            if (value.length === 0) return `Value is required!`;
          },
        }),
      template_name: () =>
        p.text({
          message: "模板",
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
          message: "Install dependencies?",
          initialValue: true,
        }),
      editor: () =>
        p.select({
          message: "选择一个趁手编辑器",
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
    },
    {
      onCancel: () => {
        p.cancel("Operation cancelled.");
        process.exit(0);
      },
    }
  );
  const s = p.spinner();

  // 填写：新项目地址-填写模板地址
  if (!project.download) {
    console.log(`取消下载...`);
    return;
  }
  await cloneNewProjectFromAddr(s, project.project_addr);
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

async function cloneNewProjectFromAddr(s, project_addr) {
  s.start(`开始克隆 ${project_addr} 项目`);
  await useExecCwd(`git clone ${project_addr} .`);
  s.stop(`克隆 ${project_addr} 项目结束`);
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
