---
title: Comprendre et manipuler son contexte Kubernetes
date: "2024-02-09T09:57:21.682Z"
description: "On creuse le concept de contexte local Kubernetes et on s’outille pour simplifier son utilisation."
published: true
tags: ["kubernetes", "productivity"]
language: french
socialStaticImageName: computer-with-terminal.png
---

## Introduction

Tu sais changer de cluster et de namespace avec ton client `kubectl` mais tu ne sais pas ce qu’il se passe sous le capot ? Je te propose de creuser le concept de contexte Kubernetes et d’adopter un outil fort pratique.

## Configuration du client

Tout d’abord, utilisons les bons mots : la notion de contexte n’a de sens qu’avec un client ; le premier qui vient en tête est `kubectl` mais il y en a bien d’autre : le [SDK Python](https://github.com/kubernetes-client/python), [celui de golang](https://github.com/kubernetes/client-go), etc.

Chacun de ces clients va utiliser la “*kube config*”. Par défaut, elle se trouve dans `$HOME/.kube/config` et cet emplacement peut être écrasé par la variable d’environnement `KUBECONFIG`.

Voyons ensemble de quoi est composée cette “*kube config*” :

```yaml
# l'API & le type de la ressource,
# comme toute ressource Kubernetes digne de ce nom !
apiVersion: v1
kind: Config

# La liste des clusters
clusters: []

# La liste des identités
users: []

# La liste des contextes
contexts: []

# Le contexte courant
current-context: ""
```

### Les identités

Ici, je parle exprès d’*identité* et pas d’*utilisateur* : lorsqu’on utilise un client Kubernetes, on peut revêtir plusieurs types d’identité :

- celle d’un simple utilisateur avec un certificat stocké localement
- celle d’un utilisateur provenant d’un “annuaire” d’entreprise (eg. [Google Groups pour RBAC](https://cloud.google.com/kubernetes-engine/docs/how-to/google-groups-rbac?hl=fr) ou [Microsoft Entra avec AKS](https://learn.microsoft.com/fr-fr/azure/aks/azure-ad-integration-cli))
- celle d’un compte de service

Un compte de service ou *service account* est un utilisateur “machine” : c’est, par exemple, votre outil d’intégration continue (GitHub Actions, Drone CI, GitLab CI, etc.) qui va revêtir l'identité d'un compte de service pour y déployer une application.

Généralement, sauf utilisation avancée, vous allez principalement interagir avec votre client Kubernetes via un utilisateur simple ou un utilisateur “d’annuaire”.

### Les clusters

Dans cette section, on configure les clusters avec lesquels on souhaite interagir. On y voit souvent une adresse pointant vers l’*API server* du cluster avec des métadonnées de connexion (*certificate authority*, configuration TLS, etc.).

### Les contextes

On entre dans le vif du sujet : le contexte est une entité tripartite qui forme un lien entre :

- une identité (eg. `francis@xyz.fr`)
- un cluster (eg. `xyz-europe1-production`)
- un namespace (eg. `car-api`)

En résumé, le contexte, c’est une glue entre ces 3 infos et ce que tu vas principalement utiliser de ta *kube config*.

### Le contexte courant

Le contexte courant ou `current-context` est un pointeur vers un des contextes déclarés.

Le contexte courant est **global** : tous les clients à un instant T utiliseront le même contexte courant s'ils ne le précisent pas (par exemple via `--context=CONTEXT` pour `kubectl`).

### Le namespace courant

C’est contre-intuitif mais **il n’existe pas de namespace courant**.

En réalité, le namespace est configuré à l’échelle de chaque cluster et c’est le `current-context` qui configure le contexte courant et donc le cluster courant et son namespace.

## Configuration de ton cluster

Ta solution Kubernetes (Minikube, Google Cloud GKE, Azure AKS, Amazon EKS, etc.) doit normalement te charger le cluster et l’identité avec un contexte par défaut dans la *kube config* : je te laisse le soin de te documenter en fonction de ton environnement.

Par exemple, chez Google Cloud Platform (GCP), pour ajouter ou modifier les informations de connexion au cluster, `gcloud` va modifier ta *kube config* grâce à `gcloud container clusters get-credentials [...]`.

Et si tu as envie d’expérimenter, je t’invite à utiliser [minikube](https://kubernetes.io/fr/docs/tasks/tools/install-minikube/).

## Manipule ton contexte

Prenons un exemple de 2 clusters et un utilisateur ainsi que 2 contextes :

```yaml
clusters:
- name: xyz-eu1-production
- name: xyz-eu4-integration

users:
- name: francis

contexts:
- context:
    cluster: xyz-eu1-production
    user: francis
    namespace: car-api
  name: plv_xyz_eu1_production
- context:
    cluster: xyz-eu4-integration
    user: francis
    namespace: driver-app
  name: fwy_xyz_eu4_integration
current-context: fwy_xyz_eu4_integration
```

Regardons ce que nous dit `kubectl` :

```bash
kubectl config get-contexts
# CURRENT NAME                    CLUSTER             AUTHINFO NAMESPACE
# *       fwy_xyz_eu4_integration xyz-eu4-integration francis  driver-app
#         plv_xyz_eu1_production  xyz-eu1-production  francis  car-api

kubectl config current-context
# fwy_xyz_eu4_integration
```

Changeons, à présent de contexte :

```bash
kubectl config use-context plv_xyz_eu1_production
# Switched to context "plv_xyz_eu1_production".

kubectl config current-context
# plv_xyz_eu1_production
```

Tentons, maintenant, de connaître le namespace de ton contexte courant :

```bash
kubectl config view --minify -o jsonpath='{..namespace}'
# car-api
```

Cette commande est un peu cryptique, je te l’explique :

- `kubectl config view` : montre la configuration actuelle
- `--minify` : Retire toute information qui n’est pas lié au contexte courant
- `-o jsonpath={}` : donne-moi un retour en utilisant [le format JSONPath](https://kubernetes.io/docs/reference/kubectl/jsonpath/)
- `jsonpath='{..namespace}'` : descend recursivement jusqu’à trouver un attribut `namespace`

Pour finir, changeons de namespace :

```bash
kubectl config set-context --current --namespace=driver-api
# Context "plv_xyz_eu1_production" modified.

kubectl config view --minify -o jsonpath='{..namespace}'
# driver-api
```

## Simplifions-nous la vie

Je te propose d'utiliser quelques outils afin de simplifier ton workflow pour qu'il ressemble à ceci :

![kubectx with FZF](/images/comprendre-et-manipuler-son-contexte-kubernetes-local/kubectx-with-fzf.gif)

Ici, on utilise [kubectx](https://github.com/ahmetb/kubectx), [fzf](https://github.com/junegunn/fzf), la notion de [plugin kubectl](https://kubernetes.io/docs/tasks/extend-kubectl/kubectl-plugins/) et un simple alias.

Je te propose :

- d'installer [fzf](https://github.com/junegunn/fzf)
- d'installer [kubectx](https://github.com/ahmetb/kubectx)
- de créer 2 plugins `kubectl` très simples :

  ```shell
  ln -s /usr/local/bin/kubectx /usr/local/bin/kubectl-tx
  ln -s /usr/local/bin/kubens /usr/local/bin/kubectl-ns
  ```
- de créer un simple alias : `alias k=kubectl`

Tu as, peut-être, remarqué que le cluster et le namespace ne s'affichent que lorsque je tape `k` ou `kubectl` dans mon prompt ? Je t'explique ça dans mon article sur [powerlevel10k, un prompt simple mais puissant](../powerlevel10k-un-prompt-simple-mais-puissant/).

## Pour aller encore plus loin...

Tu as, à présent, une bonne compréhension de la notion de contexte et un workflow de gestion de contexte Kubernetes fluide.

Mais il reste une problématique très importante : le contexte courant est global. Il est global à toutes tes sessions de terminal, cela veut dire que tu peux, par inadvertance agir sur le mauvais cluster.

Et si j’aborde ce sujet, c’est parce que ça m’est arrivé et que cela a eu des conséquences désastreuses : que se passe-t-il si tu exécutes un `kubectl delete deployment car-api` sur le cluster de production alors que tu pensais être sur ton cluster de développement ?

Il est recommandé d’avoir des droits limités via RBAC pour ton identité mais tu peux, en plus, adopter un outil dont je te parlerai dans un prochain article : [kubie](https://github.com/sbstp/kubie).
