---
title: Ansible pour gérer ses dotfiles
date: "2024-01-11T09:57:40.352Z"
description: "J'ai toujours été contre l’utilisation d’Ansible pour déclarer mes dotfiles, je t'explique pourquoi j’ai changé d’avis."
published: true
tags: ["ansible", "shell", "productivity"]
language: french
---

J’attache pas mal d’importance à mon environnement de travail et mes dotfiles ont beaucoup évolué au fil des années. Depuis 2 ans, je décris et déploie ces dotfiles grâce à Ansible.

Et crois-moi, il y a encore quelques années, j’étais absolument contre l’utilisation d’Ansible pour déclarer mes dotfiles.

Je te propose de découvrir pourquoi j’ai changé d’avis.

## Quelques rappels

### Que sont les dotfiles ?

Les dotfiles sont des **fichiers de configuration** utilisés principalement dans les systèmes Unix et Linux. Ces fichiers commencent généralement par un point (.), d’où leur nom “dotfiles”.

Ils contiennent des paramètres pour diverses applications et environnements de bureau, tels que des raccourcis clavier, des couleurs de terminal, des options de shell : la **customisation d’un environnement graphique ou de terminal** passe généralement par ces dotfiles. 

### Qu’est-ce qu’Ansible ?

Ansible est un outil d’infrastructure-as-code développé et maintenu par Red Hat. Plus particulièrement, c’est un **outil de configuration déclaratif**. C’est un outil open-source en Python qui est extensible grâce à des plugins et modules, écrits en Python également ; c’est grâce à cette extensibilité qu’Ansible bénéficie d’une large collection de modules communautaires et d’une communauté très active.

Concrètement, grâce à Ansible, on peut configurer un ensemble de machines : y installer des paquets, y ajouter une configuration précise via des templates, redémarrer des services, etc.

## Ansible, c’est compliqué non ?

Oui, Ansible est un outil qui demande un peu d’apprentissage.

Je n’expliquerai pas ici les concepts d’Ansible, je donnerai simplement quelques pointeurs.

Les concepts de base sont relativement simples, on décrit :

- le “comment faire” dans des **[rôles](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html)**
- le “où le faire” dans l’**[inventaire](https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html)**
- le “quoi faire” dans le **[playbook](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_intro.html)**

Cependant, l’écosystème est riche et il existe des concepts avancés relativement complexes (coucou la [priorité des variables](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html#variable-precedence-where-should-i-put-a-variable) 👋).

## Pourquoi utiliser Ansible, alors ?

Parce que décrire et déployer des dotfiles c’est un besoin simple et mine de rien, Ansible est capable de garder cette simplicité.

Pour gérer des dotfiles, j’identifie 5 besoins essentiels :

- installer et gérer des dépendances (paquets systèmes, binaires, bibliothèques, etc.)
- copier des fichiers à des endroits précis sur le système de fichier
- templater des fichiers
- gérer des secrets (token, passphrase, clés privées, etc.)
- correctement gérer l’état des fichiers que je fais évoluer au fil du temps

Avant d’utiliser Ansible, j’ai utilisé bash ou [dotbot](https://github.com/anishathalye/dotbot) et pour répondre à ces besoins et j’ai toujours été confronté à un problème majeur : **la complexité accidentelle**. Auparavant, je n’avais jamais réussi à gérer mes dotfiles sans tordre un outil ou écrire de longs scripts bash.

Avec Ansible, une fois que l’utilisation de quelques modules et que les concepts de base sont assimilés, eh bien, on peut se concentrer sur l’essentiel : décrire et déployer ses dotfiles.

L’essence même de l’outil est de gérer la configuration et c’est précisément ce qu’on fait quand on déclare et déploie nos dotfiles.

## À quoi cela ressemble-t-il ?

Mon inventaire est constitué de 2 lignes et j’utilise principalement ces 4 modules dans les rôles :

- `ansible.builtin.copy` : copie des fichiers
- `ansible.builtin.template` : copie des fichiers templatés
- `community.general.pacman` : installe des paquets Arch Linux
- `ansible.builtin.command` : exécute une commande

Et grâce au riche écosystème d’Ansible :

- j’utilise [sops](https://github.com/getsops/sops) pour dé-/chiffer les secrets de mes dotfiles grâce à [`community.sops`](https://docs.ansible.com/ansible/latest/collections/community/sops/docsite/guide.html)
- j’utilise des modules natifs ou communautaires pour des besoins “universels”
- je peux écrire un module sur-mesure pour des besoins à la marge et pour gagner en lisibilité

## Le mot de la fin

Adopter un outil comme Ansible n’est pas un choix anodin et cela ajoute une nouvelle dépendance : on doit apprivoiser un nouvel outil, son écosystème et le maintenir à jour et ce coût est difficile à estimer lorsqu'on fait ce choix.

Cependant, après 2 ans de bons et loyaux services, je suis toujours aussi satisfait et l’utilisation d’Ansible s’avère être maintenable et pérenne !
