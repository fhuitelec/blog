---
title: My non-technical colleague outdid my 2-year work in 1 month
date: "2018-08-11T11:23:22.169Z"
description: "Through this story, I want to highlight a fact I learnt the hard way: we, developers, need to seek for simplicity, at its essence."
published: true
tags: ["mvp", "learnings"]
language: english
---

Through this story, I want to highlight a fact I learnt the hard way: we, developers, need to seek for simplicity, at its essence.

I'll take a particular scope for this post: your startup's or mid-size company's internal tools. But I guess you can still learn from this on a broader scope.

## Some context

To give you a bit more context, I am going to tell you a bit about myself.

A few years back, I was hired to, among other things, implement a bridge between a SaaS CRM solution and our information system. In short, I needed to make sure the SaaS CRM talked the same language as our back office tools.

The end goal was simple: make life easier for our account managers and industrialize a bit our B2B interactions.

In the last sentence, you will have noticed two things:

- the end goal is quite standard for a business (we have account managers and a B2B side)
- this CRM thingy is directly used by our own people

## Using the data

As a SaaS tool, the CRM we chose is generic but open for extension. You can create your own modules (entities), add fields, etc. and I am fine with that, creating a model was a bit hard, ended up being quite complex but it was doable in the end.

However, entering data is one side of the story, using and projecting the data is another and a trickier one if you ask me.

This is where we fell short:

As a general rule of thumb: you cannot use the data you generate inside a generic CRM unless you import all the relevant data from all your other data sources within it (and it implies a lot of complexity), so all the views I created for our users missed a lot of business context and were, in many cases, pointless.

## The human side of a tool

In most of the cases, UX is the least of your concerns when talking about internal tools. To cope with this, you document processes, you onboard new employees for a day or two and you talk about how impractical those tools are in the break room.

Now, I want to state a few facts:

- as said earlier: the views were useless
- the UX was terrible
- the model was complex because the CRM was generic

To sum it up, despite managers pushing the tools, we only got interest from a handful of our target users and lost almost any value from the tool itself because it was not being used enough.

As a matter of fact, even the managers themselves did not want to use the tools and chose spreadsheets instead.

## Water under the bridge

2 years later, I moved to another team (I brought so much more value to the company, in my new role, than I did before, by the way) and the CRM only served about 15% of its target goal.

It's only a few month later I got some technical questions from a colleague of mine that raised my attention. His name is [David](https://www.linkedin.com/in/david-rajzman-5a20ab4/), he is a jack-of-all-trades, he learnt a few Python a few years ago and likes to use technologies to make his life easier.

His question was about some Google Spreadsheet he was creating for our whole "Sales" department. I asked him a few questions, tried to help him out and it turned out he had already built a tiny CRM solution based on a few Google tools.

I have to admit I was skeptical for the first 5 minutes I talked with him, until I saw all the data he had already collected and the way he structured them. There was already more than a hundred of lines of data. I was amazed. At the time I am writing these lines, there are about 350 of them.

A few days later, I stumbled upon an official announcement about this very same CRM: his tool got support from our direction and apparently from all the department. It was and still is bringing value and at a fast pace.

## A simpler approach

The approach is simple: a Google Form to collect the data in a structured way, a Google spreadsheet to store them and Google Studio Data reports to project the data. Collect, store and project: simple.

The data model is simple too: the dimensions vary but everything is about Interactions and this is where he nailed it. He got the one thing that improved the life of his colleagues: the thing that matters to them everyday: the way they interact with our partners.

## Start small

David's solution is far from perfect but it works: it collects data, it allows to see the data the way you want and most of all, his solution is used.

Sure, there are still a lot of work to do: we need a way to cross the data with our other data stores, there are a lot of functionalities missing, we might need some automation along the way but David started at the beginning, iterated brick by brick and listened to the users. By having a simple and extensible solution, he could listen to the users and answer their need easily without a month worth of development.

Now I don't blame anyone, not even myself: my 2-year work is used by a whole team and brings value to my company but I think there is a lesson to learn from this experience: start small.

For an internal tool, say a back office, by starting small with a Google spreadsheet, you will identify the business needs and challenges right away and will be able to build on them quickly. The spreadsheet is not an end game, it is a mean to learn how your business unit works and act on these learnings.

You will then iterate on it: add events (Google spreadsheet has a very nice API), change the data model, project data using powerful BI solution, move the spreadsheet into a existing SaaS solution or, if your needs don't fit a SaaS tool, build a small web application, use a real event system, etc.

## Shortfall

David, who is not a developer took less than a month of his time to fulfill a business need I could not fulfill in 2 years. For 2 years we spent a fair amount of money on a tool and a full-time developer salary to meet about 15% of our target goal when my colleague nailed it in one month.

And those are just direct cost: what if I brought more value during those 1 year and 11 months in another team and helped gain, say $250.000 of business value through deployed features?

## Final thoughts

Next time you are creating a back office or internal tool, don't be afraid to start with a spreadsheet.

And if you need to interact with an existing system and deal with technical complexity, start small, don't use a React/Redux frontend with a GraphQL API, build an ugly MVC web application.

You may feel pain along the way, but this pain is a far smaller financial and human cost compared to what you would have done with an overly complex solution.
