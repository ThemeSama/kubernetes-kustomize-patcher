import { KubeConfig } from "@kubernetes/client-node";

const kc = new KubeConfig();
kc.loadFromDefault();

export default kc;
