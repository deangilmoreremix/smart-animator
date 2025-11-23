var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/gemini-generate.ts
var gemini_generate_exports = {};
__export(gemini_generate_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(gemini_generate_exports);
var handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not configured" })
    };
  }
  try {
    const { endpoint, method = "GET", body: requestBody } = JSON.parse(event.body || "{}");
    if (!endpoint) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Endpoint is required" })
      };
    }
    const url = `${endpoint}${endpoint.includes("?") ? "&" : "?"}key=${GEMINI_API_KEY}`;
    const options = {
      method,
      headers: {
        "Content-Type": "application/json"
      }
    };
    if (requestBody && method !== "GET") {
      options.body = JSON.stringify(requestBody);
    }
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type");
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      console.error("Empty response from Gemini API");
      return {
        statusCode: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          error: "Empty response from Gemini API",
          status: response.status
        })
      };
    }
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Non-JSON response from Gemini API:", text.substring(0, 200));
      return {
        statusCode: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          error: "Invalid response type from Gemini API",
          contentType,
          preview: text.substring(0, 200)
        })
      };
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Gemini API response:", parseError, text.substring(0, 200));
      return {
        statusCode: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          error: "Failed to parse Gemini API response",
          message: parseError instanceof Error ? parseError.message : "Unknown error",
          preview: text.substring(0, 200)
        })
      };
    }
    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to process request",
        message: error instanceof Error ? error.message : "Unknown error"
      })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
