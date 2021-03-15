const fs = require('fs')

const log = (message) => {
    console.log(`[propsenv][DEBUG] ${message}`)
}

const NEWLINE = '\n'
const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/
const RE_NEWLINES = /\\n/g

// Parses src into an Object
const parse = (src, options) => {
    const debug = Boolean(options && options.debug)
    const obj = {}

    // convert Buffers before splitting into lines and processing
    src
        .toString()
        .split(NEWLINE)
        .forEach(function (line, idx) {
            // matching "KEY' and 'VAL' in 'KEY=VAL'
            const keyValueArr = line.match(RE_INI_KEY_VAL)
            // matched?
            if (keyValueArr != null) {
                const key = keyValueArr[1]
                // default undefined or missing values to empty string
                let val = keyValueArr[2] || ''
                const end = val.length - 1
                const isDoubleQuoted = val[0] === '"' && val[end] === '"'
                const isSingleQuoted = val[0] === "'" && val[end] === "'"
                // if single or double quoted, remove quotes
                if (isSingleQuoted || isDoubleQuoted) {
                    val = val.substring(1, end)
                    // if double quoted, expand newlines
                    if (isDoubleQuoted) {
                        val = val.replace(RE_NEWLINES, NEWLINE)
                    }
                } else {
                    // remove surrounding whitespace
                    val = val.trim()
                }
                obj[key] = val
            } else if (debug) {
                log(`did not match key and value when parsing line ${idx + 1}: ${line}`)
            }
        })

    return obj
}

// Populates process.env from .env file
module.exports = (options = {}) => {

    const {debug = false, filePath = './env/', encoding = 'utf8', profile, arrayDelimiter = ','} = options

    const currentProfile = profile || (process.env.NODE_ENV ? process.env.NODE_ENV : 'local')

    if (debug) {
        log(`Current environment profile : ${currentProfile}`)
    }

    let file = `env_${currentProfile}.properties`

    try {
        let result = {}
        // specifying an encoding returns a string instead of a buffer
        const parsedEnvFile = parse(fs.readFileSync(`${filePath}${file}`, {encoding}), {debug})
        Object.keys(parsedEnvFile).forEach((key) => {
            log(`parsing current key: ${key}`)
            let environmentValue = parsedEnvFile[key]
            result[key] = environmentValue
            if (!process.env.hasOwnProperty(key)) {
                if (isNumber(environmentValue)) {
                    result[key] = Number(environmentValue)
                } else if (isBoolean(environmentValue)) {
                    result[key] = JSON.parse(environmentValue)
                } else if (isArray(environmentValue, arrayDelimiter)) {
                    const splitedArray = environmentValue.split(arrayDelimiter)
                    const parsedArray = splitedArray.filter((item) => !isEmpty(item.trim())).map((item) => {
                        let parsedItem = item.trim()
                        if(isNumber(parsedItem)) {
                            return Number(parsedItem)
                        }else if(isBoolean(parsedItem)) {
                            return JSON.parse(parsedItem)
                        }else {
                            return parsedItem
                        }
                    })
                    result[key] = parsedArray
                }
                process.env[key] = result[key]
            } else if (debug) {
                log(`"${key}" is already defined in \`process.env\` and will not be overwritten`)
            }
        })
        return result
    } catch (e) {
        return {error: e}
    }
}

const isNumber = (str) => {
    return !isNaN(Number(str))
}

const isBoolean = (str) => {
    return str.toLowerCase() === 'true' || str.toLowerCase() === 'false'
}

const isEmpty = (str) => {
    return str === undefined || str === null || str === ''
}

const isArray = (str, delimiter) => {
    return str.indexOf(delimiter) !== -1 ? true : false
}
