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
}

provider "google" {
  # Replace `PROJECT_ID` with your project
  project = var.gcp_project_id
  region      = var.gcp_region
  zone        = "us-central1-c"
}

resource "google_project_service" "cloud-build" {
  service = "cloudbuild.googleapis.com"

  disable_dependent_services = true
}

resource "google_project_service" "artifact-registry" {
  service = "artifactregistry.googleapis.com"

  disable_dependent_services = true
}

resource "google_project_service" "run_api" {
  service = "run.googleapis.com"

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
  name          = "staging_bucket_${random_string.bucket-post.result}"
  location      = var.gcp_region
  force_destroy = true

  public_access_prevention = "enforced"
}

resource "google_artifact_registry_repository" "images-repo" {
  location      = var.gcp_region
  repository_id = "images"
  description   = "Docker repo"
  format        = "DOCKER"
  depends_on = [
    google_project_service.artifact-registry
  ]
}

resource "null_resource" "build" {
  provisioner "local-exec" {
    command = "gcloud builds submit . --gcs-source-staging-dir=${google_storage_bucket.build_staging.url}/source"
  }

  depends_on = [
    google_artifact_registry_repository.images-repo
  ]
}
