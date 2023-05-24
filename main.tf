terraform {
  required_version = ">= 0.14"

  required_providers {
    mongodbatlas = {
      source = "mongodb/mongodbatlas"
    }
    # Cloud Run support was added on 3.3.0
    google = {
      source = "hashicorp/google"
    }
  }
}

resource "random_string" "bucket-post" {
  length  = 8
  special = false
  upper   = false
  count = 2
}

provider "google" {
  # Replace `PROJECT_ID` with your project
  project = var.gcp_project_id
  region      = var.gcp_region
  zone        = "us-central1-c"
}

resource "google_project_service" "enable_apis" {
  for_each = toset(["cloudbuild", "artifactregistry", "run"])
  
  service = "${each.key}.googleapis.com"
  disable_dependent_services = true
}


# next two enable cloud build to deploy to run 
# resource "google_project_iam_member" "run_admin_binding" {
#   project = var.gcp_project_id
#   role    = "roles/run.admin"
#   member  = "serviceAccount:${var.gcp_project_no}@cloudbuild.gserviceaccount.com"
# }
# resource "google_project_iam_member" "iam_user_binding" {
#   project = var.gcp_project_id
#   role    = "roles/iam.serviceAccountUser"
#   member  = "serviceAccount:${var.gcp_project_no}@cloudbuild.gserviceaccount.com"
# }

resource "google_storage_bucket" "build_staging" {
  name          = "staging_bucket_${random_string.bucket-post[0].result}"
  location      = var.gcp_region
  force_destroy = true

  public_access_prevention = "enforced"
}

resource "google_storage_bucket" "feed_bucket" {
  name          = "feed_bucket_${random_string.bucket-post[1].result}"
  location      = var.gcp_region
  force_destroy = true
  public_access_prevention = "inherited"
}

resource "google_storage_bucket_iam_member" "member" {
  bucket = google_storage_bucket.feed_bucket.name
  role = "roles/storage.objectViewer"
  member = "allUsers"
}
# resource "google_storage_bucket_access_control" "public_rule" {
#   bucket = google_storage_bucket.feed_bucket.name
#   role   = "READER"
#   entity = "allUsers"
# }

resource "google_artifact_registry_repository" "images-repo" {
  location      = var.gcp_region
  repository_id = "images"
  description   = "Docker repo"
  format        = "DOCKER"
  depends_on = [
    google_project_service.enable_apis
  ]
}

resource "null_resource" "build" {
  provisioner "local-exec" {
    command = "gcloud builds submit . --gcs-source-staging-dir=${google_storage_bucket.build_staging.url}/source"
  }

  depends_on = [
    google_artifact_registry_repository.images-repo, local_file.env
  ]
}
