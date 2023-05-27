provider "mongodbatlas" {
  public_key  = var.atlas_public_key
  private_key = var.atlas_private_key
}

resource "random_string" "mongodb_password" {
  length  = 32
  special = false
  upper   = true
}

resource "mongodbatlas_cluster" "db-cluster" {
  project_id              = var.atlas_project_id
  name                    = var.atlas_db_name

  # Provider Settings "block"
  provider_name = "TENANT" //free tier
  backing_provider_name = "GCP"
  provider_region_name = "CENTRAL_US" //free tier
  provider_instance_size_name = "M0" //free tier
}

resource "mongodbatlas_database_user" "user" {
  project_id         = var.atlas_project_id
  auth_database_name = "admin"

  username = var.db_username
  password = random_string.mongodb_password.result

  roles {
    role_name     = "readWrite"
    database_name = var.atlas_db_name
  }

  roles {
    role_name     = "readWrite"
    database_name = "test"
  }
}

locals {
  # the demo app only takes URIs with the credentials embedded and the atlas
  # provider doesn't give us a good way to get the hostname without the protocol
  # part so we end up doing some slicing and dicing to get the creds into the URI
  atlas_uri = replace(
    mongodbatlas_cluster.db-cluster.srv_address,
    "://",
    "://${var.db_username}:${mongodbatlas_database_user.user.password}@"
  )
}
