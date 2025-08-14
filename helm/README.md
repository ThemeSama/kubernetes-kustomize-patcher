# kustomize-patcher

[kustomize-patcher](https://github.com/ThemeSama/kubernetes-kustomize-patcher) A simple mutating Webhooks tool for applying custom patches to Deployment definitions within Kubernetes.

If you are working with multiple clusters and their system resources differ, you can patch your Deployment definitions per cluster via GitOps. For example, if your server resources differ in your business continuity or disaster recovery center and you cannot run all your applications on other clusters due to insufficient resources, the solution is either to patch your Deployment definitions or convert all your projects into Helm charts. The choice is yours :)

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![AppVersion: latest](https://img.shields.io/badge/AppVersion-latest-informational?style=flat-square)

This chart bootstraps an kustomize-patcher deployment on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Requirements

- Kubernetes: `>=1.28.0-0`
- cert-manager: `>=v1.12.0-0`

## Get Repo Info

```console
helm repo add kustomize-patcher https://themesama.github.io/kubernetes-kustomize-patcher/helm/
helm repo update
```

## Install Chart

```console
helm install [RELEASE_NAME] kustomize-patcher
```

The command deploys kustomize-patcher on the Kubernetes cluster in the default configuration.

_See [configuration](#configuration) below._

_See [helm install](https://helm.sh/docs/helm/helm_install/) for command documentation._

## Usage

For example, if you need to apply a patch to a previously deployed or newly added Deployment definition, you must add certain PatchDeployment definitions to ensure the patch is reflected before the change.

For example:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          ports:
            - containerPort: 80
          resources:
            limits:
              cpu: "0.5"
              memory: "512Mi"
            requests:
              cpu: "0.2"
              memory: "256Mi"

---
apiVersion: themesama.com/v1alpha1
kind: PatchDeployment
metadata:
  name: nginx-resources
  labels:
    target-deployment: "nginx-deployment"
spec:
  patch:
    spec:
      template:
        spec:
          containers:
            - name: nginx
              resources: # change container resources
                limits:
                  cpu: "200m"
                  memory: "256Mi"
                requests:
                  cpu: "100m"
                  memory: "128Mi"
---
apiVersion: themesama.com/v1alpha1
kind: PatchDeployment
metadata:
  name: nginx-x-replicas
  labels:
    target-deployment: "nginx-deployment"
spec:
  patch:
    spec:
      replicas: 7 # inc replica count
```

- Patches are applied sequentially according to the PatchDeployment name.
- For pods containing multiple containers, it is recommended to maintain the definition order.

## Uninstall Chart

```console
helm uninstall [RELEASE_NAME]
```

This removes all the Kubernetes components associated with the chart and deletes the release.

_See [helm uninstall](https://helm.sh/docs/helm/helm_uninstall/) for command documentation._

## Upgrading Chart

```console
helm upgrade [RELEASE_NAME] [CHART] --install
```

_See [helm upgrade](https://helm.sh/docs/helm/helm_upgrade/) for command documentation._

## Configuration

See [Customizing the Chart Before Installing](https://helm.sh/docs/intro/using_helm/#customizing-the-chart-before-installing). To see all configurable options with detailed comments, visit the chart's [values.yaml](./values.yaml), or run these configuration commands:

```console
helm show values kustomize-patcher/kustomize-patcher
```

#### Required Tools
It should be possible to use [cert-manager/cert-manager](https://github.com/cert-manager/cert-manager) if a more complete solution is required.

Please ensure that cert-manager is correctly installed and configured.

## Values

| **Key** | **Type** | **Default** | **Description** |
|---------|----------|------------|-----------------|
| `image.repository` | string | `ghcr.io/themesama/kubernetes-kustomize-patcher` | The container image repository for the Kustomize Patcher webhook. |
| `image.tag` | string | `latest` | The tag of the container image to use. |
| `image.pullPolicy` | string | `Always` | The image pull policy (`Always`, `IfNotPresent`, `Never`). |
| `replicaCount` | int | `1` | Number of replicas to deploy for the webhook. |
| `service.port` | int | `443` | The port on which the webhook service will listen. |
| `certificate.secretName` | string | `kustomize-patcher-webhook-cert` | Name of the Kubernetes Secret containing the TLS certificate for the webhook. |
| `webhook.timeoutSeconds` | int | `5` | Timeout in seconds for webhook requests. |
| `webhook.failurePolicy` | string | `Ignore` | Policy to follow if the webhook fails (`Ignore` or `Fail`). |
| `certManager.enabled` | bool | `true` | Enable or disable Cert-Manager integration for managing certificates. |
| `certManager.rootCert.duration` | string | `43800h0m0s` | Duration for which the root certificate is valid. |
| `certManager.rootCert.revisionHistoryLimit` | int | `0` | Number of previous root certificate revisions to retain. |
| `certManager.admissionCert.duration` | string | `8760h0m0s` | Duration for which the admission webhook certificate is valid. |
| `certManager.admissionCert.revisionHistoryLimit` | int | `0` | Number of previous admission certificates to retain. |
| `certManager.issuerRef` | object | `{}` | Reference to the Cert-Manager issuer used to sign certificates. |
| `serviceAccount.create` | bool | `true` | Whether to create a new ServiceAccount for the webhook. |
| `serviceAccount.name` | string | `kustomize-patcher-sa` | Name of the ServiceAccount to use. |
| `livenessProbe.initialDelaySeconds` | int | `10` | Initial delay before starting the liveness probe. |
| `livenessProbe.periodSeconds` | int | `10` | How often to perform the liveness probe. |
| `livenessProbe.timeoutSeconds` | int | `1` | Timeout for the liveness probe request. |
| `livenessProbe.successThreshold` | int | `1` | Minimum consecutive successes for the probe to be considered successful. |
| `livenessProbe.failureThreshold` | int | `5` | Minimum consecutive failures for the probe to be considered failed. |
| `readinessProbe.initialDelaySeconds` | int | `10` | Initial delay before starting the readiness probe. |
| `readinessProbe.periodSeconds` | int | `10` | How often to perform the readiness probe. |
| `readinessProbe.timeoutSeconds` | int | `1` | Timeout for the readiness probe request. |
| `readinessProbe.successThreshold` | int | `1` | Minimum consecutive successes for the probe to be considered ready. |
| `readinessProbe.failureThreshold` | int | `3` | Minimum consecutive failures for the probe to be considered not ready. |
