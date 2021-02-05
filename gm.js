const { google } = require('googleapis');

/**
 * Class for help to work with gmail API
 */
class GM {

    constructor() {}

    /**
     * Returns oAuthClient for use in next request for access to someting action in gmail
     * @param {Object} cr credentials 
     * @param {String} cr.client_secret 
     * @param {String} cr.client_id 
     * @param {String} cr.redirect_uris 
     * @param {Object} token 
     */
    async auth(cr, token) {
        const client_secret = cr.client_secret;
        const client_id = cr.client_id;
        const redirect_uris = cr.redirect_uris;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        oAuth2Client.setCredentials(token)
        return oAuth2Client
    }

    /**
     * Returns mail lables
     * @param {Object} cr
     * @param {Object} token 
     */
    async listLables(cr = null, token = null) {
        const auth = await this.auth(cr, token)
        const gmail = await google.gmail({ version: 'v1', auth });
        const res = await gmail.users.labels.list({ userId: 'me', })
        return res.data.labels
    }

    /**
     * Returns array with messages id from inbox
     * @param {Object} cr 
     * @param {Object} token 
     * @returns Return data in format [{id: 123, threadId:'fdefefe'}, ...]
     */
    async inbox(cr = null, token = null) {
        const auth = await this.auth(cr, token)
        const gmail = await google.gmail({ version: 'v1', auth });
        const res = await gmail.users.messages.list({ userId: 'me', labelIds: ['INBOX', 'UNREAD'] })
        if (res.data.resultSizeEstimate == 0) return []
        return res.data.messages
    }

    /**
     * Delete message by id
     * @param {Object} cr 
     * @param {Object} token 
     * @param {...Number} messagesId 
     */
    async delete(cr = null, token = null, messagesId) {
        const auth = await this.auth(cr, token)
        const gmail = await google.gmail({ version: 'v1', auth });
        const res = await gmail.users.messages.delete({ userId: 'me', id: messagesId })
        return res
    }

    /**
     * Returns message list 
     * @param {Object} cr 
     * @param {Object} token 
     * @param {...Number} messagesId 
     */
    async get(cr = null, token = null, ...messagesId) {
        const auth = await this.auth(cr, token)
        const gmail = await google.gmail({ version: 'v1', auth });
        if (messagesId) {

            let messagesList = []

            for (let i = 0; i < messagesId.length; i++) {

                const res = await gmail.users.messages.get({
                    userId: 'me',
                    id: messagesId[i],
                    format: 'FULL'
                })

                if (res.status == 200) {
                    messagesList.push(res.data)
                } else { 
                    messagesList.push(`By id > ${messagesId[i]} message not found`)
                }
            }

            return messagesList

        } else return Error('Message id not passed')
    }

    /**
     * Return the value of headers by its name key
     * @param {*} name 
     * @param {*} headers 
     */
    getHeaderValue(name = null, headers = null) {

        for (let i = 0; i < headers.length; i++) {

            if (headers[i].name != name) continue
            return headers[i].value
        }
        return null

    }

    /**
     * Decode message
     * @param {*} bodyData 
     */
    decodeMessage(bodyData = null) {
        let body = new Buffer.from(bodyData, 'base64')
        return body.toString('utf-8')
    }

    /**
     * Set timer
     * @param {*} millisecond 
     */
    async timer(millisecond = null) {
        return new Promise((resolve) => setTimeout(resolve, millisecond))
    }

}