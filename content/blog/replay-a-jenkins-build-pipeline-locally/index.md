---
title: Replay a Jenkins build pipeline locally
date: "2017-01-24T12:10:54.169Z"
description: "Let me introduce you, in a nutshell, a way to iterate on a Jenkins pipeline on your local machine."
published: true
tags: ["jenkins"]
language: english
---

Let me introduce you, in a nutshell, a way to iterate on a Jenkins pipeline on your local machine.

Don’t get me wrong, the Replay feature is great, but only when you deal with one Jenkinsfile. If you have 1+ groovy files and the Jenkinsfile, it becomes a nightmare.

When developing a complex build pipeline, we all have our time-consuming routine with a text editor, git and <kbd>⌘</kbd> + <kbd>Tab</kbd> / Alt + Tab to switch between CLI and Jenkins UI. Let’s see what I had to do, on each iteration, for the last build pipeline I built:

```shell {numberLines: true}
# Just edited Jenkinsfile dealing with some deploy when merging on master
git add Jenkinsfile lib/jenkins/Servers.groovy # git add
git commit -m "WIP build pipeline" # git commit
git push origin master --force # previously rebased 50 "WIP build pipeline" in git history
                               # push force on master, yolo

# Wait for the build to be triggered
# ⌘ + Tab
# 3 clicks on Jenkins to get the build output
# Build failed, there's a freaking typo in on the sh() I added

# And so on
```

## Basic knowledge

I’ll take for granted that you know how to use docker and docker-compose and that you know the basics of Jenkins and Jenkins Pipelines.

## Prep time

Get your docker stack ready.o published ports on:

- `80` (Jenkins web UI
- `2222` (Jenkins SSH CLI
- `8181` (Jetty server for the example)

I forked the [official Jenkins workflow demo](https://github.com/jenkinsci/workflow-aggregator-plugin): you can view/get the sources [here](https://github.com/jenkinsci/workflow-aggregator-plugin) to get a sense of this article.

Quick note: the Makefile recipes are just here to help a bit, you might want to build your own dev-oriented Jenkins image with more advanced scripted helpers.

That being said, let’s run Jenkins. To make things easier, there’s a `docker-compose` file mounting the repository:

```shell
docker-compose -p jenkins -f infrastructure/docker-compose.yml up -d
```

Let’s dig in!

---

## A CLI you said?

That’s right, Jenkins comes with a CLI, partly accessible via SSH on a port exposed by Jenkins itself or via a jar executable you can get from your Jenkins instance.

As I read in the documentation, the SSH accessor have some limits, so I will stick with the bare CLI.

> _“How do I get the CLI?”_, I hear you say. No more suspense:

```shell
wget http://localhost/jnlpJars/jenkins-cli.jar
```

But we don’t need it locally, we want it accessible in the container, so run a `make init` that does the following:

```shell
docker exec -i jenkins_jenkins_1 bash -c ' \
  cd /application/vendor/jenkins && \
  wget http://localhost:8080/jnlpJars/jenkins-cli.jar \
'
```

To be able to replay the build pipeline, you can see in `infrastructure/docker-compose.yml`, I bound the repository as a volume so we are going to use the CLI inside the container in the mounted directory called `/application`.

## Push no more

In the following example, I’ll use a custom library import `Servers.groovy` to see how we replay a handful of scripts.

We are going to edit these files to try the CLI:

- In `bin/Jenkinsfile`, let’s add a dummy `sh(echo Toto)`
- In `demo/lib/src/demo/Servers.groovy`, let’s replace `String id = UUID.randomUUID().toString()` by `String id = "tmp-${UUID.randomUUID()}"`

Usually, it would be:

```shell {numberLines: true}
git add .
git commit -m "WIP build pipeline"
git push origin master

# Wait the build to be triggered
# ⌘ + Tab
# Wait for the build to end
```

Now:

```shell
make cli-replay # ⌘ + Tab - Wait the build
```

Under the hood, it uses your Jenkins instance CLI:

```shell {numberLines: true}
docker exec -i jenkins_jenkins_1 bash -c ' \
  java -jar /application/vendor/jenkins/jenkins-cli.jar -s http://localhost:8080 \
  replay-pipeline cd/master \
  -s Jenkinsfile < /application/demo/repo/Jenkinsfile \
  -s demo.Servers < /application/demo/lib/src/demo/Servers.groovy \
'
```

## Decrypting the command

```shell {numberLines: true}
# Use your docker instance to run the commands below
docker exec -i jenkins_jenkins_1 bash -c

# Run locally (in the container, Jenkins runs on 8080) Jenkins CLI
# on your running instance
java -jar /application/vendor/jenkins/jenkins-cli.jar -s http://localhost:8080

# Run the command `replay-pipeline` on the cd item and master branch
replay-pipeline cd/master

# Replace the Script "Jenkinsfile" with the updated file in input
-s Jenkinsfile < /application/demo/repo/Jenkinsfile

# Same as above, use the Script "demo.Servers" and replace it with the input
-s demo.Servers < /application/demo/lib/src/demo/Servers.groovy
```

## Important

You have to explicitly tell to the CLI which scripts to rerun and replace the script via the input (`<`): using a little script might not be a bad idea.

Don’t follow to the letter the official [Cloudbees blog post](https://www.cloudbees.com/blog/replay-pipeline) or even the [Jenkins one](https://jenkins.io/blog/2016/04/14/replay-with-pipeline/): they wrote `-s Script1 < some_file` but you have to specify the filenames used by the Pipeline.

For the Jenkinsfile, it’s quite simple: `Jenkinsfile`. For external libraries, it is their FQCN ; for Servers, in this example, it’s its package name `demo` and the classname `Servers`: `demo.Servers`.

I had a hard time figuring this out.

## Final notes

This article and related repository are far from being bulletproof but it’s a good introduction on how to use Jenkins CLI to make build pipeline conception workflow more fluid.
