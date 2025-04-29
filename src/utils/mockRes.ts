import { NextApiResponse } from "next";
// utils/mockRes.ts

export interface MockNextApiResponse {
    statusCode: number;
    _json?: any;
    _send?: any;
    status: (code: number) => MockNextApiResponse;
    json: (data: any) => MockNextApiResponse;
    send: (data: any) => MockNextApiResponse;
  }
  
  export function createMockRes(): MockNextApiResponse {
    return {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this._json = data;
        return this;
      },
      send(data) {
        this._send = data;
        return this;
      },
    };
  }
  