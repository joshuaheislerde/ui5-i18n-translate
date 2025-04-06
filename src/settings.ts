import fs from "fs"
import path from "path"
import yaml from "js-yaml"
import minimist from "minimist"

export default class Settings {
    private static instance: Settings

    public authUrl: string
    public authClientId: string
    public authClientSecret: string
    public apiUrl: string
    public targetLanguages: Array<string>
    public sourceLanguage: string
    public isTest: boolean

    public static get Instance() {
        return this.instance || (this.instance = new this())
    }

    private constructor() {
        const config = this.getConfigFile()
        const parameter = this.getParameter()

        this.authUrl = parameter?.auth_url || config?.auth_url || ""
        this.authClientId = parameter?.auth_client_id || config?.auth_client_id || ""
        this.authClientSecret = parameter?.auth_client_secret || config?.auth_client_secret || ""
        this.apiUrl = parameter?.api_url || config?.api_url || ""
        this.targetLanguages = parameter?.target_languages?.split(",") || config?.target_languages?.split(",") || ""
        this.sourceLanguage = parameter?.fallback_language || config?.fallback_language || "en"
        this.isTest = parameter?.test || false

        this.validateMandatorySettings()
    }

    private getConfigFile() {
        const currentDirectory = process.cwd()
        const configFilePath = path.join(currentDirectory, path.sep, "ui5-i18n-translate.yml")

        const configFileExists = fs.existsSync(configFilePath)
        let config: any = {}
        if (configFileExists) {
            const fileContents = fs.readFileSync(configFilePath, "utf8")
            config = yaml.load(fileContents)
        }
        return config
    }

    private getParameter() {
        return minimist(process.argv.slice(2))
    }

    private validateMandatorySettings() {
        if (!this.authUrl) throw new Error(`Setting 'auth_url' is not defined`)
        if (!this.authClientId) throw new Error(`Setting 'auth_client_id' is not defined`)
        if (!this.authClientSecret) throw new Error(`Setting 'auth_client_secret' is not defined`)
        if (!this.apiUrl) throw new Error(`Setting 'api_url' is not defined`)
        if (!this.targetLanguages) throw new Error(`Setting 'translate_to' is not defined`)
    }
}