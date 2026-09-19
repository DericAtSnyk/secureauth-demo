resource "aws_s3_bucket" "uploads" {
  bucket = var.bucket_name

  tags = {
    Name        = "secureauth-demo-uploads"
    Environment = var.environment
  }
}

# CRITICAL: Public read/write access with no encryption
resource "aws_s3_bucket_acl" "uploads_acl" {
  bucket = aws_s3_bucket.uploads.id
  acl    = "public-read-write"
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "uploads_public" {
  bucket = aws_s3_bucket.uploads.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadWrite"
        Effect    = "Allow"
        Principal = "*"
        Action    = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource  = "${aws_s3_bucket.uploads.arn}/*"
      }
    ]
  })
}

# LOW: No server-side encryption configured
# No aws_s3_bucket_server_side_encryption_configuration resource

# LOW: No access logging configured
# No aws_s3_bucket_logging resource
