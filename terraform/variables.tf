variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "aws_access_key" {
  description = "AWS access key ID"
  type        = string
  sensitive   = true
}

variable "aws_secret_key" {
  description = "AWS secret access key"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "demo"
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
  default     = "Sup3rS3cret_Demo_P@ssw0rd!"
}

variable "bucket_name" {
  description = "S3 bucket name for user uploads"
  type        = string
  default     = "secureauth-demo-uploads"
}
