export function getProjectConfig() {
	return require(`${process.env.CONFIG_DIR}/config.yml`)
}

export function importConfig(filePath) {
	return require(`${process.env.CONFIG_DIR}/${filePath}`)
}
