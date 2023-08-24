const globalConfig: IGlobalConfig = {
    host: '',
};

export function setGlobalConfig(config: IGlobalConfig) {
    Object.assign(globalConfig, config);
}

export function getGlobalConfig() {
    return globalConfig;
}
