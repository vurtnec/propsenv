## Install

```bash
# with npm 
npm install propsenv
 
# or with Yarn 
yarn add propsenv
```

## Usage

As early as possible in your application, require and configure propsenv.

```
## default
require('propsenv')()

## with options
require('propsenv')({
  debug: true,
  path: './your_env_path',
  encoding: 'utf-8'
})
```

Create a `env_<env>.properties` file in the root/env/ directory of your project. Add environment-specific variables on new lines in the form of `NAME=VALUE`. For example:

```
HOST=localhost.local
USER=root
PASS=pass
```

You can also create multiple `env_<env>.properties` file in the the directory.

```
# <root>/env

env_dev.properties
env_test.properties
env_prod.properties
```

Then execute your start script before with NODE_ENV=<env>, you will get the configured variables in to env_<env>.properties file by process.env.HOST, process.env.USER, process.env.PASS

```
NODE_ENV=test node your_script.js
```

