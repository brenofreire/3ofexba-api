import TipoCampanha from "App/Models/TipoCampanha";

export default class TipoCampanhasController {
    async getTipoCampanhas() {
        const rawTipos = await TipoCampanha.all()
        const TiposCampanhaEnumReverso = {}
        
        const TiposCampanhaEnum = rawTipos.map(item => item.slug)
        rawTipos.map(item => {
            TiposCampanhaEnumReverso[item.slug] = item.nome
        })

        return { TiposCampanhaEnum, TiposCampanhaEnumReverso }
    }
}
