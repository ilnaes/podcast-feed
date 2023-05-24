output "atlas_uri" {
  value = local.atlas_uri
  sensitive = true
}

output "api_url" {
  value = google_cloud_run_service.run_service.status[0].url
}

output "feed_bucket" {
  value = google_storage_bucket.feed_bucket.url
}

resource "local_file" "env" {
  content = "GOOGLE_APPLICATION_CREDENTIALS=\"key.json\"\nMONGO_URI=\"${local.atlas_uri}\"\nFEED_BUCKET=\"${google_storage_bucket.feed_bucket.url}\""
  filename = ".env"
  file_permission = "0666"
}
