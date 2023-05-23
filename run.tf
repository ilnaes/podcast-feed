# # Create the Cloud Run service
# resource "google_cloud_run_service" "run_service" {
#   name = "app"
#   location = "us-east1"

#   template {
#     spec {
#       containers {
#         image = "gcr.io/google-samples/hello-app:1.0"
#       }
#     }
#   }

#   # Waits for the Cloud Run API to be enabled
#   depends_on = [google_project_service.run_api]
# }

# # Allow unauthenticated users to invoke the service
# resource "google_cloud_run_service_iam_member" "run_all_users" {
#   service  = google_cloud_run_service.run_service.name
#   location = google_cloud_run_service.run_service.location
#   role     = "roles/run.invoker"
#   member   = "allUsers"
# }
