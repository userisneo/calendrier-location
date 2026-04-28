const https = require("https");
const http  = require("http");

exports.handler = async function(event) {
  const url = event.queryStringParameters && event.queryStringParameters.url;

  if (!url) {
    return {
      statusCode: 400,
      body: "Paramètre 'url' manquant"
    };
  }

  try {
    const text = await fetchUrl(url);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      },
      body: text
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: "Erreur : " + err.message
    };
  }
};

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    lib.get(url, (res) => {
      // Gérer les redirections (301/302)
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error("HTTP " + res.statusCode));
      }
      let data = "";
      res.setEncoding("utf8");
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
      res.on("error", reject);
    }).on("error", reject);
  });
}
