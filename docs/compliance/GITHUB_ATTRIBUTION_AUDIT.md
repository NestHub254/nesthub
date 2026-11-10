# GitHub Cursor attribution audit — NestHub254/nesthub

**Status:** Audit record · PUBLIC-SAFE  
**Date:** 10 November 2026 (updated with Option A release note)  
**Default branch baseline:** `main` @ merge `ff95f3fb04dae8b3375418ec208ea15225e86883`  
**Later compliance merge:** `8f49d428abdf05c68fe13f8308639d4e2c117bd6` (PR #2)

## Finding

Cursor does **not** appear as Git **author** or **committer** on `main`.  
Cursor **does** appear as a **Co-authored-by** trailer on seven SIONA migration commits that are present on `main`.

## Affected SHAs (SIONA work on main)

| SHA | Author | Subject |
|---|---|---|
| `16279e51cbc8d756bac0bdab2979a8ed4241e1da` | sibona njaji \<njajisamson@gmail.com\> | Add Cloud Run and Cloudflare staging infrastructure scaffolding. |
| `65efb7b18928a910550519e571268e55bd212017` | sibona njaji \<njajisamson@gmail.com\> | Switch staging plan to Firebase Hosting and asia-south1. |
| `a0a9e13add31be7343c1d4c8782128e394c9c120` | sibona njaji \<njajisamson@gmail.com\> | Implement Path B same-origin API routing for Firebase Hosting. |
| `6cff6752b8145dece69df5e0c0c01fe5bec3c5b7` | sibona njaji \<njajisamson@gmail.com\> | Record siona-nesthub-staging-2026 project wiring after GCP bootstrap. |
| `e59543e962287da8e66f5377f0d1f12d3daec28c` | sibona njaji \<njajisamson@gmail.com\> | Add SIONA hosting SEO, privacy drafts, and sanitized migration docs. |
| `c7a511f9d44736012ac78097bca53e0866efd01e` | sibona njaji \<njajisamson@gmail.com\> | Scrub migration docs and mark legal drafts as pending approval. |
| `c93bd13616742ee85824a0f75730a26a1fd6ee69` | sibona njaji \<njajisamson@gmail.com\> | Finalize partner-approved legal pages and static Hosting release config. |

Trailer text on each: `Co-authored-by: Cursor <cursoragent@cursor.com>`

## Partner commits (no Cursor trailer)

| SHA | Author | Subject |
|---|---|---|
| `0ea96d480bb2c0ad22d0ed7655d8f5282a6375c1` | Mark Mutuku Kyalo | Initial public project release |
| `d38853e59ef2a63262d12e0163102fcbfc078415` | Mark Mutuku Kyalo | Move local configuration to environment variables |
| `d758e75b75a86d6530cee76fbee2fafcbd596a2f` | Mark Mutuku Kyalo | Optimize tenant portal for mobile |

## Correction options

1. **Forward-only (selected for this release):** future commits use repository-local human author only; no Cursor Co-authored-by.  
2. **Historical rewrite:** would require rewriting the seven SHAs above (and the merge commit), force-push to `main`, and NestHub254 owner approval. **Not performed.** Full backup required before any rewrite.

## Policy going forward

- `git config --local user.name` / `user.email` = verified human GitHub identity  
- Do not add `Co-authored-by: Cursor`  
- Do not attribute partner commits to SIONA or vice versa  
