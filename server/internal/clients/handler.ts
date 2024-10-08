import { v4 as uuidv4 } from "uuid";
import { CertificateBundle } from "./ca";
import prisma from "../db/database";

export interface ClientMetadata {
  name: string;
  platform: string;
}

export class ClientHandler {
  private temporaryClientTable: {
    [key: string]: {
      timeout: NodeJS.Timeout;
      data: ClientMetadata;
      userId?: string;
      authToken?: string;
    };
  } = {};

  async initiate(metadata: ClientMetadata) {
    const clientId = uuidv4();

    this.temporaryClientTable[clientId] = {
      data: metadata,
      timeout: setTimeout(() => {
        if (this.temporaryClientTable[clientId])
          delete this.temporaryClientTable[clientId];
      }, 1000 * 60 * 10), // 10 minutes
    };

    return clientId;
  }

  async fetchClientMetadata(clientId: string) {
    return (await this.fetchClient(clientId))?.data;
  }

  async fetchClient(clientId: string) {
    const entry = this.temporaryClientTable[clientId];
    if (!entry) return undefined;
    return entry;
  }

  async attachUserId(clientId: string, userId: string) {
    if (!this.temporaryClientTable[clientId])
      throw new Error("Invalid clientId for attaching userId");
    this.temporaryClientTable[clientId].userId = userId;
  }

  async generateAuthToken(clientId: string) {
    const entry = this.temporaryClientTable[clientId];
    if (!entry) throw new Error("Invalid clientId to generate token");

    const token = uuidv4();
    this.temporaryClientTable[clientId].authToken = token;

    return token;
  }

  async fetchClientMetadataByToken(token: string) {
    return Object.entries(this.temporaryClientTable)
      .map((e) => Object.assign(e[1], { id: e[0] }))
      .find((e) => e.authToken === token);
  }

  async finialiseClient(id: string) {
    const metadata = this.temporaryClientTable[id];
    if (!metadata) throw new Error("Invalid client ID");
    if (!metadata.userId) throw new Error("Un-authorized client ID");

    return await prisma.client.create({
      data: {
        id: id,
        userId: metadata.userId,

        endpoint: "",
        capabilities: [],

        name: metadata.data.name,
        platform: metadata.data.platform,
        lastConnected: new Date(),
      },
    });
  }
}

export const clientHandler = new ClientHandler();
export default clientHandler;
