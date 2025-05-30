import Helper from "./helper";
import ora from "ora";
import fs from "fs";
import path from "path";
import os from "os";
import moment from "moment";

export default class CommandDelta {
    static command: string = "delta"
    static description: string = "Add translations for keys missing in i18n-files"

    static showHelp() {
        console.log(
            Helper.getDefaultHelpPrefix(),
            "COMMAND NAME:\n",
            "\n",
            `\x1b[33m${CommandDelta.command} - ${CommandDelta.description}\x1b[0m\n`,
            "\n",
            "USAGE:\n",
            "\n",
            `\x1b[33mui5-i18n-translate ${CommandDelta.command} [...OPTIONS]\x1b[0m\n`,
            "\n",
            "   --auth_url                uaa URL of the key for the SAP Translation Hub instance\n",
            "   --auth_client_id          uaa client id of the key for the SAP Translation Hub instance\n",
            "   --auth_client_secret      uaa client secret of the key for the SAP Translation Hub instance\n",
            "   --api_url                 The api URL of the key for the SAP Translation Hub instance\n",
            "   --fallback_language       The BCP 47 language used in the fallback i18n file (default: en)\n",
            "   --translate_to            The BCP 47 language(s) for which i18n files should be maintained (e.g. de,fr,es)\n",
            "   --test                    Don't run translate or change data, only show what would happen"
        )
    }

    static async translate(settings, translator, arrayOfI18nFolders) {
        for (const folder of arrayOfI18nFolders) {
            if (!Helper.hasMissingEntries(folder)) {
                const spinner = ora(`[${folder.path}] Translating...`).start()
                spinner.succeed(`[${folder.path}] Nothing to translate`)
                continue
            }

            const spinner = ora(`[${folder.path}] Translating...`).start()

            for (const missing_translation of folder.missing_translations) {
                if (missing_translation.missing_entries.length === 0) {
                    continue
                }

                let translations = await translator.translate(missing_translation.missing_entries, [missing_translation.language], settings.sourceLanguage)

                var writeStream = fs.createWriteStream(path.join(folder.path, path.sep, `i18n_${missing_translation.language}.properties`), { flags: 'a' })
                writeStream.write(os.EOL + os.EOL + `# [${moment().format('YYYY-MM-DD hh:mm:ss')}] New translations added by ui5-i18n-translate`)
                for (const missing_entry of missing_translation.missing_entries) {
                    let translation = translations
                        .find(translation => translation.key === missing_entry.key)
                        .translations.find(translation => translation.language === missing_translation.language)
                        .value

                    if (translation) {
                        writeStream.write(os.EOL)
                        if (missing_entry.classification) {
                            writeStream.write(missing_entry.classification + os.EOL)
                        }
                        writeStream.write(`${missing_entry.key}=${translation}`)
                    }
                }
                writeStream.end()
            }
            spinner.succeed(`[${folder.path}] Translation complete`)
        }
    }
}
