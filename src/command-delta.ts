import Helper from "./helper";

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
}
