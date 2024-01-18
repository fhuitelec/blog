---
title: Un shell ZSH performant, beau et pratique avec zinit
date: "2024-01-18T18:19:43.778Z"
description: "On remplace l'énorme framework Oh My Zsh! par un shell sur-mesure sans réinventer la roue."
published: true
tags: ["shell", "productivity"]
language: french
---

Imagine-toi démarrer une session shell en 60ms avec un shell élégant, composé sur-mesure par tes soins avec tes plugins et modules préférés, le tout avec quelques lignes de configuration ?!

Dans cet article, je te propose de découvrir [`zdharma-continuum/zinit`](https://github.com/zdharma-continuum/zinit) pour personnaliser un shell ZSH au design épuré, performant et avec des fonctionnalités avancées.

## Tour d’horizon de l’écosystème du Z Shell

Lorsqu’on a affaire à un terminal pour la première fois, on tombe généralement sur le shell qui fait l’unanimité dans une très large majorité de distributions GNU/Linux de bureau ou serveur : [GNU bash](https://www.gnu.org/software/bash/). Puis, on tombe rapidement sur un collègue ou un article qui fait les louanges de [fish](https://fishshell.com/) ou encore [ZSH](https://zsh.sourceforge.io/).

Ici, je m’adresse donc à celles et ceux qui ont été conquis par ZSH, que ce soit pour sa conformité avec POSIX ou simplement ses fonctionnalités natives très utiles (je pense à toi l'auto-complétion dynamique avec TAB ❤️). 

Ce shell a été adopté par une très large communauté de créa⋅teur⋅trice⋅s et d’utilisa⋅teur⋅trice⋅s des plus novices aux plus expérimenté⋅e⋅s et cela a conduit à la création d’une pléthore de bibliothèques, utilitaires et frameworks.

Parmi ces derniers, on peut lister [Oh My Zsh](https://ohmyz.sh/)**,** [Prezto](https://github.com/sorin-ionescu/prezto) ou encore [zimfw](https://github.com/zimfw/zimfw). Et chacun a ses mérites et si je devais n'en citer qu'un : ce serait leur côté *plug'n'play* et la facilité qui l'accompagne.

Mais cette facilité d'adoption et d'utilisation a un prix : on se retrouve avec un shell qu’on ne comprend pas ou mal, qui mets plusieurs secondes à démarrer et dont on n’utilise, finalement, que 5 ou 10% des fonctionnalités.

## Entrent en scène les *plugin managers*

Pour palier ces faiblesses des frameworks et privilégier la composabilité, d’autres utilitaires ZSH ont vu le jour : les *plugin managers*.

Je t’épargne l’historique et l’écosystème des plugin managers, celui que j’utilisais avant `zinit` était [antigen](https://github.com/zsh-users/antigen) qu’un collègue proche, [Antoine](https://www.linkedin.com/in/alepee/), m’a fait découvrir.

L’intérêt des *plugin managers* : n’installer et charger que ce que tu utilises dans ton shell. C’est un élément de design qui reprend un des éléments de la philosophie Unix : “Make each program do one thing well” et c’est en grande partie ce qui m’a séduit.

Et les meilleurs *plugin managers* utilisent du chargement asynchrone pour bénéficier d’incroyables performances !

## Installer et utiliser zinit

Installe `zinit` en suivant le [README.md](https://github.com/zdharma-continuum/zinit?tab=readme-ov-file#manual).

Dirige-toi maintenant vers ton `~/.zshrc`. Je te conseille de repartir de zéro et d’incorporer ton ancienne configuration au fur et à mesure après avoir configuré `zinit`.

Si tu ne te sens pas de lire le [README.md](https://github.com/zdharma-continuum/zinit?tab=readme-ov-file#usage) ou le [wiki](https://zdharma-continuum.github.io/zinit/wiki/), voici un extrait de ma configuration :

```shell
#!/usr/bin/env zsh

source "${HOME}/.local/share/zinit/zinit.git/zinit.zsh"

# Load plugins & libraries
zinit light-mode for \
    OMZL::history.zsh \
    OMZL::key-bindings.zsh

zinit wait'!' lucid light-mode for \
    OMZP::ssh-agent \
    OMZL::completion.zsh \
    zdharma-continuum/fast-syntax-highlighting

# [...] Le reste de ta configuration (prompt, PATH, etc.)
```

## Mes partis pris

Bien que ce soit un “plugin manager”, je n’utilise `zinit` que pour gérer et charger des modules et bibliothèques en rapport direct avec ZSH. Je pourrais utiliser les *"[packs](https://zdharma-continuum.github.io/zinit/wiki/Zinit-Packages/)"* et installer celui de [pyenv](https://github.com/zdharma-continuum/zinit-packages/tree/main/pyenv) par exemple, mais je préfère gérer le cycle de vie de ce genre d’utilitaires dans [mes dotfiles avec Ansible](../ansible-pour-gerer-ses-dotfiles/).

Ensuite, pour ce qui est de la syntaxe, je trouve qu’elle est trop complexe et riche. Je n’utilise que ces 2 variantes :

- `zinit light-mode for […]` : pour télécharger et charger de façon **synchrone**
- `zinit wait'!' lucid light-mode for […]` : pour télécharger et charger de façon **asynchrone** (c’est le fameux mode “[turbo](https://github.com/zdharma-continuum/zinit?tab=readme-ov-file#turbo-and-lucid)”)

## Il était une fois zinit

`zinit` a un historique atypique et  certain⋅e⋅s pourraient même dire que le projet a connu du “drama”.

L’auteur originel et mainteneur du projet jusqu’en Octobre 2021 était un certain Sebastian Gniazdowski (aka [@psprint](https://github.com/psprint)). La [v1.0](https://github.com/zdharma-continuum/zinit/tree/v1.0), en 2016, s’appelait d’ailleurs **zplugin** !

@psprint a supprimé le dépôt git, unilatéralement, sur GitHub à 2 reprises : en mars 2020 et en octobre 2022. Selon [ses dires](https://www.reddit.com/r/zsh/comments/fhc6kg/comment/fkadc68/?utm_source=reddit&utm_medium=web2x&context=3) :

> Je suis le propriétaire du projet, je peux le supprimer quand je veux.
> 

Lors de la seconde suppression, la communauté a [pris les devants](https://www.reddit.com/r/zsh/comments/qinb6j/httpsgithubcomzdharma_has_suddenly_disappeared_i/) et plusieurs forks sont apparus afin de faire survivre puis vivre le projet. Les 2 forks majeurs sont les suivants :

- [z-shell/zi](https://github.com/z-shell/zi?tab=readme-ov-file#%E2%84%B9%EF%B8%8F-acknowledgements) : il n’est plus activement maintenu depuis Décembre 2022 et l’historique du projet a été réécrit lors du fork
- [zdharma-continuum/zinit](https://github.com/zdharma-continuum/zinit) : celui-ci est activement maintenu et il y a eu [un effort considérable](https://www.reddit.com/r/zsh/comments/qinb6j/comment/him7jan/?utm_source=reddit&utm_medium=web2x&context=3) pour conserver et vérifier l’historique du projet. C’est celui qui a connu le plus de tractions

Note que @psprint a continué une version de son côté, nommée zinit-4, annoncée sur [Reddit](https://www.reddit.com/r/zsh/comments/164k70z/new_zinit_fork_from_the_original_author_zinit_4/) en Août 2023.

Malheureusement, en rédigeant cet article, je suis tombé sur [l’annonce](https://www.reddit.com/r/zsh/comments/17vokub/remembering_psprint_creator_of_zinit_and_fsyh/) d’un mainteneur de [zdharma-continuum/zinit](https://github.com/zdharma-continuum/zinit) nous prévenant que @psprint serait décédé en Novembre 2023.

## Pour finir

J’utilise un plugin manager ZSH depuis 2018 et plus particulièrement `zinit` depuis 2020 et mon shell s’en porte pour le mieux, je te conseille de sauter le pas si ce n'est pas déjà fait.

Comme tu as pu le constater, un *plugin manager* et quelques plugins, c’est pratique et performant mais il y a encore de nombreux utilitaires à explorer pour avoir un workflow de terminal fluide : z, fzf, p10k, direnv, tmux, et j’en passe : _**stay tuned!**_
