export interface HttpStatusCodeInfo {
  code: number;
  phrase: string;
  category: "1xx" | "2xx" | "3xx" | "4xx" | "5xx";
  summary: string;
  description: string;
  rfc: string;
  rfcUrl: string;
}

export const HTTP_STATUS_CODES: HttpStatusCodeInfo[] = [
  // 1xx
  {
    code: 100,
    phrase: "Continue",
    category: "1xx",
    summary: "Initial request received, client should proceed.",
    description:
      "The server has received the request headers and the client should proceed to send the request body.",
    rfc: "RFC 9110, 15.2.1",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.2.1",
  },
  {
    code: 101,
    phrase: "Switching Protocols",
    category: "1xx",
    summary: "Server agreed to change protocols (e.g. WebSocket).",
    description:
      "The requester has asked the server to switch protocols and the server has agreed to do so.",
    rfc: "RFC 9110, 15.2.2",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.2.2",
  },
  {
    code: 102,
    phrase: "Processing",
    category: "1xx",
    summary: "Server is processing request, but no response is available yet.",
    description:
      "Used to prevent the client from timing out while the server processes a long request.",
    rfc: "RFC 2518, 10.1",
    rfcUrl: "https://datatracker.ietf.org/doc/html/rfc2518#section-10.1",
  },
  {
    code: 103,
    phrase: "Early Hints",
    category: "1xx",
    summary: "Return headers before final HTTP message.",
    description:
      "Used to return some response headers before final HTTP message, useful for preload link headers.",
    rfc: "RFC 8297",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc8297",
  },

  // 2xx
  {
    code: 200,
    phrase: "OK",
    category: "2xx",
    summary: "Standard response for successful HTTP requests.",
    description:
      "The request has succeeded. The payload sent depends on the request method (GET, POST, PUT, DELETE).",
    rfc: "RFC 9110, 15.3.1",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.3.1",
  },
  {
    code: 201,
    phrase: "Created",
    category: "2xx",
    summary: "Request succeeded and a new resource was created.",
    description:
      "The request has been fulfilled and has resulted in one or more new resources being created.",
    rfc: "RFC 9110, 15.3.2",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.3.2",
  },
  {
    code: 202,
    phrase: "Accepted",
    category: "2xx",
    summary: "Request accepted for processing, but processing is not complete.",
    description:
      "The request has been accepted for processing, but the processing has not been completed.",
    rfc: "RFC 9110, 15.3.3",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.3.3",
  },
  {
    code: 204,
    phrase: "No Content",
    category: "2xx",
    summary: "Server fulfilled request, no content to return.",
    description:
      "The server has successfully fulfilled the request and there is no additional content to send in the response payload body.",
    rfc: "RFC 9110, 15.3.5",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.3.5",
  },
  {
    code: 206,
    phrase: "Partial Content",
    category: "2xx",
    summary: "Partial GET request served (e.g. video range).",
    description:
      "The server is delivering only part of the resource due to a Range header sent by the client.",
    rfc: "RFC 9110, 15.3.7",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.3.7",
  },

  // 3xx
  {
    code: 301,
    phrase: "Moved Permanently",
    category: "3xx",
    summary: "Resource permanently moved to a new URI.",
    description:
      "The target resource has been assigned a new permanent URI and any future references to this resource ought to use one of the enclosed URIs.",
    rfc: "RFC 9110, 15.4.2",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.4.2",
  },
  {
    code: 302,
    phrase: "Found",
    category: "3xx",
    summary: "Resource temporarily resides under a different URI.",
    description:
      "Tells the client to look at (browse to) another URL temporarily.",
    rfc: "RFC 9110, 15.4.3",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.4.3",
  },
  {
    code: 304,
    phrase: "Not Modified",
    category: "3xx",
    summary: "Cached version is up to date, re-use it.",
    description:
      "Indicates that the resource has not been modified since the version specified by the request headers If-Modified-Since or If-None-Match.",
    rfc: "RFC 9110, 15.4.5",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.4.5",
  },
  {
    code: 307,
    phrase: "Temporary Redirect",
    category: "3xx",
    summary: "Redirect with same HTTP method guaranteed.",
    description:
      "The target resource resides temporarily under a different URI and the user agent MUST NOT change the request method if it performs an automatic redirection.",
    rfc: "RFC 9110, 15.4.8",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.4.8",
  },
  {
    code: 308,
    phrase: "Permanent Redirect",
    category: "3xx",
    summary: "Permanent redirect with same HTTP method guaranteed.",
    description:
      "The target resource has been assigned a new permanent URI and any future references to this resource ought to use one of the enclosed URIs without changing the request method.",
    rfc: "RFC 9110, 15.4.9",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.4.9",
  },

  // 4xx
  {
    code: 400,
    phrase: "Bad Request",
    category: "4xx",
    summary: "Malformed request syntax or invalid parameters.",
    description:
      "The server cannot or will not process the request due to something that is perceived to be a client error.",
    rfc: "RFC 9110, 15.5.1",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.5.1",
  },
  {
    code: 401,
    phrase: "Unauthorized",
    category: "4xx",
    summary: "Authentication required or invalid credentials.",
    description:
      "The request has not been applied because it lacks valid authentication credentials for the target resource.",
    rfc: "RFC 9110, 15.5.2",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.5.2",
  },
  {
    code: 403,
    phrase: "Forbidden",
    category: "4xx",
    summary: "Server understood request, but refuses authorization.",
    description:
      "The server understood the request but refuses to authorize it. Unlike 401, re-authenticating will make no difference.",
    rfc: "RFC 9110, 15.5.4",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.5.4",
  },
  {
    code: 404,
    phrase: "Not Found",
    category: "4xx",
    summary: "Origin server cannot find current representation of resource.",
    description:
      "The origin server did not find a current representation for the target resource or is not willing to disclose that one exists.",
    rfc: "RFC 9110, 15.5.5",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.5.5",
  },
  {
    code: 405,
    phrase: "Method Not Allowed",
    category: "4xx",
    summary: "HTTP method not supported for target resource.",
    description:
      "The request method is known by the server but is not supported by the target resource (e.g. POST on a read-only endpoint).",
    rfc: "RFC 9110, 15.5.6",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.5.6",
  },
  {
    code: 409,
    phrase: "Conflict",
    category: "4xx",
    summary: "Request conflicts with current state of resource.",
    description:
      "The request could not be completed due to a conflict with the current state of the target resource (e.g. edit conflicts).",
    rfc: "RFC 9110, 15.5.10",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.5.10",
  },
  {
    code: 422,
    phrase: "Unprocessable Content",
    category: "4xx",
    summary: "Semantic or validation errors in request body.",
    description:
      "The server understands the content type and syntax is correct, but was unable to process the contained instructions.",
    rfc: "RFC 9110, 15.5.21",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.5.21",
  },
  {
    code: 429,
    phrase: "Too Many Requests",
    category: "4xx",
    summary: "Rate limit exceeded.",
    description:
      "The user has sent too many requests in a given amount of time (rate limiting).",
    rfc: "RFC 6585, 4",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc6585#section-4",
  },

  // 5xx
  {
    code: 500,
    phrase: "Internal Server Error",
    category: "5xx",
    summary: "Generic server failure encountered.",
    description:
      "The server encountered an unexpected condition that prevented it from fulfilling the request.",
    rfc: "RFC 9110, 15.6.1",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.6.1",
  },
  {
    code: 501,
    phrase: "Not Implemented",
    category: "5xx",
    summary: "Server does not recognize request method.",
    description:
      "The server does not support the functionality required to fulfill the request.",
    rfc: "RFC 9110, 15.6.2",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.6.2",
  },
  {
    code: 502,
    phrase: "Bad Gateway",
    category: "5xx",
    summary: "Invalid response received from upstream server.",
    description:
      "The server, while acting as a gateway or proxy, received an invalid response from the inbound server it accessed.",
    rfc: "RFC 9110, 15.6.3",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.6.3",
  },
  {
    code: 503,
    phrase: "Service Unavailable",
    category: "5xx",
    summary: "Server temporarily overloaded or down for maintenance.",
    description:
      "The server is currently unable to handle the request due to a temporary overload or scheduled maintenance.",
    rfc: "RFC 9110, 15.6.4",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.6.4",
  },
  {
    code: 504,
    phrase: "Gateway Timeout",
    category: "5xx",
    summary: "Upstream server failed to respond in time.",
    description:
      "The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server.",
    rfc: "RFC 9110, 15.6.5",
    rfcUrl: "https://www.rfc-editor.org/rfc/rfc9110#section-15.6.5",
  },
];
