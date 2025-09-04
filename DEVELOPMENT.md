# Kubernetes Kustomize Patcher Development Guide

To set up a local development environment, follow the steps below.

## Install Dependencies

npm is preferred for the development environment. You can choose to use other package managers if you prefer.

```bash
npm install
```

## Run

To test on the Kubernetes cluster in your development environment, first perform the installation using the Helm chart. You can follow the instructions in the README.md file. Once the installation is complete, you need to update the "kustomize-patcher-webhook" definition within the Mutating Webhook Configs.

Since the Mutating Webhook service must run over HTTPS, you need to configure an SSL certificate for your local Express project. You can simplify this process by using the ngrok service.

You need to remove the service definitions in the `clientConfig` of the `kustomize-patcher-webhook` and add the `clientConfig.url` setting. Additionally, you should remove the `cert-manager.io/inject-ca-from` and `certmanager.k8s.io/inject-ca-from` entries in `metadata.annotations` since you are managing SSL yourself.

```yaml
webhooks:
  - name: kustomize-patcher.themesama.com
    clientConfig:
      url: https://xxx.ngrok-free.app/mutate
```

Now, on a terminal with access to the local Kubernetes context, run the following command.

```
npm run debug
```

When the webhooks are triggered, the `mutate` endpoint of your Express application will be invoked, and your changes will be applied.

## Image build

```
docker buildx build --platform linux/amd64,linux/arm64 -t ghcr.io/themesama/kubernetes-kustomize-patcher:latest --push .
```