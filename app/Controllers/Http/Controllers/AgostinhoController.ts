import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AgostinhoController {
    public async enviarMensagem({ request, response }: HttpContextContract) {        
        return response.ok(request.all())
    }
}
