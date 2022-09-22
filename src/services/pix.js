import RequestHelper from "../utils/requestHelper.js";

class Pix {

  constructor(server = "dev") {
    this.urlPix = server == "dev" ? process.env.PIX_HOMOLOG_API : process.env.PIX_PROD_API;
    this.urlAuth = process.env.BB_AUTH;

    this.defaultQuery = {
      "gw-dev-app-key" : process.env.DEVELOPER_APPLICATION_KEY,
    }
    
    this.basicAuth = process.env.CLIENT_BASIC;
    this.token = "";
    this.expires_at = 0
  }

  async getToken(){
    if(this.expires_at < new Date().getTime()){
      await this.refreshToken()
    }
  }

  async refreshToken() {
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

    return { success, message, data };
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

    return { success, message, data };
  }

  async consultarPix(inicio, fim) {
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
    
    return { success, message, data };
  }
}

export default Pix;