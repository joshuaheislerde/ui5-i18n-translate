#!/usr/bin/env node

import fs from "fs";
import path from "path";
import minimist from "minimist";
import ora from "ora";
import os from "os"
import moment from "moment"

import Settings from "./settings";
import Helper from "./helper";
import CommandDelta from "./command-delta";
import CommandFull from "./command-full";
import Translator from "./translator";

(async () => {
    const currentDirectory = process.cwd()
    const parameter = minimist(process.argv.slice(2))

    // exit if no command has been entered
    if (parameter._.length !== 1) {
        Helper.showGeneralHelp()
        process.exit()
    }

    const settings = Settings.Instance

    // exit if a non-exiting command has been entered
    const command = parameter._[0];
    if (!["delta", "full"].includes(command)) {
        Helper.showGeneralHelp()
        process.exit()
    }

    // exit if help parameter has been requested
    if (parameter.help) {
        switch (command) {
            case CommandDelta.command:
                CommandDelta.showHelp()
                break
            case CommandFull.command:
                CommandFull.showHelp()
                break
        }
        process.exit()
    }

    // read information
    let arrayOfI18nFolders = Helper.getAllI18nFolders(currentDirectory, [])
    arrayOfI18nFolders = arrayOfI18nFolders.map((folder) => ({ path: folder }))
    for (const folder of arrayOfI18nFolders) {
        folder.files = Helper.getAllI18nFilesOfFolder(folder.path)
        folder.missing_translations = Helper.getMissingTranslations(
            folder.files,
            settings.targetLanguages
        )
    }

    // exit if any folder does not contain a fallback i18n
    for (const folder of arrayOfI18nFolders) {
        const fallbackFile = folder?.files?.find((file) => file.language === "fallback")
        if (!fallbackFile) {
            console.log(`[${folder.path}] Folder does not contain a fallback file`)
            process.exit()
        }
    }

    // print information
    console.log(`${arrayOfI18nFolders.length} location${arrayOfI18nFolders.length !== 1 ? "s" : ""} of i18n folders found:`)
    for (const folder of arrayOfI18nFolders) {
        console.log(` - ${folder.path}`)
        for (const file of folder.files) {
            console.log(`   - ${file.name} (${file.language}): ${file.entries.length} ${file.entries.length !== 1 ? "entries" : "entry"}`)
        }
        if (Helper.hasMissingEntries(folder)) {
            console.log(`   Missing translations:`);
            for (const missing_translation of folder.missing_translations) {
                console.log(`    - ${missing_translation.language}: ${missing_translation.missing_entries.length} ${missing_translation.missing_entries.length !== 1 ? "entries" : "entry"}`)
            }
        } else {
            console.log(`   No missing translations found!\n`)
        }
    }

    if (settings.isTest) {
        process.exit()
    }

    const translator = new Translator(settings.authUrl, settings.authClientId, settings.authClientSecret, settings.apiUrl)

    if (command === 'full') {
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

    if (command === 'delta') {
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

    // Done.
    // TODO: Move command calls into their respective class.
    // TODO: Clean up code.
    // TODO: Bug: the output of entries found also counts empty lines (e.g. de has two empty lines, it will show 97 instead if 95)
    // TODO: Publish as version 1.0.0

    // testing: PS C:\Users\joshua\vscode-workspace\extension-inspector\frontend>node C:\Users\joshua\vscode-workspace\ui5-i18n-translate\dist\cli.js delta --target_languages de,fr
    // npx tsc
})();
