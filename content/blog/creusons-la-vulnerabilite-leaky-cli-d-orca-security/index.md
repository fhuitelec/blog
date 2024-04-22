---
title: Creusons les vulnérabilités de LeakyCLI d’Orca Security
date: "2024-04-22T09:50:20.697Z"
description: "Non, cette vulnérabilité n'en est pas vraiment une."
published: true
tags: ["security", "methodology"]
language: french
socialStaticImageName: researcher-detective.png
---

Je suis tombé, dans mon fil d'actualité, sur une certaine vulnérabilité "LeakyCLI" relevée par Orca Security et en creusant une grosse heure, je me suis rendu compte que [l'article](https://orca.security/resources/blog/leakycli-aws-google-cloud-command-line-tools-can-expose-sensitive-credentials-build-logs/) derrière cette trouvaille n'était pas vraiment le fruit d'un travail de recherche honnête et plutôt, en réalité, un coup marketing.

## Résumons la situation

Le 16 avril 2024, l'entité "Orca Research Pod" d'Orca Security [nous fait part](https://orca.security/resources/blog/leakycli-aws-google-cloud-command-line-tools-can-expose-sensitive-credentials-build-logs/) d'une vulnérabilité qu'ils nomment "LeakyCLI".

Orca cite la [CVE-2023-36052](https://nvd.nist.gov/vuln/detail/CVE-2023-36052) datant du 14 novembre 2023 : la CLI d'Azure exposait des secrets dans sa sortie standard entrainant la fuite de secrets, notamment dans des outils d'intégration continue comme GitHub Actions. Notons que cette CVE fait suite à [une remontée](https://www.paloaltonetworks.com/blog/prisma-cloud/secrets-leakage-user-error-azure-cli/) d'un concurrent d'Orca Security : Prisma Cloud de chez Palo Alto Networks.

Tout va finalement se reposer sur cette CVE : le comportement des CLIs de GCP et AWS vont être mis à la même hauteur que celle d'Azure.

Dans cet article, je vais tenter de t'expliquer pourquoi cette comparaison entre les CLIs d'Azure, GCP & AWS est maladroite et d'autant plus malvenue qu'elle provient d'une société dont c'est le métier.

## 1. Le cas Microsoft Azure

Bien que Microsoft ait été plutôt exemplaire, on manque de détail concret sur l'origine du problème dans son [article explicatif](https://msrc.microsoft.com/blog/2023/11/microsoft-guidance-regarding-credentials-leaked-to-github-actions-logs-through-azure-cli/) : c'est dans la [PR du correctif](https://github.com/Azure/azure-cli/pull/27565) et [dans la documentation des app settings](https://learn.microsoft.com/en-us/azure/app-service/configure-common?tabs=portal) que je vais tenter de comprendre l'origine du problème.

Ce sont 4 sous-commandes de la CLI manipulant les "app settings" qui listaient les variables d'environnement (secrets inclus).

L'élément le plus important et qui caractérise la criticité de la vulnérabilité est que **les app settings d'Azure sont conçus pour héberger des secrets**.

### Quelles responsabilités ?

C'est donc de la responsabilité de :

- Microsoft de ne pas faire fuiter ces éléments de configuration
- Microsoft de fournir une alternative de configuration pour stocker des secrets

Ce n'est pas une mauvaise utilisation de la CLI de la part de l'utilisateur.

## 2. Le cas Amazon Web Services

Intéressons-nous maintenant à la CLI d'AWS : certaines sous-commandes de la CLI manipulant les "lambdas" listaient les variables d'environnement (secrets inclus).

La question à se poser à présent est la suivante :

> ❓ Les variables d'environnement de Lambda sont-elles conçues pour héberger des secrets ?

Malheureusement, [la documentation](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html) n'est pas sans équivoque.

Mon interprétation est que non, **les variables d'environnement de Lambda ne sont pas conçues pour héberger des secrets**. On a même un encars en haut de la documentation qui dit :

> To increase security, we recommend that you use AWS Secrets Manager instead of environment variables to store database credentials and other sensitive information like API keys or authorization tokens.

### Quelles responsabilités ?

C'est donc de la responsabilité de :

- l'utilisateur de stocker ses secrets dans un endroit approprié
- Amazon de documenter de façon bien plus visible les risques de stocker des secrets à cet endroit
- Amazon d'avoir un comportement par défaut de sortie standard moins verbeux
- Amazon de simplifier le stockage sécurisé de secrets

## 3. Le cas Google Cloud Platform

Dans la CLI gcloud, 3 sous-commandes de manipulation des variables d'environnement de "cloud functions" listaient les variables d'environnement.

Mais c'est là où le bât blesse : **les variables d'environnement "cloud functions" ne sont pas conçues pour héberger des secrets** et il existe une alternative native et bien documentée : [`--set-secrets`](https://cloud.google.com/sdk/gcloud/reference/functions/deploy#--set-secrets-)

### Quelles responsabilités ?

Il est de la responsabilité de l'utilisateur de stocker ses secrets dans un endroit approprié.

## Récapitulons

| CLI                | Conçu pour des secrets | Bien documenté | Alternative native simple |
| :--------------------------- | :--------------------: | :------------: | :-----------------------: |
| **Azure - app settings**     |          oui           |      oui       |            non            |
| **AWS - lambda**             |          non           |      non       |            non            |
| **Google - cloud functions** |          non           |      oui       |            oui            |

## Conclusion

Il y a effectivement de quoi s'alarmer chez AWS qui devrait prendre ce problème au sérieux : leur réponse "ce n'est pas une vulnérabilité, c'est le comportement attendu" ne me semble pas responsable.

Cependant, il y a peu de choses à reprocher à GCP : `gcloud function deploy --set-secrets` gère ça nativement et est bien documenté.

Mettre le comportement de la CLI d'Azure avec la [CVE-2023-36052](https://nvd.nist.gov/vuln/detail/CVE-2023-36052) et celui des CLIs d'AWS et GCP est une erreur. J'ai la forte impression qu'Orca Security a voulu créer le buzz avec ce "LeakyCLI" en regroupant les 3 plus grands cloud public.

Pour finir, cette démarche dont je te fais part à travers cet article, je ne l'ai retrouvée nul part chez les personnes qui ont relayé l'information : relayer une information parce qu'elle provient d'une publication d'Orca Security sans s'interroger, c'est tomber dans un biais d'autorité et dans ces métiers qu'on exerce, à mon humble avis, ce n'est pas acceptable.

PS : ce "LeakyCLI" n'a pas fait trop de bruit et n'a pas été relayé par de grands média, espérons que ça reste ainsi.
