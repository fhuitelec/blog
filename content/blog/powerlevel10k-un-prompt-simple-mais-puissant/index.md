---
title: powerlevel10k, un prompt simple mais puissant
date: "2024-01-25T09:21:32.293Z"
description: "Ici, on parle d'un prompt facile à configurer, élégant et personnalisable."
published: true
tags: ["shell", "productivity"]
language: french
socialStaticImageName: pure.png
---

Je mentionnais récemment [le *plugin manager* zinit](../un-shell-zsh-performant-beau-et-pratique-avec-zinit/) mais il existe un élément très important dans l’expérience qu’on a de son shell, j’ai nommé : **le prompt** !

Dans ce court article, je te propose de découvrir celui que j’utilise depuis 2 ans maintenant : **[powerlevel10k](https://github.com/romkatv/powerlevel10k)**.

## Un prompt facile à configurer

Ce qui m’a séduit, d’emblée, c’est la commande `p10k configure` : on se retrouve avec un configurateur interactif qui pose plein de questions pertinentes !

Le configurateur te garantis un prompt prêt à l’emploi en 2 minutes montre en main !

## Un prompt simple & élégant

Le parti pris de ce prompt est la simplicité ; le prompt n’affiche, par défaut, qu’un minimum d’information : le répertoire actuel, la durée de la dernière commande, l’heure et le statut de la dernière commande.

Pour autant, sa grande force est qu’il vient donner du contexte lorsque c’est pertinent et temporairement, le tout afin de ne pas encombrer le prompt.

Et ne confonds pas sa simplicité avec un manque de personnalisation : cela te demandera un peu de lecture mais ce prompt est [extensible à souhait](https://github.com/romkatv/powerlevel10k?tab=readme-ov-file#extremely-customizable) !

## Un prompt sous stéroïde

Imagine voir apparaître le cluster Kubernetes de ton contexte dès que tu tapes la commande `kubectl` ? Ou encore voir ton projet Google Cloud avec la commande `gcloud` ? C’est ce que te permets la fonctionnalité [*show on command*](https://github.com/romkatv/powerlevel10k#show-on-command) !

Il existe également un [mode *transient*](https://github.com/romkatv/powerlevel10k#transient-prompt) qui te permet de n’afficher qu’une seule instance de ton prompt.

## Un prompt maintenu

Ce prompt ZSH a vu le jour sous le nom de [powerlevel9k](https://github.com/Powerlevel9k/powerlevel9k) en 2015 commencé par [@bhilburn](https://github.com/bhilburn) & [@dritter](https://github.com/dritter) puis largement maintenu par @dritter jusqu’en 2019. Il est ensuite repris par [@romkatv](https://github.com/romkatv) qui maintient, dès lors, le projet sous le nom  [powerlevel10k](https://github.com/romkatv/powerlevel10k).

C’est un projet solide qui totalise, aujourd’hui, 41k étoiles GitHub, 258 contribu⋅teur⋅trice⋅s et qui est activement maintenu. Et malgré ces statistiques, ils maintiennent un nombre d’*issues* ouvertes très bas (34 à ce jour !).

## Un prompt qui n’attend que toi

Si tu n’es pas satisfait de ton prompt actuel ou que tu cherches un peu de renouveau, franchis le pas et essaie [powerlevel10k](https://github.com/romkatv/powerlevel10k?tab=readme-ov-file#extremely-customizable), je te le recommande chaudement ! 🔥

Et si tu utilises un autre shell que ZSH ou que tu cherches une alternative, je te recommande de jeter un oeil du côté de [starship](https://github.com/starship/starship).
