---
title: Traefik as an ingress controller on minikube with kustomize & helm
date: "2019-07-17T07:31:00.169Z"
description: "I wanted to mess around with skaffold and do it with a clean minikube setup. And by clean I mean one where I can access my services locally via a nice hostname like myservice.dev. I am quite…"
published: true
tags: ["kubernetes"]
language: english
---

I wanted to mess around with [skaffold](https://skaffold.dev/) and do it with a clean minikube setup. And by clean I mean one where I can access my services locally via a nice hostname like myservice.dev.

I am quite acquainted with [traefik](https://containo.us/traefik/) as an ingress controller on Kubernetes so I went for it and found some super interesting resources and a quite appealing way to do it. Let's dive in!

## Requirements

To get the best of this article, you need to know your Kubernetes, understand why an ingress controller is needed and why it can be a bit painful on minikube.

You also need a setup minikube running with kubernetes > 1.14 to take advantage of kustomize integrated.

## What do we need to have an ingress controller?

You need:

- the ingress controller itself: traefik in our case
- traefik must have a `javascript›NET_BIND_SERVICE` Security Context Capability in its DaemonSet or Deployment pod specs
- finally traefik must specify hostPort for each of its ports

## Where do we begin?

We don't want to reinvent the wheel, so we need the official helm chart.

However [its values](https://github.com/helm/charts/blob/master/stable/traefik/values.yaml) do not map to our need to have hostPorts and `javascript›NET_BIND_SERVICE` which is quite normal since it is a very specific need related to the fact that we use minikube.

This is where I found this [amazing article](https://testingclouds.wordpress.com/2018/07/20/844/) combining [helm](https://helm.sh/) and [kustomize](https://kustomize.io/).

In essence, we will use helm template with a custom values.yaml that we will then pass to kustomize.

Note: we could have used patch files but kustomize's ability to [merge and manipulate fields through paths](https://kubectl.docs.kubernetes.io/pages/app_customization/customizing_arbitrary_fields.html) is way cleaner than a patch file!

## The magic ✨

```yaml:title=values.yaml {numberLines: true}
# Cf. https://github.com/helm/charts/blob/master/stable/traefik/values.yaml
rbac:
  enabled: true
dashboard:
  enabled: true
  domain: traefik.local.minikube.com
  serviceType: NodePort
serviceType: NodePort
```

```shell:title=helm-template-to-native-k8s-resource.sh {numberLines: true}
# Pre-requisite:
# - You have minikube with kubernetes > 1.14 up & running
# - You have setup tiller on minikube
# - You **don't** have enabled the minikube ingress addon
# - You have kubectl > 1.14

# We need to have a copy of the helm chart locally
helm fetch --untar --untardir chart 'stable/traefik'

# We then export the template as native Kurbenetes resources
helm template \
    --namespace kube-system \
    --values 0--values.yaml \
    --name traefik-ingress-controller \
    helm/traefik/chart/traefik > traefik-helm-template.yaml
```

```yaml:title=kustomization.yaml {numberLines: true}
# This is where the magic happens ✨
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
- traefik-helm-template.yaml
patches:
- minikube-ingress-controller-patch.yaml
patchesJson6902:
- target:
    group: apps
    version: v1
    kind: Deployment
    name: traefik-ingress-controller
  path: delete-useless-fields.yaml
```

```yaml:title=minikube-ingress-controller-patch.yaml {numberLines: true}
# This file will add hostPorts and NET_BIND_SERVICE Security Context Capability
apiVersion: apps/v1
kind: Deployment
metadata:
  name: traefik-ingress-controller
spec:
  template:
    spec:
      containers:
      - name: traefik-ingress-controller
        ports:
        - containerPort: 80
          hostPort: 80
        - containerPort: 8880
          hostPort: 8880
        - containerPort: 443
          hostPort: 443
        - containerPort: 8080
          hostPort: 8080
        securityContext:
          capabilities:
            drop:
            - ALL
            add:
            - NET_BIND_SERVICE
```

```yaml:title=delete-useless-fields.yaml {numberLines: true}

# Cf. https://kubectl.docs.kubernetes.io/pages/app_customization/customizing_arbitrary_fields.html
# This path deletes fields that we don't need using "patchesJson6902"
# The syntax is not intuitive but the proposed standard (https://tools.ietf.org/html/rfc6902) is enough to get things done

# This operation removes the port 8880 (index 1)
- op: remove
  path: /spec/template/spec/containers/0/ports/1

# Careful: each operation is done sequentially so you have
#          to take into account the operations before to determine
#          how to manipulate paths
# In our example we wanted to delete the port 8080 below (index 3)
# but its the index has changed since the index 1 has been deleted above
- op: remove
  path: /spec/template/spec/containers/0/ports/2
```

Everything is set up, we will now apply the base helm chart and the patches we declared with `shell›kubectl apply --kustomize .`.
