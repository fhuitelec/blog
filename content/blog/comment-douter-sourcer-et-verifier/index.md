---
title: Comment douter, sourcer et vérifier
date: "2024-05-01T09:11:44.802Z"
description: "Le fact-checking dans la tech, c’est un art."
published: true
tags: ["methodology"]
language: french
socialStaticImageName: it-worker-thinking-and-doubting.jpg
---

Je suis récemment tombé sur [ce post LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7188822587727106048/) et bien que ce soit plein de bon sens, plusieurs choses m’ont fait tiquer et m’ont conduit à vérifier les informations s’y trouvant.

Dans cet article, je te propose de parler de méthodologie pour douter, sourcer puis vérifier toute information plutôt technique sur laquelle tu peux tomber.

Tu peux retrouver la consolidation de mes trouvailles dans le dépôt GitHub [fhuitelec/sandbox](https://github.com/fhuitelec/sandbox/tree/main/2024-04-linkedin-password-maximum-length).

## 1ère étape : douter

Dans [ledit post](https://www.linkedin.com/feed/update/urn:li:activity:7188822587727106048/), 2 choses m’ont gêné :

- On sent à plein nez l’argument d’autorité : l’ANSSI et la CNIL sont cités
- On ne voit pas les sources : ce n’est pas très grave mais couplé à l’argument d’autorité, ça me fait grimacer

Je me dis grossièrement :

> "L’auteur, l’ANSSI et la CNIL, ils sont bien gentils : l’entropie d’un mot de passe, c’est important oui mais j’ai quand même l’impression qu’une limite à 200 caractères ouvre la porte à un joli déni de service".

## 2ème étape : sourcer

Sourcer, c’est l’action de vérifier l'origine et l'authenticité d'une information. Voyons comment je m’y suis pris.

Rien de sorcier habituellement mais pas aujourd’hui : ce sujet est mal référencé, il m’a fallu 20 minutes pour trouver les 2 sources exactes.

1. il m’a fallu les mots-clés "**CNIL maximum caractères mot de passe**" et aller jusqu’au [4ème résultat](https://www.cnil.fr/fr/questions-reponses-sur-la-nouvelle-recommandation-relative-aux-mots-de-passe-et-autres-secrets)
2. Rendez-vous à la question "**9. L’ANSSI indique en R22 « ne pas imposer de longueur maximale pour les mots de passe » […]”**
3. **1ère source trouvée :** ici, [un premier lien](https://www.cnil.fr/sites/cnil/files/atoms/files/deliberation-2022-100-du-21-juillet-2022_recommandation-aux-mots-de-passe.pdf#page=9) renvoie vers la source de la CNIL (à la mauvaise page d’ailleurs)
4. Puis on voit ensuite qu’il est question de la "recommandation R22" de l’ANSSI
5. **2ème source trouvée :** il m’a fallu les mots-clés "recommandation R22 anssi mot de passe" et aller [jusqu’au 2ème résultat](https://cyber.gouv.fr/sites/default/files/2021/10/anssi-guide-authentification_multifacteur_et_mots_de_passe.pdf#page=31)

L’auteur a donc raison : la CNIL et l’ANSSI recommandent effectivement d’autoriser des mots de passe de "plusieurs centaines de caractères".

Revenons à mon intuition initiale : certes, 2 figures d’autorités le recommandent mais n’y a-t-il pas un risque de déni de service ?

## 3ème étape : vérifier

Ici, on va vérifier une assertion mais pas celle que tu crois : je vais tenter de prouver qu’une limite de 100, 200 ou 500 caractères **n’implique pas** un déni de service.

Tu l’auras peut-être compris, je tente de prouver l’inverse de ce que mon intuition me dit et pour une bonne raison : pour **ne pas tomber dans le [biais de confirmation](https://thedecisionlab.com/biases/confirmation-bias)**.

Grossièrement, voici les 3 étapes par lesquelles je suis passé :

1. déterminer un contexte de test réaliste
2. développer un script simple
3. lancer un benchmark

### 1. Déterminer un contexte de test réaliste

#### L’algorithme de hachage

Premièrement, trouvons un algorithme de hashage de mots de passe. Ici, je connais un minimum le sujet et je me tourne vers l’[OWASP](https://owasp.org/about/) qui recommande dans [sa cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) **argon2id**.

#### La contrainte CPU

Deuxièmement, puisqu’il s’agit d’un déni de service, trouvons une dimension à contraindre pour tenter de saturer le traitement. Pour l’algorithme de hachage choisi, argon2id, on a 2 dimensions de ressources qu’on peut saturer : le CPU et la mémoire. **Je choisis le CPU**.

Ici, j’imagine assez facilement un service d’authentification sous forme de microservice conteneurisé et hébergé sur Kubernetes. Ça tombe bien, Kubernetes - et les *container runtimes* plus généralement - exposent des mécaniques pour limiter le temps CPU alloué à un conteneur.

On va donc utiliser un environnement conteneurisé contraint [en temps CPU avec docker](https://docs.docker.com/config/containers/resource_constraints/#cpu) :

```bash
docker run --cpus=0.25 # [...]
```

### 2. Développer un script simple

Ici, mon choix se tourne vers Python avec, comme bibliothèque, [une des recommandations](https://github.com/p-h-c/phc-winner-argon2?tab=readme-ov-file#bindings) officielles d’argon2 : [`argon2-cffi`](https://pypi.org/project/argon2-cffi/).

Quelques minutes de lecture de [la documentation](https://argon2-cffi.readthedocs.io/en/stable/api.html) et voici un script simple et fonctionnel :

```bash
import argon2, secrets, string, time

# Password generation

password_length = 100

character_choices = (string.ascii_letters
                     + string.digits
                     + string.punctuation)
password = ''.join(
    secrets.choice(character_choices)
    for i in range(password_length)
)

# Hash benchmarking

start = time.time()

password_hasher = argon2.PasswordHasher.from_parameters(
    argon2.profiles.RFC_9106_LOW_MEMORY
)
hashed_password = password_hasher.hash(password)

end = time.time()

# Output

diff_in_ms = round((end - start) * 1000)
print('Elapsed time:    ' + str(diff_in_ms) + "ms")
```

### 3. Lancer un benchmark

On conteneurise le tout et on lance le script avec différentes tailles de mots de passe.

Les résultats du benchmark sont disponibles [ici](https://github.com/fhuitelec/sandbox/tree/main/2024-04-linkedin-password-maximum-length#results).

## Avais-je raison ?

[**Non**](https://github.com/fhuitelec/sandbox/tree/main/2024-04-linkedin-password-maximum-length#results).

> **Dans un environnement contraint en CPU avec un algorithme de hachage de mot de passe moderne et réputé, une limite de plusieurs centaines de caractères n’implique pas de risque de déni de service !**
> 

Le résultat est assez fou : jusqu’à une longueur de mot de passe d'un million (oui, 1 000 000) de caractères, le processus de hachage du mot de passe dure environ une seconde (entre 1000 et 1200ms) et avec constance.

Le plus incroyable est le temps hachage d’un mot de passe de 1 milliard de caractères : 9 secondes seulement !

## Raisonnement corollaire

Ce que j’en déduis et qui m’a l’air finalement plutôt logique, c’est que la longueur du mot de passe en entrée ne devrait pas influer sur la performance d’un algorithme de hachage moderne et bien conçu.

Peu importe la longueur du mot de passe, la constance du temps de hachage est cruciale, comme [le souligne l'OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#using-work-factors) concernant le _facteur de travail_ :

> Determining the optimal work factor will require experimentation on the specific server(s) used by the application. As a general rule, calculating a hash should take less than one second.
> 

Donc, non seulement mon intuition n’était pas la bonne mais avec du recul, je me rends compte que le raisonnement derrière mon intuition était lui aussi erroné !

## Conclusion

À travers ce billet, je veux mettre en avant 3 choses :

- que seul, un argument d’autorité a peu de valeur
- que tu dois anticiper et contrebalancer ton propre biais de confirmation
- que même une information provenant d’une autorité peut être remise en cause et testée

Alors oui, je te l’accorde, j’ai un bon *Google-fu* et je connais déjà un minimum l’univers de la cryptographie et du hachage de mots de passe, donc la démarche de bout en bout m’a pris peu de temps.

Mais cet esprit critique et cette démarche de sourcer et vérifier ce qu’on te présente, je la trouve essentielle dans notre société actuelle. Si tu ne l’appliques pas, je t’invite à l’exercer plus souvent et si tu l’appliques déjà, je t’invite à la cultiver et à l’enseigner.
