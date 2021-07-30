import { Type } from "@angular/core";

export interface ITemplate {
    name: string,
    key: string,
    component: Type<any>
}