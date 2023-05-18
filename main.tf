terraform {
  required_version = ">= 0.14"

  required_providers {
    mongodbatlas = {
      source = "mongodb/mongodbatlas"
    }
    # Cloud Run support was added on 3.3.0
    # google = ">= 3.3"
  }
}

# provider "google" {
#   # Replace `PROJECT_ID` with your project
#   project = var.gcp_project_id
# }


# Display the service URL
# output "service_url" {
#   value = google_cloud_run_service.run_service.status[0].url
# }
