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
      return {
        success: false,
        message: e.message || e.title || e.error || e.razao || "",
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

  static async patch(url, data, header = {}) {
    return this.doFetch({ url, method: "PATCH", data, header });
  }
}

export default RequestHelper;