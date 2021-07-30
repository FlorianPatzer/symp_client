export interface IPolicy{
  id: number,
  uri: string,
  localName: string,
  modelLink: string,
  description: string,
  lastChanged: Date,
  policyUrl?: string,
}