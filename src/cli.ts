#!/usr/bin/env node

import minimist from "minimist";

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

    // exit if test mode is enabled
    if (settings.isTest) {
        process.exit()
    }

    // handle translation
    const translator = new Translator(settings.authUrl, settings.authClientId, settings.authClientSecret, settings.apiUrl)
    switch (command) {
        case CommandDelta.command:
            CommandDelta.translate(settings, translator, arrayOfI18nFolders)
            break
        case CommandFull.command:
            CommandFull.translate(settings, translator, arrayOfI18nFolders)
            break
    }

    // Done.
    // TODO: Move command calls into their respective class.
    // TODO: Clean up code.
    // TODO: Bug: the output of entries found also counts empty lines (e.g. de has two empty lines, it will show 97 instead if 95)
    // TODO: Publish as version 1.0.0

    // testing: PS C:\Users\joshua\vscode-workspace\extension-inspector\frontend>node C:\Users\joshua\vscode-workspace\ui5-i18n-translate\dist\cli.js delta --target_languages de,fr
    // npx tsc
})();
