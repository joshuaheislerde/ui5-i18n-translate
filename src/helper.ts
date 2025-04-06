import fs from "fs";
import path from "path";
import CommandDelta from "./command-delta";
import CommandFull from "./command-full";

export default class Helper {
    static getAllI18nFolders(dirPath, arrayOfI18nFolders) {
        const files = fs.readdirSync(dirPath);
        arrayOfI18nFolders = arrayOfI18nFolders || [];

        files.forEach(function (file) {
            if (fs.statSync(dirPath + path.sep + file).isDirectory()) {
                if (!["node_modules", "dist"].includes(file)) {
                    arrayOfI18nFolders = Helper.getAllI18nFolders(
                        dirPath + path.sep + file,
                        arrayOfI18nFolders
                    );
                }
                if (file === "i18n") {
                    arrayOfI18nFolders.push(path.join(dirPath, path.sep, file));
                }
            }
        });

        return arrayOfI18nFolders;
    }

    static getTextType(line): string {
        // Samples of classifications:
        // #<Type>
        // #<Type>:<Description>
        // #<Type>,<maxLength>
        // #<Type>,<maxLength>:<Description>
        const textType = line.split(",", 1)[0].split(":", 1)[0].split("#", 2)[1];
        const textTypes = [
            "XACT",
            "XBUT",
            "XCKL",
            "XCOL",
            "XFLD",
            "XGRP",
            "XLNK",
            "XLOG",
            "XLST",
            "XMIT",
            "XMSG",
            "XRBL",
            "XSEL",
            "XTIT",
            "XTOL",
            "YINS",
        ];

        return textTypes.includes(textType) ? textType : "";
    }

    static getMaxLength(line): number {
        if (line.includes(",")) {
            // Handle manual defined maxLength (#TYPE,maxLength:Description)
            return Number(line.split(",", 2)[1].split(":", 1)[0]);
        } else {
            // Handle maxLength defined by the textType (everyting besides YINS must be <= 120 as defined here https://github.com/SAP-docs/sapui5/blob/main/docs/05_Developing_Apps/text-classification-582ce93.md)
            const textType = Helper.getTextType(line);
            const textTypesBelow120Characters = [
                "XACT",
                "XBUT",
                "XCKL",
                "XCOL",
                "XFLD",
                "XGRP",
                "XLNK",
                "XLOG",
                "XLST",
                "XMIT",
                "XMSG",
                "XRBL",
                "XSEL",
                "XTIT",
                "XTOL",
            ];
            return textTypesBelow120Characters.includes(textType) ? 120 : 1000;
        }
    }

    static getAllEntriesOfI18nFile(filePath): Array<Object> {
        let lines = fs.readFileSync(filePath).toString().split("\n");
        lines = lines.filter((line) => line !== "");

        let entryArray = [];

        for (const index in lines) {
            const line = lines[index].trim();

            if (line.startsWith("#")) {
                continue;
            }

            let classification = "";
            let textType = "";
            let maxLength = 1000;
            if (Number(index) > 0) {
                const previousLine = lines[Number(index) - 1].trim();
                if (previousLine.startsWith("#")) {
                    textType = Helper.getTextType(previousLine);
                    if (textType !== "") {
                        classification = previousLine;
                        maxLength = Helper.getMaxLength(previousLine);
                    }
                }
            }

            entryArray.push({
                classification: classification,
                textType: textType,
                key: line.split("=")[0],
                value: line.split("=")[1],
                maxLength: maxLength,
            });
        }

        return entryArray;
    }

    static getAllI18nFilesOfFolder(dirPath): Array<Object> {
        return fs.readdirSync(dirPath).map((file) => ({
            name: file,
            language: file.split("_", 2)[1]?.split(".", 1)[0] || "fallback",
            entries: Helper.getAllEntriesOfI18nFile(path.join(dirPath, path.sep, file)),
        }));
    }

    static getMissingTranslations(files, translate_to) {
        const fallback_file = files.find((file) => file.language === "fallback")
        let missing_translations = []

        for (const language of translate_to) {
            const file = files.find((file) => file.language === language)

            let missing_entries = []
            if (file) {
                missing_entries = fallback_file.entries.filter(
                    (fallback_entry) =>
                        !file.entries.some((entry) => entry.key === fallback_entry.key)
                )
            } else {
                missing_entries = fallback_file.entries
            }

            missing_translations.push({
                language: language,
                missing_entries: missing_entries
            })
        }

        return missing_translations
    }

    static hasMissingEntries(folder) {
        for (const missing_translation of folder.missing_translations) {
            if (missing_translation.missing_entries.length > 0) {
                return true
            }
        }
        return false
    }

    static getDefaultHelpPrefix(): string {
        return "UI5 i18n Translate via SAP Translation Hub CLI by joshuaheislerde.\nThis tool will translate your fallback i18n into other languages.\n\n";
    }

    static showGeneralHelp() {
        console.log(
            Helper.getDefaultHelpPrefix(),
            "USAGE:\n",
            "\n",
            "\x1b[33mui5-i18n-translate [COMMAND] [COMMAND OPTIONS]\x1b[0m\n",
            "\n",
            "COMMAND:\n",
            "\n",
            "delta              " + CommandDelta.description + "\n",
            "full               " + CommandFull.description + "\n",
            "\n",
            "GLOBAL COMMAND OPTIONS:\n",
            "\n",
            "--help             Show help for the given command\n"
        )
    }
}
