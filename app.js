import * as dotenv from 'dotenv'
dotenv.config()
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

class RequestHelper {
  static async post(url, data, header = {}) {
    try {
      const 
        headers = {
          'Content-Type': 'application/json',
          ...header,
        },
        response = await fetch(url, {
          method: "POST",
          headers,
          body: data,
        }),
        status = response.status,
        json = await response.json();

      if (status > 299) throw json;

      return { success: true, data: json };
    } catch (e) {
      return {
        success: false,
        message: e.message || e.title || e.error || "Erro desconhecido",
        data: e,
      };
    }
  }

  static async put(url, data, header = {}) {
    try {
      const 
        headers = {
          'Content-Type': 'application/json',
          ...header,
        },
        response = await fetch(url, {
          method: "PUT",
          headers,
          body: data,
        }),
        status = response.status,
        json = await response.json();

      if (status > 299) throw json;

      return { success: true, data: json };
    } catch (e) {
      return {
        success: false,
        message: e.message || e.title || e.error || "Erro desconhecido",
        data: e,
      };
    }
  }
}

class Pix {
  constructor() {
    this.gwDevAppKey = process.env.DEVELOPER_APPLICATION_KEY
    this.urlPix = process.env.PIX_HOMOLOG_API
    this.bbAuth = process.env.BB_AUTH
    this.basicAuth = process.env.CLIENT_BASIC
    this.token = ""
  }

  async init() {
    const 
      url = `${this.bbAuth}/oauth/token`,
      body = new URLSearchParams({
        "grant_type": "client_credentials",
        "scope": "cob.read cob.write pix.read pix.write",
      }),
      header = {
        "Authorization": `Basic ${this.basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      { success, message, data } = await RequestHelper.post(url, body, header),
      { expires_in, token_type, access_token } = data

    if (success) this.token = access_token
    
    return { success, message, data }
  }

  async criarCobranca(dataSend) {
    const
      txid = uuidv4().slice(0, 20),
      url = `${this.urlPix}/cob/${txid}?gw-dev-app-key=${this.gwDevAppKey}`,
      body = JSON.stringify(dataSend),
      header = {
        "Authorization": `Bearer ${this.token}`
      },
      { success, message, data } = await RequestHelper.put(url, body, header)
    
    return { success, message, data }
  }
}

(async()=>{
  const pixDriver = new Pix()
  await pixDriver.init()

  const response = await pixDriver.criarCobranca({
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
    chave: "28779295827",
    solicitacaoPagador: "Cobrança dos serviços prestados.",
  })
  console.log(response)
})()