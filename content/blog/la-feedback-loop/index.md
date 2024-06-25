---
title: Raccourcis ta feedback loop
date: "2024-06-25T13:52:32.793Z"
description: "La puissance de la boucle de rétroaction."
published: true
tags: ["methodology"]
language: french
socialStaticImageName: thunder-and-feedback-loop.png
---

Je te parlais, [il y a quelque temps](https://www.linkedin.com/feed/update/urn:li:activity:7193990012705599490/), d'intégration continue et de ses outils et dans cet article je te parle de mon favori : la "feedback loop".

Je suis absolument friand du concept de la feedback loop et je cherche constamment à la rendre la plus courte possible.

## C’est quoi ça, la feedback loop ?

La “feedback loop” aka la “boucle de rétroaction”, je vais essayer de la définir dans un contexte particulier : celui d’une tâche dans la tech. Cette tâche peut être le développement d’une fonctionnalité ou encore l’investigation ou la résolution d’un problème.

La feedback loop, c’est le cycle continuel qui te permet d’avoir un retour sur l’avancement de ta tâche et ça peut être un tas de choses :

- une suite de tests
- un déploiement
- un rafraîchissement de page
- du Hot Module Reloading et quelques tests manuels
- un `docker build`
- des logs en production
- le retour d’une commande
- etc.

Et surtout, cette feedback loop, elle peut avoir un périmètre très différent, d’un besoin à l’autre : ça peut être au sein d’un même commit, d’une PR, de plusieurs PRs et ça peut même ne pas avoir de lien avec du code si c’est de l’investigation !

## Et c’est important ?

Oui et j’irai même jusqu’à dire que la maîtrise de sa feedback loop, **c’est essentiel**.

Il y a plusieurs niveaux de maîtrise :

1. tu n’as aucun système de feedback loop
2. tu en as mis un en place mais tu ignores que ç’en est un
3. tu en as mis un en place, sciemment
4. tu en as mis un en place et tu l’optimise

Et ce niveau peut évoluer à mesure que tu améliores ta compréhension de la tâche que tu exécutes.

Il m’arrive souvent de m’atteler à un problème et 15 minutes plus tard de mettre en place une feedback loop puis 30 minutes plus tard, de l’optimiser pour qu’elle soit plus rapide.

Généralement, quand on maîtrise ce concept, la feedback loop se réduit à mesure qu’on gagne en connaissance et en compréhension du besoin ou du problème qu’on tente de résoudre.

## Des exemples concrets

Je te donne ci-dessous quelques exemples concret de boucles de feedback ou d’amélioration de celle-ci. Je les aborde en surface, chacun méritent des livres entiers !

### TDD

Je ne t’apprendrai rien en citant le Test-Driven Development (TDD) comme exemple de feedback loop : en plus d’être un superbe outil de design émergeant, l’essence même du TDD, le “red, green, refactor” est elle-même une boucle de rétroaction !

### Debugging

Tu les connais sûrement :

```python
print(some_var)
```

```go
fmt.Printf("%+v\n", someVar)
```

```php
var_dump(someVar)
```

Pour investiguer un problème sur une stack locale, il n’y a rien de mieux qu’un débogueur pour réduire drastiquement ta boucle de feedback !

L’investissement initial peut paraître lourd (préparer son éditeur, gérer la complexité d’une stack conteneurisée, etc.) mais le gain est bien supérieur : être capable de lire ou modifier des variables pas à pas et avec tout le contexte d’exécution, c’est un véritable luxe.

### Logging & distributed tracing

Ici, c’est simple : tu reprends les mêmes bénéfices que le debugging mais tu l’appliques à la production.

Ajouter un logging de qualité et avoir à disposition une stack de tracing distribué, ce sont autant de biais d’observabilité qui réduisent considérablement tes boucles de feedback pour tes investigations en production.

### Intégration & déploiement continu

Je l’abordais [récemment](https://www.linkedin.com/feed/update/urn:li:activity:7193990012705599490/), intégrer ses changements dans la mainline (aka “main” ou “trunk”) et les déployer très tôt et souvent, ça te permets d’avoir des retours de ta production fréquents et d’excellente qualité.

Être capable d’identifier une régression et l’associer à un changement précis, c’est une forme de feedback loop très puissante.

### Et bien d’autres

Le Hot Module Reloading, la semi-automatisation via de petits scripts en Bash ou en Python, etc. ce sont autant de système qui te permettent d’avoir un retour sur l’avancement de ta tâche très rapidement.