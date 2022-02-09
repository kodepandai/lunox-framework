import type { ObjectOf } from "../../Types";

export interface HttpExceptionInterface {
    getStatusCode(): number
    getHeaders(): ObjectOf<any>
    getPrevious(): Error|null
}