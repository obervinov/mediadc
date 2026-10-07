# Nextcloud MediaDC (maintained fork)

**📸📹 Collect photo and video duplicates to save your cloud storage space**

This is a fork of [cloud-py-api/mediadc](https://github.com/cloud-py-api/mediadc), which was archived upstream.
The fork keeps MediaDC running on current Nextcloud releases. It is maintained on a best-effort basis
for a self-hosted setup, and it is not published to the Nextcloud App Store.

![Home page](/screenshots/mediadc_home.png)
![Task page](/screenshots/mediadc_task_details_2.png)

## Compatibility

| MediaDC | Nextcloud | Notes |
| --- | --- | --- |
| 0.5.0 | 30 – 35 | `cloud_py_api` bundled, no separate install needed |
| 0.4.4 | 30 – 31 | requires the `cloud_py_api` app |

Verified on 0.5.0:
- upgrade 0.4.4 → 0.5.0 on Nextcloud 31, then Nextcloud 31 → 32;
- fresh install on Nextcloud 35;
- PostgreSQL, `linux/amd64` and `linux/arm64`.

Nextcloud 33 and 34 are within the declared range but were not tested separately.
FreeBSD is not supported.

## What differs from upstream

- **No `cloud_py_api` dependency.** The upstream helper app was archived and stopped at Nextcloud 31.
  Its Python framework part is bundled into MediaDC since 0.5.0.
  The `oc_cloud_py_api_settings` table is reused if it already exists, so existing settings are kept.
- **Pinned Python binaries.** The Python part is unchanged since upstream v0.4.0, so the binaries are
  downloaded from the [upstream v0.4.0 release](https://github.com/cloud-py-api/mediadc/releases/tag/v0.4.0).
  Each archive is checked against a sha256 pinned in `lib/AppInfo/Application.php`; a mismatch is rejected
  before extraction.
- **Bulk deletion of exact duplicates.** Groups where all files share the same hash and size can be
  cleaned up in one action (0.4.4).

## Installation

1. Download `mediadc.tar.gz` from the [latest release](https://github.com/obervinov/mediadc/releases/latest)
   and verify it with `mediadc.tar.gz.sha256`.
2. Extract it into `custom_apps/` of your Nextcloud, so the app lives in `custom_apps/mediadc`.
3. Enable the app: `occ app:enable mediadc`. When updating an existing install, run `occ upgrade` instead.
4. If the old `cloud_py_api` app is installed, disable it: `occ app:disable cloud_py_api`.
   Do not remove it — its settings table is still used by MediaDC.

On first enable, MediaDC downloads the Python binary for your platform into its app data.
The server needs outbound HTTPS access to `github.com` for that.

Usage and settings are described on the upstream [Wiki](https://github.com/cloud-py-api/mediadc/wiki).

## Releases

A tag `vX.Y.Z` triggers the release workflow, which builds `mediadc.tar.gz` and its `.sha256` and attaches
them to a GitHub release. The tag must match `<version>` in `appinfo/info.xml`.

## Credits

MediaDC was created by [Andrey Borysenko](https://github.com/andrey18106) and
[Alexander Piskun](https://github.com/bigcat88). Thanks to them and to everyone who contributed upstream.

## License

[AGPL-3.0-or-later](LICENSE)
