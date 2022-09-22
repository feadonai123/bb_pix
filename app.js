import * as dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";

class RequestHelper {
  static async doFetch({ url, method, data, header = {} }) {
    try {
      const 
        headers = {
          "Content-Type": "application/json",
          ...header,
        },
        response = await fetch(url, {
          method,
          headers,
          body:
            headers["Content-Type"] == "application/json"
              ? JSON.stringify(data)
              : data,
        }),
        status = response.status,
        json = await response.json();

      if (status > 299) throw json;

      return { success: true, data: json };
    } catch (e) {
      console.log("ERRO " + url, e);
      return {
        success: false,
        message: e.message || e.title || e.error || "",
        data: e,
      };
    }
  }

  static async get(url, header = {}) {
    return this.doFetch({ url, method: "GET", header });
  }

  static async post(url, data, header = {}) {
    return this.doFetch({ url, method: "POST", data, header });
  }

  static async put(url, data, header = {}) {
    return this.doFetch({ url, method: "PUT", data, header });
  }
}

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
      console.log('refresh token')
    }else{
      console.log('token valido')
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

(async () => {
  const pixDriver = new Pix("dev");

  const promiseCriarCobranca = pixDriver.criarCobranca({
    calendario: {
      expiracao: 36000,
    },
    devedor: {
      cpf: "12345678909",
      nome: "Francisco da Silva",
    },
    valor: {
      original: "1.45",
    },
    chave: process.env.CHAVE_PIX,
    solicitacaoPagador: "Cobrança dos serviços prestados.",
  });

  
  const inicio = new Date().getTime() - 4 * 24 * 60 * 60 * 1000,
    fim = new Date().getTime(),
    isoInicio = new Date(inicio).toISOString(),
    isoFim = new Date(fim).toISOString(),
    promiseConsultarPix = pixDriver.consultarPix(isoInicio, isoFim);

  const [criarCobranca, consultarPix] = await Promise.all([
    promiseCriarCobranca,
    promiseConsultarPix,
  ]);

  console.log("\n\n\n");
  if (criarCobranca.success) {
    console.log("Cobrança criada com sucesso");
    console.log(criarCobranca.data);
  } else console.log("Erro ao criar cobrança", criarCobranca.data);

  
  console.log("\n\n\n");
  if (consultarPix.success) {
    console.log("Pix consultado com sucesso");
    console.log(consultarPix.data)
    const { parametros, pix } = consultarPix.data;
    const { txid, valor, horario, pagador, infoPagador, endToEndId } = pix[0];
    const { cpf, cnpj, nome } = pagador;
  } else console.log("Erro ao consultar pix", consultarPix.data);

})();
