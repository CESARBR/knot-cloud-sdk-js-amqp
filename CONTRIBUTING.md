# KNoT Contributing Guide

> This contribution guideline is derived from the [Vue.js](https://github.com/vuejs/vue/blob/dev/.github/CONTRIBUTING.md), [Atom](https://github.com/atom/atom/blob/master/CONTRIBUTING.md), [Starship](https://github.com/starship/starship/blob/master/CONTRIBUTING.md) and [Convetional Commits](https://github.com/conventional-commits/conventionalcommits.org/blob/master/CONTRIBUTING.md) contribution guidelines.

:tada: First of all, thank you so much for taking the time to contribute to KNoT! :tada:

Secondly, before submitting your contribution, please make sure to take a moment and read through the guidelines for contributing to [KNoT](https://knot.cesar.org.br) and its packages, which are hosted in the [CESARBR Organization](https://github.com/CESARBR) on GitHub:

- [Code of Conduct](#code-of-conduct)
- [Issue Reporting Guidelines](#issue-reporting-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Development Setup](#development-setup)

## Code of Conduct

This project and everyone participating in it is governed by the [Contributor Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to our [Slack Workspace](https://join.slack.com/t/knot-iot/shared_invite/enQtNjkxMDI3MTgyNzQzLTU5NDY3ZmU3OGZjMGZhMmZiMzk1ZWY4OTA2NGRiNDJhY2M5MmY3YWM5MmEzYTc3NWJiNTczY2JjYzIyZjBhYjc).

## Issue Reporting Guidelines

The issue list is reserved exclusively for bug reports and feature requests. For usage questions, please use the following resources:1

- Read the [docs](https://knot-devel.cesar.org.br)
- Ask on our [Slack workspace](https://join.slack.com/t/knot-iot/shared_invite/enQtNjkxMDI3MTgyNzQzLTU5NDY3ZmU3OGZjMGZhMmZiMzk1ZWY4OTA2NGRiNDJhY2M5MmY3YWM5MmEzYTc3NWJiNTczY2JjYzIyZjBhYjc)

Also try to search for your issue - it may have already been answered or even fixed in the development branch. However, if you find that an old, closed issue still persists in the latest version, you should open a new issue using the form below instead of commenting on the old issue.

## Pull Request Guidelines

KNoT uses the [GitHub flow](https://guides.github.com/introduction/flow/) as main versioning workflow:

1. Fork this repository
2. Create a new branch for each feature, fix or improvement, off of `master`: `git checkout -b my-feature-branch`
3. Make some changes, committing them along the way (make sure to follow the [Commit Convention](.github/COMMIT_CONVENTION.md) guidelines)
4. When your changes are ready for review, push your branch: `git push origin my-feature-branch`
5. Create a pull request from your branch to `CESARBR/master` (make sure to fill in all [Pull Request](.github/PULL_REQUEST_TEMPLATE.md) requirements)
6. No need to assign the pull request to anyone, we'll review it when we can
7. When the changes have been reviewed and approved, someone will squash and merge for you

It is very important to separate new features or improvements into separate feature branches, and to send a pull request for each branch. This allow us to review and pull in new features or improvements individually.

## Development Setup

You will need [Node.js](http://nodejs.org) and [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/en/docs/install). If you need multiple Node.js versions, take a look at [nvm-sh's nvm project](https://github.com/nvm-sh/nvm).

After cloning the repo, install the project's dependencies with:

``` bash
$ yarn
```

### Commonly used NPM scripts

``` bash
# build all dist files, including npm packages
$ npm run build

# run index.js
$ npm run start

# run the full test suite, including linting/type checking
$ npm test
```

There are some other scripts available in the `scripts` section of the `package.json` file.

The default test script will do the following: lint with ESLint -> unit tests. **Please make sure to have this pass successfully before submitting a PR.**

## License

You must agree that your patch will be licensed under the repository's license, and when we change the license we will assume that you agreed with the change unless you object to the changes in time.
