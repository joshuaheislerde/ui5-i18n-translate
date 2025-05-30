# ui5-i18n-translate

A command-line interface (CLI) tool to effortlessly translate your UI5 i18n fallback files into multiple languages using the SAP Translation Hub. This package streamlines the localization process for your UI5 applications by automating the translation of missing or all entries in your i18n files.

---

## Installation
This package can be installed using npm:
```
npm install ui5-i18n-translate
```

## Usage

This tool provides two main commands for managing your translations: delta and full.

To see the general help information, run:
```
ui5-i18n-translate --help
```

### Delta Translation
The ```delta``` command adds translations only for keys that are **missing** in your existing i18n files. This is useful for incremental updates without overwriting existing translations.
```
ui5-i18n-translate delta [OPTIONS]
```

**Options for ```delta``` command:**

- ```--auth_url```: The UAA URL of the key for the SAP Translation Hub instance.
- ```--auth_client_id```: The UAA client ID of the key for the SAP Translation Hub instance.
- ```--auth_client_secret```: The UAA client secret of the key for the SAP Translation Hub instance.
- ```--api_url```: The API URL of the key for the SAP Translation Hub instance.
- ```--fallback_language```: The BCP 47 language used in the fallback i18n file (default: ```en```).
- ```--target_languages```: The BCP 47 language(s) for which i18n files should be maintained (e.g., ```de,fr,es```).
- ```--test```: Don't run translation or change data; only show what would happen.

Example:
```
ui5-i18n-translate delta --target_languages de,fr
```

### Full Translation
The ```full``` command adds translations for **all** keys found in your fallback i18n file. **Be aware that this command will overwrite any existing translations in the target language files**.
```
ui5-i18n-translate full [OPTIONS]
```

**Options for ```full``` command:**

- ```--auth_url```: The UAA URL of the key for the SAP Translation Hub instance.
- ```--auth_client_id```: The UAA client ID of the key for the SAP Translation Hub instance.
- ```--auth_client_secret```: The UAA client secret of the key for the SAP Translation Hub instance.
- ```--api_url```: The API URL of the key for the SAP Translation Hub instance.
- ```--fallback_language```: The BCP 47 language used in the fallback i18n file (default: ```en```).
- ```--target_languages```: The BCP 47 language(s) for which i18n files should be maintained (e.g., ```de,fr,es```).
- ```--test```: Don't run translation or change data; only show what would happen.

Example:
```
ui5-i18n-translate full --target_languages en,fr --source_language de
```

### Global Command Options
- ```--help```: Show help for the given command.

## Configuration
The ```ui5-i18n-translate``` tool requires configuration to connect to the SAP Translation Hub. You can provide these settings in two ways:

1. **Configuration File (recommended for persistent settings):**
Create a file named ```ui5-i18n-translate.yml``` in your project's root directory. This file holds the necessary credentials and API endpoints.
Here's an example of the ```ui5-i18n-translate.yml``` structure:
```
auth_url: https://[subaccount].authentication.[region].hana.ondemand.com
auth_client_id: [Client ID]
auth_client_secret: [Client Secret]
api_url: https://software-translation.api.[region].translationhub.cloud.sap
target_languages: [Comma-separated list of target language codes (e.g., en,de,fr)]
source_language: [The language of your fallback i18n file (defaults to 'en')]
```

2. **Command-Line Parameters (for one-time or overriding settings or not using the configuration file at all):**
You can also pass the configuration settings directly as command-line parameters when executing ```ui5-i18n-translate```. Command-line parameters will override any corresponding settings found in the ```ui5-i18n-translate.yml``` file. Refer to the "Options for delta command" and "Options for full command" sections above for the available parameters.

### Mandatory Settings:
The following settings are mandatory, whether provided via the configuration file or command-line parameters:

- ```auth_url```: The authentication URL for the SAP Translation Hub.
- ```auth_client_id```: Your client ID for authentication.
- ```auth_client_secret```: Your client secret for authentication.
- ```api_url```: The API URL for the SAP Translation Hub.
- ```target_languages```: A comma-separated list of language codes you want to translate your i18n files into (e.g., ```de,fr,es```).

### Optional Settings:
- ```source_language```: The language of your fallback i18n file. If not specified, it defaults to ```en```.