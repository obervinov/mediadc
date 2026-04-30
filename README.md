# Maintained fork

This fork keeps **the same Nextcloud app id (`mediadc`)** so it can replace the archived upstream app in an existing installation without breaking the app data model. The primary goal of this fork is to make large duplicate sets usable again on self-hosted instances with big photo/video libraries.

# Nextcloud MediaDC

[![Fork repository](https://img.shields.io/badge/fork-obervinov%2Fmediadc-blue)](https://github.com/obervinov/mediadc)



**📸📹 Collect photo and video duplicates to save your cloud storage space**

**[cloud_py_api](https://apps.nextcloud.com/apps/cloud_py_api)** must be installed and enabled before MediaDC.

| **Not working on FreeBSD systems for now**

![Home page](/screenshots/mediadc_home.png)
![Task page](/screenshots/mediadc_task_details_2.png)
Nextcloud Media Duplicate Collector application

## Why is this so awesome?

* **♻ Detects similar and duplicate photos/videos with different resolutions, sizes and formats**
* **💡 Easily saves your cloud storage space and time for sorting**
* **⚙ Flexible configuration**

## What is different in this fork?

This fork starts with a narrow performance-focused patch set for the duplicate details UI:

* **Fixes malformed preview URLs** so preview requests are generated correctly.
* **Lazy-loads thumbnails** on details/resolved screens to avoid pulling every preview immediately.
* **Stages group opening requests** instead of bursting all duplicate-group fetches in parallel.
* **Uses a composite index** for hot duplicate-detail lookups.
* **Avoids repeated in-loop filesize sorting** when loading the files of a duplicate group.

## 🚀 Installation

This fork is meant to be delivered as a **custom app** rather than through the Nextcloud App Store:

1. Install and enable [`cloud_py_api`](https://apps.nextcloud.com/apps/cloud_py_api).
2. Stage this repository into `custom_apps/mediadc` in your Nextcloud deployment.
3. Enable the app with `php occ app:enable --force mediadc`.

The infrastructure used for this fork syncs the repository into `custom_apps/mediadc` via a Kubernetes init container, then enables the managed app set with `occ` during startup.

Starting from 0.2.0 version MediaDC is only included in Nextcloud v25 and higher.

## Upstream maintainers

* [Andrey Borysenko](https://github.com/andrey18106)
* [Alexander Piskun](https://github.com/bigcat88)

## Fork maintenance notes

The upstream repository is archived, so this fork keeps the app alive for production self-hosting use. The current focus is operational stability and performance on large media libraries rather than App Store publication.
