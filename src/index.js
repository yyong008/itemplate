#!/usr/bin/env node

import { Command } from "commander";

// remote/local
import { mainRemote } from "./remote.js";
import { mainLocal } from "./local.js";

const program = new Command();

program
  .command("create")
  .option("-t --type <type>", "选择类型", "remote")
  .action(async (options) => {
    console.log(options);
    if (options.type === "remote") {
      mainRemote().catch((e) => {
        console.error(e);
        process.exit(0);
      });
    } else if (options.type === "local") {
      mainLocal().catch((e) => {
        console.error(e);
        process.exit(0);
      });
    } else {
      console.log("使用 -t/--type 参数指定项目类型 local/remote");
      return;
    }
  });

program.parse(process.argv);
