---
title: Ne créer qu'une image docker pour PHP-FPM & Nginx
date: "2018-07-16T15:34:04.169Z"
description: "Et pas une de plus."
published: true
tags: ["container", "best practice"]
language: english
---

I have always been bothered by a simple issue when building docker image artifacts for my PHP/Nginx applications. The issue of building **two docker image artifacts** instead of **just one** with my PHP source code.

This article is about building only one artifact by just using an Nginx directive instead of another.

## A bit of context

My favorite stack for PHP applications is PHP-FPM and Nginx and I have enough ops skills to provision a Kubernetes or Docker swarm cluster for my personal and work-related projects. This means I always have a CI/CD ready to build and deploy my docker image artifacts.

When pushing my code into the PHP-FPM docker image only and deploying my application, I would get errors filled with anger from my containers:

```
PHP-FPM | GET /index.php” 404
Nginx | realpath() “/var/www/html/public” failed (2: No such file or directory)
Nginx | FastCGI sent in stderr: “Primary script unknown” while reading response header from upstream
```

My guess was that not having my source code in the Nginx docker image prevented Nginx from passing the request to PHP-FPM. Sure enough, adding the source code in the Nginx docker image **fixed the issue** every single time.

But then, I had to build **2 images** with **the exact same source code**: one for PHP-FPM and one for Nginx, just so Nginx could do its request pass-through job.

To be honest, it bugged me for quite some time, but I never got to wrap my head around the issue.

**Until this day.**

## The bottom line

Symfony, which I use almost every time I deal with MVC applications, has [a nice Nginx snippet](https://symfony.com/doc/current/setup/web_server_configuration.html#nginx) to get your application up & running.

```nginx {numberLines: true}
server {
    # [...]
    location ~ ^/index\.php(/|$) {
        fastcgi_pass php-fpm-endpoint:9000;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include fastcgi_params;

        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;
        internal;
    }
}
```

I am no wizard, and my Nginx skills mainly consist of <kbd>⌘</kbd> + <kbd>C</kbd> and <kbd>⌘</kbd> + <kbd>V</kbd> with some editing along the way. This means I had to try & fail for about 2 hours with Stack Overflow as my only friend to find a better solution.

However, after all these failures and Stack Overflow not really helping me out, I stumbled upon [some Nginx documentation](http://nginx.org/en/docs/http/ngx_http_core_module.html#var_realpath_root) and made a bald move: using `nginx›$document_root` instead of `nginx›$realpath_root`.

```nginx {numberLines: true}
server {
    # [...]
    location ~ ^/index\.php(/|$) {
        fastcgi_pass php-fpm-endpoint:9000;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include fastcgi_params;

        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; # highlight-line
        fastcgi_param DOCUMENT_ROOT $realpath_root;
        internal;
    }
}
```

From the [said Nginx documentation](http://nginx.org/en/docs/http/ngx_http_core_module.html#var_realpath_root):

> `nginx›$document_root`: [root](http://nginx.org/en/docs/http/ngx_http_core_module.html#root) or [alias](http://nginx.org/en/docs/http/ngx_http_core_module.html#alias) directive’s value for the current request
>
> `nginx›$realpath_root`: an absolute pathname corresponding to the [root](http://nginx.org/en/docs/http/ngx_http_core_module.html#root) or [alias](http://nginx.org/en/docs/http/ngx_http_core_module.html#alias) directive’s value for the current request, with all symbolic links resolved to real paths

There is an important word for `nginx›$realpath_root`, in case you did not catch it: **resolved**. We are in the Nginx context: for Nginx to **resolve** a path, it needs to **access** the file system context which it could not without the source code.

`nginx›$document_root` fixes this as it uses the `nginx›root` directive directly.

## Takeaway

When dealing with PHP-FPM artifacts and Nginx in a docker context, use `nginx›$document_root` for your `nginx›fastcgi_param SCRIPT_FILENAME` directive instead of `nginx›$realpath_root` in your Nginx configuration.

It will allow you to build one and only one PHP-FPM docker image artifact and to use the [raw Nginx docker](https://hub.docker.com/_/nginx/) image with just one configuration file to mount.
