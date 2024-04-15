---
title: Redécouvrir Terraform après 7 ans de Pulumi
date: "2024-04-15T14:37:01.722Z"
description: "Essayons Terraform après n’avoir utilisé que Pulumi pendant des années."
published: true
tags: ["infrastructure-as-code", "spike"]
language: french
socialStaticImageName: engineer-writing-code.png
---

Imaginez qu’après 10 ans d’expérience dont 7 ans en cloud engineering, je vous dises que j’ai une expérience que j’ai une expérience limitée avec Terraform ?

<a name="one-top"></a>

Il se trouve que j’utilise Pulumi depuis sa génèse (2018-2019<sup>[1](#one-bottom)</sup>) et ça a laissé peu de place à Terraform.

Et en tant que Freelance, ce n’est pas chose aisée d’expliquer cela à un potentiel⋅le client⋅e ou recruteur⋅euse donc je saute le pas : je me réapproprie Terraform avec toutes mes connaissances et mon expérience avec Pulumi.

Dans cet article, je vais tenter de comparer les 2 outils avec un prisme différent du simple [versus](https://www.pulumi.com/docs/concepts/vs/terraform/) : te montrer les questions que je me suis posé ré-essayant Terraform pendant 2 heures en utilisant toute mon expérience avec Pulumi.

Attention, je t’invite à te familiariser avec les concepts de base de [Terraform](https://developer.hashicorp.com/terraform/intro) et de [Pulumi](https://www.pulumi.com/docs/concepts/) avant de continuer ta lecture car je ne les détaillerai pas.

## Gestion du *state*

Cette facette des 2 outils est plutôt simple car ils ont, tous deux, une approche similaire : le *state* (*aka* l’état) est stocké dans un backend configurable qu’on peut choisir parmi de nombreux providers (local, GCS, AWS S3, etc.).

Il y a cependant un “détail” qui n’est pas le même : le stockage des données sensibles, *aka* “secrets”, dans le *state.* Terraform [recommande](https://developer.hashicorp.com/terraform/language/state/sensitive-data) de chiffrer tout son état et le considérer comme sensible dans son intégralité contrairement à Pulumi où chaque secret est chiffré “*at rest*“ et individuellement dans l’état : l’état n’est pas considéré comme sensible.

Ça ne me semble pas nécessairement gênant mais si l’audit des accès et manipulations de l’état et des secrets est important, cela devient problématique car on n’a pas cette granularité : un accès à l’état veut forcément dire un accès aux secrets.

## Gestion des secrets

Dans Pulumi, la gestion des secret dans la configuration et le *state* est [native](https://www.pulumi.com/docs/concepts/secrets/) : les secrets sont chiffrés “*at rest*” via un *encryption provider* (GCP KMS, AWS KMS, HashiCorp Vault, etc.), que ce soit dans le dépôt git, via la configuration ou dans le backend qui stocke le *state* des stack.

Pour ce qui est de Terraform, la gestion des secrets n’est pas native et [la documentation](https://developer.hashicorp.com/well-architected-framework/operational-excellence/operational-excellence-terraform-maturity#use-secrets-storage) pousse fortement à l’utilisation de HashiCorp Vault. Pour avoir déployé et opéré plusieurs instances Vault, je ne suis pas vraiment favorable à l’intégration d’un *secret store* centralisé dans la *toolchain* de l’insfrastructure-as-code : la complexité de cette solution me semble disproportionné vis-à-vis du besoin.

Je suis probablement biaisé par le fonctionnement de Pulumi mais je suis plutôt partisan du chiffrement “*at rest*”. Finalement, bien que je n’ai pas entièrement testé la solution, j’entrevois une possibilité de gérer les secrets via `.tfvars` et [sops](https://github.com/getsops/sops) de façon plutôt élégante.

## Organisation des ressources

Tout d’abord, un peu de contexte : avec Pulumi, nous manipulons [des projets et des stacks](https://www.pulumi.com/docs/using-pulumi/organizing-projects-stacks/). J’ai pour habitudes d’utiliser un monorepo découpé en de nombreuses micro-stacks.

Le “projet”, chez Pulumi, est tout le code qui décrit l’infrastructure. La “stack”, chez Pulumi, est une représentation de ce code : une configuration et un *state* qui va se baser sur le projet (le code).

Voici un exemple de structure dont j’ai l’habitude :

```markdown
├── global/
│  ├── dns/
│  │  ├── example.org/...        **PROJET**
│  │  └── example.fr/...         **PROJET**
│  └── research/
│  │  ├── kubernetes-resources/  **PROJET**
│  │  │   ├── staging             _STACK_
│  │  │   └── production          _STACK_
│  │  └── example.fr/...         **PROJET**
└── library/
   └── network/
       └── vpc/...               **PACKAGE**
```

Attention, je ne m’étendrai pas sur le sujet mais cette organisation a ses limites et je n’en suis pas entièrement satisfait.

Concernant Terraform maintenant : de ce que j’ai pu observer et tester, il semble que Terraform est flexible quant à l’organisation des ressources et je vois plusieurs axes avec lesquels jouer : le dépôt git et l’arborscence (monorepo vs multi-repo), les workspaces et les modules.

Si je souhaite reproduire l’arborescence en monorepo ci-dessus, voici ce à quoi ça pourrait ressembler via Terraform :

```markdown
├── global/
│  ├── dns/
│  │  ├── example.org/...
│  │  └── example.fr/...
│  └── research/
│  │  ├── kubernetes-resources/
│  │  │   ├── staging            _WORKSPACE_
│  │  │   └── production         _WORKSPACE_
│  │  └── example.fr/
└── library/
   └── network/
       └── vpc/           **MODULE**
```

J’émet une réserve, cependant : je ne suis pas certain que d’utiliser les *workspaces* soit judicieux et j’ai l’impression que Terraform pousse beaucoup plus à l’utilisation des modules imbriqués pour organiser son code.

Maintenant qu’on entrevoit une certaines flexibilité dans l’organisation des ressources avec Terraform, se pose maintenant la question des dépendances.

## Gestion des dépendances

Quand je parle de dépendances, je parle d’utiliser des outputs de ressources externes pour déclarer d’autres ressources (je ne parle pas de [l’ordonnancement des actions du plan](https://developer.hashicorp.com/terraform/tutorials/configuration-language/dependencies)).

Dans Pulumi, qui pousse à une découpe relativement fine des stacks, il est très courant d’utiliser des [StackReferences](https://www.pulumi.com/learn/building-with-pulumi/stack-references/) pour aller chercher une information dans l’état d’une autre stack.

Pour ce qui est de Terraform, j’ai l’impression que c’est moins courant mais le pattern semble exister via la *data source* [terraform_remote_state](https://developer.hashicorp.com/terraform/language/state/remote-state-data). Cependant, étant donné les nombreuses mises en garde de la documentation officielle, je dirais que ce pattern a beaucoup de limites et qu’on tort un ou plusieurs paradigmes de Terraform.

## La suite ?

2 heures, pour se réapproprier un outil dont l’écosystème est dense, c’est court ! Je vois plusieurs pistes à creuser pour la suite : l’automatisation de l’exécution des plans via des outils de CI/CD, les tests, la gouvernance (policy management), Cloud Development Kit for Terraform, etc.

Et surtout, mon expérience avec Pulumi s’étant faites principalement en scale-up (-10 contributeur⋅trice⋅s quotidiens et -50 contributeur⋅trice⋅s réguliers), j’ai bien envie de comprendre comment les organisations organisent leur infra-as-code avec Terraform en fonction de leur taille (start-ups, scale-ups, grands groupes, etc.).

---

<a name="one-bottom"></a>
<sup>[1](#one-top)</sup> Petite anecdote amusante : malgré une première release de [Terraform](https://github.com/hashicorp/terraform/releases/tag/v0.1.0) en 2014 comparé à 2017 pour [Pulumi](https://github.com/pulumi/pulumi/releases/tag/v0.1), c'est bel et bien Pulumi qui publie sa première version stable (la fameuse v1.0.0) en [2019](https://github.com/pulumi/pulumi/releases/tag/v1.0.0) comparé à Terraform qui la publie en [2021](https://github.com/hashicorp/terraform/releases/tag/v1.0.0) !