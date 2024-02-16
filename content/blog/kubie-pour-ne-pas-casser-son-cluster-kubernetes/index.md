---
title: Kubie pour ne pas casser son cluster Kubernetes
date: "2024-02-16T08:44:19.773Z"
description: "Maîtrise ton contexte Kubernetes pour ne rien faire de dangereux sur le mauvais cluster."
published: true
tags: ["kubernetes", "productivity"]
language: french
socialStaticImageName: disaster-on-computer-avoided.jpg
---

## Introduction

Précédemment dans [cet article](../comprendre-et-manipuler-son-contexte-kubernetes-local/), on a creusé le concept de contexte local Kubernetes et on s’est outillé pour avoir un workflow efficace et fluide. Je te propose d’aller plus loin aujourd’hui : on va tenter d’avoir une parfaite maîtrise de notre contexte Kubernetes.

Un peu plus bas, je te conte une anecdote relativement effrayante pour un *cloud engineer*/*devops*/*SRE* qu’on va éplucher ensemble et je finirai par te raconter pourquoi j’utilise kubie depuis ce temps-là.

## Une anecdote glaçante

Il y a quelques années, j’étais en train d’itérer sur la création d’un cluster Kubernetes local. J’en étais à une étape de *discovery* donc rien n’était industrialisé : pas d’infrastructure-as-code, j’utilisais principalement `kubectl` et quelques scripts shell semi-automatisés.

À cette époque, j’étais aussi en charge de la bonne santé de l’infrastructure et je gérais des demandes de support de diverses équipes. Je changeais donc de contexte Kubernetes local régulièrement.

Je ne sais plus si c’était suite à une demande de support ou à un incident de production sur lequel j'étais intervenu mais mon contexte Kubernetes local pointait sur un cluster de production. Évidemment, j’ai repris mon itération sur la création d’un cluster Kubernetes local sans faire attention à ce détail : j’ai modifié un script shell que j’ai ensuite exécuté **sur un cluster de production**.

Oups.

Le script en question n’était absolument pas à destination d’un cluster de production et pourtant le mal était fait. Je te passe le détail des conséquences mais elles n’ont pas été joyeuses.

## Analysons tout ça

Dans cette anecdote, au-delà des conséquences que tu peux imaginer, il y a pas mal de choses qui ont dû te gêner : je te propose de les analyser.

### Préciser le contexte

Ici, je parle d’un script à exécuter et on peut faire le constat très rapidement : tout ça aurait pu être évité en précisant le contexte des commandes `kubectl` avec `--context=CONTEXT`.

### Utiliser [k9s](https://github.com/derailed/k9s)

_(petite dédicace à [Thibaut](https://www.linkedin.com/in/thibaut-bayer/) !)_

Oui et non : c’est un outil fort pratique mais tout dépend de ton intérêt pour les *Text User Interface* (TUI). Personnellement, j'aime beaucoup les TUIs mais du côté de Kubernetes je reste avec mes habitudes *old school* à la `kubectl`.

Et cela ne résoud qu’une partie du problème : l’interaction directe avec des ressources précises. Dès lors qu’on automatise ou semi-automatise avec des manifestes entiers, `kubectl` reste un incontournable.

### Utiliser de l’infrastructure-as-code

J’aurais pu utiliser de l’infra-as-code. Mais, encore aujourd’hui, je ne le ferais pas.

<details><summary>C’est un peu hors-sujet mais je t’explique le fond de ma pensée…</summary>

<br />

> **TL;DR :** j’utilise de l’infra-as-code mais à l’étape de la *discovery* mais je ne me l’impose pas !
> 
> Dès lors que je contribue à de l’infrastructure qui n’est pas éphémère ou que mon travail est voué à être partagé, j’utilise, évidemment, de l’infra-as-code. Mais ici, il était question de *discovery* : je tente de comprendre plus finement le besoin et je tâte le terrain avec plusieurs approches différentes.
> 
> Certaines utiliseraient de l’infra-as-code, d’autres des scripts ou même rien du tout. Moi je préfère des commandes *one-off* et quand je me rends compte que je peux gagner du temps, je les consolide ensuite dans des scripts.
> 
> Quand il est question de *discovery*, il y a un concept qui me tient particulièrement à cœur, c’est la boucle de rétroaction aka “**boucle de feedback**” : je mets en place toutes les mesures possibles pour gagner du temps entre un test et son résultat en réduisant cette boucle de feedback.
> 
> Et j’ai un avis tranché : sauf si le travail de discovery est collaboratif et/ou qu’il doit durer plusieurs jours, on ne doit pas imposer à qui que ce soit d’utiliser de l’infra-as-code.
> 
> Et j’ai un avis encore plus tranché : une discovery doit être découpée finement et time-boxée afin de ne durer que quelques heures !

</details>

### S’interdire toute action destructrice

Dans un contexte de contribution classique, personne, pas même un profil de type “ops” ne devrait avoir le droit d’effectuer d’action modificative ou destructrice sur un cluster Kubernetes sans infrastructure-as-code ou uniquement via une élévation de privilège ponctuelle.

Grâce aux *[Role-based access control](https://kubernetes.io/fr/docs/reference/access-authn-authz/rbac/)* (RBAC), un cluster ne devrait donner que des permissions restreintes sur une majorité d’objets Kubernetes.

Toute modification sur un cluster de production (ou faisant partie de la chaîne de déploiement pour aller en production) devrait être faite via de l’infrastructure-as-code qui ne serait pas exécutés, dans l’idéal, depuis un poste de développement.

Et dans des cas exceptionnels de debugging en production ou de réponse à incident, un contributeur (développeuse, SRE, cloud engineer, etc.), devrait pouvoir, à la demande et temporairement, élever ses privilèges (une sorte de [sudo](https://www.sudo.ws/sudo/)).

Mais par défaut, mon identité de cloud engineer dans mon contexte Kubernetes local n’aurait pas dû avoir les droits suffisants pour effectuer d’action dangereuse sur le cluster !

## La solution parfaite ?

Les solutions que j’ai listé plus haut ne sont que des garde-fous et surtout, ils ne dépendent pas de toi ou de moi individuellement : ils dépendent de la maturité et des pratiques de ton équipe platform / infrastructure / SRE / devops.

Et surtout, elles sont complémentaires et elle-mêmes perfectibles puisqu’elles dépendent des contribu⋅teur⋅trice⋅s : il peut y avoir un trou dans la raquette dans la politique RBAC ou quelqu’un a peut-être oublié l’option `--context=CONTEXT` dans un script.

L’erreur humaine sera donc ma transition pour te proposer un outil fort pratique : [kubie](https://github.com/sbstp/kubie).

## Entre en scène, kubie

Grâce à kubie, chaque session de terminal a son propre contexte Kubernetes. Et par défaut ce contexte ~~peut~~ doit être nul.

Cela veut dire que tu dois choisir ton contexte avant de pouvoir discuter avec l’API de ton cluster Kubernetes. Ce n’est pas la solution ultime mais c’est un garde-fou sacrément puissant : **le choix du cluster cible est donc intentionnel** et si tu ne le choisit pas, tu ne peux rien faire.

![Gérer son contexte par session avec Kubie](/images/kubie-pour-ne-pas-casser-son-cluster-kubernetes/gerer-son-contexte-par-session-avec-kubie.gif)

[*asciinema.org*](https://asciinema.org/a/fIjes5JoWfp1I9R6cMdfXCOIi)

## Configurons kubie

- installe [kubie](https://github.com/sbstp/kubie?tab=readme-ov-file#installation)
- crée 2 plugins `kubectl` :
    - dans `/usr/local/bin/kubectl-tx` ajoute :
        
        ```bash
        #!/usr/bin/env sh
        
        kubie ctx $@
        ```
        
    - dans `/usr/local/bin/kubectl-ns` ajoute :
        
        ```bash
        #!/usr/bin/env sh
        
        kubie ns $@
        ```

### Supprimons le contexte par défaut

Pour finir, on va supprimer le contexte par défaut lorsque tu ouvres une nouvelle session de terminal.

Tu as 2 choix :

- ajoute ceci dans ton `~/.*shrc` : 
    
    ```bash
    export KUBECONFIG=/dev/null
    ```
    
    **avantage** : rien ne peut modifier ce comportement
    
    **inconvénient** : chaque fois qu’un outil aura besoin d’accéder à ta kube config, il râlera et tu devras exécuter manuellement `unset KUBECONFIG`

- **ou** supprime le couple clé/valeur `current-context` dans ta *kube config*
    
    **avantage** : si un outil a besoin de ta *kube config*, il peut y accéder sans souci
    
    **inconvénient** : certains outils qui modifie la kube config pour y ajouter un cluster (minikube, gcloud, etc.) vont généralement redéfinir `current-context`, tu devras le retirer systématiquement en prenant le risque d’oublier

Personnellement, j’utilise la solution `KUBECONFIG=/dev/null`.

## Le mot de la fin

Peu importe que ton environnement Kubernetes soit sain et sécurisé ou non, je suis d’avis qu’il est de ta responsabilité en temps que contribu⋅teur⋅trice - et encore plus si tu as des privilège élevés - de mettre en place des garde-fous individuels pour réduire la probabilité de faire une erreur sur un cluster Kubernetes et/ou réduire l'impact d'une telle erreur.

Et kubie est justement un outil qui te le permets.

Et comme tu peux le voir, ce setup kubie est peu intrusif et offre le même workflow que [précédemment](https://blog.fabien.sh/comprendre-et-manipuler-son-contexte-kubernetes-local/).

À toi de jouer !
