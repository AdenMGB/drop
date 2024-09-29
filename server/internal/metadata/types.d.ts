import { Developer, Publisher } from "@prisma/client";

export interface GameMetadataSearchResult {
    id: string;
    name: string;
    icon: string;
    description: string;
    year: number;
}

export interface GameMetadataSource {
    sourceId: string;
    sourceName: string;
}

export type InternalGameMetadataResult = GameMetadataSearchResult & GameMetadataSource;
export type RemoteObject = string;

export interface GameMetadata {
    name: string;
    shortDescription: string;
    description: string;

    // These are created using utility functions passed to the metadata loader
    // (that then call back into the metadata provider chain)
    publishers: Publisher[]
    developers: Developer[]

    reviewCount: number;
    reviewRating: number;

    // Created with another utility function
    icon: RemoteObject,
    banner: RemoteObject,
    art: RemoteObject[],
    screenshots: RemoteObject[],
}

export interface PublisherMetadata {
    name: string;
    shortDescription: string;
    description: string;

    logo: RemoteObject;
    banner: RemoteObject;
}

export type DeveloperMetadata = PublisherMetadata;

export interface _FetchGameMetadataParams {
    id: string,

    publisher: (query: string) => Promise<Publisher>
    developer: (query: string) => Promise<Developer>

    createObject: (url: string) => Promise<RemoteObject>
}

export interface _FetchPublisherMetadataParams {
    query: string;
    createObject: (url: string) => Promise<RemoteObject>;
}

export type _FetchDeveloperMetadataParams = _FetchPublisherMetadataParams;