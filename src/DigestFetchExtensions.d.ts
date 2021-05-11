import * as DigestFetch from "digest-fetch";

declare namespace DigestFetchExtensions {
    interface TypedDigestFetch extends DigestFetch {
        fetch: (url: string, options?: {
            // These properties are part of the Fetch Standard
            method?: "GET" | "POST" | "DELETE",
            headers?: { },
            body?: string | Buffer | Blob | ReadableStream,
            redirect?: "follow" | "manual" | "error",
            signal?: null | AbortSignal,
        }) => Promise<Response>;
    }
    interface Body extends DigestFetch.Body {
        body: ReadableStream,
        bodyUsed: boolean,
        arrayBuffer: () => Promise<ArrayBuffer>,
        blob: () => Promise<Blob>,
        json: () => Promise<string>,
        text: () => Promise<string>,
        buffer: () => Promise<Buffer>
    }
    interface Response extends DigestFetch.Response, Body {
        ok: boolean,
        redirected: boolean,
        type: "default" | "error",
        status: number,
    }
}

export = DigestFetchExtensions;
