/* eslint-disable no-nested-ternary */

const getProperty = (value, lookup) =>
    typeof lookup === 'function' && typeof value.find === 'function'
        ? value.find(lookup)
        : lookup === null
        ? value
        : value[lookup];

const followFirstValidLookup = (value, ...lookups) =>
    lookups.slice(0).reduce((accum, lookup, i, array) => {
        if (getProperty(value, lookup) === undefined) {
            return undefined;
        }
        array.splice(1); // exit early
        return getProperty(value, lookup);
    });

const getPropertyWithArraySupport = (value, lookup) =>
    Array.isArray(lookup) ? followFirstValidLookup(value, ...lookup) : getProperty(value, lookup);

/**
 * An alternative to a && a.b && a.b.c
 */
const safelyGetProperty = (value, ...path) =>
    path.length === 0
        ? value
        : value && typeof value === 'object'
        ? safelyGetProperty(getPropertyWithArraySupport(value, path[0]), ...path.slice(1))
        : undefined;

module.exports = safelyGetProperty;
