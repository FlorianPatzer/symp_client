import { ITragetSystem } from "./ITragetSystem";

export interface IAnalysis {
    _id?: string,
    name: string,
    createdBy?: string,
    createdAt?: Date,
    description: string,
    targetSystemId: string,
    template: String,
    engineURI: String,
    containedPolicies: String[]
}