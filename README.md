# BC/SC Job Tracker

A mobile-friendly shared web app for four team members. It uses Supabase Auth + Postgres so everyone signs in to the same shared job list. The app includes add/edit, search, PO and job-status filters, dashboard counts, CSV export, and live refresh when another user changes a record.

## Included fields
- BC/SC Client
- Area
- Customer
- PO status: PO Received / PO Not Received / In Process
- Farm/Cellar name
- Location
- Date Scheduled
- Contact Person
- Contact number (stored as text to preserve leading zeroes)
- Inventory
- Technician
- Date Completed
- Job status: In Progress / Completed / Not Completed
- Optional Notes / follow-up

## Setup summary
Follow `SETUP.md`. You need a Supabase project and a static host (GitHub Pages is a free option for a public repository). Do not put any Supabase service-role/secret key in the browser.
