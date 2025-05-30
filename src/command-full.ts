import Helper from "./helper";
import ora from "ora";
import fs from "fs";
import path from "path";
import os from "os";

export default class CommandFull {
    static command: string = "full"
    static description: string = "Add translations for all keys in i18n-files (this will overwrite existing translations!)"

    static showHelp() {
        console.log(
            Helper.getDefaultHelpPrefix(),
            "COMMAND NAME:\n",
            "\n",
            `\x1b[33m${CommandFull.command} - ${CommandFull.description}\x1b[0m\n`,
            "\n",
            "USAGE:\n",
            "\n",
            `\x1b[33mui5-i18n-translate ${CommandFull.command} [...OPTIONS]\x1b[0m\n`,
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
            const spinner = ora(`[${folder.path}] Translating...`).start()
            const fallbackFile = folder?.files?.find((file) => file.language === "fallback")
            let translations = await translator.translate(fallbackFile.entries, settings.targetLanguages, settings.sourceLanguage)

            for (const language of settings.targetLanguages) {
                var writeStream = fs.createWriteStream(path.join(folder.path, path.sep, `i18n_${language}.properties`))
                for (const entry of fallbackFile.entries) {
                    let translation = translations
                        .find(translation => translation.key === entry.key)
                        .translations.find(translation => translation.language === language)
                        .value

                    if (translation) {
                        if (entry.classification) {
                            writeStream.write(entry.classification + os.EOL)
                        }
                        writeStream.write(`${entry.key}=${translation}` + os.EOL)
                    }
                }
                writeStream.end()
            }



            spinner.succeed(`[${folder.path}] Translation complete`)
        }
    }
}