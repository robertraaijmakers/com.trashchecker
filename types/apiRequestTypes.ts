'use strict';

import https from 'https';
import { IncomingHttpHeaders } from 'http';

export interface HttpsPromiseOptions {
  body?: string | Buffer;
  hostname: string;
  path: string;
  method: string;
  headers?: { [key: string]: string | string[] | number };
  agent?: https.Agent;
  rejectUnauthorized?: boolean; // Optional for SSL/TLS validation
  family?: number; // Optional for IP address family
}

export interface HttpsPromiseResponse {
  body: string | object;
  headers: IncomingHttpHeaders;
}
