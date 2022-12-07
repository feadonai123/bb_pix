import RequestHelper from "../utils/requestHelper.js";

class Pix {

  urlHomolog = "https://api.hm.bb.com.br/pix/v1"
  urlProd = "https://api.bb.com.br/pix/v1"
  urlAuth = "https://oauth.hm.bb.com.br"
  apiSimularPagamento = "https://api.hm.bb.com.br/testes-portal-desenvolvedor/v1"
  loading = false
  expires_at = 0
  token = ""

  constructor({
    ambiente = "dev",
    appKey = process.env.DEVELOPER_APPLICATION_KEY,
    clientBasic = process.env.CLIENT_BASIC
  }) {
    this.urlPix = ambiente == "dev" ? this.urlHomolog : this.urlProd;
    this.defaultQuery = { "gw-dev-app-key" : appKey }
    this.basicAuth = clientBasic;
  }

  async getToken(){
    while(this.loading) await new Promise(resolve => setTimeout(resolve, 1000));
    if(this.expires_at < new Date().getTime() && !this.loading){
      await this.refreshToken()
    }
  }

  async refreshToken() {
    this.loading = true
    const 
      url = `${this.urlAuth}/oauth/token`,
      body = {
        grant_type: "client_credentials",
        scope: "cob.read cob.write pix.read pix.write",
      },
      bodyFormated = new URLSearchParams(body),
      header = {
        "Authorization": `Basic ${this.basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      { success, message, data } = await RequestHelper.post(
        url,
        bodyFormated,
        header
      ),
      { expires_in, token_type, access_token } = data;

    if (success) {
      this.token = access_token;
      this.expires_at = new Date().getTime() + expires_in * 1000;
    }

    this.loading = false
    if(!success) throw new Error(message)
    return data;
  }

  async criarCobrancaQRCODE(dataSend) {
    await this.getToken()
    const 
      txid = "",
      body = dataSend,
      header = {
        Authorization: `Bearer ${this.token}`,
      },
      query = this.defaultQuery,
      queryFormat = new URLSearchParams(query),
      url = `${this.urlPix}/cobqrcode/${txid}?${queryFormat}`,
      { success, message, data } = await RequestHelper.put(url, body, header);

    if(!success) throw new Error(message)
    return data;
  }

  async criarCobranca(dataSend) {
    await this.getToken()
    const 
      txid = "",
      body = dataSend,
      header = {
        Authorization: `Bearer ${this.token}`,
      },
      query = this.defaultQuery,
      queryFormat = new URLSearchParams(query),
      url = `${this.urlPix}/cob/${txid}?${queryFormat}`,
      { success, message, data } = await RequestHelper.put(url, body, header);

    if(!success) throw new Error(message)
    return data;
  }

  async atualizarCobranca(txid, newData) {
    await this.getToken()
    const 
      body = newData,
      header = {
        Authorization: `Bearer ${this.token}`,
      },
      query = this.defaultQuery,
      queryFormat = new URLSearchParams(query),
      url = `${this.urlPix}/cob/${txid}?${queryFormat}`,
      { success, message, data } = await RequestHelper.patch(url, body, header);

    if(!success) throw new Error(message)
    return data;
  }

  async consultarCobrancaPorTxid(txid) {
    await this.getToken()
    const 
      header = {
        Authorization: `Bearer ${this.token}`,
      },
      query = this.defaultQuery,
      queryFormat = new URLSearchParams(query),
      url = `${this.urlPix}/cob/${txid}?${queryFormat}`,
      { success, message, data } = await RequestHelper.get(url, header);

    if(!success) throw new Error(message)
    return data;
  }

  async consultarPixRecebidos(inicio, fim) {
    /*
      diferença entre inicio e fim deve ser menor que 5 dias
    */
    await this.getToken()
    const 
      query = {
        ...this.defaultQuery,
        inicio,
        fim,
        paginaAtual: 0,
      },
      queryFormat = new URLSearchParams(query),
      header = {
        Authorization: `Bearer ${this.token}`,
      },
      url = `${this.urlPix}?${queryFormat}`,
      { success, message, data } = await RequestHelper.get(url, header);
    
    if(!success) throw new Error(message)
    return data;
  }

  async consultarPixPorE2EId(e2eid) {
    await this.getToken()
    const 
      query = this.defaultQuery,
      queryFormat = new URLSearchParams(query),
      header = {
        Authorization: `Bearer ${this.token}`,
      },
      url = `${this.urlPix}/pix/${e2eid}?${queryFormat}`,
      { success, message, data } = await RequestHelper.get(url, header);
    
    if(!success) throw new Error(message)
    return data;
  }

  async simularPagamento(textoImagemQRcode){
    await this.getToken()
    const 
      body = {
        pix: textoImagemQRcode,
      },
      query = this.defaultQuery,
      queryFormat = new URLSearchParams(query),
      url = `${this.apiSimularPagamento}/boletos-pix/pagar?${queryFormat}`

    let success = false, data, message, cont = 0
    while(!success && cont < 5){
      const response = await RequestHelper.post(url, body);
      success = response.success
      data = response.data
      message = response.message
      cont ++
    }
    
    if(!success) throw new Error(message)
    return data;
  }
}

export default Pix;