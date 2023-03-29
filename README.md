# itpls

>A CLI tool that fills empty Git projects with templates

- [chinese doc](./README-CN.md)


## Dependencies


| Package Name | Description |
| ------------ | ----------- |
| git          | Code management tool |
| degit        | Code download tool |

## Design Motivation

Sometimes we need to add some template files to an empty git project. These template files are hosted on platforms such as github/gitlab, and we want to quickly start a project by using these two templates. itpls is such a tool, which is used to fill in template files in an empty project and can install dependencies and open the editor of the cli tool.

## Usage

```sh
pnpm install itpls -g

cd your_target_dir

## starter commander
itpls create
```

1. Fill in the complete github git address of the empty project
2. Fill in the template file name required by degit: `<github_your_name>/<github_projectname>`
3. Other default selections

Note: Currently, because git clone will create a new folder, itpls' working directory is the current new folder.

## Tips

The functionality of the future cli may change, but the core will not change.
