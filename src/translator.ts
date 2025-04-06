import axios from "axios"

export default class Translator {
    private authUrl: string
    private authClientId: string
    private authClientSecret: string
    private apiUrl: string

    private token: string

    constructor(authUrl: string, authClientId: string, authClientSecret: string, apiUrl: string) {
        this.authUrl = authUrl
        this.authClientId = authClientId
        this.authClientSecret = authClientSecret
        this.apiUrl = apiUrl
    }

    private async requestToken() {
        if (this.token) {
            return
        }

        const encodedParams = new URLSearchParams()
        encodedParams.set("client_id", this.authClientId)
        encodedParams.set("client_secret", this.authClientSecret)
        encodedParams.set("grant_type", "client_credentials")
        encodedParams.set("response_type", "token")

        const options = {
            method: 'POST',
            url: `${this.authUrl}/oauth/token`,
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: encodedParams,
        }

        try {
            const response: any = await axios.request(options)
            this.token = response.data.access_token
        } catch (error) {
            throw new Error(error.message)
        }
    }

    public async translate(units, targetLanguages, sourceLanguage) {
        await this.requestToken()

        const options = {
            method: "POST",
            url: `${this.apiUrl}/translationhub/api/v2/translate`,
            headers: {
                "content-type": "application/json; charset=utf-8",
                authorization: `Bearer ${this.token}`,
            },
            data: {
                targetLanguages: targetLanguages,
                sourceLanguage: sourceLanguage,
                units: units
            }
        }

        try {
            const response: any = await axios.request(options)
            return response.data?.units
        } catch (error) {
            throw new Error(error.message)
        }
    }
}