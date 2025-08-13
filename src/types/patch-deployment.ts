export interface IPatchDeployment {
  type: string;
  namespace: string;
  name: string;
  patch: object;
}
