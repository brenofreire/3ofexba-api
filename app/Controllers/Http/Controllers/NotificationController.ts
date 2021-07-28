import { UserCargos } from 'App/Utils/Utils'
import Usuario from 'App/Models/Usuario'
import UserNotificationToken from 'App/Models/UserNotificationToken'

const webpush = require('web-push')

const vapidKeys = {
  publicKey: 'BD93KEBZ7QFBg6neYY1RI84GSFivqp8qE5XhntkNdgfbQx9EObCPzb04Wpit3GG-hdv6djuvpennntN2jU0KgUE',
  privateKey: 'IDroJ2FHS4UholEPbU3QPtOLbM3DnTIu6P95H26OUuE',
}

webpush.setVapidDetails('https://agostinho.net.br', vapidKeys.publicKey, vapidKeys.privateKey)

export default class TarefasController {
  async sendNewsletter(cargos: UserCargos[]) {
    return new Promise(async (resolve, reject) => {
      const allSubscriptions = await this.getUsersToSendNotification(cargos)

      const notificationPayload = {
        notification: {
          title: 'Chegou mensagem do Agostinho!',
          body: 'Newsletter Available!',
          // icon: '/assets/main-page-logo-small-hat.png',
          vibrate: [100, 50, 100],
          data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
          },
          actions: [
            {
              action: 'explore',
              title: 'Ir pro app!',
            },
          ],
        },
      }

      console.log({ allSubscriptions, notificationPayload })

      Promise.all(allSubscriptions.map((sub) => webpush.sendNotification(sub.token, JSON.stringify(notificationPayload))))
        .then(() => resolve({ message: 'Newsletter sent successfully.' }))
        .catch((err) => reject('Error sending notification, reason: ' + err))
    })
  }

  async getUsersToSendNotification(cargos: UserCargos[]) {
    const extract = (arr: Usuario[]) => {
      return arr.map((userItem) => userItem.idDm)
    }

    try {
      const dmsIds = extract(await Usuario.query().select('id_dm').whereIn('cargo', cargos).andWhere({ status: 1 }))
      const tokens = await UserNotificationToken.query().where('userId', dmsIds)

      console.log({ dmsIds, tokens })

      return tokens
    } catch (error) {
      throw error
    }
  }
}
