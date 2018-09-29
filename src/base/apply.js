/**
 * Created by ued on 2016/11/9.
 */

/**
 * Copies all the properties of config to obj.
 * @param {Object} obj The receiver of the properties
 * @param {Object} config The source of the properties
 * @return {Object} returns obj
 */
export let apply = function (obj, ...config) {
    config.forEach((config) => {
        if (obj && config && typeof config === 'object') {
            for (let p in config) {
                if (config.hasOwnProperty(p)) {
                    obj[p] = config[p];
                }
            }
        }
    });

    return obj;
};

export let applyIf = function (obj, ...config) {
    if (obj) {
        config.forEach((config) => {
            for (let p in config) {
                if (config.hasOwnProperty(p) && typeof obj[p] === 'undefined') {
                    obj[p] = config[p];
                }
            }
        });
    }
    return obj;
};
