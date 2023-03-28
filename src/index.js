#!/usr/bin/env node

import { Command } from "commander";
import { exec } from "child_process";
import * as p from "@clack/prompts";
import chalk from "chalk";

const program = new Command();
const editorOptions = [
  { value: "code", label: "VS Code", hint: "recommended" },
  { value: "code-inside", label: "VS Code Insider", hint: "recommended" },
  { value: "nvim", label: "Neo Vim" },
  { value: "vim", label: "Vim" },
];

program.command("create").action(async () => {
  main().catch((e) => {
    console.error(e)
    process.exit(0)
  });
});

program.parse(process.argv);

async function main() {
  console.clear();

  warning();
  p.intro(chalk.bgCyan(chalk.black(" create-app ")));

  const project = await p.group(
    {
      github_addr: () =>
        p.text({
          message: "请输入空白 github 地址",
          placeholder:
            "使用 https 或者 ssh 模式 (例如：git@github.com:<github_your>/<github_project>.git)",
          initialValue: "",
          validate(value) {
            if (value.length === 0) return `Value is required!`;
          },
        }),
      template_name: () =>
        p.text({
          message: "🔣请输入模板地址: `<github_your>/<github_project>`",
          placeholder: "<github_your>/<github_project>",
          initialValue: "",
          validate(value) {
            if (value.length === 0) return `Value is required!`;
          },
        }),
      download: () =>
        p.confirm({
          message: "📥下载项目",
          initialValue: true,
        }),
      install: () =>
        p.confirm({
          message: "🏗︎ Install dependencies?",
          initialValue: true,
        }),
      editor: () =>
        p.select({
          message: "✅选择一个趁手编辑器",
          initialValues: ["code"],
          options: editorOptions,
        }),
      open: (...args) => {
        console.log("args",args)
        let currentEditor
        let choiceEditor = args[0].results.editor
        editorOptions.forEach((e) => {
          if(e.value === choiceEditor) {
            currentEditor = e.label
          }
        })
        
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
  let dirname = project.github_addr
    .split("/")
    [project.github_addr.split("/").length - 1].split(".")[0];

    outputCwdDir(dirname)

  if (project.download) {
    await cloneGithubBlank(s, project.github_addr);
    await cloneGithubTemplate(s, project.template_name, setCwd(dirname));
  }

  if (project.install) {
    await installPackages(s, dirname);
    await useExecCwd(`pnpm install`, setCwd(dirname));
  }

  if (project.open) {
    await openEditor(s, project.editor, setCwd(dirname));
  }

  p.outro(`🚀🚀🚀 完成！`);
}

async function cloneGithubBlank(s, github_addr) {
  s.start("开始克隆项目");
  await useExecCwd(`git clone ${github_addr}`);
  s.stop("克隆项目结束");
}

async function cloneGithubTemplate(s, template_addr, dirname) {
  s.start("开始克隆模板");
  await useExecCwd(`degit ${template_addr} --force`, dirname);
  s.stop("克隆项目模板");
}

async function installPackages(s, dirname) {
  s.start("安装依赖");
  await useExecCwd(`pnpm install`, dirname);
  s.stop("安装依赖结束");
}

async function openEditor(s, editor, dirname) {
  s.start("打开编辑器");
  await useExecCwd(`${editor} .`, dirname);
  s.stop("打开编辑器");
}

function setCwd(dirname) {
  if (!dirname) return process.cwd();
  return `${process.cwd()}/${dirname}`;
}

function outputCwdDir(dirname) {
  console.log()
  console.log(`  ${chalk.green("工作目录：")} ${process.cwd()}/${dirname}`);
  console.log()
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
