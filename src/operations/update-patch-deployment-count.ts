import {
  CustomObjectsApi,
  CustomObjectsApiPatchNamespacedCustomObjectRequest,
} from "@kubernetes/client-node";
import { getDeploymentPatch } from "./get-deployment-patch.js";
import kc from "../kc.js";
import { now } from "../helper/date.js";

export const updatePatchDeploymentCount = async (
  deploymentName: string,
  namespace: string
) => {
  const customApi = kc.makeApiClient(CustomObjectsApi);

  try {
    const patchList = await getDeploymentPatch(deploymentName, namespace);

    if (Array.isArray(patchList) && patchList.length) {
      patchList.forEach(async (patch) => {
        const labels = patch?.metadata?.labels || {};
        const currentCount = parseInt(labels["patch-apply-count"] || "0", 10);

        const { name: resourceName } = patch?.metadata;

        const patchOperations = [
          {
            op: "add",
            path: "/metadata/labels/patch-apply-count",
            value: String(currentCount + 1),
          },
        ];

        const patchRequest: CustomObjectsApiPatchNamespacedCustomObjectRequest =
          {
            group: "themesama.com",
            version: "v1alpha1",
            plural: "patchdeployments",
            namespace,
            name: resourceName,
            body: patchOperations,
          };

        await customApi.patchNamespacedCustomObject(patchRequest);
      });
    }
  } catch (err) {
    console.error(`${now()} [ERROR] Error updating patch deployment:`, err);
  }
};
