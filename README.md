# Selenite GEOS Graph Editor
A graphical interface for advanced GEOS users. It serves the purpose of automating and simplifying the generation of GEOS input files, by programming visually with a node based interface.

It is part of Selenite, a project to develop a suite of tools for using [GEOS](https://github.com/GEOS-DEV/GEOS).

## Usage
The app can be accessed at this url : [https://selenite-geos.github.io/advanced-interface](https://selenite-geos.github.io/advanced-interface/). 

> If you encounter whole page crashes, you can try to update your brower.

The app is also available as a standalone executable for Windows, MacOS and Linux. You can download the latest release from the [releases page](https://github.com/ShaitanLyss/selenite-geos-graph-editor/releases).

## Development
The app is built using [Svelte](https://svelte.dev/) and [Tauri](https://v2.tauri.app/fr/). Svelte provides a reactive web frontend, while Tauri provides a way to package the app as a standalone executable.

### Prerequisites
- [Node.js](https://nodejs.org/en/)
- [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/)

## Release
A new release can be made by merging a pull request into the `release` branch.

The app will then be compiled and published to github, thanks to github actions.

Releases are available on the [releases page](https://github.com/ShaitanLyss/selenite-geos-graph-editor/releases).


## TODO
- move code integration to graph editor and remove unecessary deps like rete
- move to pnpm
- add multiple nodes preview
- add preview node shortcut
- add search node and go next
- add nodes tree view
- improve responsivity
- fix missing data for added node in live preview
- add delay before hiding top right toolbar
- add play button with select to select a play node