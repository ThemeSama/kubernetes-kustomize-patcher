import { CustomObjectsApi } from "@kubernetes/client-node";
import type { CustomObjectsApiListNamespacedCustomObjectRequest } from "@kubernetes/client-node";
import kc from "../kc.js";
import { now } from "../helper/date.js";

export const getDeploymentPatch = async (
  deploymentName: string,
  namespace: string
) => {
  const customApi = kc.makeApiClient(CustomObjectsApi);

  const customObjectRequest: CustomObjectsApiListNamespacedCustomObjectRequest =
    {
      group: "themesama.com",
      version: "v1alpha1",
      namespace,
      plural: "patchdeployments",
      labelSelector: `target-deployment=${deploymentName}`,
    };

  try {
    const res = await customApi.listNamespacedCustomObject(customObjectRequest);

    if (Array.isArray(res?.items) && res?.items.length) {
      return res?.items.sort((a: any, b: any) =>
        a?.metadata?.name > b?.metadata?.name ? 1 : -1
      );
    }
  } catch (err) {
    console.error(
      `${now()} [ERROR] There was a problem accessing PatchDeployment definitions!`,
      err
    );
  }

  return false;
};
