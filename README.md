# i18n-cli

I18n-cli is command line interface for i18n.dev.

## Installation

Global installation:

`npm i -g i18ndev-cli`

Local installation:

`npm i i18ndev-cli`

## Usage

1. Create project at https://www.i18n.dev
2. Generate token at project setting
3. Create `.i18nrc` in your project with content below:

    ```
    token=xxxx
    ```
4. Run command line 

    ```
    i18n download
    ```

## Command Line Interface Guide

1. Check version
    `i18n -V` or `i18n --version`

2. Help
    `i18n -h` or `i18n --help`

3. Download profile from https://www.i18n.dev

    `i18n d` or `i18n download`

    - `--url` or `-u` specify path that you want to store json file. Default will be current directory from terminal.
    Example:
        ```
        i18n d -u /assets
        ```
    - `--profile` or `-p` specify the profile that you want to download. Default is ALL.
    Example:
        ```
        i18n d -p en -u /assets
        ```
